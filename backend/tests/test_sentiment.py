import pytest
import pandas as pd
from app.sentiment import (
    classify_polarity,
    normalize_sentiment_label,
    analyze_comment,
    run_sentiment_analysis,
    detect_columns
)


def test_classify_polarity_thresholds():
    # Preserves notebook thresholds: > 0.05 is Positive, < -0.05 is Negative
    assert classify_polarity(0.5) == "Positive"
    assert classify_polarity(0.06) == "Positive"
    assert classify_polarity(0.05) == "Neutral"
    assert classify_polarity(0.0) == "Neutral"
    assert classify_polarity(-0.05) == "Neutral"
    assert classify_polarity(-0.06) == "Negative"
    assert classify_polarity(-0.7) == "Negative"


def test_normalize_sentiment_label():
    assert normalize_sentiment_label("positive") == "Positive"
    assert normalize_sentiment_label("Pos") == "Positive"
    assert normalize_sentiment_label("NEGATIVE") == "Negative"
    assert normalize_sentiment_label("neg") == "Negative"
    assert normalize_sentiment_label("Neutral") == "Neutral"
    assert normalize_sentiment_label("neu") == "Neutral"
    assert normalize_sentiment_label(None) is None
    assert normalize_sentiment_label("unknown") is None


def test_analyze_comment():
    pos_sent, pos_score, _ = analyze_comment("This is absolutely wonderful and fantastic!")
    assert pos_sent == "Positive"
    assert pos_score > 0.05

    neg_sent, neg_score, _ = analyze_comment("Horrible, terrible, worst experience ever.")
    assert neg_sent == "Negative"
    assert neg_score < -0.05

    neu_sent, neu_score, _ = analyze_comment("The meeting takes place on Tuesday at 4 PM.")
    assert neu_sent == "Neutral"
    assert -0.05 <= neu_score <= 0.05


def test_run_sentiment_analysis_percentages():
    data = {
        "original_text": [
            "I love this so much!",
            "Fantastic quality and great experience",
            "This is horrible and broken",
            "The train arrives at 10 AM"
        ],
        "cleaned_text": [
            "I love this so much!",
            "Fantastic quality and great experience",
            "This is horrible and broken",
            "The train arrives at 10 AM"
        ]
    }
    df = pd.DataFrame(data)
    analyzed_df, summary = run_sentiment_analysis(df)
    
    assert summary["total_analyzed"] == 4
    # Percentages must sum to 100%
    pct_sum = summary["positive_percentage"] + summary["neutral_percentage"] + summary["negative_percentage"]
    assert pytest.approx(pct_sum, 0.01) == 100.0
    assert summary["dominant_sentiment"] in ["Positive", "Neutral", "Negative"]


def test_detect_columns():
    df1 = pd.DataFrame({"comment_id": [1], "comment": ["hello"], "sentiment": ["Positive"]})
    text, label, score = detect_columns(df1)
    assert text == "comment"
    assert label == "sentiment"
    assert score is None

    df2 = pd.DataFrame({"tweet": ["hi"], "polarity": [0.5]})
    text2, label2, score2 = detect_columns(df2)
    assert text2 == "tweet"
    assert label2 is None
    assert score2 == "polarity"
