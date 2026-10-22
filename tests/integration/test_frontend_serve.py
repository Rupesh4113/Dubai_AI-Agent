"""
Integration test to verify that FastAPI serves the production React SPA and index.html.
"""
from fastapi.testclient import TestClient
from backend.app.main import app


def test_serve_spa_index():
    with TestClient(app) as client:
        res = client.get("/")
        assert res.status_code == 200
        assert "<div id=\"root\"></div>" in res.text
        assert "CoolShield AI" in res.text
