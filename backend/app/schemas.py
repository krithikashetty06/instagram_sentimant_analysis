from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


class DatasetPreviewResponse(BaseModel):
    filename: str
    total_rows: int
    columns: List[str]
    preview_rows: List[Dict[str, Any]]
    detected_text_column: Optional[str] = None
    detected_label_column: Optional[str] = None
    detected_score_column: Optional[str] = None
    has_existing_labels: bool = False


class AnalysisSettings(BaseModel):
    text_column: Optional[str] = None
    label_column: Optional[str] = None
    score_column: Optional[str] = None
    remove_duplicates: bool = True
    clean_text: bool = True
    positive_threshold: float = Field(default=0.05, ge=0.0, le=1.0)
    negative_threshold: float = Field(default=-0.05, ge=-1.0, le=0.0)
    use_existing_labels: bool = False  # If true and labels exist, use them. Otherwise run TextBlob classifier.


class SentimentItem(BaseModel):
    id: int
    original_text: str
    cleaned_text: str
    predicted_sentiment: str  # "Positive", "Neutral", "Negative"
    sentiment_score: float  # Polarity score (-1.0 to 1.0)
    subjectivity_score: Optional[float] = None
    existing_label: Optional[str] = None
    existing_score: Optional[float] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SentimentBreakdown(BaseModel):
    sentiment: str
    count: int
    percentage: float


class PreprocessingStats(BaseModel):
    rows_before: int
    rows_after: int
    rows_excluded: int
    duplicates_removed: int
    empty_removed: int


class AnalysisSummary(BaseModel):
    total_analyzed: int
    positive_count: int
    positive_percentage: float
    neutral_count: int
    neutral_percentage: float
    negative_count: int
    negative_percentage: float
    dominant_sentiment: str
    average_polarity: float
    average_subjectivity: float
    preprocessing: PreprocessingStats
    distribution: List[SentimentBreakdown]
    dominant_explanation: str


class AnalysisResultResponse(BaseModel):
    analysis_id: str
    filename: str
    created_at: str
    used_algorithm: str
    text_column_used: str
    summary: AnalysisSummary
    has_existing_labels: bool
    preview_items: List[SentimentItem]


class PaginatedCommentsResponse(BaseModel):
    analysis_id: str
    total_items: int
    filtered_items: int
    page: int
    page_size: int
    total_pages: int
    items: List[SentimentItem]


class SampleDatasetInfo(BaseModel):
    name: str
    filename: str
    description: str
    row_count: int
    columns: List[str]
    sample_type: str  # e.g. "Instagram Comments (with labels)", "Raw Social Posts"


class SingleCommentRequest(BaseModel):
    text: str = Field(..., max_length=2000, description="The comment text to analyze")

    @field_validator("text")
    @classmethod
    def validate_text_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Comment text cannot be empty or contain only whitespace.")
        return v


class SingleCommentResponse(BaseModel):
    original_text: str
    cleaned_text: str
    polarity: float
    sentiment: str  # "Positive", "Neutral", "Negative"
    subjectivity: Optional[float] = None

