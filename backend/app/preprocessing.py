import re
import html
from typing import Tuple, Dict, Any
import pandas as pd


def clean_single_text(text: str) -> str:
    """
    Cleans individual social media text while preserving sentiment-rich components.
    
    Rules applied:
    1. Unescape HTML entities (e.g. &amp; -> &).
    2. Remove URLs (http://, https://, www.*).
    3. Remove user mentions (@username).
    4. Extract words from hashtags (e.g., #awesome -> awesome) so sentiment words are preserved.
    5. Preserve emojis (emojis express crucial sentiment signals).
    6. Normalize redundant punctuation and excessive whitespace.
    7. Retain original casing/content integrity for sentiment scoring.
    """
    if pd.isna(text) or text is None:
        return ""
    
    text = str(text)
    
    # 1. Unescape HTML entities
    text = html.unescape(text)
    
    # 2. Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text, flags=re.MULTILINE)
    
    # 3. Remove user mentions (@handle)
    text = re.sub(r'@\w+', ' ', text)
    
    # 4. Extract hashtag words (replace '#word' with 'word', don't delete word)
    text = re.sub(r'#(\w+)', r'\1', text)
    
    # 5. Normalize whitespace while keeping emojis and alphanumeric characters
    # Collapse multiple spaces, tabs, newlines
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text


def preprocess_dataframe(
    df: pd.DataFrame,
    text_column: str,
    remove_duplicates: bool = True,
    clean_text: bool = True
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Preprocesses a pandas DataFrame using the project's cleaning methodology.
    
    Preserves:
    - original_text: untouched original post
    - cleaned_text: preprocessed text used for sentiment analysis
    
    Returns:
    - Processed DataFrame
    - Preprocessing statistics dictionary
    """
    rows_before = len(df)
    working_df = df.copy()
    
    # Ensure text column exists
    if text_column not in working_df.columns:
        raise ValueError(f"Specified text column '{text_column}' not found in dataset.")
    
    # Keep original text explicitly
    working_df["original_text"] = working_df[text_column].astype(str)
    
    # Filter out empty or null rows
    working_df = working_df.dropna(subset=[text_column]).copy()
    working_df["original_text"] = working_df["original_text"].str.strip()
    working_df = working_df[working_df["original_text"] != ""].copy()
    
    empty_removed = rows_before - len(working_df)
    
    # Apply text cleaning
    if clean_text:
        working_df["cleaned_text"] = working_df["original_text"].apply(clean_single_text)
        # Drop rows where cleaned text became completely empty (e.g., post was only a URL or mention)
        # But if cleaned text is empty, keep original_text if it had words
        mask_non_empty = working_df["cleaned_text"].str.strip() != ""
        working_df.loc[~mask_non_empty, "cleaned_text"] = working_df.loc[~mask_non_empty, "original_text"]
    else:
        working_df["cleaned_text"] = working_df["original_text"]
        
    duplicates_removed = 0
    if remove_duplicates:
        rows_pre_dedup = len(working_df)
        working_df = working_df.drop_duplicates(subset=["cleaned_text"]).reset_index(drop=True)
        duplicates_removed = rows_pre_dedup - len(working_df)
    else:
        working_df = working_df.reset_index(drop=True)
        
    rows_after = len(working_df)
    rows_excluded = rows_before - rows_after
    
    stats = {
        "rows_before": rows_before,
        "rows_after": rows_after,
        "rows_excluded": rows_excluded,
        "duplicates_removed": duplicates_removed,
        "empty_removed": empty_removed
    }
    
    return working_df, stats
