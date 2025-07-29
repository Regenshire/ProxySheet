import sys
import subprocess
import os

required_packages = ['requests', 'beautifulsoup4']

for pkg in required_packages:
    try:
        __import__(pkg if pkg != 'beautifulsoup4' else 'bs4')
    except ImportError:
        print(f"Missing required package '{pkg}'. Installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])


import requests
import time
from bs4 import BeautifulSoup
import re

def fetch_all_cards_from_set(set_codes, drop_filter=None):
    if isinstance(set_codes, str):
        set_codes = [set_codes]

    cards = []
    for set_code in set_codes:
        url = f'https://api.scryfall.com/cards/search?q=e%3A{set_code}&order=set&dir=asc'
        while url:
            print(f"Fetching: {url}")
            response = requests.get(url)
            data = response.json()
            cards.extend(data['data'])
            url = data.get('next_page')
            time.sleep(0.1)

    # If a collector number range is given, filter by that
    if drop_filter:
        if isinstance(drop_filter, tuple) and len(drop_filter) == 2:
            drop_filter = [drop_filter]  # Convert to list-of-one

        if isinstance(drop_filter, list):
            ranges = drop_filter
            cards = [
                c for c in cards
                if c.get('collector_number', '').isdigit()
                and any(
                    min_cn <= int(c['collector_number']) <= max_cn
                    for (min_cn, max_cn) in ranges
                )
            ]

    return cards

def sanitize_name(name):
    return name.split(' // ')[0].strip()

def get_best_printing(card, expansion, art_priority):
    """Fetches the best printing only from the target expansion, ranked by alt-art quality."""
    try:
        response = requests.get(card['prints_search_uri'])
        if response.status_code != 200:
            return card
        all_prints = response.json().get('data', [])

        # Filter only to the correct expansion
        filtered = [c for c in all_prints if c.get('set', '').lower() == expansion.lower()]
        if not filtered:
            print(f"Warning: No printings found in set {expansion.upper()} for {card.get('name')}")
            return card  # fallback to default

        def score(c):
            if c.get('lang') != 'en':
                return -1000
            if c.get('foil'):
                return -100

            frame_effects = c.get('frame_effects', []) or []

            for art_type in art_priority:
                if art_type == 1 and 'showcase' in frame_effects:
                    return 1000 - art_priority.index(1)
                if art_type == 2 and 'borderless' in frame_effects:
                    return 1000 - art_priority.index(2)
                if art_type == 3 and 'extendedart' in frame_effects:
                    return 1000 - art_priority.index(3)

            # Normal card fallback
            return 1000 - art_priority.index(0) if 0 in art_priority else 0

        return max(filtered, key=score)

    except Exception as e:
        print(f"Error selecting best printing for {card.get('name')}: {e}")
        return card

def export_moxfield_decklist(cards, expansion, output_file=None, drop_label=None):
    output_dir = "Decklist"
    os.makedirs(output_dir, exist_ok=True)

    if output_file is None:
        if drop_label:
            safe_label = re.sub(r'[^\w\s-]', '', drop_label).strip()
            safe_label = re.sub(r'\s+', '_', safe_label)  # Convert spaces to underscores
            filename = f"{expansion.upper()}_{safe_label}.txt"
        else:
            filename = f"{expansion.upper()}.txt"
        output_file = os.path.join(output_dir, filename)

    seen = set()
    with open(output_file, mode='w', encoding='utf-8') as file:
        for idx, card in enumerate(cards, 1):
            name = sanitize_name(card.get('name', 'Unknown'))
            print(f"[{idx}/{len(cards)}] Processing: {name}")
            best_card = get_best_printing(card, expansion, art_priority)
            time.sleep(0.05)

            name = sanitize_name(best_card.get('name', ''))
            collector_number = best_card.get('collector_number', '').strip()
            set_code = best_card.get('set', '').upper()

            if not name or not collector_number or not set_code:
                print(f"Skipping incomplete card: {name}")
                continue

            line = f"1 {name} ({set_code}) {collector_number}"
            if line not in seen:
                file.write(line + "\n")
                seen.add(line)

    print(f"\nExported {len(seen)} unique cards to {output_file}")

def build_sld_drop_map():
    url = "https://scryfall.com/sets/sld"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Failed to fetch SLD page: {e}")
        return {}

    soup = BeautifulSoup(response.text, "html.parser")
    drop_map = {}

    for h2 in soup.find_all("h2", class_="card-grid-header"):
        try:
            text = h2.get_text(strip=True)
            name_match = re.search(r"^(.*?)\s*•", text)
            if not name_match:
                continue
            drop_name = name_match.group(1).strip().lower()

            a_tag = h2.find("a", href=True)
            if not a_tag:
                continue
            href = a_tag['href']
            cn_match = re.search(r"cn%E2%89%A5(\d+)\+cn%E2%89%A4(\d+)", href)
            if not cn_match:
                continue
            min_cn, max_cn = int(cn_match.group(1)), int(cn_match.group(2))
            drop_map[drop_name] = (min_cn, max_cn)
        except Exception as e:
            print(f"Skipping malformed entry: {e}")
            continue

    return drop_map


# --- Run Script ---
if __name__ == '__main__':
    print("")
    print("##############################")
    print("## GET MTG EXPANSION SCRIPT ##")
    print("##############################")
    print("")
    expansion = input("Enter the expansion code (e.g., EOE, SLD, ect): ").strip().lower()
    
    print("")

    is_special_drop = expansion == "sld"

    drop_filter = None
    if is_special_drop:
        drop_query = input("Enter a Secret Lair Drop Name search term to filter (e.g., 'Final Fantasy'): ").strip().lower()
        drop_map = build_sld_drop_map()
        matches = [k for k in drop_map if drop_query in k]
        if not matches:
            print("No matching drop found.")
            proceed = input("Would you like to fetch all SLD/SLP cards instead? (y/n): ").strip().lower()
            if proceed != 'y':
                print("Ok. Card fetching cancelled.")
                exit(0)
            else:
                print("Proceeding with full SLD/SLP card list.")
        elif len(matches) == 1:
            drop_filter = drop_map[matches[0]]
            print(f"Matched drop: {matches[0]} — CN range {drop_filter[0]}–{drop_filter[1]}")
        else:
            print("Multiple drops matched:")
            print("  0. All matching drops")
            for i, name in enumerate(matches, 1):
                print(f"  {i}. {name} — CN {drop_map[name][0]}–{drop_map[name][1]}")

            try:
                print("")
                choice = int(input("Select a drop by number (0 for all): "))
                print("")
                if choice == 0:
                    drop_filter = [drop_map[name] for name in matches]
                    print("Selected ALL matching drops:")
                    for name in matches:
                        print(f"  {name} — CN {drop_map[name][0]}–{drop_map[name][1]}")

                else:
                    selected = matches[choice - 1]
                    drop_filter = drop_map[selected]
                    print(f"Matched drop: {selected} — CN range {drop_filter[0]}–{drop_filter[1]}")
            except Exception:
                print("Invalid selection. Showing all cards.")

    print("\nChoose your preferred art type(s) in order of priority.")
    print("Options:")
    print("  0 - Normal Cards")
    print("  1 - Showcase")
    print("  2 - Borderless")
    print("  3 - Extended Art")
    print("You can enter a single number (e.g., '1') or a comma-separated list (e.g., '2,1,3,0').")
    art_input = input("Enter art type priority (default is 1 - Showcase > 2 - Borderless > 3 - Extended > 0 - Normal): ").strip()
    default_priority = [1, 2, 3, 0]  # Default: Showcase > Borderless > Extended > Normal
    if art_input:
        try:
            user_priority = [int(x) for x in art_input.split(",") if x.strip().isdigit()]
            if len(user_priority) == 1:
                # If only one type is given, put it first and follow with the rest of the defaults
                art_priority = [user_priority[0]] + [x for x in default_priority if x != user_priority[0]]
            else:
                # Custom order without duplicates
                seen = set()
                art_priority = [x for x in user_priority if x not in seen and not seen.add(x) and 0 <= x <= 3]
                art_priority += [x for x in default_priority if x not in art_priority]
        except ValueError:
            print("Invalid input detected. Using default art priority.")
            art_priority = default_priority
    else:
        art_priority = default_priority

    print("")

    if is_special_drop:
        cards = fetch_all_cards_from_set(['sld', 'slp'], drop_filter=drop_filter)
    else:
        cards = fetch_all_cards_from_set(expansion)
    export_moxfield_decklist(cards, expansion, drop_label=drop_query if is_special_drop else None)

