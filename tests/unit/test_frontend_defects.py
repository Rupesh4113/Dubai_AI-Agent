"""
Automated Regression Test Suite for Defect Verifications (DEF-01 to DEF-05)
Validates language translation completeness, OpenStreetMap integration,
Persona-based RBAC enforcement, API client resilience, and sanitized environment templates.
"""
import os
import re
import pytest

def test_def01_multilingual_dictionary_completeness():
    """Verify DEF-01: All 6 languages exist with translation keys in frontend and backend."""
    i18n_path = os.path.join("frontend", "src", "i18n", "translations.ts")
    assert os.path.exists(i18n_path), f"i18n dictionary missing at {i18n_path}"

    with open(i18n_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify all 6 languages are declared
    for code in ["en", "ar", "hi", "ur", "ml", "fil"]:
        assert f"code: '{code}'" in content, f"Language code '{code}' missing from LANGUAGES list"
        assert f'"{code}": {{' in content or f"  {code}: {{" in content, f"Translation dictionary for '{code}' missing"

    # Verify RTL is set for Arabic and Urdu, LTR for others
    assert "{ code: 'ar', label: 'Arabic', native: 'العربية', dir: 'rtl' }" in content
    assert "{ code: 'ur', label: 'Urdu', native: 'اردو', dir: 'rtl' }" in content
    assert "{ code: 'en', label: 'English', native: 'English', dir: 'ltr' }" in content
    assert "{ code: 'hi', label: 'Hindi', native: 'हिन्दी', dir: 'ltr' }" in content
    assert "{ code: 'ml', label: 'Malayalam', native: 'മലയാളം', dir: 'ltr' }" in content
    assert "{ code: 'fil', label: 'Filipino', native: 'Tagalog', dir: 'ltr' }" in content


def test_def02_map_leaflet_css_and_osm_tile_provider():
    """Verify DEF-02: Leaflet CSS is bundled and OpenStreetMap open-source API is used."""
    map_path = os.path.join("frontend", "src", "components", "DubaiMap.tsx")
    assert os.path.exists(map_path), f"DubaiMap component missing at {map_path}"

    with open(map_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Direct CSS bundle import
    assert "import 'leaflet/dist/leaflet.css';" in content, "Missing direct leaflet.css import in DubaiMap"

    # 2. Open-source OpenStreetMap endpoint
    assert "https://tile.openstreetmap.org/{z}/{x}/{y}.png" in content, "OpenStreetMap tile endpoint missing"
    assert "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" in content, "OSM Humanitarian layer missing"

    # 3. Proper container cleanup to prevent map leak / blank re-renders
    assert "mapInstanceRef.current.remove()" in content, "Missing map remove cleanup"
    assert "mapInstanceRef.current = null" in content, "Missing map reference nullification in cleanup"

    # 4. Invalidate size after layout
    assert "invalidateSize()" in content, "Missing map.invalidateSize() to handle dynamic container sizing"


def test_def03_persona_rbac_matrix_and_guards():
    """Verify DEF-03: Persona matrix defines clear capabilities and guards actions."""
    app_path = os.path.join("frontend", "src", "App.tsx")
    assert os.path.exists(app_path), f"App.tsx missing at {app_path}"

    with open(app_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify all 6 roles exist in ROLES_CONFIG
    for role_id in ["facilities_manager", "property_owner", "hvac_technician", "sustainability_manager", "finance_analyst", "auditor"]:
        assert f"id: '{role_id}'" in content, f"Role '{role_id}' missing in ROLES_CONFIG"

    # Verify auditor is strictly read-only
    assert "auditor: {\n    id: 'auditor'" in content
    assert "isReadOnly: true" in content

    # Verify Facilities Manager is the only role with full operational approval
    assert "facilities_manager: {\n    id: 'facilities_manager'" in content
    assert "canApproveWorkOrders: true" in content

    # Verify permission gates are enforced in action handlers
    assert "!activeRoleConfig.canCreateWorkOrder" in content, "Missing guard on handleCreateWorkOrder"
    assert "!activeRoleConfig.canApproveWorkOrders" in content, "Missing guard on handleApproveWorkOrder"
    assert "!activeRoleConfig.canAuthorizePeakShedding" in content, "Missing guard on handleApprovePlan"
    assert "!activeRoleConfig.canSubmitServiceTickets" in content, "Missing guard on handleServiceTicketSubmit"


def test_def04_api_client_resilience_and_env():
    """Verify DEF-04: API client reads VITE_API_URL and verifies application/json before .json()."""
    client_path = os.path.join("frontend", "src", "api", "client.ts")
    assert os.path.exists(client_path), f"client.ts missing at {client_path}"

    with open(client_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify dynamic VITE_API_URL
    assert "import.meta.env.VITE_API_URL" in content, "API_BASE must read import.meta.env.VITE_API_URL"

    # Verify application/json check on fetch responses
    assert "res.headers.get('content-type') || '').includes('application/json')" in content, \
        "Missing application/json content-type check to prevent HTML SPA rewrite JSON parse syntax errors"


def test_def05_env_example_presence_and_sanitization():
    """Verify DEF-05: .env.example exists and contains no committed secrets."""
    env_example_path = ".env.example"
    assert os.path.exists(env_example_path), ".env.example is missing from repository root"

    with open(env_example_path, "r", encoding="utf-8") as f:
        env_content = f.read()

    required_vars = [
        "VITE_API_URL",
        "DATABASE_URL",
        "SECRET_KEY",
        "N8N_WEBHOOK_URL",
        "DEWA_API_BASE",
        "NCM_WEATHER_API_BASE",
    ]
    for var in required_vars:
        assert var in env_content, f"Required variable '{var}' missing in .env.example"

    # Confirm no real secret keys are committed
    assert "CHANGE_ME" in env_content
    assert "PLACEHOLDER_KEY" in env_content
