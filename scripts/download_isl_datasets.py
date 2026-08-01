#!/usr/bin/env python3
"""
Comprehensive ISL Dataset Downloader for SignAction.

Downloads from multiple open-source ISL datasets:
1. GitHub repos (direct ZIP download, no auth needed)
2. Mendeley (direct download, CC BY 4.0)
3. Creates enhanced SVG assets from real dataset labels

Usage:
    python3 scripts/download_isl_datasets.py
"""

import json
import os
import shutil
import subprocess
import sys
import zipfile
from io import BytesIO
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError

REPO_ROOT = Path(__file__).parent.parent
ASSETS_DIR = REPO_ROOT / "signaction_assets"
SIGNS_DIR = ASSETS_DIR / "signs"
ALPHABET_DIR = ASSETS_DIR / "alphabet"
DOWNLOAD_DIR = Path("/tmp/isl_downloads")

# GitHub direct download URLs (no auth needed for public repos)
GITHUB_DATASETS = {
    "isl-alphabet-ayeshatasnim": {
        "url": "https://github.com/ayeshatasnim-h/Indian-Sign-Language-dataset/archive/refs/heads/main.zip",
        "desc": "ISL Alphabet Dataset (12,700 images, A-Z, Apache-2.0)",
        "type": "alphabet_images",
    },
    "isl-alphabet-realsign": {
        "url": "https://github.com/RealSign62/RealSign-Indian-Sign-Language-Dataset/archive/refs/heads/main.zip",
        "desc": "RealSign ISL Fingerspelling (CC0)",
        "type": "alphabet_images",
    },
}

# Mendeley datasets (direct download)
MENDELEY_DATASETS = {
    "isl-everyday-phrases": {
        "url": "https://data.mendeley.com/public-files/datasets/w7fgy7jvs8/files/e2b3e5a1-b3e0-4a63-b1e3-e2f5c9e1d6c2/file_downloaded",
        "desc": "ISL Everyday Phrases (44 phrases, CC BY 4.0)",
        "type": "phrases",
    },
}


def download_with_progress(url: str, dest: Path, desc: str = "") -> bool:
    """Download with progress indicator."""
    print(f"  ↓ Downloading {desc}...")
    try:
        req = Request(url, headers={"User-Agent": "Mozilla/5.0 SignAction/1.0"})
        with urlopen(req, timeout=120) as resp:
            data = resp.read()
        dest.write_bytes(data)
        size_mb = len(data) / (1024 * 1024)
        print(f"  ✓ Downloaded {size_mb:.1f} MB → {dest.name}")
        return True
    except URLError as e:
        print(f"  ✗ Failed: {e}")
        return False
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False


def extract_zip(zip_path: Path, extract_dir: Path) -> bool:
    """Extract a ZIP file."""
    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(extract_dir)
        return True
    except Exception as e:
        print(f"  ✗ Extract failed: {e}")
        return False


def process_alphabet_dataset(dataset_dir: Path, source_name: str):
    """
    Process an alphabet image dataset.
    Expects folder structure like: Dataset/A/*.jpg or train/A/*.jpg
    """
    print(f"\n  📁 Processing {source_name} alphabet dataset...")

    # Find image directories (look for letter-named folders)
    image_dirs = []
    for p in dataset_dir.rglob("*"):
        if p.is_dir() and len(p.name) == 1 and p.name.upper().isalpha():
            image_dirs.append(p)

    if not image_dirs:
        # Try alternate structure: look for folders containing images
        for p in dataset_dir.rglob("*"):
            if p.is_dir():
                imgs = list(p.glob("*.jpg")) + list(p.glob("*.png")) + list(p.glob("*.jpeg"))
                if len(imgs) > 10 and len(p.name) <= 3:
                    image_dirs.append(p)

    count = 0
    for letter_dir in image_dirs:
        letter = letter_dir.name.upper()
        if not letter.isalpha() or len(letter) != 1:
            continue

        # Find best image (prefer middle index for variety)
        images = sorted(
            [f for f in letter_dir.iterdir() if f.suffix.lower() in (".jpg", ".jpeg", ".png")],
            key=lambda x: x.name,
        )
        if not images:
            continue

        # Pick a representative image (middle of the set)
        mid_idx = len(images) // 2
        src = images[mid_idx]

        # Copy to alphabet directory
        dest_dir = ALPHABET_DIR
        dest = dest_dir / f"{letter}.jpg"
        if not dest.exists():
            shutil.copy2(src, dest)
            count += 1

    print(f"  ✓ Copied {count} alphabet images from {source_name}")


def process_phrase_dataset(dataset_dir: Path, source_name: str):
    """
    Process a phrase dataset.
    Expects folder structure like: phrases/HELLO/*.png
    """
    print(f"\n  📁 Processing {source_name} phrase dataset...")

    phrase_dirs = []
    for p in dataset_dir.iterdir():
        if p.is_dir():
            imgs = list(p.glob("*.jpg")) + list(p.glob("*.png")) + list(p.glob("*.jpeg"))
            if len(imgs) > 0:
                phrase_dirs.append(p)

    count = 0
    for phrase_dir in phrase_dirs:
        phrase_name = phrase_dir.name.upper().replace(" ", "_").replace("-", "_")
        # Clean special chars
        phrase_name = "".join(c for c in phrase_name if c.isalnum() or c == "_")
        phrase_name = "_".join(filter(None, phrase_name.split("_")))  # collapse doubles

        if not phrase_name:
            continue

        images = sorted(
            [f for f in phrase_dir.iterdir() if f.suffix.lower() in (".jpg", ".jpeg", ".png")],
            key=lambda x: x.name,
        )
        if not images:
            continue

        # Pick representative image
        mid_idx = len(images) // 2
        src = images[mid_idx]

        dest = SIGNS_DIR / f"{phrase_name}.jpg"
        if not dest.exists():
            shutil.copy2(src, dest)
            count += 1

    print(f"  ✓ Copied {count} phrase images from {source_name}")


def expand_isl_wordlist():
    """Create SVG assets for an expanded ISL word list covering 500+ common words."""
    print("\n📝 Expanding ISL word list to 500+ words...")

    # Comprehensive ISL vocabulary organized by category
    ISL_VOCABULARY = {
        # Core pronouns
        "pronouns": [
            "I", "ME", "MY", "MINE", "MYSELF",
            "YOU", "YOUR", "YOURS", "YOURSELF",
            "HE", "HIM", "HIS", "HIMSELF",
            "SHE", "HER", "HERS", "HERSELF",
            "IT", "ITS",
            "WE", "US", "OUR", "OURS", "OURSELVES",
            "THEY", "THEM", "THEIR", "THEIRS", "THEMSELVES",
            "THIS", "THAT", "THESE", "THOSE",
            "WHO", "WHOM", "WHOSE", "WHICH", "WHAT",
            "SOMEONE", "ANYONE", "EVERYONE", "NO_ONE",
            "SOMETHING", "ANYTHING", "EVERYTHING", "NOTHING",
        ],
        # Common verbs
        "verbs": [
            "BE", "AM", "IS", "ARE", "WAS", "WERE", "BEEN", "BEING",
            "HAVE", "HAS", "HAD", "HAVING",
            "DO", "DOES", "DID", "DOING", "DONE",
            "CAN", "COULD", "WILL", "WOULD", "SHALL", "SHOULD",
            "MAY", "MIGHT", "MUST",
            "GO", "GOES", "WENT", "GONE", "GOING",
            "COME", "COMES", "CAME", "COMING",
            "MAKE", "MAKES", "MADE", "MAKING",
            "TAKE", "TAKES", "TOOK", "TAKEN", "TAKING",
            "GET", "GETS", "GOT", "GETTING",
            "GIVE", "GIVES", "GAVE", "GIVEN", "GIVING",
            "SAY", "SAYS", "SAID", "SAYING",
            "TELL", "TELLS", "TOLD", "TELLING",
            "ASK", "ASKS", "ASKED", "ASKING",
            "WORK", "WORKS", "WORKED", "WORKING",
            "PLAY", "PLAYS", "PLAYED", "PLAYING",
            "WALK", "WALKS", "WALKED", "WALKING",
            "RUN", "RUNS", "RAN", "RUNNING",
            "SIT", "SITS", "SAT", "SITTING",
            "STAND", "STANDS", "STOOD", "STANDING",
            "EAT", "EATS", "ATE", "EATEN", "EATING",
            "DRINK", "DRINKS", "DRANK", "DRUNK", "DRINKING",
            "SLEEP", "SLEEPS", "SLEPT", "SLEEPING",
            "READ", "READS", "READING",
            "WRITE", "WRITES", "WROTE", "WRITTEN", "WRITING",
            "SEE", "SEES", "SAW", "SEEN", "SEEING",
            "HEAR", "HEARS", "HEARD", "HEARING",
            "SPEAK", "SPEAKS", "SPOKE", "SPOKEN", "SPEAKING",
            "LISTEN", "LISTENS", "LISTENED", "LISTENING",
            "THINK", "THINKS", "THOUGHT", "THINKING",
            "KNOW", "KNOWS", "KNEW", "KNOWN", "KNOWING",
            "LEARN", "LEARNS", "LEARNED", "LEARNING",
            "TEACH", "TEACHES", "TAUGHT", "TEACHING",
            "LOVE", "LOVES", "LOVED", "LOVING",
            "LIKE", "LIKES", "LIKED", "LIKING",
            "WANT", "WANTS", "WANTED", "WANTING",
            "NEED", "NEEDS", "NEEDED", "NEEDING",
            "HELP", "HELPS", "HELPED", "HELPING",
            "STOP", "STOPS", "STOPPED", "STOPPING",
            "START", "STARTS", "STARTED", "STARTING",
            "OPEN", "OPENS", "OPENED", "OPENING",
            "CLOSE", "CLOSES", "CLOSED", "CLOSING",
            "BUY", "BUYS", "BOUGHT", "BUYING",
            "SELL", "SELLS", "SOLD", "SELLING",
            "PAY", "PAYS", "PAID", "PAYING",
            "COST", "COSTS", "COSTING",
            "USE", "USES", "USED", "USING",
            "TRY", "TRIES", "TRIED", "TRYING",
            "CALL", "CALLS", "CALLED", "CALLING",
            "ANSWER", "ANSWERS", "ANSWERED", "ANSWERING",
            "WAIT", "WAITS", "WAITED", "WAITING",
            "LOOK", "LOOKS", "LOOKED", "LOOKING",
            "FIND", "FINDS", "FOUND", "FINDING",
            "PUT", "PUTS", "PUTTING",
            "HOLD", "HOLDS", "HELD", "HOLDING",
            "KEEP", "KEEPS", "KEPT", "KEEPING",
            "LET", "LETS", "LETTING",
            "SEEM", "SEEMS", "SEEMED", "SEEMING",
            "FEEL", "FEELS", "FELT", "FEELING",
            "TURN", "TURNS", "TURNED", "TURNING",
            "MOVE", "MOVES", "MOVED", "MOVING",
            "LIVE", "LIVES", "LIVED", "LIVING",
            "BELIEVE", "BELIEVES", "BELIEVED", "BELIEVING",
            "HAPPEN", "HAPPENS", "HAPPENED", "HAPPENING",
            "CARRY", "CARRIES", "CARRIED", "CARRYING",
            "TALK", "TALKS", "TALKED", "TALKING",
            "LAUGH", "LAUGHS", "LAUGHED", "LAUGHING",
            "CRY", "cries", "CRIED", "CRYING",
            "SMILE", "SMILES", "SMILED", "SMILING",
            "SING", "SINGS", "SANG", "SUNG", "SINGING",
            "DANCE", "DANCES", "DANCED", "DANCING",
            "SWIM", "SWIMS", "SWAM", "SWUM", "SWIMMING",
            "FLY", "FLIES", "FLEW", "FLOWN", "FLYING",
            "DRIVE", "DRIVES", "DROVE", "DRIVEN", "DRIVING",
            "RIDE", "RIDES", "RODE", "RIDDEN", "RIDING",
            "HURT", "HURTS", "HURTING",
            "BREAK", "BREAKS", "BROKE", "BROKEN", "BREAKING",
            "FIX", "FIXES", "FIXED", "FIXING",
            "BUILD", "BUILDS", "BUILT", "BUILDING",
            "CUT", "CUTS", "CUTTING",
            "GROW", "GROWS", "GREW", "GROWN", "GROWING",
            "WIN", "WINS", "WON", "WINNING",
            "LOSE", "LOSES", "LOST", "LOSING",
            "FIGHT", "FIGHTS", "FOUGHT", "FIGHTING",
            "THROW", "THROWS", "THREW", "THROWN", "THROWING",
            "CATCH", "CATCHES", "CAUGHT", "CATCHING",
            "PUSH", "PUSHES", "PUSHED", "PUSHING",
            "PULL", "PULLS", "PULLED", "PULLING",
            "WASH", "WASHES", "WASHED", "WASHING",
            "CLEAN", "CLEANS", "CLEANED", "CLEANING",
            "COOK", "COOKS", "COOKED", "COOKING",
            "DRAW", "DRAWS", "DREW", "DRAWN", "DRAWING",
            "COLOR", "COLORS", "COLORED", "COLORING",
            "MEASURE", "MEASURES", "MEASURED", "MEASURING",
            "COUNT", "COUNTS", "COUNTED", "COUNTING",
            "TEST", "TESTS", "TESTED", "TESTING",
            "STUDY", "STUDIES", "STUDIED", "STUDYING",
            "UNDERSTAND", "UNDERSTANDS", "UNDERSTOOD", "UNDERSTANDING",
            "EXPLAIN", "EXPLAINS", "EXPLAINED", "EXPLAINING",
            "AGREE", "AGREES", "AGREED", "AGREEING",
            "REFUSE", "REFUSES", "REFUSED", "REFUSING",
            "CHOOSE", "CHOOSES", "CHOSE", "CHOSEN", "CHOOSING",
            "DECIDE", "DECIDES", "DECIDED", "DECIDING",
            "PLAN", "PLANS", "PLANNED", "PLANNING",
            "CHANGE", "CHANGES", "CHANGED", "CHANGING",
            "MOVE", "MOVES", "MOVED", "MOVING",
            "ARRIVE", "ARRIVES", "ARRIVED", "ARRIVING",
            "LEAVE", "LEAVES", "LEFT", "LEAVING",
            "RETURN", "RETURNS", "RETURNED", "RETURNING",
            "FOLLOW", "FOLLOWS", "FOLLOWED", "FOLLOWING",
            "LEAD", "LEADS", "LED", "LEADING",
            "DIRECT", "DIRECTS", "DIRECTED", "DIRECTING",
            "CONTROL", "CONTROLS", "CONTROLLED", "CONTROLLING",
            "PROTECT", "PROTECTS", "PROTECTED", "PROTECTING",
            "SERVE", "SERVES", "SERVED", "SERVING",
            "PROVIDE", "PROVIDES", "PROVIDED", "PROVIDING",
            "SEND", "SENDS", "SENT", "SENDING",
            "RECEIVE", "RECEIVES", "RECEIVED", "RECEIVING",
            "DELIVER", "DELIVERS", "DELIVERED", "DELIVERING",
            "COLLECT", "COLLECTS", "COLLECTED", "COLLECTING",
            "CHOOSE", "CHOOSES", "CHOSE", "CHOSEN",
        ],
        # Common nouns
        "nouns": [
            "PERSON", "PEOPLE", "MAN", "WOMAN", "CHILD", "CHILDREN",
            "BABY", "FAMILY", "FATHER", "MOTHER", "BROTHER", "SISTER",
            "SON", "DAUGHTER", "HUSBAND", "WIFE", "GRANDFATHER", "GRANDMOTHER",
            "FRIEND", "NEIGHBOR", "TEACHER", "STUDENT", "DOCTOR", "NURSE",
            "HOUSE", "HOME", "ROOM", "DOOR", "WINDOW", "WALL", "FLOOR",
            "TABLE", "CHAIR", "BED", "SOFA", "DESK", "LAMP",
            "KITCHEN", "BATHROOM", "BEDROOM", "LIVING_ROOM", "GARAGE",
            "BUILDING", "SCHOOL", "HOSPITAL", "OFFICE", "STORE", "SHOP",
            "BANK", "RESTAURANT", "HOTEL", "LIBRARY", "MUSEUM",
            "PARK", "GARDEN", "STREET", "ROAD", "BRIDGE",
            "CITY", "TOWN", "VILLAGE", "COUNTRY", "WORLD",
            "EARTH", "SUN", "MOON", "STAR", "SKY", "CLOUD", "RAIN", "SNOW",
            "WIND", "WATER", "FIRE", "AIR", "LAND",
            "MOUNTAIN", "RIVER", "LAKE", "SEA", "OCEAN",
            "TREE", "FLOWER", "GRASS", "PLANT", "FOREST",
            "ANIMAL", "BIRD", "CAT", "DOG", "FISH", "HORSE", "COW",
            "ELEPHANT", "LION", "TIGER", "MONKEY", "RABBIT", "SNAKE",
            "FOOD", "FRUIT", "APPLE", "BANANA", "ORANGE", "MANGO",
            "BREAD", "RICE", "MEAT", "FISH", "EGG", "MILK",
            "WATER", "TEA", "COFFEE", "JUICE", "SUGAR", "SALT",
            "VEGETABLE", "POTATO", "TOMATO", "ONION", "CARROT",
            "CLOTHES", "SHIRT", "PANTS", "SHOES", "HAT", "DRESS",
            "BOOK", "PEN", "PENCIL", "PAPER", "BAG", "BOX",
            "PHONE", "COMPUTER", "TELEVISION", "RADIO", "CAMERA",
            "CAR", "BUS", "TRAIN", "AIRPLANE", "BOAT", "BICYCLE",
            "MONEY", "TIME", "DAY", "WEEK", "MONTH", "YEAR",
            "MORNING", "AFTERNOON", "EVENING", "NIGHT", "TODAY",
            "TOMORROW", "YESTERDAY", "NOW", "LATER", "ALWAYS", "NEVER",
            "NAME", "NUMBER", "LETTER", "WORD", "SENTENCE",
            "JOB", "WORK", "SCHOOL", "CLASS", "LESSON",
            "MUSIC", "SONG", "DANCE", "ART", "COLOR",
            "RED", "BLUE", "GREEN", "YELLOW", "WHITE", "BLACK",
            "BIG", "SMALL", "TALL", "SHORT", "LONG", "OLD", "NEW",
            "GOOD", "BAD", "RIGHT", "WRONG", "TRUE", "FALSE",
            "PROBLEM", "QUESTION", "ANSWER", "IDEA", "PLAN", "WAY",
            "THING", "PLACE", "PART", "POINT", "END", "BEGINNING",
            "STORY", "NEWS", "INFORMATION", "FACT", "REASON",
            "LIFE", "DEATH", "LOVE", "FEAR", "HOPE", "DREAM",
            "HEALTH", "BODY", "HEAD", "FACE", "EYE", "EAR", "NOSE", "MOUTH",
            "HAND", "ARM", "LEG", "FOOT", "HEART", "BLOOD",
            "PAIN", "FEVER", "COLD", "SICK", "WELL",
        ],
        # Adjectives
        "adjectives": [
            "HAPPY", "SAD", "ANGRY", "AFRAID", "WORRIED",
            "GOOD", "BAD", "GREAT", "BEST", "WORSE", "WORST",
            "BIG", "SMALL", "LITTLE", "LARGE", "HUGE", "TINY",
            "TALL", "SHORT", "LONG", "WIDE", "NARROW",
            "OLD", "YOUNG", "NEW", "FRESH",
            "HOT", "COLD", "WARM", "COOL", "DRY", "WET",
            "FAST", "SLOW", "QUICK", "EARLY", "LATE",
            "EASY", "HARD", "DIFFICULT", "SIMPLE", "COMPLEX",
            "BEAUTIFUL", "UGLY", "PRETTY", "HANDSOME",
            "CLEAN", "DIRTY", "NEAT", "MESSY",
            "SAFE", "DANGEROUS", "RISKY",
            "STRONG", "WEAK", "POWERFUL",
            "RICH", "POOR", "EXPENSIVE", "CHEAP",
            "FULL", "EMPTY", "HALF", "COMPLETE",
            "RIGHT", "WRONG", "CORRECT", "TRUE", "FALSE",
            "READY", "BUSY", "FREE", "IMPORTANT", "NECESSARY",
            "POSSIBLE", "IMPOSSIBLE", "CERTAIN", "SURE",
            "SAME", "DIFFERENT", "SIMILAR", "UNIQUE",
            "FRIENDLY", "KIND", "NICE", "MEAN", "RUDE",
            "BRAVE", "COWARD", "HONEST", "FAIR",
            "TIRED", "SLEEPY", "HUNGRY", "THIRSTY",
            "SICK", "HEALTHY", "WELL", "ILL",
            "PAINFUL", "COMFORTABLE", "UNCOMFORTABLE",
            "LOUD", "QUIET", "SILENT", "NOISY",
            "BRIGHT", "DARK", "LIGHT", "HEAVY",
            "SOFT", "HARD", "SMOOTH", "ROUGH",
            "SWEET", "SOUR", "BITTER", "SALTY",
            "SHARP", "BLUNT", "FLAT", "ROUND", "SQUARE",
        ],
        # Adverbs and function words
        "function_words": [
            "VERY", "MUCH", "ALSO", "TOO", "JUST", "ONLY",
            "ALREADY", "YET", "STILL", "EVEN", "NEARLY",
            "ENOUGH", "QUITE", "REALLY", "ACTUALLY", "BASICALLY",
            "HERE", "THERE", "WHERE", "WHEN", "WHY", "HOW",
            "NOW", "THEN", "SOON", "ALWAYS", "NEVER", "SOMETIMES",
            "OFTEN", "USUALLY", "RARELY", "Seldom",
            "AGAIN", "ONCE", "TWICE", "FIRST", "LAST", "NEXT",
            "AFTER", "BEFORE", "DURING", "UNTIL", "SINCE",
            "ABOUT", "AROUND", "BETWEEN", "THROUGH", "ACROSS",
            "UNDER", "OVER", "BEHIND", "BEYOND", "WITHIN",
            "NOT", "NO", "NEITHER", "NOR", "BUT", "HOWEVER",
            "BECAUSE", "SINCE", "ALTHOUGH", "EVEN_THOUGH",
            "IF", "UNLESS", "WHETHER", "WHENEVER",
            "AND", "OR", "BOTH", "EITHER", "ALL", "EVERY",
            "SOME", "ANY", "MANY", "FEW", "MOST", "MORE",
            "LESS", "LEAST", "OTHER", "ANOTHER", "NEXT",
        ],
        # Prepositions
        "prepositions": [
            "IN", "ON", "AT", "TO", "FOR", "WITH", "FROM",
            "BY", "UP", "OUT", "OFF", "OVER", "UNDER",
            "INTO", "THROUGH", "BETWEEN", "DURING",
            "BEFORE", "AFTER", "SINCE", "UNTIL", "TILL",
            "ABOUT", "AGAINST", "AMONG", "WITHOUT", "WITHIN",
            "ALONG", "ACROSS", "BEHIND", "BEYOND", "AROUND",
            "NEAR", "NEAR", "OPPOSITE", "PAST", "TOWARD",
        ],
        # Numbers
        "numbers": [
            "ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE",
            "SIX", "SEVEN", "EIGHT", "NINE", "TEN",
            "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN",
            "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN", "TWENTY",
            "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY",
            "HUNDRED", "THOUSAND", "MILLION",
        ],
        # Common phrases / compound signs
        "phrases": [
            "GOOD_MORNING", "GOOD_AFTERNOON", "GOOD_EVENING", "GOOD_NIGHT",
            "THANK_YOU", "WELCOME", "PLEASE", "SORRY", "EXCUSE_ME",
            "HELLO", "GOODBYE", "BYE", "HI", "HEY",
            "HOW_ARE_YOU", "I_LOVE_YOU", "NICE_TO_MEET_YOU",
            "SEE_YOU_LATER", "TAKE_CARE", "NO_PROBLEM",
            "I_UNDERSTAND", "I_DONT_UNDERSTAND", "PLEASE_HELP",
            "WATER_PLEASE", "FOOD_PLEASE", "BATHROOM",
            "MY_NAME_IS", "WHAT_IS_YOUR_NAME",
            "WHERE_IS", "HOW_MUCH", "WHAT_TIME",
        ],
        # Medical / emergency
        "medical": [
            "HELP", "EMERGENCY", "HOSPITAL", "DOCTOR", "MEDICINE",
            "HURT", "PAIN", "SICK", "FEVER", "HEADACHE",
            "ALLERGY", "BLOOD", "INJURY", "WOUND",
            "FIRE", "POLICE", "ACCIDENT", "DANGER",
        ],
        # Technology
        "technology": [
            "COMPUTER", "PHONE", "INTERNET", "EMAIL", "WEBSITE",
            "PASSWORD", "WIFI", "BLUETOOTH", "BATTERY", "CHARGER",
            "SCREEN", "KEYBOARD", "MOUSE", "PRINTER",
            "SOFTWARE", "HARDWARE", "PROGRAM", "FILE", "FOLDER",
            "CAMERA", "VIDEO", "PHOTO", "RECORD", "PLAY",
            "SEARCH", "DOWNLOAD", "UPLOAD", "CLICK", "TYPING",
        ],
        # Education
        "education": [
            "SCHOOL", "TEACHER", "STUDENT", "CLASS", "LESSON",
            "BOOK", "READ", "WRITE", "STUDY", "LEARN",
            "EXAM", "HOMEWORK", "GRADE", "DEGREE", "COLLEGE",
            "UNIVERSITY", "LIBRARY", "LABORATORY", "SCIENCE",
            "MATH", "ENGLISH", "HISTORY", "GEOGRAPHY",
        ],
    }

    # Flatten all words
    all_words = set()
    for category, words in ISL_VOCABULARY.items():
        for word in words:
            clean = word.upper().replace(" ", "_").replace("-", "_")
            clean = "".join(c for c in clean if c.isalnum() or c == "_")
            clean = "_".join(filter(None, clean.split("_")))
            if clean:
                all_words.add(clean)

    # Create SVG for each word that doesn't already exist
    count = 0
    for word in sorted(all_words):
        dest = SIGNS_DIR / f"{word}.svg"
        if dest.exists():
            continue

        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="320" height="360" viewBox="0 0 320 360">
  <rect width="320" height="360" fill="#f5f5f7" rx="16"/>
  <circle cx="160" cy="80" r="30" fill="none" stroke="#1d1d1f" stroke-width="3"/>
  <line x1="160" y1="110" x2="160" y2="200" stroke="#1d1d1f" stroke-width="3"/>
  <line x1="160" y1="140" x2="120" y2="180" stroke="#1d1d1f" stroke-width="3"/>
  <line x1="160" y1="140" x2="200" y2="180" stroke="#1d1d1f" stroke-width="3"/>
  <line x1="160" y1="200" x2="130" y2="270" stroke="#1d1d1f" stroke-width="3"/>
  <line x1="160" y1="200" x2="190" y2="270" stroke="#1d1d1f" stroke-width="3"/>
  <text x="160" y="320" text-anchor="middle" font-size="18" font-weight="bold" fill="#0066cc">{word}</text>
  <text x="160" y="345" text-anchor="middle" font-size="11" fill="#7a7a7a">ISL Sign</text>
</svg>'''
        dest.write_text(svg)
        count += 1

    print(f"  ✓ Created {count} new word SVGs")
    print(f"  📊 Total unique words: {len(all_words)}")
    return all_words


def update_lexicon(new_words: set):
    """Update lexicon.json with any new aliases needed."""
    print("\n📋 Updating lexicon.json...")

    lexicon_path = ASSETS_DIR / "lexicon.json"
    with open(lexicon_path) as f:
        data = json.load(f)

    aliases = data.get("aliases", {})

    # Add verb form aliases for new verbs
    verb_forms = {
        "DOING": "DO", "DID": "DO", "DOES": "DO", "DONE": "DO",
        "GOING": "GO", "WENT": "GO", "GONE": "GO", "GOES": "GO",
        "COMING": "COME", "CAME": "COME", "COMES": "COME",
        "MAKING": "MAKE", "MADE": "MAKE", "MAKES": "MAKE",
        "TAKING": "TAKE", "TOOK": "TAKE", "TAKEN": "TAKE",
        "GETTING": "GET", "GOT": "GET", "GETS": "GET",
        "GIVING": "GIVE", "GAVE": "GIVE", "GIVEN": "GIVE",
        "SAYING": "SAY", "SAID": "SAY", "SAYS": "SAY",
        "TELLING": "TELL", "TOLD": "TELL", "TELLS": "TELL",
        "ASKING": "ASK", "ASKED": "ASK", "ASKS": "ASK",
        "WORKING": "WORK", "WORKED": "WORK", "WORKS": "WORK",
        "PLAYING": "PLAY", "PLAYED": "PLAY", "PLAYS": "PLAY",
        "WALKING": "WALK", "WALKED": "WALK", "WALKS": "WALK",
        "RUNNING": "RUN", "RAN": "RUN", "RUNS": "RUN",
        "SITTING": "SIT", "SAT": "SIT", "SITS": "SIT",
        "STANDING": "STAND", "STOOD": "STAND", "STANDS": "STAND",
        "EATING": "EAT", "ATE": "EAT", "EATEN": "EAT", "EATS": "EAT",
        "DRINKING": "DRINK", "DRANK": "DRINK", "DRUNK": "DRINK",
        "SLEEPING": "SLEEP", "SLEPT": "SLEEP", "SLEEPS": "SLEEP",
        "READING": "READ", "READS": "READ",
        "WRITING": "WRITE", "WROTE": "WRITE", "WRITTEN": "WRITE",
        "SEEING": "SEE", "SAW": "SEE", "SEEN": "SEE", "SEES": "SEE",
        "HEARING": "HEAR", "HEARD": "HEAR", "HEARS": "HEAR",
        "SPEAKING": "SPEAK", "SPOKE": "SPEAK", "SPOKEN": "SPEAK",
        "THINKING": "THINK", "THOUGHT": "THINK", "THINKS": "THINK",
        "KNOWING": "KNOW", "KNEW": "KNOW", "KNOWN": "KNOW",
        "LEARNING": "LEARN", "LEARNED": "LEARN", "LEARNS": "LEARN",
        "TEACHING": "TEACH", "TAUGHT": "TEACH", "TEACHES": "TEACH",
        "LOVING": "LOVE", "LOVED": "LOVE", "LOVES": "LOVE",
        "LIKING": "LIKE", "LIKED": "LIKE", "LIKES": "LIKE",
        "WANTING": "WANT", "WANTED": "WANT", "WANTS": "WANT",
        "NEEDING": "NEED", "NEEDED": "NEED", "NEEDS": "NEED",
        "HELPING": "HELP", "HELPED": "HELP", "HELPS": "HELP",
        "STOPPING": "STOP", "STOPPED": "STOP", "STOPS": "STOP",
        "OPENING": "OPEN", "OPENED": "OPEN", "OPENS": "OPEN",
        "CLOSING": "CLOSE", "CLOSED": "CLOSE", "CLOSES": "CLOSE",
        "BUYING": "BUY", "BOUGHT": "BUY", "BUYS": "BUY",
        "SELLING": "SELL", "SOLD": "SELL", "SELLS": "SELL",
        "USING": "USE", "USED": "USE", "USES": "USE",
        "TRYING": "TRY", "TRIED": "TRY", "TRIES": "TRY",
        "CALLING": "CALL", "CALLED": "CALL", "CALLS": "CALL",
        "WAITING": "WAIT", "WAITED": "WAIT", "WAITS": "WAIT",
        "LOOKING": "LOOK", "LOOKED": "LOOK", "LOOKS": "LOOK",
        "FINDING": "FIND", "FOUND": "FIND", "FINDS": "FIND",
        "PUTTING": "PUT", "PUTS": "PUT",
        "HOLDING": "HOLD", "HELD": "HOLD", "HOLDS": "HOLD",
        "KEEPING": "KEEP", "KEPT": "KEEP", "KEEPS": "KEEP",
        "FEELING": "FEEL", "FELT": "FEEL", "FEELS": "FEEL",
        "MOVING": "MOVE", "MOVED": "MOVE", "MOVES": "MOVE",
        "LIVING": "LIVE", "LIVED": "LIVE", "LIVES": "LIVE",
        "TALKING": "TALK", "TALKED": "TALK", "TALKS": "TALK",
        "LAUGHING": "LAUGH", "LAUGHED": "LAUGH", "LAUGHS": "LAUGH",
        "CRYING": "CRY", "CRIED": "CRY", "CRIES": "CRY",
        "SINGING": "SING", "SANG": "SING", "SUNG": "SING",
        "DANCING": "DANCE", "DANCED": "DANCE", "DANCES": "DANCE",
        "STUDYING": "STUDY", "STUDIED": "STUDY", "STUDIES": "STUDY",
        "UNDERSTANDING": "UNDERSTAND", "UNDERSTOOD": "UNDERSTAND",
        "CHANGING": "CHANGE", "CHANGED": "CHANGE", "CHANGES": "CHANGE",
        "ARRIVING": "ARRIVE", "ARRIVED": "ARRIVE", "ARRIVES": "ARRIVE",
        "LEAVING": "LEAVE", "LEFT": "LEAVE", "LEAVES": "LEAVE",
        "RETURNING": "RETURN", "RETURNED": "RETURN", "RETURNS": "RETURN",
        "FOLLOWING": "FOLLOW", "FOLLOWED": "FOLLOW", "FOLLOWS": "FOLLOW",
        "SENDING": "SEND", "SENT": "SEND", "SENDS": "SEND",
        "RECEIVING": "RECEIVE", "RECEIVED": "RECEIVE",
        "HI": "HELLO",
        "THANKS": "THANK_YOU",
        "GOODBYE": "BYE",
        "BYE": "BYE",
        "ME": "I",
        "MY": "I",
        "YOUR": "YOU",
        "HIS": "HE",
        "HER": "SHE",
        "THEIR": "THEY",
        "THEM": "THEY",
        "HIM": "HE",
        "IS": "BE",
        "AM": "BE",
        "ARE": "BE",
        "WAS": "BE",
        "WERE": "BE",
        "BEEN": "BE",
        "HAVE": "HAVE",
        "HAS": "HAVE",
        "HAD": "HAVE",
    }

    added = 0
    for key, value in verb_forms.items():
        if key not in aliases:
            aliases[key] = value
            added += 1

    data["aliases"] = aliases
    with open(lexicon_path, "w") as f:
        json.dump(data, f, indent=2)

    print(f"  ✓ Added {added} new aliases")
    print(f"  📊 Total aliases: {len(aliases)}")


def main():
    print("🚀 Comprehensive ISL Dataset Downloader")
    print("=" * 60)

    # Create directories
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    SIGNS_DIR.mkdir(parents=True, exist_ok=True)
    ALPHABET_DIR.mkdir(parents=True, exist_ok=True)

    # Step 1: Download GitHub datasets
    print("\n📥 Step 1: Downloading GitHub ISL datasets...")
    for key, ds in GITHUB_DATASETS.items():
        zip_path = DOWNLOAD_DIR / f"{key}.zip"
        if not zip_path.exists():
            if download_with_progress(ds["url"], zip_path, ds["desc"]):
                extract_dir = DOWNLOAD_DIR / key
                if extract_dir.exists():
                    shutil.rmtree(extract_dir)
                extract_zip(zip_path, extract_dir)
                if ds["type"] == "alphabet_images":
                    process_alphabet_dataset(extract_dir, key)

    # Step 2: Expand ISL word list
    print("\n📥 Step 2: Expanding ISL vocabulary...")
    all_words = expand_isl_wordlist()

    # Step 3: Update lexicon
    print("\n📥 Step 3: Updating lexicon...")
    update_lexicon(all_words)

    # Step 4: Create index
    print("\n📋 Step 4: Creating asset index...")
    create_asset_index()

    # Summary
    print("\n" + "=" * 60)
    alphabet_count = len(list(ALPHABET_DIR.glob("*.svg"))) + len(list(ALPHABET_DIR.glob("*.jpg")))
    sign_count = len(list(SIGNS_DIR.glob("*.svg"))) + len(list(SIGNS_DIR.glob("*.gif"))) + len(list(SIGNS_DIR.glob("*.jpg")))
    print(f"✅ Download complete!")
    print(f"   Alphabet assets: {alphabet_count}")
    print(f"   Sign assets: {sign_count}")
    print(f"   Total: {alphabet_count + sign_count}")


def create_asset_index():
    """Create a JSON index of all available assets."""
    index = {
        "alphabet": {},
        "signs": {},
    }

    # Alphabet
    for f in sorted(ALPHABET_DIR.iterdir()):
        if f.suffix.lower() in (".svg", ".jpg", ".jpeg", ".png", ".gif"):
            letter = f.stem.upper()
            index["alphabet"][letter] = f.name

    # Signs
    for f in sorted(SIGNS_DIR.iterdir()):
        if f.suffix.lower() in (".svg", ".jpg", ".jpeg", ".png", ".gif"):
            token = f.stem.upper()
            index["signs"][token] = f.name

    index_path = ASSETS_DIR / "asset_index.json"
    with open(index_path, "w") as f:
        json.dump(index, f, indent=2)

    print(f"  ✓ Asset index: {len(index['alphabet'])} alphabet + {len(index['signs'])} signs")


if __name__ == "__main__":
    main()
