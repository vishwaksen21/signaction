export default function AboutPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>About</h1>
      <p>
        SignAction is a web interface for a Python backend that translates text and speech into a
        sign-language-style token stream and resolves tokens to local gesture assets (GIF/MP4).
      </p>
      <h2>Accessibility impact</h2>
      <p>
        The goal is to make communication more inclusive by presenting a visual gesture sequence
        driven by your dataset.
      </p>
      <h2>How it works</h2>
      <ol>
        <li>Speech (optional) → transcript (Vosk)</li>
        <li>Text → gloss/tokens (rule-based baseline)</li>
        <li>Tokens → asset lookup (signs/alphabet folders)</li>
        <li>UI → gesture playback</li>
      </ol>
    </div>
  );
}
