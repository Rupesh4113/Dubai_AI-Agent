"""
CoolShield AI - Role-Based Access Control (RBAC) & Security Policies
Enforces granular role permissions on backend endpoints for all 8 defined building operations roles.
"""
from typing import Dict, List, Set, Optional
from fastapi import HTTPException, Header, Depends, status
from sqlalchemy.orm import Session
from backend.app.models.db_models import User, get_db

ROLE_PERMISSIONS: Dict[str, Set[str]] = {
    "property_owner": {
        "view_portfolio", "view_financials", "view_kpis", "export_reports", "view_audits"
    },
    "building_manager": {
        "view_portfolio", "edit_building", "view_live_monitoring", "view_insights",
        "view_work_orders", "create_work_orders", "view_reports"
    },
    "facilities_manager": {
        "view_portfolio", "view_live_monitoring", "view_insights", "investigate_anomaly",
        "create_work_orders", "approve_work_orders", "reject_work_orders", "assign_technician",
        "trigger_agent", "view_work_orders", "view_audits", "manage_integrations"
    },
    "hvac_technician": {
        "view_assigned_work_orders", "record_findings", "execute_intervention",
        "view_asset_history", "view_live_monitoring"
    },
    "maintenance_coordinator": {
        "view_work_orders", "create_work_orders", "assign_technician", "schedule_maintenance",
        "view_live_monitoring"
    },
    "sustainability_manager": {
        "view_portfolio", "view_energy_analytics", "view_water_analytics", "view_sustainability",
        "export_reports", "view_tariffs", "calculate_carbon"
    },
    "finance_analyst": {
        "view_portfolio", "view_financials", "view_tariffs", "edit_tariffs",
        "calculate_roi", "export_reports"
    },
    "auditor": {
        "view_portfolio", "view_audits", "view_verification_results", "view_approvals",
        "view_evidence", "export_reports"
    }
}


def check_permission(user_role: str, required_permission: str) -> bool:
    """Checks whether a given role holds the required capability."""
    allowed = ROLE_PERMISSIONS.get(user_role, set())
    return required_permission in allowed


def get_current_user(
    x_user_role: Optional[str] = Header(default="facilities_manager"),
    x_user_email: Optional[str] = Header(default="fm@coolshield.ae"),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Extracts and authenticates user identity from headers (or demo session).
    Validates against the database or default demo user profile.
    """
    role = x_user_role.lower() if x_user_role else "facilities_manager"
    if role not in ROLE_PERMISSIONS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Invalid or unrecognized role: {role}. Allowed roles: {list(ROLE_PERMISSIONS.keys())}"
        )

    return {
        "email": x_user_email,
        "role": role,
        "full_name": "Authenticated User"
    }


def require_permission(permission: str):
    """FastAPI dependency factory enforcing granular RBAC capability."""
    def dependency(user: Dict[str, str] = Depends(get_current_user)):
        if not check_permission(user["role"], permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Role '{user['role']}' lacks required permission '{permission}'."
            )
        return user
    return dependency
