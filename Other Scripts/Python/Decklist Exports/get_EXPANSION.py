import requests
import time

def fetch_all_cards_from_set(set_code):
    url = f'https://api.scryfall.com/cards/search?q=e%3A{set_code}&order=set&dir=asc'
    cards = []

    while url:
        print(f"Fetching: {url}")
        response = requests.get(url)
        data = response.json()
        cards.extend(data['data'])
        url = data.get('next_page')
        time.sleep(0.1)

    return cards

def sanitize_name(name):
    return name.split(' // ')[0].strip()

def get_best_printing(card, expansion):
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
            frame_effects = c.get('frame_effects', [])
            if 'showcase' in frame_effects:
                return 300
            if 'borderless' in frame_effects:
                return 200
            if 'extendedart' in frame_effects:
                return 100
            return 0  # normal

        return max(filtered, key=score)

    except Exception as e:
        print(f"Error selecting best printing for {card.get('name')}: {e}")
        return card

def export_moxfield_decklist(cards, expansion, output_file=None):
    if output_file is None:
        output_file = f"{expansion.upper()}.txt"

    seen = set()
    with open(output_file, mode='w', encoding='utf-8') as file:
        for idx, card in enumerate(cards, 1):
            name = sanitize_name(card.get('name', 'Unknown'))
            print(f"[{idx}/{len(cards)}] Processing: {name}")
            best_card = get_best_printing(card, expansion)
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

# --- Run Script ---
if __name__ == '__main__':
    expansion = input("Enter the expansion code (e.g., EOE): ").strip().lower()
    cards = fetch_all_cards_from_set(expansion)
    export_moxfield_decklist(cards, expansion)
