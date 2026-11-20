import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "SocialPulse" in data["service"]


def test_sample_datasets_endpoint():
    response = client.get("/api/sample-datasets")
    assert response.status_code == 200
    samples = response.json()
    assert len(samples) > 0
    assert any("sample_instagram_sentiment.csv" in s["filename"] for s in samples)


def test_dataset_preview_and_analysis_workflow():
    # 1. Preview
    csv_content = (
        "author,text,likes\n"
        "alice,This project is superb and amazing! 😍,10\n"
        "bob,Completely dissatisfied and disappointed 😡,2\n"
        "charlie,The report was published at 2 PM.,5\n"
    )
    files = {"file": ("test_comments.csv", csv_content.encode("utf-8"), "text/csv")}
    preview_res = client.post("/api/dataset/preview", files=files)
    assert preview_res.status_code == 200
    preview_data = preview_res.json()
    assert preview_data["total_rows"] == 3
    assert preview_data["detected_text_column"] == "text"

    # 2. Analyze
    files = {"file": ("test_comments.csv", csv_content.encode("utf-8"), "text/csv")}
    analyze_res = client.post("/api/analyze", files=files)
    assert analyze_res.status_code == 200
    result_data = analyze_res.json()
    
    assert "analysis_id" in result_data
    aid = result_data["analysis_id"]
    summary = result_data["summary"]
    assert summary["total_analyzed"] == 3
    assert summary["positive_count"] == 1
    assert summary["negative_count"] == 1
    assert summary["neutral_count"] == 1

    # 3. Comment Explorer Query
    posts_res = client.get(f"/api/results/{aid}/posts?sentiment=Positive")
    assert posts_res.status_code == 200
    posts_data = posts_res.json()
    assert posts_data["filtered_items"] == 1
    assert posts_data["items"][0]["predicted_sentiment"] == "Positive"

    # 4. Search Query
    search_res = client.get(f"/api/results/{aid}/posts?search=dissatisfied")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["filtered_items"] == 1
    assert "disappointed" in search_data["items"][0]["original_text"]

    # 5. Export CSV
    export_res = client.get(f"/api/results/{aid}/export?format=csv")
    assert export_res.status_code == 200
    assert "text/csv" in export_res.headers["content-type"]
    assert "attachment" in export_res.headers["content-disposition"]
    csv_text = export_res.content.decode("utf-8-sig")
    assert "Original_Text" in csv_text
    assert "Sentiment" in csv_text


def test_invalid_file_handling():
    # Empty file
    files = {"file": ("empty.csv", b"", "text/csv")}
    res = client.post("/api/analyze", files=files)
    assert res.status_code == 400

    # Non-existent analysis
    res_404 = client.get("/api/results/non-existent-id-12345")
    assert res_404.status_code == 404


def test_analyze_single_positive():
    payload = {"text": "I really enjoyed the event! It was absolutely wonderful and brilliant."}
    res = client.post("/api/analyze-single", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["original_text"] == payload["text"]
    assert "cleaned_text" in data
    assert data["sentiment"] == "Positive"
    assert data["polarity"] > 0.05


def test_analyze_single_negative():
    payload = {"text": "This is terrible, completely broken and horribly disappointing. Worst service ever."}
    res = client.post("/api/analyze-single", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["original_text"] == payload["text"]
    assert data["sentiment"] == "Negative"
    assert data["polarity"] < -0.05


def test_analyze_single_neutral():
    payload = {"text": "The meeting will be held on the third floor tomorrow at 10 AM."}
    res = client.post("/api/analyze-single", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["original_text"] == payload["text"]
    assert data["sentiment"] == "Neutral"
    assert -0.05 <= data["polarity"] <= 0.05


def test_analyze_single_empty_input():
    payload = {"text": ""}
    res = client.post("/api/analyze-single", json=payload)
    assert res.status_code == 422


def test_analyze_single_whitespace_input():
    payload = {"text": "    \t \n   "}
    res = client.post("/api/analyze-single", json=payload)
    assert res.status_code == 422


def test_analyze_single_excessively_long_input():
    payload = {"text": "word " * 600}  # > 2000 chars
    res = client.post("/api/analyze-single", json=payload)
    assert res.status_code == 422


def test_analyze_single_preprocessing_integration():
    # URL removed, hashtag preserved, mention stripped, emoji preserved
    payload = {"text": "Hello @someone, check out this #amazing concert! https://link.com 🔥😍"}
    res = client.post("/api/analyze-single", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "https://" not in data["cleaned_text"]
    assert "@someone" not in data["cleaned_text"]
    assert "amazing" in data["cleaned_text"]
    assert "😍" in data["cleaned_text"]
    assert data["sentiment"] == "Positive"
    assert data["polarity"] > 0.05


def test_analyze_sample_dataset_instagram_workflow():
    """
    Tests the exact action: clicking 'Analyze This Sample' on sample_instagram_sentiment.csv.
    Verifies that all 30 records (including line 20 with commas in comments) are parsed and analyzed.
    """
    res = client.post("/api/analyze-sample/sample_instagram_sentiment.csv")
    assert res.status_code == 200
    data = res.json()
    assert "analysis_id" in data
    aid = data["analysis_id"]
    summary = data["summary"]
    
    # 30 rows in sample dataset
    assert summary["total_analyzed"] == 30
    assert summary["positive_count"] > 0
    assert summary["negative_count"] > 0
    assert summary["neutral_count"] > 0
    
    # Verify line 20 ("Horrible bug in the latest patch, crashes every five minutes!") is present
    posts_res = client.get(f"/api/results/{aid}/posts?search=Horrible+bug")
    assert posts_res.status_code == 200
    posts_data = posts_res.json()
    assert posts_data["filtered_items"] == 1
    found_item = posts_data["items"][0]
    assert "crashes every five minutes!" in found_item["original_text"]
    assert found_item["predicted_sentiment"] == "Negative"

    # Verify CSV and Excel export for the sample
    csv_exp = client.get(f"/api/results/{aid}/export?format=csv")
    assert csv_exp.status_code == 200
    assert "text/csv" in csv_exp.headers["content-type"]

    excel_exp = client.get(f"/api/results/{aid}/export?format=excel")
    assert excel_exp.status_code == 200
    assert "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" in excel_exp.headers["content-type"]


def test_analyze_sample_dataset_unlabeled_workflow():
    """
    Tests 'Analyze This Sample' on sample_unlabeled_social_posts.csv.
    Verifies that all 20 records (including line 5 with multiple commas in comments) are parsed and analyzed.
    """
    res = client.post("/api/analyze-sample/sample_unlabeled_social_posts.csv")
    assert res.status_code == 200
    data = res.json()
    aid = data["analysis_id"]
    summary = data["summary"]
    assert summary["total_analyzed"] == 20

    # Verify line 5 ("Best pasta I have ever eaten in my entire life! Creamy, fresh, and bursting with flavor 🍝😋")
    posts_res = client.get(f"/api/results/{aid}/posts?search=Best+pasta")
    assert posts_res.status_code == 200
    posts_data = posts_res.json()
    assert posts_data["filtered_items"] == 1
    item = posts_data["items"][0]
    assert "Creamy, fresh, and bursting with flavor" in item["original_text"]
    assert item["predicted_sentiment"] == "Positive"


def test_csv_with_commas_in_quoted_comments():
    csv_data = (
        'id,text,likes\n'
        '1,"The service was fast, friendly, and exceptional!",15\n'
        '2,"Late delivery, damaged box, but support was helpful.",3\n'
        '3,"Just average, nothing special, nothing bad.",1\n'
    )
    files = {"file": ("quoted_commas.csv", csv_data.encode("utf-8"), "text/csv")}
    res = client.post("/api/analyze", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["summary"]["total_analyzed"] == 3


def test_csv_with_emojis_and_unicode():
    csv_data = (
        'id,comment\n'
        '1,"Pure magic and joy! 🌟✨🎉 Loved every single second 😍"\n'
        '2,"Absolument magnifique! Délicieux repas à Paris 🇫🇷"\n'
        '3,"Terrible experience and awful quality! 😡💥 Never using this again 👎"\n'
    )
    files = {"file": ("unicode_emojis.csv", csv_data.encode("utf-8"), "text/csv")}
    res = client.post("/api/analyze", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["summary"]["total_analyzed"] == 3
    assert data["summary"]["positive_count"] >= 1
    assert data["summary"]["negative_count"] >= 1
    assert any("😍" in item["cleaned_text"] for item in data["preview_items"])


def test_csv_with_properly_escaped_quotes():
    csv_data = (
        'id,comment\n'
        '1,"She said, ""This is the best experience ever!"" and smiled."\n'
        '2,"The term ""guaranteed refund"" was a complete lie."\n'
    )
    files = {"file": ("escaped_quotes.csv", csv_data.encode("utf-8"), "text/csv")}
    res = client.post("/api/analyze", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["summary"]["total_analyzed"] == 2


def test_csv_with_utf8_bom():
    # Prepend UTF-8 BOM bytes (\xef\xbb\xbf)
    csv_data = b'\xef\xbb\xbfcomment,author\n"Awesome platform!",alice\n"Terrible bug",bob\n'
    files = {"file": ("bom_test.csv", csv_data, "text/csv")}
    res = client.post("/api/analyze", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["summary"]["total_analyzed"] == 2


def test_csv_with_empty_values():
    csv_data = (
        'id,comment\n'
        '1,"Great job!"\n'
        '2,""\n'
        '3,   \n'
        '4,"Horrible experience"\n'
    )
    files = {"file": ("empty_rows.csv", csv_data.encode("utf-8"), "text/csv")}
    res = client.post("/api/analyze", files=files)
    assert res.status_code == 200
    data = res.json()
    # 2 rows with text, 2 empty rows excluded
    assert data["summary"]["total_analyzed"] == 2
    assert data["summary"]["preprocessing"]["empty_removed"] == 2


def test_csv_genuinely_malformed_rejected_with_clear_error():
    # Line 2 has an unquoted comma producing 3 columns when header has 2
    malformed_csv = (
        'id,comment\n'
        '1,valid text\n'
        '2,unquoted comma,extra column here\n'
        '3,valid text\n'
    )
    files = {"file": ("malformed.csv", malformed_csv.encode("utf-8"), "text/csv")}
    res = client.post("/api/analyze", files=files)
    assert res.status_code == 400
    err = res.json()
    assert "Could not parse CSV file" in err["detail"]
    assert "Error tokenizing data" in err["detail"]


def test_excel_file_upload_and_analysis():
    import io
    import pandas as pd
    excel_df = pd.DataFrame({
        "post": ["Brilliant and extraordinary performance!", "Awful customer service, very disappointed", "Meeting at 5 PM"],
        "user": ["user1", "user2", "user3"]
    })
    excel_buf = io.BytesIO()
    excel_df.to_excel(excel_buf, index=False, engine="openpyxl")
    files = {"file": ("test_data.xlsx", excel_buf.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    res = client.post("/api/analyze", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["summary"]["total_analyzed"] == 3
    assert data["summary"]["positive_count"] == 1
    assert data["summary"]["negative_count"] == 1
    assert data["summary"]["neutral_count"] == 1
    assert len(data["preview_items"]) == 3
    assert any("Brilliant" in item.get("cleaned_text", "") for item in data["preview_items"])

