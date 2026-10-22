"""
Unit tests for Role-Based Access Control (RBAC) permissions.
"""
from backend.app.security.rbac import check_permission, ROLE_PERMISSIONS


def test_facilities_manager_permissions():
    assert check_permission("facilities_manager", "approve_work_orders") is True
    assert check_permission("facilities_manager", "investigate_anomaly") is True
    assert check_permission("facilities_manager", "edit_tariffs") is False


def test_hvac_technician_permissions():
    assert check_permission("hvac_technician", "execute_intervention") is True
    assert check_permission("hvac_technician", "record_findings") is True
    assert check_permission("hvac_technician", "approve_work_orders") is False


def test_auditor_permissions():
    assert check_permission("auditor", "view_audits") is True
    assert check_permission("auditor", "view_evidence") is True
    assert check_permission("auditor", "approve_work_orders") is False


def test_property_owner_permissions():
    assert check_permission("property_owner", "view_portfolio") is True
    assert check_permission("property_owner", "view_financials") is True
    assert check_permission("property_owner", "execute_intervention") is False
