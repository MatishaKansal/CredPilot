# CredPilot

**Predict. Trust. Proceed.**

An AI-powered loan default prediction platform for microfinance institutions, built with three role-based portals — applicants, loan officers, and bank admins — backed by an explainable ML model and an LLM assistant.

---

## Problem statement

Microfinance institutions serve borrowers who have no formal credit history (no CIBIL score, no credit card), making loan risk assessment almost entirely manual and inconsistent. Loan officers rely on gut feeling, leading to avoidable defaults and inconsistent approval decisions across branches. CredPilot replaces this with a data-driven, explainable risk score — without requiring any credit bureau data.

---

## Key features

- **Risk prediction** — XGBoost model trained on 300K+ historical loan records, achieving an AUC of 0.73 using only fields a field officer can realistically collect (income, employment, family status, past repayment behavior).
- **Explainability (SHAP)** — every prediction comes with a plain-language breakdown of which factors increased or decreased the applicant's risk, instead of a black-box score.
- **Three role-based portals**:
  - **Applicant** — apply for a loan, check eligibility, track application status, chat with an AI assistant for guidance.
  - **Loan officer** — review a queue of applications, view risk scores and SHAP explanations, approve/reject/request documents.
  - **Admin** — monitor approval trends, audit officer performance, and run a fairness audit across gender/education/region.
  - 
- **LLM assistant** — converts SHAP values and applicant data into plain-language explanations (e.g. "why was I rejected", "summarise this week's risk trends").
- **Fairness audit** — checks whether the model's predictions are biased by gender, education level, or region — a step most student ML projects skip entirely.

---

## Tech stack

| Layer | Technology |
|---|---|
| ML model | XGBoost, SHAP, scikit-learn |
| Backend | FastAPI, SQLite |
| Frontend | React, Tailwind CSS, React Router, Axios |
| LLM | Claude / Gemini API |
| Data | [Home Credit Default Risk](https://www.kaggle.com/c/home-credit-default-risk) (Kaggle) |

---

## Project structure

```
credpilot/
├── notebooks/          # Data exploration, cleaning, model training (Jupyter)
├── model/              # Saved model.pkl and explainer.pkl
├── backend/
│   ├── main.py          # FastAPI entry point
│   ├── database.py      # SQLite schema and connection
│   ├── llm.py            # LLM API integration
│   ├── ml/
│   │   └── predict.py    # Model loading and prediction logic
│   └── routers/
│       ├── applicant.py
│       ├── officer.py
│       └── admin.py
├── frontend/
│   └── src/
│       ├── components/   # Reusable UI (StatCard, DataTable, ChatWindow, Sidebar, etc.)
│       ├── portals/      # Role-specific pages (user, employee, admin)
│       ├── pages/        # Public pages (Login, Register)
│       ├── services/     # API calls (Axios)
│       ├── context/      # Auth state
│       └── routes/       # Route definitions and role-based protection
└── README.md
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

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Model training (optional — pre-trained model included)
```bash
cd notebooks
jupyter notebook
# Run 01_test_setup.ipynb through 05_shap_explainability.ipynb in order
```

---

## Future scope

- Multi-language support for the applicant chat assistant (Hindi and regional languages)
- Mobile-first responsive design
- Integration with all 7 Home Credit data tables for improved AUC
- Real bank deployment pilot with anonymized live data

---
