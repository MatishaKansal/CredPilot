# CredPilot

**Predict. Trust. Proceed.**

An AI-powered loan default prediction platform for microfinance institutions, built with three role-based portals — applicants, loan officers, and bank admins — backed by an explainable ML model and Gemini-powered support assistants.

---

## Problem statement

Microfinance institutions serve borrowers who have no formal credit history (no CIBIL score, no credit card), making loan risk assessment almost entirely manual and inconsistent. Loan officers rely on gut feeling, leading to avoidable defaults and inconsistent approval decisions across branches. CredPilot replaces this with a data-driven, explainable risk score — without requiring any credit bureau data.

---

## Key features

- **Risk prediction** — XGBoost model trained on 300K+ historical loan records, achieving an AUC of 0.73 using only fields a field officer can realistically collect (income, employment, family status, past repayment behavior).
- **Explainability (SHAP)** — every prediction comes with a plain-language breakdown of which factors increased or decreased the applicant's risk, instead of a black-box score.
- **Eligibility pre-check** — applicants can run a lightweight risk estimate before submitting a full loan application.
- **Three role-based portals**:
  - **Applicant** — apply for a loan, check eligibility, track application status, manage profile, and chat with an AI support assistant.
  - **Loan officer** — review assigned applications, view risk scores and SHAP explanations, approve/reject/request additional information, and access performance reports.
  - **Admin** — monitor approval trends, manage employees and customers, audit officer performance, run fairness-oriented analytics, and use an admin support assistant.
- **Role-based LLM assistants** — Gemini-powered support chat for applicants, employees, and admins, with separate API keys and system prompts per role.
- **Fairness audit** — checks whether the model's predictions are biased by gender, education level, or region — a step most student ML projects skip entirely.

---

## Tech stack

| Layer | Technology |
|---|---|
| ML model | XGBoost, SHAP, scikit-learn |
| Backend | FastAPI, Supabase (PostgreSQL) |
| Frontend | React, Tailwind CSS, React Router, Axios, Recharts |
| LLM | Google Gemini API |
| Data | [Home Credit Default Risk](https://www.kaggle.com/c/home-credit-default-risk) (Kaggle) |

---

## Project structure

```
CredPilot/
├── notebooks/              # Data exploration, cleaning, and model training (Jupyter)
├── model/                  # Saved model.pkl (pre-trained)
├── Backend/
│   ├── app.py              # FastAPI entry point and API routes
│   ├── database.py         # Supabase client
│   ├── risk_model.py       # Model loading, feature engineering, and prediction
│   ├── shap_explainer.py   # SHAP value extraction and human-readable labels
│   ├── dashboard_analytics.py  # Role-specific dashboard and report builders
│   ├── api/
│   │   ├── schemas.py      # Pydantic request/response models
│   │   └── utils.py        # ID generation and helpers
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── pages/
        │   ├── User/       # Applicant portal (dashboard, apply, eligibility, support)
        │   ├── Employee/   # Loan officer portal
        │   ├── Admin/      # Admin portal
        │   ├── Login/
        │   ├── Register/
        │   └── LandingPage/
        ├── services/       # Axios API clients
        ├── context/        # Auth state (AuthContext)
        └── utils/          # Export helpers and role-specific utilities
```

---

## Model performance

| Metric | Score |
|---|---|
| AUC-ROC | 0.73 |
| Recall (defaulters) | 0.55 |
| Precision (non-defaulters) | 0.94 |

The dataset's known competitive ceiling (per the original $70,000 Kaggle competition) is approximately 0.80–0.81, achieved using all 7 relational tables and extensive ensembling. This project uses 3 tables and a focused feature set chosen for real-world collectibility by a field loan officer — prioritizing interpretability and practical deployability over a marginal AUC gain.

---

## Getting started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Supabase](https://supabase.com/) project with the CredPilot schema applied
- Google Gemini API keys (one per support assistant role, or shared)

### Backend

```bash
cd Backend
pip install -r requirements.txt
pip install supabase python-dotenv passlib pydantic
cp .env.example .env
uvicorn app:app --reload
```

The API runs at `http://127.0.0.1:8000`.

Configure `Backend/.env`:

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase service/anon key |
| `GEMINI_API_KEY` | Applicant support assistant |
| `GEMINI_EMPLOYEE_API_KEY` | Employee support assistant |
| `GEMINI_ADMIN_API_KEY` | Admin support assistant |

Optional model overrides: `GEMINI_MODEL`, `GEMINI_EMPLOYEE_MODEL`, `GEMINI_ADMIN_MODEL` (default: `gemini-2.0-flash`).

### Frontend

```bash
cd frontend
npm install
npm start
```

The app runs at `http://localhost:3000` and expects the backend on port `8000`.

### Model training (optional — pre-trained model included)

```bash
cd notebooks
jupyter notebook
```

Suggested order: `01_test_setup.ipynb` → `02_explore_data.ipynb` → `03_clean_data.ipynb` → `04_train_model.ipynb`, then the updated feature notebooks (`05`–`08`) as needed.

---

## API overview

| Area | Endpoints |
|---|---|
| Auth | `POST /register`, `POST /login` |
| Applicant | `GET/PATCH /applicant/{id}/profile`, `GET /applicant/{id}/dashboard`, `POST /applicant/{id}/eligibility-check`, `POST/GET /applicant/{id}/applications`, `POST /applicant/{id}/support-chat` |
| Employee | `GET /employee/{id}/dashboard`, `GET /employee/{id}/applications`, `PATCH /employee/{id}/applications/{app_id}/review`, `POST /employee/{id}/support-chat` |
| Admin | `GET /admin/dashboard`, `GET /admin/reports`, `GET/POST/PATCH/DELETE /admin/employees`, `GET /admin/applications`, `PATCH /admin/applications/{id}/review`, `POST /admin/{id}/support-chat` |

Interactive docs: `http://127.0.0.1:8000/docs`

---

## Future scope

- Multi-language support for the applicant chat assistant (Hindi and regional languages)
- Mobile-first responsive design
- Integration with all 7 Home Credit data tables for improved AUC
- Real bank deployment pilot with anonymized live data

---
