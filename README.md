# 🚀 CredPilot

# Predict. Trust. Proceed.

**An AI-powered loan default prediction platform for Microfinance Institutions featuring Explainable AI, Role-Based Portals, and Gemini-powered AI assistants.**

---

## 📖 Overview

Microfinance institutions often lend to borrowers with **little or no formal credit history**, making loan approval a largely manual and subjective process. This can lead to inconsistent decisions and higher default rates.

**CredPilot** provides an AI-driven decision support system that predicts loan default risk using machine learning, explains every prediction using SHAP, and offers Gemini-powered AI assistants tailored for applicants, loan officers, and administrators.

Unlike traditional credit scoring systems, CredPilot relies only on information that a field loan officer can realistically collect, making it suitable for real-world microfinance environments.

---

## ✨ Key Features

### 🤖 AI-Powered Risk Prediction

- Predicts loan default probability using **XGBoost**
- Trained on **300,000+ historical loan records**
- Uses practical applicant information instead of credit bureau data
- Achieved **AUC-ROC of 0.73**

### 🔍 Explainable AI (SHAP)

Every prediction is accompanied by an easy-to-understand explanation showing:

- Factors increasing risk
- Factors reducing risk
- Feature importance
- Human-readable reasoning instead of a black-box score

### 📝 Eligibility Pre-check

Applicants can estimate their loan eligibility before submitting a complete application.

### 👥 Three Role-Based Portals

#### 👤 Applicant

- Register & Login
- Eligibility Prediction
- Apply for Loan
- Track Applications
- Manage Profile
- AI Support Assistant

#### 👨‍💼 Loan Officer

- Review Assigned Applications
- View Risk Scores
- SHAP Explanations
- Approve / Reject Applications
- Request Additional Information
- Performance Dashboard
- AI Assistant

#### 🏢 Admin

- Employee Management
- Customer Management
- Approval Analytics
- Fairness Reports
- Officer Performance Monitoring
- AI Assistant

### 💬 Gemini AI Assistants

Dedicated AI assistants are available for:

- Applicant Support
- Employee Support
- Admin Support

Each assistant uses its own prompt and API key for role-specific assistance.

### ⚖️ Fairness Audit

The platform evaluates prediction bias across:

- Gender
- Education Level
- Region

to encourage responsible AI deployment.

---

## 🧠 Machine Learning Pipeline

```text
Loan Dataset
      │
      ▼
Data Cleaning
      │
      ▼
Feature Engineering
      │
      ▼
XGBoost Model
      │
      ▼
Risk Prediction
      │
      ▼
SHAP Explainability
      │
      ▼
Human-readable Explanation
      │
      ▼
Loan Decision Support
```

---

## 📊 Model Performance

| Metric | Score |
|--------|------:|
| AUC-ROC | **0.73** |
| Recall (Defaulters) | **0.55** |
| Precision (Non-Defaulters) | **0.94** |

> The original Home Credit Kaggle competition achieved approximately **0.80–0.81 AUC** using all seven relational tables and advanced ensembling techniques. CredPilot intentionally prioritizes interpretability and practical deployment by using three tables and features that can realistically be collected during field verification.

---

## 🏗️ System Architecture

```text
                React Frontend
                      │
                      ▼
              FastAPI Backend
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
 Supabase Database           XGBoost Model
                                    │
                                    ▼
                            SHAP Explainer
                                    │
                                    ▼
                        Human-readable Output
                                    │
                                    ▼
                          Gemini AI Assistants
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---------|------------|
| Frontend | React, Tailwind CSS, React Router, Axios, Recharts |
| Backend | FastAPI |
| Database | Supabase (PostgreSQL) |
| Machine Learning | XGBoost, SHAP, scikit-learn |
| AI | Google Gemini API |
| Dataset | Home Credit Default Risk |

---

## 📂 Project Structure

```text
CredPilot/
│
├── notebooks/
│   ├── Data exploration
│   ├── Data cleaning
│   ├── Feature engineering
│   └── Model training
│
├── model/
│   └── model.pkl
│
├── Backend/
│   ├── app.py
│   ├── database.py
│   ├── risk_model.py
│   ├── shap_explainer.py
│   ├── dashboard_analytics.py
│   ├── api/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   └── src/
│       ├── pages/
│       ├── services/
│       ├── context/
│       └── utils/
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Supabase Project
- Google Gemini API Keys

### Backend

```bash
cd Backend

pip install -r requirements.txt

pip install supabase python-dotenv passlib pydantic

cp .env.example .env

uvicorn app:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

### Frontend

```bash
cd frontend

npm install

npm start
```

Frontend runs at:

```text
http://localhost:3000
```

---

## 📚 API Overview

### Authentication

- `POST /register`
- `POST /login`

### Applicant

- Eligibility Check
- Loan Application
- Dashboard
- Profile
- Support Chat

### Employee

- Dashboard
- Assigned Applications
- Review Applications
- Support Chat

### Admin

- Dashboard
- Reports
- Employee Management
- Application Review
- Support Chat

Interactive API Documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 🔮 Future Scope

- 🌐 Multi-language AI Assistant
- 📱 Mobile-first Responsive Design
- 📈 Integration with all Home Credit tables
- 🏦 Real-world Banking Deployment
- 📊 Advanced Explainability Dashboard
- 📄 PDF Report Generation
- 🔔 Notification System

---

## 📚 Dataset

**Home Credit Default Risk**

https://www.kaggle.com/c/home-credit-default-risk

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub!
