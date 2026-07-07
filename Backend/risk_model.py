from __future__ import annotations

import pickle
from datetime import date, datetime
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

ROOT_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = ROOT_DIR / "model" / "model.pkl"
DATA_PATH = ROOT_DIR / "data" / "added_features_clean_data.csv"

FEATURE_COLUMNS = [
    "AMT_INCOME_TOTAL",
    "AMT_CREDIT",
    "AMT_ANNUITY",
    "CNT_CHILDREN",
    "CODE_GENDER",
    "NAME_EDUCATION_TYPE",
    "NAME_FAMILY_STATUS",
    "FLAG_OWN_CAR",
    "FLAG_OWN_REALTY",
    "REGION_POPULATION_RELATIVE",
    "AMT_GOODS_PRICE",
    "NAME_INCOME_TYPE",
    "ORGANIZATION_TYPE",
    "TOTAL_PAST_LOANS",
    "TOTAL_PAST_DEFAULTS",
    "AVG_DAYS_OVERDUE",
    "AVG_DEBT_REMAINING",
    "TOTAL_CREDIT_SUM",
    "PREV_APP_COUNT",
    "PREV_APPROVED",
    "PREV_REFUSED",
    "AVG_PREV_CREDIT",
    "MAX_PREV_CREDIT",
    "AVG_PREV_ANNUITY",
    "AVG_PREV_INSTALLMENTS",
    "AVG_DAYS_LATE",
    "MAX_DAYS_LATE",
    "NUM_LATE_PAYMENTS",
    "AVG_PAYMENT_RATIO",
    "MIN_PAYMENT_RATIO",
    "AVG_UTILIZATION",
    "MAX_UTILIZATION",
    "HIGH_UTILIZATION_RATE",
    "AVG_DPD",
    "MAX_DPD",
    "AVG_BALANCE",
    "DEBT_TO_INCOME",
    "ANNUITY_TO_INCOME",
    "CREDIT_TO_GOODS",
    "AGE_YEARS",
    "EMPLOYMENT_YEARS",
    "REGISTRATION_YEARS",
    "EMPLOYMENT_TO_AGE",
    "CREDIT_TO_AGE",
    "INCOME_PER_PERSON",
    "ANNUITY_TO_GOODS",
    "LOANS_PER_YEAR",
    "TOTAL_DEBT_TO_INCOME",
    "PAST_DEFAULT_RATE",
    "PREV_APPROVAL_RATE",
    "PREV_REFUSAL_RATE",
]

EDUCATION_MAP = {
    "Secondary": 1,
    "Higher Secondary": 2,
    "Graduate": 3,
    "Postgraduate": 4,
    "Other": 0,
}

MARITAL_MAP = {
    "Single": 0,
    "Married": 1,
    "Divorced": 2,
    "Widowed": 3,
}

EMPLOYMENT_MAP = {
    "Salaried": 4,
    "Self-employed": 1,
    "Self-Employed": 1,
    "Daily wage": 2,
    "Unemployed": 7,
}

REGION_MAP = {
    "Urban": 0.018,
    "Semi-urban": 0.010,
    "Rural": 0.004,
}

_model = None
_feature_medians: dict[str, float] | None = None


def _load_model():
    global _model
    if _model is not None:
        return _model
    if MODEL_PATH.exists():
        try:
            with MODEL_PATH.open("rb") as handle:
                _model = pickle.load(handle)
        except Exception:
            _model = None
    return _model


def _load_feature_medians() -> dict[str, float]:
    global _feature_medians
    if _feature_medians is not None:
        return _feature_medians

    if DATA_PATH.exists():
        df = pd.read_csv(DATA_PATH, usecols=FEATURE_COLUMNS)
        _feature_medians = df.median(numeric_only=True).to_dict()
        return _feature_medians

    _feature_medians = {
        "AMT_INCOME_TOTAL": 135000.0,
        "AMT_CREDIT": 450000.0,
        "AMT_ANNUITY": 25000.0,
        "CNT_CHILDREN": 0.0,
        "CODE_GENDER": 1.0,
        "NAME_EDUCATION_TYPE": 2.0,
        "NAME_FAMILY_STATUS": 1.0,
        "FLAG_OWN_CAR": 0.0,
        "FLAG_OWN_REALTY": 1.0,
        "REGION_POPULATION_RELATIVE": 0.01,
        "AMT_GOODS_PRICE": 400000.0,
        "NAME_INCOME_TYPE": 4.0,
        "ORGANIZATION_TYPE": 20.0,
        "TOTAL_PAST_LOANS": 2.0,
        "TOTAL_PAST_DEFAULTS": 0.0,
        "AVG_DAYS_OVERDUE": 0.0,
        "AVG_DEBT_REMAINING": 0.0,
        "TOTAL_CREDIT_SUM": 250000.0,
        "PREV_APP_COUNT": 1.0,
        "PREV_APPROVED": 1.0,
        "PREV_REFUSED": 0.0,
        "AVG_PREV_CREDIT": 200000.0,
        "MAX_PREV_CREDIT": 300000.0,
        "AVG_PREV_ANNUITY": 15000.0,
        "AVG_PREV_INSTALLMENTS": 12.0,
        "AVG_DAYS_LATE": 0.0,
        "MAX_DAYS_LATE": 0.0,
        "NUM_LATE_PAYMENTS": 0.0,
        "AVG_PAYMENT_RATIO": 1.0,
        "MIN_PAYMENT_RATIO": 1.0,
        "AVG_UTILIZATION": 0.25,
        "MAX_UTILIZATION": 0.5,
        "HIGH_UTILIZATION_RATE": 0.08,
        "AVG_DPD": 0.0,
        "MAX_DPD": 0.0,
        "AVG_BALANCE": 25000.0,
        "DEBT_TO_INCOME": 2.0,
        "ANNUITY_TO_INCOME": 0.12,
        "CREDIT_TO_GOODS": 1.05,
        "AGE_YEARS": 40.0,
        "EMPLOYMENT_YEARS": 3.0,
        "REGISTRATION_YEARS": 8.0,
        "EMPLOYMENT_TO_AGE": 0.08,
        "CREDIT_TO_AGE": 10000.0,
        "INCOME_PER_PERSON": 120000.0,
        "ANNUITY_TO_GOODS": 0.07,
        "LOANS_PER_YEAR": 0.05,
        "TOTAL_DEBT_TO_INCOME": 0.0,
        "PAST_DEFAULT_RATE": 0.0,
        "PREV_APPROVAL_RATE": 1.0,
        "PREV_REFUSAL_RATE": 0.0,
    }
    return _feature_medians


def _age_years(date_of_birth: Any) -> float:
    if not date_of_birth:
        return 35.0
    if isinstance(date_of_birth, str):
        parsed = datetime.fromisoformat(date_of_birth[:10]).date()
    elif isinstance(date_of_birth, datetime):
        parsed = date_of_birth.date()
    else:
        parsed = date_of_birth
    today = date.today()
    return max(18.0, (today - parsed).days / 365.25)


def _application_features(application: dict[str, Any]) -> dict[str, float]:
    monthly_income = float(application.get("monthly_income") or 0)
    annual_income = max(monthly_income * 12, 1.0)
    loan_amount = float(application.get("loan_amount") or 0)
    tenure_months = max(int(application.get("tenure_months") or 12), 1)
    years_employed = float(application.get("years_employed") or 0)
    num_children = int(application.get("num_children") or 0)
    age_years = _age_years(application.get("date_of_birth"))

    num_past_loans = int(application.get("num_past_loans") or 0) if application.get("has_past_loans") else 0
    had_late = bool(application.get("had_late_payments")) if application.get("has_past_loans") else False
    outstanding_debt = float(application.get("existing_outstanding_debt") or 0) if application.get("has_past_loans") else 0.0

    monthly_emi = loan_amount / tenure_months if tenure_months else loan_amount / 12
    goods_price = max(loan_amount * 0.92, 1.0)

    gender = application.get("gender", "M")
    education = application.get("education_level", "Graduate")
    marital = application.get("marital_status", "Single")
    employment = application.get("employment_type", "Salaried")
    region = application.get("region_type", "Urban")

    prev_app_count = max(num_past_loans, 1)
    prev_refused = 1.0 if had_late else 0.0
    prev_approved = max(num_past_loans - int(had_late), 0)

    features = {
        "AMT_INCOME_TOTAL": annual_income,
        "AMT_CREDIT": loan_amount,
        "AMT_ANNUITY": monthly_emi * 12,
        "CNT_CHILDREN": num_children,
        "CODE_GENDER": 1.0 if str(gender).upper().startswith("M") else 0.0,
        "NAME_EDUCATION_TYPE": float(EDUCATION_MAP.get(education, 2)),
        "NAME_FAMILY_STATUS": float(MARITAL_MAP.get(marital, 0)),
        "FLAG_OWN_CAR": 1.0 if application.get("owns_car") else 0.0,
        "FLAG_OWN_REALTY": 1.0 if application.get("owns_house") else 0.0,
        "REGION_POPULATION_RELATIVE": REGION_MAP.get(region, 0.01),
        "AMT_GOODS_PRICE": goods_price,
        "NAME_INCOME_TYPE": float(EMPLOYMENT_MAP.get(employment, 4)),
        "ORGANIZATION_TYPE": 20.0,
        "TOTAL_PAST_LOANS": float(num_past_loans),
        "TOTAL_PAST_DEFAULTS": 1.0 if had_late else 0.0,
        "AVG_DAYS_OVERDUE": 15.0 if had_late else 0.0,
        "AVG_DEBT_REMAINING": outstanding_debt,
        "TOTAL_CREDIT_SUM": outstanding_debt + loan_amount,
        "PREV_APP_COUNT": float(prev_app_count),
        "PREV_APPROVED": float(prev_approved),
        "PREV_REFUSED": prev_refused,
        "AVG_PREV_CREDIT": outstanding_debt / max(num_past_loans, 1),
        "MAX_PREV_CREDIT": outstanding_debt,
        "AVG_PREV_ANNUITY": monthly_emi * 12,
        "AVG_PREV_INSTALLMENTS": float(min(tenure_months, 24)),
        "AVG_DAYS_LATE": -10.0 if had_late else 0.0,
        "MAX_DAYS_LATE": -5.0 if had_late else 0.0,
        "NUM_LATE_PAYMENTS": 1.0 if had_late else 0.0,
        "AVG_PAYMENT_RATIO": 0.85 if had_late else 1.0,
        "MIN_PAYMENT_RATIO": 0.75 if had_late else 1.0,
        "AVG_UTILIZATION": min(outstanding_debt / max(loan_amount, 1), 1.0),
        "MAX_UTILIZATION": min(outstanding_debt / max(loan_amount, 1), 1.0),
        "HIGH_UTILIZATION_RATE": 1.0 if outstanding_debt > annual_income * 0.4 else 0.0,
        "AVG_DPD": 5.0 if had_late else 0.0,
        "MAX_DPD": 10.0 if had_late else 0.0,
        "AVG_BALANCE": outstanding_debt / 2 if outstanding_debt else 0.0,
        "DEBT_TO_INCOME": loan_amount / annual_income,
        "ANNUITY_TO_INCOME": monthly_emi / max(monthly_income, 1),
        "CREDIT_TO_GOODS": loan_amount / goods_price,
        "AGE_YEARS": age_years,
        "EMPLOYMENT_YEARS": years_employed,
        "REGISTRATION_YEARS": 8.0,
        "EMPLOYMENT_TO_AGE": years_employed / max(age_years, 1),
        "CREDIT_TO_AGE": loan_amount / max(age_years, 1),
        "INCOME_PER_PERSON": annual_income / max(num_children + 1, 1),
        "ANNUITY_TO_GOODS": (monthly_emi * 12) / goods_price,
        "LOANS_PER_YEAR": num_past_loans / max(age_years, 1),
        "TOTAL_DEBT_TO_INCOME": outstanding_debt / annual_income,
        "PAST_DEFAULT_RATE": (1.0 / num_past_loans) if had_late and num_past_loans else 0.0,
        "PREV_APPROVAL_RATE": prev_approved / prev_app_count,
        "PREV_REFUSAL_RATE": prev_refused / prev_app_count,
    }

    medians = _load_feature_medians()
    for column in FEATURE_COLUMNS:
        value = features.get(column)
        if value is None or (isinstance(value, float) and np.isnan(value)):
            features[column] = float(medians[column])

    return features


def _risk_level(score: int) -> str:
    if score < 40:
        return "low"
    if score < 70:
        return "medium"
    return "high"


def _recommendation(score: int) -> str:
    if score < 40:
        return "approve"
    if score < 70:
        return "review"
    return "decline"


def _rule_based_score(features: dict[str, float]) -> tuple[int, list[dict[str, Any]]]:
    score = 35.0
    factors: list[dict[str, Any]] = []

    debt_to_income = features["DEBT_TO_INCOME"]
    if debt_to_income > 4:
        score += 22
        factors.append({"feature": "Loan to income ratio", "impact": "high", "direction": "risk"})
    elif debt_to_income > 2.5:
        score += 12
        factors.append({"feature": "Loan to income ratio", "impact": "medium", "direction": "risk"})

    annuity_ratio = features["ANNUITY_TO_INCOME"]
    if annuity_ratio > 0.45:
        score += 18
        factors.append({"feature": "EMI burden", "impact": "high", "direction": "risk"})
    elif annuity_ratio > 0.3:
        score += 8
        factors.append({"feature": "EMI burden", "impact": "medium", "direction": "risk"})

    if features["TOTAL_PAST_DEFAULTS"] > 0:
        score += 16
        factors.append({"feature": "Late payment history", "impact": "high", "direction": "risk"})

    if features["TOTAL_PAST_LOANS"] >= 3:
        score += 8
        factors.append({"feature": "Multiple past loans", "impact": "medium", "direction": "risk"})

    if features["NAME_INCOME_TYPE"] >= 7:
        score += 20
        factors.append({"feature": "Employment stability", "impact": "high", "direction": "risk"})
    elif features["EMPLOYMENT_YEARS"] < 1:
        score += 10
        factors.append({"feature": "Short employment tenure", "impact": "medium", "direction": "risk"})

    if features["FLAG_OWN_REALTY"] > 0:
        score -= 6
        factors.append({"feature": "Property ownership", "impact": "medium", "direction": "positive"})

    if features["AMT_INCOME_TOTAL"] > 300000:
        score -= 8
        factors.append({"feature": "Strong annual income", "impact": "medium", "direction": "positive"})

    bounded = int(max(5, min(95, round(score))))
    return bounded, factors[:5]


def predict_application_risk(application: dict[str, Any]) -> dict[str, Any]:
    from shap_explainer import explain_application_risk

    features = _application_features(application)
    model = _load_model()
    score = None
    risk_factors = []
    shap_explanation: dict[str, Any] = {"available": False, "features": []}
    default_probability: float | None = None
    source = "rules"

    if model is None:
        shap_explanation = {"available": False, "reason": "model_not_loaded", "features": []}

    if model is not None:
        try:
            frame = pd.DataFrame([features], columns=FEATURE_COLUMNS)
            default_probability = float(model.predict_proba(frame)[0][1])
            score = int(max(1, min(99, round(default_probability * 100))))
            shap_explanation = explain_application_risk(application, top_k=8)
            if shap_explanation.get("available"):
                risk_factors = [
                    {
                        "feature": item["feature"],
                        "impact": item["impact"],
                        "direction": item["direction"],
                        "shapValue": item["shapValue"],
                    }
                    for item in shap_explanation["features"][:5]
                ]
            source = "model"
        except Exception as exc:
            shap_explanation = {"available": False, "reason": f"model_error: {str(exc)}", "features": []}
            score = None

    if score is None:
        score, risk_factors = _rule_based_score(features)
        source = "rules"

    level = _risk_level(score)
    return {
        "riskScore": score,
        "riskLevel": level,
        "riskRecommendation": _recommendation(score),
        "riskFactors": risk_factors,
        "riskSource": source,
        "defaultProbability": default_probability,
        "shapExplanation": shap_explanation,
    }


def risk_fields_for_storage(prediction: dict[str, Any]) -> dict[str, Any]:
    return {
        "risk_score": prediction["riskScore"],
        "risk_level": prediction["riskLevel"],
        "risk_recommendation": prediction["riskRecommendation"],
        "risk_factors": prediction["riskFactors"],
    }


def hydrate_application_risk(row: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any] | None]:
    """Compute risk on a DB row when missing. Returns (merged_row, db_updates_or_none)."""
    if row.get("risk_score") is not None:
        return row, None

    try:
        prediction = predict_application_risk(row)
        updates = risk_fields_for_storage(prediction)
        return {**row, **updates}, updates
    except Exception:
        return row, None
