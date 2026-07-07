from __future__ import annotations

from calendar import month_abbr
from collections import Counter, defaultdict
from datetime import datetime, timezone
from typing import Any

from risk_model import hydrate_application_risk


MONTH_COLORS = {
    "Home": "#1d4ed8",
    "Business": "#7c3aed",
    "Vehicle": "#0891b2",
    "Education": "#059669",
    "Agriculture": "#16a34a",
    "Medical": "#dc2626",
    "Other": "#64748b",
}

FALLBACK_COLORS = ["#1d4ed8", "#7c3aed", "#0891b2", "#059669", "#f59e0b", "#ef4444"]

REQUIRED_DOCUMENTS = [
    "Government ID proof",
    "Income proof",
    "Address proof",
    "Loan purpose proof (if applicable)",
]


def _parse_datetime(value: Any) -> datetime | None:
    if not value:
        return None
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    try:
        text = str(value).replace("Z", "+00:00")
        parsed = datetime.fromisoformat(text)
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def _month_label(dt: datetime) -> str:
    return month_abbr[dt.month]


def _last_month_keys(count: int = 6) -> list[tuple[int, int]]:
    now = datetime.now(timezone.utc)
    keys = []
    year = now.year
    month = now.month
    for _ in range(count):
        keys.append((year, month))
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    return list(reversed(keys))


def _month_map(count: int = 6) -> dict[tuple[int, int], str]:
    return {key: _month_label(datetime(key[0], key[1], 1, tzinfo=timezone.utc)) for key in _last_month_keys(count)}


def _in_month(dt: datetime | None, year: int, month: int) -> bool:
    return bool(dt and dt.year == year and dt.month == month)


def _format_relative_time(value: Any) -> str:
    dt = _parse_datetime(value)
    if not dt:
        return "Recently"

    now = datetime.now(timezone.utc)
    delta = now - dt.astimezone(timezone.utc)
    days = delta.days

    if days <= 0:
        return f"Today, {dt.strftime('%I:%M %p').lstrip('0')}"
    if days == 1:
        return "Yesterday"
    if days < 7:
        return f"{days} days ago"
    return dt.strftime("%d %b %Y")


def _status_bucket(status: str) -> str:
    normalized = (status or "pending").lower()
    if normalized == "approved":
        return "approved"
    if normalized in ("declined", "rejected"):
        return "declined"
    if normalized == "pending_admin":
        return "pending_admin"
    return "pending"


def _application_progress_score(status: str) -> int:
    mapping = {
        "pending": 55,
        "pending_admin": 72,
        "under_review": 65,
        "approved": 92,
        "declined": 38,
        "rejected": 38,
    }
    return mapping.get((status or "pending").lower(), 50)


def _estimate_emi(loan_amount: float, tenure_months: int) -> float:
    months = max(int(tenure_months or 12), 1)
    return loan_amount / months


def _profile_completion(applicant: dict[str, Any]) -> dict[str, Any]:
    fields = [
        ("address", applicant.get("address")),
        ("city", applicant.get("city")),
        ("state", applicant.get("state")),
        ("pincode", applicant.get("pincode")),
        ("phone", applicant.get("phone")),
    ]
    complete = sum(1 for _, value in fields if str(value or "").strip())
    total = len(fields)
    percent = round((complete / total) * 100) if total else 0
    return {
        "complete": complete,
        "total": total,
        "percent": percent,
    }


def _applications_for_employee(all_applications: list[dict], employee_id: str, customer_ids: set[str]) -> list[dict]:
    return [
        row for row in all_applications
        if row.get("user_id") in customer_ids
    ]


def _risk_score(row: dict[str, Any] | None) -> int | None:
    if not row:
        return None
    score = row.get("risk_score")
    if score is None:
        return None
    try:
        return int(float(score))
    except (TypeError, ValueError):
        return None


def build_applicant_dashboard(applicant_row: dict, applications: list[dict]) -> dict[str, Any]:
    applicant = {
        "userId": applicant_row.get("user_id"),
        "fullName": applicant_row.get("full_name", ""),
        "email": applicant_row.get("email", ""),
        "phone": applicant_row.get("phone", ""),
        "address": applicant_row.get("address", ""),
        "city": applicant_row.get("city", ""),
        "state": applicant_row.get("state", ""),
        "pincode": applicant_row.get("pincode", ""),
    }
    profile = _profile_completion(applicant_row)
    latest = applications[0] if applications else None

    active_statuses = {"pending", "pending_admin", "under_review", "approved"}
    active_count = sum(
        1 for row in applications
        if (row.get("status") or "pending").lower() in active_statuses
    )

    month_keys = _last_month_keys()
    month_labels = _month_map()
    trend = []
    for key in month_keys:
        month_apps = [
            row for row in applications
            if _in_month(_parse_datetime(row.get("created_at")), key[0], key[1])
        ]
        month_risk_scores = [_risk_score(row) for row in month_apps]
        month_risk_scores = [score for score in month_risk_scores if score is not None]
        if month_risk_scores:
            score = round(sum(month_risk_scores) / len(month_risk_scores))
        elif month_apps:
            score = round(
                sum(_application_progress_score(row.get("status", "pending")) for row in month_apps)
                / len(month_apps)
            )
        else:
            score = _risk_score(latest) or max(40, min(100, profile["percent"]))
        trend.append({"month": month_labels[key], "score": score})

    pending_profile_fields = profile["total"] - profile["complete"]
    profile_mix = [
        {"name": "Done", "value": profile["complete"], "color": "#16a34a"},
        {"name": "Pending", "value": max(pending_profile_fields, 0), "color": "#f59e0b"},
    ]
    if profile_mix[0]["value"] == 0 and profile_mix[1]["value"] == 0:
        profile_mix = [
            {"name": "Done", "value": 0, "color": "#16a34a"},
            {"name": "Pending", "value": 5, "color": "#f59e0b"},
        ]

    readiness = profile["percent"]
    if latest:
        readiness = round((profile["percent"] + _application_progress_score(latest.get("status", "pending"))) / 2)

    hero_status = "Verification in progress"
    status_normalized = (latest.get("status") if latest else "") or ""
    if status_normalized == "approved":
        hero_status = "Application approved"
    elif status_normalized == "declined":
        hero_status = "Application declined"
    elif status_normalized == "pending_admin":
        hero_status = "With admin review"

    timeline = [
        {"label": "Application submitted", "done": bool(applications)},
        {"label": "Profile completed", "done": profile["complete"] >= 3},
        {"label": "Income verification", "done": bool(latest and latest.get("monthly_income"))},
        {"label": "Address verification", "done": bool(str(applicant_row.get("address") or "").strip())},
        {"label": "Final approval", "done": status_normalized == "approved"},
    ]

    recent_activity = []
    for row in applications[:4]:
        app_id = row.get("application_id", "")
        status = (row.get("status") or "pending").replace("_", " ")
        recent_activity.append({
            "title": f"Application {app_id} updated",
            "desc": f"{row.get('loan_purpose', 'Loan')} · Rs. {float(row.get('loan_amount') or 0):,.0f} · {status}",
            "time": _format_relative_time(row.get("created_at")),
            "status": "success" if row.get("status") == "approved" else "info" if row.get("status") == "pending_admin" else "warning",
            "iconKey": "CheckCircle2" if row.get("status") == "approved" else "FileText",
        })

    if not recent_activity and not profile["complete"]:
        recent_activity.append({
            "title": "Complete your profile",
            "desc": "Add address, city, and state to unlock loan applications",
            "time": "Pending",
            "status": "warning",
            "iconKey": "AlertCircle",
        })

    loan_amount = float(latest.get("loan_amount") or 0) if latest else 0
    tenure = int(latest.get("tenure_months") or 12) if latest else 12
    emi = _estimate_emi(loan_amount, tenure)
    latest_risk = _risk_score(latest)

    return {
        "applicant": applicant,
        "applications": applications,
        "activeApplicationCount": active_count,
        "latestApplication": {
            "applicationId": latest.get("application_id") if latest else None,
            "loanPurpose": latest.get("loan_purpose") if latest else None,
            "loanAmount": loan_amount,
            "tenureMonths": tenure,
            "status": latest.get("status") if latest else None,
            "createdAt": latest.get("created_at") if latest else None,
            "riskScore": latest_risk,
            "riskLevel": latest.get("risk_level") if latest else None,
            "riskRecommendation": latest.get("risk_recommendation") if latest else None,
        } if latest else None,
        "hero": {
            "statusLabel": hero_status,
            "applicationId": latest.get("application_id") if latest else "No application yet",
            "loanPurpose": latest.get("loan_purpose") if latest else "Start your first application",
            "headlineAmount": loan_amount,
            "readinessPercent": readiness,
            "estimatedEmi": emi,
            "tenureLabel": f"{tenure} months" if latest else "—",
            "reviewDate": _format_relative_time(latest.get("created_at")) if latest else "—",
            "creditHistory": "Good" if not latest or not latest.get("had_late_payments") else "Review needed",
            "incomeStability": "Strong" if latest and float(latest.get("monthly_income") or 0) >= 30000 else "Pending",
            "profileCompleteness": "Complete" if profile["complete"] == profile["total"] else "Action needed",
        },
        "metrics": {
            "activeLoans": active_count,
            "profileScore": latest_risk if latest_risk is not None else profile["percent"],
            "profileScoreDetail": (
                f"Latest application risk score: {latest_risk}/100"
                if latest_risk is not None
                else f"{profile['complete']} of {profile['total']} profile fields complete"
            ),
            "profileFieldsComplete": f"{profile['complete']} / {profile['total']}",
            "profileFieldsDetail": (
                "Complete profile to speed up review"
                if pending_profile_fields
                else "Profile details complete"
            ),
        },
        "applicationTrend": trend,
        "profileMix": profile_mix,
        "requiredDocuments": REQUIRED_DOCUMENTS,
        "timeline": timeline,
        "recentActivity": recent_activity,
        "recommendation": {
            "title": "Complete your profile" if pending_profile_fields else "Track your application",
            "desc": (
                "Add missing profile details to avoid review delays."
                if pending_profile_fields
                else "Your latest application is moving through review."
            ),
        },
    }


def build_employee_dashboard(employee_row: dict, applications: list[dict], assigned_customer_count: int) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    month_keys = _last_month_keys()
    month_labels = _month_map()

    this_month_apps = [
        row for row in applications
        if _in_month(_parse_datetime(row.get("created_at")), now.year, now.month)
    ]

    counts = Counter(_status_bucket(row.get("status", "pending")) for row in applications)
    approved = counts.get("approved", 0)
    pending = counts.get("pending", 0) + counts.get("pending_admin", 0)
    declined = counts.get("declined", 0)
    total_decided = approved + declined
    approval_rate = round((approved / total_decided) * 100) if total_decided else 0

    trend = []
    for key in month_keys:
        count = sum(
            1 for row in applications
            if _in_month(_parse_datetime(row.get("created_at")), key[0], key[1])
        )
        trend.append({"month": month_labels[key], "count": count})

    approval_mix = [
        {"name": "Approved", "value": approved, "color": "#16a34a"},
        {"name": "Pending", "value": pending, "color": "#f59e0b"},
        {"name": "Rejected", "value": declined, "color": "#ef4444"},
    ]

    recent = []
    for row in applications[:4]:
        amount = float(row.get("loan_amount") or 0)
        status = row.get("status", "pending")
        recent.append({
            "title": f"{row.get('full_name', 'Applicant')} — {row.get('loan_purpose', 'Loan')}",
            "desc": f"Rs. {amount:,.0f} · {(status or 'pending').replace('_', ' ')}",
            "time": _format_relative_time(row.get("created_at")),
            "status": "success" if status == "approved" else "warning" if status in ("pending", "pending_admin") else "info",
            "iconKey": "CheckCircle2" if status == "approved" else "AlertCircle" if status == "pending" else "Clock",
            "applicationId": row.get("application_id"),
        })

    pipeline = [
        {"label": "Received", "count": len(applications), "done": len(applications) > 0},
        {"label": "Document check", "count": len(applications), "done": len(applications) > 0},
        {"label": "Income verification", "count": sum(1 for row in applications if row.get("monthly_income")), "done": any(row.get("monthly_income") for row in applications)},
        {"label": "Risk assessment", "count": sum(1 for row in applications if row.get("risk_score") is not None), "done": any(row.get("risk_score") is not None for row in applications)},
        {"label": "Final decision", "count": approved + declined, "done": approved + declined > 0},
    ]

    return {
        "employee": {
            "id": employee_row.get("id"),
            "fullName": employee_row.get("full_name", ""),
            "email": employee_row.get("email", ""),
            "role": employee_row.get("role", ""),
        },
        "assignedCustomerCount": assigned_customer_count,
        "pendingReviewCount": counts.get("pending", 0),
        "totalApplicationsThisMonth": len(this_month_apps),
        "totalApplications": len(applications),
        "approvedCount": approved,
        "pendingCount": pending,
        "declinedCount": declined,
        "approvalRate": approval_rate,
        "applicationsTrend": trend,
        "approvalMix": approval_mix,
        "recentApplications": recent,
        "reviewPipeline": pipeline,
        "hero": {
            "pendingReviews": counts.get("pending", 0),
            "cycleLabel": now.strftime("%B %Y cycle"),
            "processedThisMonth": len(this_month_apps),
            "avgTurnaround": "—",
            "slaCompliance": 100 if pending == 0 else max(0, 100 - pending * 5),
            "reviewDeadline": "End of day",
        },
        "slaAlert": {
            "count": counts.get("pending", 0),
            "names": ", ".join(
                row.get("full_name", "Applicant")
                for row in sorted(
                    [r for r in applications if r.get("status") == "pending"],
                    key=lambda item: item.get("created_at") or "",
                )[:3]
            ) or "No pending cases",
        },
    }


def build_admin_dashboard(
    employee_rows: list[dict],
    customer_rows: list[dict],
    applications: list[dict],
) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    month_keys = _last_month_keys()
    month_labels = _month_map()

    counts = Counter(_status_bucket(row.get("status", "pending")) for row in applications)
    approved = counts.get("approved", 0)
    pending = counts.get("pending", 0)
    pending_admin = counts.get("pending_admin", 0)
    declined = counts.get("declined", 0)
    total_apps = len(applications)

    approved_amount = sum(
        float(row.get("loan_amount") or 0)
        for row in applications
        if row.get("status") == "approved"
    )
    this_month_approved_amount = sum(
        float(row.get("loan_amount") or 0)
        for row in applications
        if row.get("status") == "approved"
        and _in_month(_parse_datetime(row.get("created_at")), now.year, now.month)
    )

    monthly_target_cr = 9.0
    monthly_disbursed_cr = round(this_month_approved_amount / 10_000_000, 1)
    target_completion = min(100, round((monthly_disbursed_cr / monthly_target_cr) * 100)) if monthly_target_cr else 0

    risk_scores = [float(row.get("risk_score")) for row in applications if row.get("risk_score") is not None]
    avg_risk = round(sum(risk_scores) / len(risk_scores)) if risk_scores else 0

    disbursal_trend = []
    for key in month_keys:
        amount = sum(
            float(row.get("loan_amount") or 0)
            for row in applications
            if row.get("status") == "approved"
            and _in_month(_parse_datetime(row.get("created_at")), key[0], key[1])
        )
        disbursal_trend.append({
            "month": month_labels[key],
            "amount": round(amount / 10_000_000, 1),
        })

    purpose_counter = Counter(row.get("loan_purpose") or "Other" for row in applications)
    total_purposes = sum(purpose_counter.values()) or 1
    loan_type_mix = []
    for index, (name, count) in enumerate(purpose_counter.most_common(4)):
        loan_type_mix.append({
            "name": name,
            "value": round((count / total_purposes) * 100),
            "color": MONTH_COLORS.get(name, FALLBACK_COLORS[index % len(FALLBACK_COLORS)]),
        })

    # Employee performance: map assigned officer -> approved/declined counts
    user_assignments = {
        row.get("user_id"): row.get("assigned_employee_id")
        for row in customer_rows
        if row.get("assigned_employee_id")
    }
    employee_names = {
        row.get("id"): row.get("full_name", row.get("id"))
        for row in employee_rows
        if row.get("role") == "officer"
    }
    performance: dict[str, dict[str, int]] = defaultdict(lambda: {"approved": 0, "rejected": 0})
    for row in applications:
        officer_id = user_assignments.get(row.get("user_id"))
        if not officer_id or officer_id not in employee_names:
            continue
        bucket = _status_bucket(row.get("status", "pending"))
        if bucket == "approved":
            performance[officer_id]["approved"] += 1
        elif bucket == "declined":
            performance[officer_id]["rejected"] += 1

    employee_performance = [
        {
            "name": employee_names[officer_id].split(" ")[0],
            "approved": stats["approved"],
            "rejected": stats["rejected"],
        }
        for officer_id, stats in sorted(
            performance.items(),
            key=lambda item: item[1]["approved"] + item[1]["rejected"],
            reverse=True,
        )[:5]
    ]
    if not employee_performance:
        employee_performance = [
            {"name": row.get("full_name", "Officer").split(" ")[0], "approved": 0, "rejected": 0}
            for row in employee_rows
            if row.get("role") == "officer"
        ][:5]

    alerts = []
    if pending_admin:
        alerts.append({
            "title": f"{pending_admin} application(s) awaiting admin approval",
            "desc": "Escalated cases need a final decision",
            "time": _format_relative_time(now.isoformat()),
            "status": "warning",
            "iconKey": "Clock",
        })
    if declined and total_apps and (declined / total_apps) > 0.3:
        alerts.append({
            "title": "High decline rate detected",
            "desc": f"{round((declined / total_apps) * 100)}% of applications were declined",
            "time": _format_relative_time(now.isoformat()),
            "status": "warning",
            "iconKey": "AlertCircle",
        })
    if approved:
        alerts.append({
            "title": "Approved loans on record",
            "desc": f"Rs. {approved_amount:,.0f} total approved amount",
            "time": _format_relative_time(now.isoformat()),
            "status": "success",
            "iconKey": "CheckCircle2",
        })
    officer_count = len([row for row in employee_rows if row.get("role") == "officer"])
    if officer_count:
        alerts.append({
            "title": f"{officer_count} active officers on platform",
            "desc": "Employee roster is available for customer assignment",
            "time": _format_relative_time(now.isoformat()),
            "status": "info",
            "iconKey": "UserCheck",
        })
    alerts = alerts[:4]

    prev_month_key = month_keys[-2] if len(month_keys) > 1 else None
    prev_month_count = 0
    if prev_month_key:
        prev_month_count = sum(
            1 for row in applications
            if _in_month(_parse_datetime(row.get("created_at")), prev_month_key[0], prev_month_key[1])
        )
    this_month_count = sum(
        1 for row in applications
        if _in_month(_parse_datetime(row.get("created_at")), now.year, now.month)
    )
    growth = 0
    if prev_month_count:
        growth = round(((this_month_count - prev_month_count) / prev_month_count) * 100)

    return {
        "employeeCount": len(employee_rows),
        "adminCount": len([row for row in employee_rows if row.get("role") == "admin"]),
        "officerCount": len([row for row in employee_rows if row.get("role") == "officer"]),
        "customerCount": len(customer_rows),
        "assignedCustomerCount": len([row for row in customer_rows if row.get("assigned_employee_id")]),
        "totalApplications": total_apps,
        "approvedCount": approved,
        "pendingCount": pending + pending_admin,
        "underReviewCount": pending + pending_admin,
        "declinedCount": declined,
        "monthlyDisbursedCr": monthly_disbursed_cr,
        "monthlyTargetCr": monthly_target_cr,
        "targetCompletionPercent": target_completion,
        "avgRiskScore": avg_risk,
        "totalDisbursedAmount": approved_amount,
        "disbursalTrend": disbursal_trend,
        "loanTypeMix": loan_type_mix or [{"name": "No data", "value": 100, "color": "#94a3b8"}],
        "employeePerformance": employee_performance,
        "recentAlerts": alerts,
        "currentMonthLabel": now.strftime("%B %Y"),
        "applicationGrowthPercent": growth,
        "npaRate": round((declined / total_apps) * 100, 1) if total_apps else 0,
    }


def _risk_breakdown(applications: list[dict]) -> list[dict]:
    buckets = {"low": 0, "medium": 0, "high": 0, "unscored": 0}
    for row in applications:
        level = (row.get("risk_level") or "").lower()
        score = row.get("risk_score")
        if score is None and not level:
            buckets["unscored"] += 1
            continue
        if level in buckets:
            buckets[level] += 1
            continue
        numeric = float(score or 0)
        if numeric < 40:
            buckets["low"] += 1
        elif numeric < 70:
            buckets["medium"] += 1
        else:
            buckets["high"] += 1

    return [
        {"name": "Low", "value": buckets["low"], "color": "#16a34a"},
        {"name": "Medium", "value": buckets["medium"], "color": "#f59e0b"},
        {"name": "High", "value": buckets["high"], "color": "#ef4444"},
        {"name": "Unscored", "value": buckets["unscored"], "color": "#94a3b8"},
    ]


def _status_breakdown(applications: list[dict]) -> list[dict]:
    counts = Counter(_status_bucket(row.get("status", "pending")) for row in applications)
    return [
        {"name": "Pending", "value": counts.get("pending", 0), "color": "#f59e0b"},
        {"name": "With admin", "value": counts.get("pending_admin", 0), "color": "#8b5cf6"},
        {"name": "Approved", "value": counts.get("approved", 0), "color": "#16a34a"},
        {"name": "Declined", "value": counts.get("declined", 0), "color": "#ef4444"},
    ]


def _applications_with_risk(applications: list[dict]) -> list[dict]:
    hydrated = []
    for row in applications:
        merged, _ = hydrate_application_risk(row)
        hydrated.append(merged)
    return hydrated


def _report_application_row(row: dict, officer_name: str = "") -> dict:
    return {
        "applicationId": row.get("application_id"),
        "fullName": row.get("full_name", ""),
        "loanPurpose": row.get("loan_purpose", ""),
        "loanAmount": float(row.get("loan_amount") or 0),
        "status": (row.get("status") or "pending").lower(),
        "riskScore": int(float(row["risk_score"])) if row.get("risk_score") is not None else None,
        "riskLevel": row.get("risk_level"),
        "officerName": officer_name,
        "createdAt": row.get("created_at"),
        "reviewedAt": row.get("reviewed_at"),
    }


def build_admin_reports(
    employee_rows: list[dict],
    customer_rows: list[dict],
    applications: list[dict],
) -> dict[str, Any]:
    applications = _applications_with_risk(applications)
    counts = Counter(_status_bucket(row.get("status", "pending")) for row in applications)
    approved_amount = sum(
        float(row.get("loan_amount") or 0)
        for row in applications
        if row.get("status") == "approved"
    )
    risk_scores = [float(row.get("risk_score")) for row in applications if row.get("risk_score") is not None]
    avg_risk = round(sum(risk_scores) / len(risk_scores)) if risk_scores else 0

    user_assignments = {
        row.get("user_id"): row.get("assigned_employee_id")
        for row in customer_rows
        if row.get("assigned_employee_id")
    }
    employee_names = {
        row.get("id"): row.get("full_name", row.get("id"))
        for row in employee_rows
    }

    officer_stats: dict[str, dict[str, int]] = defaultdict(
        lambda: {"approved": 0, "declined": 0, "escalated": 0, "pending": 0, "total": 0}
    )
    for row in applications:
        officer_id = user_assignments.get(row.get("user_id"), "unassigned")
        officer_stats[officer_id]["total"] += 1
        bucket = _status_bucket(row.get("status", "pending"))
        if bucket == "approved":
            officer_stats[officer_id]["approved"] += 1
        elif bucket == "declined":
            officer_stats[officer_id]["declined"] += 1
        elif bucket == "pending_admin":
            officer_stats[officer_id]["escalated"] += 1
        elif bucket == "pending":
            officer_stats[officer_id]["pending"] += 1

    employee_performance = []
    for officer_id, stats in officer_stats.items():
        name = employee_names.get(officer_id, "Unassigned")
        employee_performance.append({
            "employeeId": officer_id,
            "name": name,
            **stats,
        })
    employee_performance.sort(key=lambda item: item["total"], reverse=True)

    application_rows = []
    for row in sorted(applications, key=lambda item: item.get("created_at") or "", reverse=True):
        officer_id = user_assignments.get(row.get("user_id"))
        officer_name = employee_names.get(officer_id, "Unassigned")
        application_rows.append(_report_application_row(row, officer_name))

    assigned_customers = len([row for row in customer_rows if row.get("assigned_employee_id")])

    return {
        "summary": {
            "totalApplications": len(applications),
            "pending": counts.get("pending", 0),
            "pendingAdmin": counts.get("pending_admin", 0),
            "approved": counts.get("approved", 0),
            "declined": counts.get("declined", 0),
            "totalDisbursed": approved_amount,
            "avgRiskScore": avg_risk,
            "assignedCustomers": assigned_customers,
            "unassignedCustomers": len(customer_rows) - assigned_customers,
            "customerCount": len(customer_rows),
        },
        "statusBreakdown": _status_breakdown(applications),
        "riskBreakdown": _risk_breakdown(applications),
        "loanTypeMix": build_admin_dashboard(employee_rows, customer_rows, applications)["loanTypeMix"],
        "disbursalTrend": build_admin_dashboard(employee_rows, customer_rows, applications)["disbursalTrend"],
        "employeePerformance": employee_performance,
        "applications": application_rows,
    }


def build_employee_reports(
    applications: list[dict],
    assigned_customer_count: int,
) -> dict[str, Any]:
    applications = _applications_with_risk(applications)
    counts = Counter(_status_bucket(row.get("status", "pending")) for row in applications)
    approved = counts.get("approved", 0)
    declined = counts.get("declined", 0)
    decided = approved + declined
    approval_rate = round((approved / decided) * 100) if decided else 0
    risk_scores = [float(row.get("risk_score")) for row in applications if row.get("risk_score") is not None]
    avg_risk = round(sum(risk_scores) / len(risk_scores)) if risk_scores else 0

    application_rows = [
        _report_application_row(row)
        for row in sorted(applications, key=lambda item: item.get("created_at") or "", reverse=True)
    ]

    return {
        "summary": {
            "assignedCustomers": assigned_customer_count,
            "totalApplications": len(applications),
            "pendingReview": counts.get("pending", 0),
            "approved": approved,
            "declined": declined,
            "sentToAdmin": counts.get("pending_admin", 0),
            "approvalRate": approval_rate,
            "avgRiskScore": avg_risk,
        },
        "statusBreakdown": _status_breakdown(applications),
        "riskBreakdown": _risk_breakdown(applications),
        "applications": application_rows,
    }
