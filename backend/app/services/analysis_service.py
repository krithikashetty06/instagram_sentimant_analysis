import io
import os
import uuid
import time
from typing import Dict, Any, Optional, List, Tuple
from pathlib import Path
import pandas as pd

from app.preprocessing import preprocess_dataframe
from app.sentiment import detect_columns, run_sentiment_analysis
from app.schemas import (
    DatasetPreviewResponse,
    AnalysisSettings,
    AnalysisSummary,
    AnalysisResultResponse,
    SentimentItem,
    PaginatedCommentsResponse,
    SampleDatasetInfo
)

# In-memory storage for analysis results with timestamps
MAX_CACHED_ANALYSES = 20
CACHE_EXPIRATION_SECONDS = 3600  # 1 hour
_analysis_cache: Dict[str, Dict[str, Any]] = {}

MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB
MAX_ROW_COUNT = 50000


def clean_expired_cache():
    """Removes stale analyses from cache."""
    now = time.time()
    expired = [
        aid for aid, data in _analysis_cache.items()
        if now - data.get("timestamp", now) > CACHE_EXPIRATION_SECONDS
    ]
    for aid in expired:
        _analysis_cache.pop(aid, None)
    if len(_analysis_cache) > MAX_CACHED_ANALYSES:
        oldest_first = sorted(_analysis_cache.keys(), key=lambda k: _analysis_cache[k].get("timestamp", 0))
        for k in oldest_first[: len(_analysis_cache) - MAX_CACHED_ANALYSES]:
            _analysis_cache.pop(k, None)


def read_uploaded_file(file_bytes: bytes, filename: str) -> pd.DataFrame:
    """
    Safely reads CSV or Excel files into a pandas DataFrame.
    Supports UTF-8 (with or without BOM), Latin-1, CP1252, and ISO-8859-1 encodings.
    Properly handles commas and quotes inside fields without silently discarding rows.
    """
    if len(file_bytes) == 0:
        raise ValueError("Uploaded file is empty.")
    
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"File size exceeds maximum allowed limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB.")
    
    ext = Path(filename).suffix.lower()
    
    if ext in [".csv", ".txt"]:
        # Put utf-8-sig first to transparently strip BOM if present
        encodings = ["utf-8-sig", "utf-8", "latin1", "cp1252", "iso-8859-1"]
        last_error = None
        for enc in encodings:
            try:
                df = pd.read_csv(io.BytesIO(file_bytes), encoding=enc)
                df.columns = [str(c).strip() for c in df.columns]
                return df
            except (UnicodeDecodeError, UnicodeError):
                continue
            except pd.errors.EmptyDataError:
                raise ValueError("The CSV file is empty or contains no readable columns.")
            except pd.errors.ParserError as e:
                raise ValueError(
                    f"Could not parse CSV file. Error tokenizing data: {str(e)}. "
                    "Please check for unescaped quotation marks or unquoted commas inside comment text."
                )
            except Exception as e:
                last_error = e
                continue
        raise ValueError(f"Could not parse CSV file. Error: {str(last_error)}")
        
    elif ext in [".xlsx", ".xls"]:
        try:
            df = pd.read_excel(io.BytesIO(file_bytes))
            df.columns = [str(c).strip() for c in df.columns]
            return df
        except Exception as e:
            raise ValueError(f"Could not parse Excel file. Ensure it is a valid spreadsheet. Error: {str(e)}")
            
    else:
        raise ValueError(f"Unsupported file format '{ext}'. Only CSV and Excel (.xlsx, .xls) files are supported.")


def get_dataset_preview(file_bytes: bytes, filename: str) -> DatasetPreviewResponse:
    """
    Generates preview metadata and columns detection for an uploaded dataset.
    """
    df = read_uploaded_file(file_bytes, filename)
    
    if df.empty:
        raise ValueError("The uploaded dataset contains zero rows.")
    
    total_rows = len(df)
    columns = list(df.columns)
    
    text_col, label_col, score_col = detect_columns(df)
    
    # Safe preview rows (replace NaN with None/empty string for JSON serialization)
    preview_df = df.head(10).copy()
    preview_rows = preview_df.fillna("").to_dict(orient="records")
    
    has_labels = label_col is not None and bool(df[label_col].notna().any())
    
    return DatasetPreviewResponse(
        filename=filename,
        total_rows=total_rows,
        columns=columns,
        preview_rows=preview_rows,
        detected_text_column=text_col,
        detected_label_column=label_col,
        detected_score_column=score_col,
        has_existing_labels=has_labels
    )


def execute_analysis(
    file_bytes: bytes,
    filename: str,
    settings: Optional[AnalysisSettings] = None
) -> AnalysisResultResponse:
    """
    Executes full sentiment analysis pipeline on an uploaded file.
    """
    clean_expired_cache()
    
    if settings is None:
        settings = AnalysisSettings()
        
    df = read_uploaded_file(file_bytes, filename)
    
    if df.empty:
        raise ValueError("The dataset is empty. Cannot perform sentiment analysis.")
    
    if len(df) > MAX_ROW_COUNT:
        raise ValueError(f"Dataset has {len(df)} rows, which exceeds the limit of {MAX_ROW_COUNT} rows.")
        
    # Detect or validate columns
    detected_text, detected_label, detected_score = detect_columns(df)
    
    text_col = settings.text_column or detected_text
    if not text_col:
        raise ValueError(
            "Could not automatically detect a comment or text column. "
            f"Available columns: {list(df.columns)}. Please select the text column manually."
        )
    if text_col not in df.columns:
        raise ValueError(f"Selected text column '{text_col}' does not exist in dataset.")
        
    label_col = settings.label_column or detected_label
    score_col = settings.score_column or detected_score
    
    # Preprocess DataFrame
    cleaned_df, prep_stats = preprocess_dataframe(
        df=df,
        text_column=text_col,
        remove_duplicates=settings.remove_duplicates,
        clean_text=settings.clean_text
    )
    
    if cleaned_df.empty:
        raise ValueError(
            "All posts were filtered out during preprocessing (e.g. empty, missing, or unparseable text)."
        )
        
    # Run sentiment analysis
    analyzed_df, sentiment_summary = run_sentiment_analysis(
        df=cleaned_df,
        positive_threshold=settings.positive_threshold,
        negative_threshold=settings.negative_threshold,
        use_existing_labels=settings.use_existing_labels,
        existing_label_col=label_col,
        existing_score_col=score_col
    )
    
    analysis_id = str(uuid.uuid4())
    created_at = time.strftime("%Y-%m-%d %H:%M:%S")
    
    # Build summary object
    summary = AnalysisSummary(
        total_analyzed=sentiment_summary["total_analyzed"],
        positive_count=sentiment_summary["positive_count"],
        positive_percentage=sentiment_summary["positive_percentage"],
        neutral_count=sentiment_summary["neutral_count"],
        neutral_percentage=sentiment_summary["neutral_percentage"],
        negative_count=sentiment_summary["negative_count"],
        negative_percentage=sentiment_summary["negative_percentage"],
        dominant_sentiment=sentiment_summary["dominant_sentiment"],
        average_polarity=sentiment_summary["average_polarity"],
        average_subjectivity=sentiment_summary["average_subjectivity"],
        preprocessing=prep_stats,
        distribution=sentiment_summary["distribution"],
        dominant_explanation=sentiment_summary["dominant_explanation"]
    )
    
    # Store in memory cache
    _analysis_cache[analysis_id] = {
        "analysis_id": analysis_id,
        "filename": filename,
        "created_at": created_at,
        "timestamp": time.time(),
        "summary": summary,
        "df": analyzed_df,
        "text_column_used": text_col,
        "algorithm_used": sentiment_summary["algorithm_used"],
        "has_existing_labels": bool(label_col and label_col in df.columns)
    }
    
    # Generate preview items (top 20)
    preview_items = get_items_from_df(analyzed_df.head(20))
    
    return AnalysisResultResponse(
        analysis_id=analysis_id,
        filename=filename,
        created_at=created_at,
        used_algorithm=sentiment_summary["algorithm_used"],
        text_column_used=text_col,
        summary=summary,
        has_existing_labels=bool(label_col and label_col in df.columns),
        preview_items=preview_items
    )


def get_items_from_df(df: pd.DataFrame, offset: int = 0) -> List[SentimentItem]:
    """Converts DataFrame rows to SentimentItem objects."""
    items = []
    for idx, row in df.iterrows():
        # Collect metadata from extra columns
        exclude_cols = {
            "original_text", "cleaned_text", "predicted_sentiment", "sentiment_score",
            "subjectivity_score", "existing_label", "existing_score", "effective_sentiment"
        }
        metadata = {
            col: (None if pd.isna(row[col]) else row[col])
            for col in df.columns
            if col not in exclude_cols
        }
        
        item = SentimentItem(
            id=int(offset + idx + 1),
            original_text=str(row.get("original_text", "")),
            cleaned_text=str(row.get("cleaned_text", "")),
            predicted_sentiment=str(row.get("effective_sentiment", row.get("predicted_sentiment", "Neutral"))),
            sentiment_score=float(row.get("sentiment_score", 0.0)),
            subjectivity_score=float(row.get("subjectivity_score", 0.0)) if pd.notna(row.get("subjectivity_score")) else None,
            existing_label=str(row.get("existing_label")) if pd.notna(row.get("existing_label")) else None,
            existing_score=float(row.get("existing_score")) if pd.notna(row.get("existing_score")) else None,
            metadata=metadata
        )
        items.append(item)
    return items


def get_analysis_by_id(analysis_id: str) -> Dict[str, Any]:
    """Retrieves an analysis by ID or raises 404."""
    data = _analysis_cache.get(analysis_id)
    if not data:
        raise KeyError(f"Analysis with ID '{analysis_id}' not found or has expired.")
    return data


def query_comments(
    analysis_id: str,
    search: Optional[str] = None,
    sentiment: Optional[str] = None,
    sort_by: Optional[str] = "id",
    sort_order: Optional[str] = "asc",
    page: int = 1,
    page_size: int = 20
) -> PaginatedCommentsResponse:
    """
    Search, filter, and paginate comments for a given analysis.
    """
    data = get_analysis_by_id(analysis_id)
    df: pd.DataFrame = data["df"].copy()
    
    total_items = len(df)
    
    # 1. Filter by sentiment
    if sentiment and sentiment.lower() != "all":
        df = df[df["effective_sentiment"].str.lower() == sentiment.lower()]
        
    # 2. Search by keyword
    if search and search.strip():
        term = search.strip().lower()
        mask = (
            df["original_text"].astype(str).str.lower().str.contains(term, na=False) |
            df["cleaned_text"].astype(str).str.lower().str.contains(term, na=False)
        )
        df = df[mask]
        
    filtered_items = len(df)
    
    # 3. Sorting
    if sort_by == "sentiment_score" and "sentiment_score" in df.columns:
        ascending = (sort_order.lower() == "asc")
        df = df.sort_values(by="sentiment_score", ascending=ascending)
    elif sort_by == "sentiment" and "effective_sentiment" in df.columns:
        ascending = (sort_order.lower() == "asc")
        df = df.sort_values(by="effective_sentiment", ascending=ascending)
        
    # 4. Pagination
    page = max(1, page)
    page_size = max(1, min(page_size, 100))
    total_pages = max(1, (filtered_items + page_size - 1) // page_size)
    
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paged_df = df.iloc[start_idx:end_idx]
    
    items = get_items_from_df(paged_df, offset=start_idx)
    
    return PaginatedCommentsResponse(
        analysis_id=analysis_id,
        total_items=total_items,
        filtered_items=filtered_items,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        items=items
    )


def export_analysis_results(analysis_id: str, format_type: str = "csv") -> Tuple[bytes, str, str]:
    """
    Generates a CSV or Excel file containing the analyzed results.
    Returns (file_bytes, filename, media_type).
    """
    data = get_analysis_by_id(analysis_id)
    df: pd.DataFrame = data["df"].copy()
    orig_name = Path(data["filename"]).stem
    
    # Reorganize columns logically for user download
    primary_cols = [
        "original_text",
        "cleaned_text",
        "effective_sentiment",
        "sentiment_score",
        "subjectivity_score"
    ]
    if "existing_label" in df.columns and df["existing_label"].notna().any():
        primary_cols.append("existing_label")
    if "existing_score" in df.columns and df["existing_score"].notna().any():
        primary_cols.append("existing_score")
        
    extra_cols = [c for c in df.columns if c not in primary_cols and c not in ["predicted_sentiment"]]
    all_export_cols = primary_cols + extra_cols
    
    export_df = df[[c for c in all_export_cols if c in df.columns]].copy()
    
    # Rename for professional clarity
    rename_dict = {
        "original_text": "Original_Text",
        "cleaned_text": "Cleaned_Text",
        "effective_sentiment": "Sentiment",
        "sentiment_score": "Sentiment_Score_Polarity",
        "subjectivity_score": "Subjectivity_Score",
        "existing_label": "Original_Dataset_Label",
        "existing_score": "Original_Dataset_Score"
    }
    export_df = export_df.rename(columns=rename_dict)
    
    if format_type.lower() == "excel":
        out = io.BytesIO()
        with pd.ExcelWriter(out, engine="openpyxl") as writer:
            export_df.to_excel(writer, index=False, sheet_name="Sentiment Analysis")
        filename = f"{orig_name}_sentiment_analyzed.xlsx"
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        return out.getvalue(), filename, media_type
    else:
        out_csv = export_df.to_csv(index=False, encoding="utf-8-sig")
        filename = f"{orig_name}_sentiment_analyzed.csv"
        media_type = "text/csv; charset=utf-8"
        return out_csv.encode("utf-8-sig"), filename, media_type


def list_sample_datasets() -> List[SampleDatasetInfo]:
    """
    Discovers available sample datasets in the datasets/ directory.
    """
    datasets_dir = Path(__file__).resolve().parent.parent.parent.parent / "datasets"
    samples = []
    
    if not datasets_dir.exists():
        return samples
        
    for file_path in datasets_dir.glob("*.csv"):
        try:
            sample_df = read_uploaded_file(file_path.read_bytes(), file_path.name)
            row_count = len(sample_df)
            
            name = file_path.stem.replace("_", " ").title()
            has_labels = any("sentiment" in c.lower() for c in sample_df.columns)
            sample_type = "Labeled Social Posts" if has_labels else "Unlabeled Social Posts"
            
            samples.append(SampleDatasetInfo(
                name=name,
                filename=file_path.name,
                description=f"Curated {sample_type} dataset for testing SocialPulse sentiment pipeline.",
                row_count=row_count,
                columns=list(sample_df.columns),
                sample_type=sample_type
            ))
        except Exception:
            continue
            
    return samples


def get_sample_dataset_bytes(filename: str) -> Tuple[bytes, str]:
    """Reads a sample dataset by filename."""
    datasets_dir = Path(__file__).resolve().parent.parent.parent.parent / "datasets"
    target = datasets_dir / filename
    if not target.exists() or not target.is_file():
        raise FileNotFoundError(f"Sample dataset '{filename}' not found.")
    return target.read_bytes(), target.name
