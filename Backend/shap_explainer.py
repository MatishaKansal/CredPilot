from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
import shap

FEATURE_LABELS: dict[str, str] = {
    "AMT_INCOME_TOTAL": "Annual income",
    "AMT_CREDIT": "Loan amount",
    "AMT_ANNUITY": "Annual EMI",
    "CNT_CHILDREN": "Children",
    "NAME_EDUCATION_TYPE": "Education level",
    "NAME_FAMILY_STATUS": "Marital status",
    "FLAG_OWN_REALTY": "Property ownership",
    "NAME_INCOME_TYPE": "Employment type",
    "TOTAL_PAST_DEFAULTS": "Past late payments",
    "DEBT_TO_INCOME": "Loan-to-income ratio",
    "ANNUITY_TO_INCOME": "EMI burden",
    "AGE_YEARS": "Age",
    "EMPLOYMENT_YEARS": "Years employed",
    "TOTAL_DEBT_TO_INCOME": "Existing debt-to-income",
}

_explainer = None


def _get_explainer(model):
    global _explainer
    if _explainer is None:
        _explainer = shap.TreeExplainer(model)
    return _explainer


def _positive_class_shap(raw_shap: Any) -> np.ndarray:
    if isinstance(raw_shap, list):
        return np.asarray(raw_shap[1])
    return np.asarray(raw_shap)


def _impact_label(shap_value: float) -> str:
    magnitude = abs(shap_value)
    if magnitude >= 0.15:
        return "high"
    if magnitude >= 0.05:
        return "medium"
    return "low"


def explain_application_risk(application: dict[str, Any], top_k: int = 8) -> dict[str, Any]:
    from risk_model import FEATURE_COLUMNS, _application_features, _load_model

    model = _load_model()
    if model is None:
        return {"available": False, "reason": "model_not_loaded", "features": []}

    features = _application_features(application)
    frame = pd.DataFrame([features], columns=FEATURE_COLUMNS)

    try:
        explainer = _get_explainer(model)
        raw = explainer.shap_values(frame)
        shap_row = _positive_class_shap(raw)
        if shap_row.ndim == 2:
            shap_row = shap_row[0]

        expected_value = explainer.expected_value
        if isinstance(expected_value, (list, np.ndarray)):
            base_value = float(expected_value[1])
        else:
            base_value = float(expected_value)

        items = []
        for index, feature_key in enumerate(FEATURE_COLUMNS):
            shap_value = float(shap_row[index])
            items.append(
                {
                    "feature": FEATURE_LABELS.get(feature_key, feature_key.replace("_", " ").title()),
                    "featureKey": feature_key,
                    "value": float(features[feature_key]),
                    "shapValue": shap_value,
                    "direction": "risk" if shap_value > 0 else "positive",
                    "impact": _impact_label(shap_value),
                }
            )

        items.sort(key=lambda item: abs(item["shapValue"]), reverse=True)
        return {
            "available": True,
            "baseValue": base_value,
            "predictedLogOdds": float(base_value + np.sum(shap_row)),
            "features": items[:top_k],
        }
    except Exception as exc:
        return {"available": False, "reason": str(exc), "features": []}
