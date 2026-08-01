import os
import sys
import requests
from pathlib import Path

WORDS = [
    "HELLO", "WORLD", "YES", "NO", "PLEASE", "THANK_YOU", 
    "I", "YOU", "LOVE", "AI", "GOOD", "BAD", "HELP", "SORRY", "SIGN", "ACTION", "TRANSLATE"
]

def generate_svg(word: str, api_key: str) -> str:
    print(f"Generating SVG for {word}...")
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    You are an expert SVG artist and animator.
    Create a standalone, minimalist, modern SVG showing a human hand performing the American Sign Language (ASL) gesture for the word '{word}'.
    
    REQUIREMENTS:
    - Return ONLY valid SVG code. No markdown, no HTML wrappers, no explanation. Just the raw <svg>...</svg> string.
    - ViewBox should be 0 0 200 200.
    - Use clean lines and solid colors or elegant gradients.
    - Include CSS animations (<style>) within the SVG to make it move fluidly (e.g., floating, pulsing, or illustrating the motion of the sign).
    - Give it a beautiful dark/light adaptable aesthetic if possible (using currentColor or standard hex).
    """

    data = {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 4096,
        "system": "You output raw SVG code only without any markdown formatting like ```svg.",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    
    response = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=data)
    if response.status_code != 200:
        print(f"Failed to generate {word}: {response.text}")
        return ""
        
    try:
        content = response.json()["content"][0]["text"]
        # Claude might still wrap in markdown despite instructions, so clean it up
        content = content.strip()
        if content.startswith("```svg"):
            content = content[6:]
        if content.startswith("```xml"):
            content = content[6:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        return content.strip()
    except Exception as e:
        print(f"Error parsing response for {word}: {e}")
        return ""

def main():
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("Please set OPENROUTER_API_KEY environment variable")
        sys.exit(1)
        
    out_dir = Path("signaction_assets/signs")
    out_dir.mkdir(parents=True, exist_ok=True)
    
    for word in WORDS:
        svg_content = generate_svg(word, api_key)
        if svg_content and svg_content.startswith("<svg"):
            out_file = out_dir / f"{word}.svg"
            out_file.write_text(svg_content)
            print(f"Saved {out_file}")
        else:
            print(f"Failed to get valid SVG for {word}")

if __name__ == "__main__":
    main()
