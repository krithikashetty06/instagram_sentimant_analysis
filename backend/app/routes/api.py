import json
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Query, HTTPException, status
from fastapi.responses import Response

from app.schemas import (
    DatasetPreviewResponse,
    AnalysisSettings,
    AnalysisResultResponse,
    PaginatedCommentsResponse,
    SampleDatasetInfo,
    SingleCommentRequest,
    SingleCommentResponse
)
from app.preprocessing import clean_single_text
from app.sentiment import analyze_comment
from app.services.analysis_service import (
    get_dataset_preview,
    execute_analysis,
    get_analysis_by_id,
    query_comments,
    export_analysis_results,
    list_sample_datasets,
    get_sample_dataset_bytes
)

router = APIRouter(prefix="/api", tags=["Sentiment Analysis"])


@router.get("/health")
def health_check():
    """Health check endpoint to verify backend status."""
    return {
        "status": "healthy",
        "service": "SocialPulse Sentiment Analytics API",
        "version": "1.0.0",
        "methodology": "TextBlob NLP Polarity + Instagram Dataset Preprocessing"
    }


@router.post("/analyze-single", response_model=SingleCommentResponse)
def analyze_single_comment(request: SingleCommentRequest):
    """
    Analyzes a single social media comment without uploading a dataset.
    Returns the original text, cleaned text, TextBlob polarity, and sentiment label.
    """
    cleaned = clean_single_text(request.text)
    # If cleaning removes everything (e.g. comment was only a URL or mention), fallback to stripped text
    effective_text = cleaned if cleaned else request.text.strip()
    
    sentiment, polarity, subjectivity = analyze_comment(effective_text)
    
    return SingleCommentResponse(
        original_text=request.text,
        cleaned_text=effective_text,
        polarity=polarity,
        sentiment=sentiment,
        subjectivity=subjectivity
    )


@router.post("/dataset/preview", response_model=DatasetPreviewResponse)
async def preview_dataset(file: UploadFile = File(...)):
    """
    Accepts an uploaded CSV or Excel file and returns column detection and preview rows.
    """
    try:
        content = await file.read()
        return get_dataset_preview(content, file.filename or "uploaded_dataset.csv")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to process file: {str(e)}")


@router.post("/analyze", response_model=AnalysisResultResponse)
async def analyze_dataset(
    file: UploadFile = File(...),
    settings: Optional[str] = Form(None)
):
    """
    Accepts a dataset file and optional analysis settings JSON string.
    Runs text preprocessing and sentiment classification.
    """
    parsed_settings = AnalysisSettings()
    if settings:
        try:
            settings_dict = json.loads(settings)
            parsed_settings = AnalysisSettings(**settings_dict)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid settings JSON format: {str(e)}"
            )
            
    try:
        content = await file.read()
        result = execute_analysis(content, file.filename or "dataset.csv", parsed_settings)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Analysis failed: {str(e)}")


@router.get("/results/{analysis_id}")
def get_analysis_results(analysis_id: str):
    """
    Returns stored analysis results and summary metrics for a given analysis_id.
    """
    try:
        data = get_analysis_by_id(analysis_id)
        from app.services.analysis_service import get_items_from_df
        preview_items = get_items_from_df(data["df"].head(20))
        
        return AnalysisResultResponse(
            analysis_id=data["analysis_id"],
            filename=data["filename"],
            created_at=data["created_at"],
            used_algorithm=data["algorithm_used"],
            text_column_used=data["text_column_used"],
            summary=data["summary"],
            has_existing_labels=data["has_existing_labels"],
            preview_items=preview_items
        )
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/results/{analysis_id}/posts", response_model=PaginatedCommentsResponse)
def get_analysis_posts(
    analysis_id: str,
    search: Optional[str] = Query(None, description="Search keyword in comment text"),
    sentiment: Optional[str] = Query(None, description="Filter by Positive, Neutral, Negative, or all"),
    sort_by: Optional[str] = Query("id", description="Sort by id, sentiment, or sentiment_score"),
    sort_order: Optional[str] = Query("asc", description="asc or desc"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Paginated, searchable, and filterable endpoint for the Comment Explorer.
    """
    try:
        return query_comments(
            analysis_id=analysis_id,
            search=search,
            sentiment=sentiment,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/results/{analysis_id}/export")
def export_results(
    analysis_id: str,
    format: str = Query("csv", description="Export format: 'csv' or 'excel'")
):
    """
    Downloads analyzed results as CSV or Excel file.
    """
    try:
        file_bytes, filename, media_type = export_analysis_results(analysis_id, format)
        return Response(
            content=file_bytes,
            media_type=media_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Export failed: {str(e)}")


@router.get("/sample-datasets", response_model=list[SampleDatasetInfo])
def get_sample_datasets():
    """
    Lists bundled sample datasets for quick demonstration.
    """
    return list_sample_datasets()


@router.post("/analyze-sample/{filename}", response_model=AnalysisResultResponse)
def analyze_sample(
    filename: str,
    settings: Optional[str] = Form(None)
):
    """
    Analyzes one of the bundled sample datasets with one click.
    """
    parsed_settings = AnalysisSettings()
    if settings:
        try:
            settings_dict = json.loads(settings)
            parsed_settings = AnalysisSettings(**settings_dict)
        except Exception:
            pass
            
    try:
        file_bytes, orig_name = get_sample_dataset_bytes(filename)
        return execute_analysis(file_bytes, orig_name, parsed_settings)
    except FileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
