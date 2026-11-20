# SocialPulse — Social Media Sentiment Analysis

A full-stack, data analytics and sentiment visualization dashboard for social media posts, built for the college project **Social Media Sentiment Analysis**.

---

## 1. Project Details & Team Credentials

- **Project Title:** Social Media Sentiment Analysis
- **System Name:** SocialPulse Sentiment Analytics
- **Team Members & SRNs:**
  - **KRITHIKA** — `R25DG010`
  - **TEJASWINI S** — `R25DG026`
- **Objective:**
  To analyze user comments and posts from social media, clean and preprocess unstructured text, classify opinions into **Positive**, **Neutral**, and **Negative** categories using Natural Language Processing (NLP), calculate accurate percentage distributions, visualize insights with interactive charts, and enable authenticated results export.

---

## 2. Notebook Reuse & Methodology Integration

This application directly preserves and refactors the exact methodology from the original Jupyter Notebook (`sentiment_analysis(1).ipynb`):

1. **Text Preprocessing Pipeline:**
   - Filters null and blank comments.
   - Cleans URLs (`http://`, `https://`, `www.`).
   - Normalizes user mentions (`@username`).
   - Extracts semantic words from hashtags (`#bestphone` &rarr; `bestphone`) to protect sentiment information.
   - Preserves emojis (crucial emotional signals for social sentiment).
   - Removes duplicate posts (deduplication) while keeping track of pre- and post-cleaning metrics.
   - Preserves both `original_text` and `cleaned_text` side-by-side for comparison.

2. **Classification Logic:**
   - Evaluates text using **TextBlob NLP Polarity** (`-1.0` to `+1.0`).
   - Applies the notebook's threshold rules:
     - $\text{Polarity} > 0.05 \implies \textbf{Positive}$
     - $\text{Polarity} < -0.05 \implies \textbf{Negative}$
     - $-0.05 \le \text{Polarity} \le 0.05 \implies \textbf{Neutral}$
   - Normalizes existing sentiment labels (`pos`, `neg`, `neu`) if already supplied in the dataset.
   - Clearly separates original dataset labels from algorithm predictions.

3. **Analytics & Visualizations:**
   - Calculates dynamic counts and percentages: $\text{Percentage} = \frac{\text{Category Count}}{\text{Total Classified Posts}} \times 100$.
   - Interactive bar chart displaying sentiment counts.
   - Proportional donut chart with exact percentage breakdown.
   - Structured summary table.
   - Dominant sentiment interpretation with statistical clarity.

---

## 3. Technology Stack

- **Backend:**
  - Python 3.10+ / 3.13
  - FastAPI (REST API framework)
  - TextBlob (NLP sentiment analyzer)
  - Pandas & OpenPyXL (CSV & Excel processing)
  - Uvicorn (ASGI web server)
  - Pytest (Automated test suite)

- **Frontend:**
  - React 18
  - Vite (Build tool & development server)
  - TypeScript (Static type safety)
  - Tailwind CSS (Modern SaaS dashboard styling)
  - Recharts (Interactive SVG data visualizations)
  - Lucide React (Clean icon set)

---

## 4. Project Structure

```text
sentiment_analysis/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entrypoint & CORS
│   │   ├── preprocessing.py            # Social media text cleaning & deduplication
│   │   ├── sentiment.py                # NLP classification & distribution logic
│   │   ├── schemas.py                  # Pydantic data validation models
│   │   ├── routes/
│   │   │   └── api.py                  # REST API endpoints (upload, analyze, posts, export)
│   │   └── services/
│   │       └── analysis_service.py     # File parsing, analysis runner, pagination, export
│   ├── requirements.txt                # Python backend dependencies
│   └── tests/
│       ├── test_preprocessing.py       # Unit tests for text cleaning & normalization
│       ├── test_sentiment.py           # Unit tests for polarity thresholds & percentages
│       └── test_api.py                 # Integration tests for FastAPI endpoints
├── frontend/
│   ├── src/
│   │   ├── components/                 # UI components (Header, Sidebar, MetricCard, etc.)
│   │   ├── pages/                      # Page views (Overview, Analyze, Results, Explorer, About)
│   │   ├── services/                   # Frontend API client
│   │   ├── types/                      # TypeScript interfaces
│   │   ├── App.tsx                     # Main layout & tab router
│   │   └── main.tsx                    # React mounting entrypoint
│   ├── package.json                    # Node dependencies & build scripts
│   ├── tailwind.config.js              # Theme & sentiment color palette
│   └── vite.config.ts                  # Vite proxy & server configuration
├── datasets/
│   ├── sample_instagram_sentiment.csv  # Instagram post comments matching notebook structure
│   └── sample_unlabeled_social_posts.csv# Raw unlabeled tweets & posts for fresh classification
├── start_backend.bat                   # 1-click Windows backend runner
├── start_frontend.bat                  # 1-click Windows frontend runner
├── run_all.bat                         # 1-click full-stack launcher
├── README.md                           # Documentation & setup guide
└── .gitignore                          # Ignored caches & artifacts
```

---

## 5. Prerequisites & Environment Setup

Ensure you have the following installed on your machine:
- **Python**: Version 3.10 or higher (`python --version`)
- **Node.js**: Version 18.0 or higher (`node -v`)
- **npm**: Version 9.0 or higher (`npm -v`)

---

## 6. How to Run the Application

### Option A: One-Click Startup (Windows)

Simply double-click:
```cmd
run_all.bat
```
This script automatically starts the FastAPI server on port 8000, launches the React Vite dev server on port 5173, and opens your default browser at `http://127.0.0.1:5173`.

---

### Option B: Step-by-Step Manual Startup

#### Step 1: Start the Backend (Terminal 1)

1. Open a terminal in the project directory (`D:\sentiment_analysis`):
   ```powershell
   cd D:\sentiment_analysis
   ```

2. (Optional) Create and activate a Python virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. Install backend dependencies:
   ```powershell
   python -m pip install -r backend/requirements.txt
   ```

4. Run the FastAPI development server:
   ```powershell
   python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
   ```
   Backend will be running at `http://127.0.0.1:8000`.  
   Interactive Swagger documentation is available at `http://127.0.0.1:8000/docs`.

#### Step 2: Start the Frontend (Terminal 2)

1. Open a second terminal window in `D:\sentiment_analysis\frontend`:
   ```powershell
   cd D:\sentiment_analysis\frontend
   ```

2. Install frontend dependencies:
   ```powershell
   npm install
   ```

3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
   The application UI will be accessible at `http://127.0.0.1:5173`.

---

## 7. How to Use the Application

1. **Dashboard Overview:**
   - View top-level sentiment counts, percentages, and distribution charts once a dataset is loaded.
2. **Analyze Posts (Dataset Upload):**
   - **Upload Custom File:** Drag and drop your `.csv` or `.xlsx` file.
   - **Column Selection:** The platform automatically detects comment and text columns (e.g., `text`, `comment`, `message`). You can override this selection with the dropdown.
   - **Preprocessing Options:** Toggle deduplication, URL/mention normalization, and customize polarity thresholds if needed.
   - **Preloaded Samples:** Click any sample card (e.g., *Sample Instagram Sentiment* or *Sample Unlabeled Social Posts*) to test immediately without manual uploading.
   - Click **"Analyze Posts & Generate Insights"**.
3. **Single Comment Analyzer (New):**
   - Navigate to **"Single Comment Analyzer"** from the sidebar.
   - Type or paste an individual post, tweet, or comment into the text area (up to 2,000 characters).
   - Alternatively, click any of the 4 interactive example comments to populate sample text.
   - Click **"Analyze Sentiment"** to classify immediately without uploading a file.
   - Inspect the classified sentiment badge (Positive, Neutral, Negative), the continuous polarity score on a visual gauge from `-1.0` to `+1.0`, and the side-by-side original vs. preprocessed text comparison.
4. **Review Results & Visualizations:**
   - Inspect the **Frequency Distribution Bar Chart** and **Proportional Share Donut Chart**.
   - Read the **Dominant Perception** analysis and summary table.
5. **Explore Individual Comments:**
   - Go to **Comment Explorer** to search posts by keyword, filter by Positive / Neutral / Negative, or sort by polarity score.
   - Click the eye icon next to any comment to view its original vs. preprocessed text.
6. **Download / Export Results:**
   - Click **"Export Dataset"** to download the analysis as a clean CSV or Excel spreadsheet containing both original and cleaned text, classification labels, and polarity scores.

---

## 8. Single Comment REST API Endpoint

The platform exposes a dedicated REST endpoint for classifying individual comments:

- **Endpoint:** `POST /api/analyze-single`
- **Content-Type:** `application/json`

**Sample Request:**
```json
{
  "text": "I really enjoyed the event! The speakers were inspiring and wonderful ✨ #blessed"
}
```

**Sample Response:**
```json
{
  "original_text": "I really enjoyed the event! The speakers were inspiring and wonderful ✨ #blessed",
  "cleaned_text": "I really enjoyed the event! The speakers were inspiring and wonderful ✨ blessed",
  "polarity": 0.75,
  "sentiment": "Positive",
  "subjectivity": 0.85
}
```

*Note:* Polarity ranges from `-1.0` (strongly negative) to `+1.0` (strongly positive). Classification thresholds match the notebook methodology:
- $\text{Polarity} > 0.05 \implies \textbf{Positive}$
- $\text{Polarity} < -0.05 \implies \textbf{Negative}$
- $-0.05 \le \text{Polarity} \le 0.05 \implies \textbf{Neutral}$

---

## 9. Running Automated Tests

To run the backend test suite verifying text preprocessing, polarity scoring, single comment classification, and API endpoints:

```powershell
$env:PYTHONPATH="backend"
python -m pytest backend/tests -v
```

All 23 test cases cover:
- Single comment classification (Positive, Negative, Neutral)
- Empty string and whitespace-only validation rejection (422 status)
- Excessively long input rejection (>2000 chars)
- URL, hashtag, mention, and emoji handling in single comments
- URL and link stripping in datasets
- User mention handling
- Hashtag word extraction
- Emoji preservation
- Redundant whitespace normalization
- Polarity threshold classification
- Sentiment percentage calculations
- Missing column and empty dataset validation
- API preview, analysis, and export workflows

---

## 10. Common Troubleshooting

- **Port 8000 already in use:**
  If another process is using port 8000, start the backend on port 8001:
  ```powershell
  python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
  ```
  Then update the proxy target in `frontend/vite.config.ts`.
- **TextBlob corpus missing:**
  If TextBlob requires word corpora, run:
  ```powershell
  python -m textblob.download_corpora
  ```
- **File Upload Errors:**
  Ensure the uploaded file is encoded in `utf-8`, `latin1`, or standard Excel format, and contains at least one text or comment column.
