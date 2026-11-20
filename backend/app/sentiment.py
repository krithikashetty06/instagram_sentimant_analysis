from typing import Dict, Any, Optional, List, Tuple
import pandas as pd
from textblob import TextBlob


SENTIMENT_ORDER = ["Positive", "Neutral", "Negative"]

SENTIMENT_COLORS = {
    "Positive": "#10B981",  # Green
    "Neutral": "#64748B",   # Slate / Blue-grey
    "Negative": "#EF4444"   # Coral Red
}


def find_column(df: pd.DataFrame, candidates: List[str]) -> Optional[str]:
    """
    Finds a column in df matching any candidate name (case-insensitive),
    preserving the notebook's find_column logic.
    """
    columns = {col.lower().strip(): col for col in df.columns}
    for candidate in candidates:
        if candidate.lower().strip() in columns:
            return columns[candidate.lower().strip()]
    return None


def detect_columns(df: pd.DataFrame) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Detects text, existing label, and existing score columns using notebook candidate lists.
    """
    text_col = find_column(df, [
        "text", "comment", "comments", "comment_text", "post_text", "post", "posts", "tweet", "tweets", "content", "caption", "body", "message", "review", "reviews"
    ])
    label_col = find_column(df, [
        "predicted_sentiment_label", "sentiment", "sentiment_label", "label", "target", "category"
    ])
    score_col = find_column(df, [
        "predicted_sentiment_score", "sentiment_score", "polarity", "score", "compound"
    ])
    return text_col, label_col, score_col


def normalize_sentiment_label(value: Any) -> Optional[str]:
    """
    Normalizes existing sentiment labels into canonical 'Positive', 'Negative', 'Neutral'.
    Preserves notebook logic.
    """
    if pd.isna(value) or value is None:
        return None
    
    val_str = str(value).strip().lower()
    
    labels_map = {
        "positive": "Positive",
        "pos": "Positive",
        "1": "Positive",
        "4": "Positive",
        "negative": "Negative",
        "neg": "Negative",
        "-1": "Negative",
        "0": "Negative",
        "neutral": "Neutral",
        "neu": "Neutral",
        "2": "Neutral"
    }
    return labels_map.get(val_str, None)


def classify_polarity(score: float, positive_threshold: float = 0.05, negative_threshold: float = -0.05) -> str:
    """
    Classifies a polarity score into Positive, Negative, or Neutral.
    Uses notebook default thresholds: score > 0.05 is Positive, score < -0.05 is Negative.
    """
    if score > positive_threshold:
        return "Positive"
    elif score < negative_threshold:
        return "Negative"
    else:
        return "Neutral"


def analyze_comment(
    text: str,
    positive_threshold: float = 0.05,
    negative_threshold: float = -0.05
) -> Tuple[str, float, float]:
    """
    Analyzes a single post using TextBlob.
    Returns (predicted_sentiment, polarity_score, subjectivity_score).
    """
    if not text or not str(text).strip():
        return "Neutral", 0.0, 0.0
    
    blob = TextBlob(str(text))
    polarity = round(float(blob.sentiment.polarity), 4)
    subjectivity = round(float(blob.sentiment.subjectivity), 4)
    sentiment = classify_polarity(polarity, positive_threshold, negative_threshold)
    return sentiment, polarity, subjectivity


def run_sentiment_analysis(
    df: pd.DataFrame,
    positive_threshold: float = 0.05,
    negative_threshold: float = -0.05,
    use_existing_labels: bool = False,
    existing_label_col: Optional[str] = None,
    existing_score_col: Optional[str] = None
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Performs sentiment classification and calculates statistical metrics.
    
    Distinguishes clearly between:
    - existing_label: label already present in the uploaded file
    - predicted_sentiment: predicted by the NLP algorithm (TextBlob)
    - sentiment_score: algorithm polarity score (-1.0 to 1.0)
    """
    working_df = df.copy()
    
    # 1. Capture existing labels/scores if present
    if existing_label_col and existing_label_col in working_df.columns:
        working_df["existing_label"] = working_df[existing_label_col].apply(normalize_sentiment_label)
    else:
        working_df["existing_label"] = None
        
    if existing_score_col and existing_score_col in working_df.columns:
        working_df["existing_score"] = pd.to_numeric(working_df[existing_score_col], errors="coerce")
    else:
        working_df["existing_score"] = None

    # 2. Always compute TextBlob prediction for every cleaned text
    # This guarantees consistent algorithmic sentiment and scores
    polarities = []
    subjectivities = []
    predictions = []
    
    for text in working_df["cleaned_text"]:
        sent, pol, subj = analyze_comment(text, positive_threshold, negative_threshold)
        predictions.append(sent)
        polarities.append(pol)
        subjectivities.append(subj)
        
    working_df["predicted_sentiment"] = predictions
    working_df["sentiment_score"] = polarities
    working_df["subjectivity_score"] = subjectivities
    
    # 3. Determine final effective sentiment for reporting
    if use_existing_labels and working_df["existing_label"].notna().sum() > 0:
        working_df["effective_sentiment"] = working_df["existing_label"].fillna(working_df["predicted_sentiment"])
        algorithm_used = "Existing Dataset Labels (with TextBlob fallback)"
    else:
        working_df["effective_sentiment"] = working_df["predicted_sentiment"]
        algorithm_used = f"TextBlob NLP Polarity (Thresholds: Pos > {positive_threshold}, Neg < {negative_threshold})"
        
    # 4. Calculate distributions and percentages
    total = len(working_df)
    
    if total == 0:
        counts = {"Positive": 0, "Neutral": 0, "Negative": 0}
        percentages = {"Positive": 0.0, "Neutral": 0.0, "Negative": 0.0}
        dominant = "Neutral"
        avg_polarity = 0.0
        avg_subjectivity = 0.0
    else:
        raw_counts = working_df["effective_sentiment"].value_counts().to_dict()
        counts = {s: int(raw_counts.get(s, 0)) for s in SENTIMENT_ORDER}
        percentages = {
            s: round((counts[s] / total) * 100, 2) for s in SENTIMENT_ORDER
        }
        dominant = max(counts, key=counts.get)
        avg_polarity = round(float(working_df["sentiment_score"].mean()), 4)
        avg_subjectivity = round(float(working_df["subjectivity_score"].mean()), 4)
        
    distribution_list = [
        {"sentiment": s, "count": counts[s], "percentage": percentages[s]}
        for s in SENTIMENT_ORDER
    ]
    
    explanation = (
        f"{dominant} sentiment is the dominant category, representing {percentages.get(dominant, 0.0)}% "
        f"({counts.get(dominant, 0)} posts) of the analyzed dataset. "
        "Please note: the dominant category reflects the distribution in this specific dataset "
        "and should not be generalized as the consensus of the entire population."
    )
    
    summary = {
        "total_analyzed": total,
        "positive_count": counts["Positive"],
        "positive_percentage": percentages["Positive"],
        "neutral_count": counts["Neutral"],
        "neutral_percentage": percentages["Neutral"],
        "negative_count": counts["Negative"],
        "negative_percentage": percentages["Negative"],
        "dominant_sentiment": dominant,
        "average_polarity": avg_polarity,
        "average_subjectivity": avg_subjectivity,
        "distribution": distribution_list,
        "dominant_explanation": explanation,
        "algorithm_used": algorithm_used
    }
    
    return working_df, summary
