import pytest
import pandas as pd
from app.preprocessing import clean_single_text, preprocess_dataframe


def test_url_removal():
    raw = "Check this out https://example.com/item and www.google.com for more info"
    cleaned = clean_single_text(raw)
    assert "https://" not in cleaned
    assert "www.google.com" not in cleaned
    assert "Check this out" in cleaned
    assert "for more info" in cleaned


def test_mention_handling():
    raw = "Hey @elonmusk and @nasa, what a great day!"
    cleaned = clean_single_text(raw)
    assert "@elonmusk" not in cleaned
    assert "@nasa" not in cleaned
    assert "what a great day!" in cleaned


def test_hashtag_processing():
    # Hashtag word should be preserved for sentiment, not destroyed
    raw = "I am so #excited and #happy today!"
    cleaned = clean_single_text(raw)
    assert "#" not in cleaned
    assert "excited" in cleaned
    assert "happy" in cleaned


def test_emoji_preservation():
    raw = "Millie 🔥🔥 Steve Aoki dj 😍😍 👏"
    cleaned = clean_single_text(raw)
    assert "🔥" in cleaned
    assert "😍" in cleaned
    assert "👏" in cleaned


def test_whitespace_normalization():
    raw = "  lots   of    weird     spacing \n\n and tabs \t "
    cleaned = clean_single_text(raw)
    assert cleaned == "lots of weird spacing and tabs"


def test_empty_and_nan_text():
    assert clean_single_text("") == ""
    assert clean_single_text(None) == ""


def test_preprocess_dataframe():
    data = {
        "id": [1, 2, 3, 4, 5, 6],
        "comment": [
            "Great product! https://example.com #love",
            "Great product! #love",  # duplicate after cleaning
            "   ",  # whitespace empty
            None,   # null
            "Terrible customer service 😡",
            "Meeting is at 3 PM tomorrow"
        ]
    }
    df = pd.DataFrame(data)
    processed_df, stats = preprocess_dataframe(df, text_column="comment", remove_duplicates=True)
    
    # 2 rows were empty/None, 1 duplicate removed -> 3 valid rows remain
    assert stats["rows_before"] == 6
    assert stats["rows_after"] == 3
    assert stats["duplicates_removed"] == 1
    assert stats["empty_removed"] == 2
    assert "original_text" in processed_df.columns
    assert "cleaned_text" in processed_df.columns
