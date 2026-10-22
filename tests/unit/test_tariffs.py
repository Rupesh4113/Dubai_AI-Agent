"""
Unit tests for DEWA Utility Tariff calculations and financial impact estimation.
"""
import pytest
from backend.app.services.tariff_service import (
    calculate_electricity_cost_aed,
    calculate_water_cost_aed,
    estimate_anomaly_financial_impact
)


def test_electricity_cost_zero():
    res = calculate_electricity_cost_aed(0.0)
    assert res["total_cost_aed"] == 0.0


def test_electricity_cost_slab1():
    # 1000 kWh in slab 1 (rate 0.23) + fuel surcharge (0.05) + 5% VAT
    res = calculate_electricity_cost_aed(1000.0)
    base = 1000 * 0.23  # 230
    fuel = 1000 * 0.05  # 50
    subtotal = 280.0
    expected_total = subtotal * 1.05  # 294.0
    assert abs(res["total_cost_aed"] - expected_total) < 0.1
    assert res["base_cost"] == 230.0
    assert res["fuel_surcharge"] == 50.0


def test_electricity_cost_multi_slab():
    # 5000 kWh: 2000 @ 0.23 + 2000 @ 0.28 + 1000 @ 0.32
    res = calculate_electricity_cost_aed(5000.0)
    expected_base = (2000 * 0.23) + (2000 * 0.28) + (1000 * 0.32)  # 460 + 560 + 320 = 1340
    expected_fuel = 5000 * 0.05  # 250
    expected_vat = (1340 + 250) * 0.05  # 79.5
    expected_total = 1340 + 250 + 79.5  # 1669.5
    assert abs(res["base_cost"] - expected_base) < 0.1
    assert abs(res["total_cost_aed"] - expected_total) < 0.1


def test_water_cost():
    # 100 m3 @ 9.20 supply + 1.65 sewerage + 5% VAT
    res = calculate_water_cost_aed(100.0)
    expected_supply = 100 * 9.20
    expected_sewerage = 100 * 1.65
    expected_subtotal = expected_supply + expected_sewerage
    expected_total = expected_subtotal * 1.05
    assert abs(res["water_supply_cost"] - expected_supply) < 0.1
    assert abs(res["sewerage_cost"] - expected_sewerage) < 0.1
    assert abs(res["total_cost_aed"] - expected_total) < 0.1


def test_estimate_anomaly_impact_water():
    res = estimate_anomaly_financial_impact(
        metric="water_m3",
        observed_value=2.5,
        baseline_value=0.5,
        projected_duration_hours=24.0
    )
    assert res["unit"] == "m³"
    assert res["hourly_excess"] == 2.0
    assert res["potential_avoidable_cost_24h_aed"] > 0
    assert res["estimated_weekly_net_benefit_aed"] > 0
    assert res["confidence"] > 0.8


def test_estimate_anomaly_impact_cop():
    res = estimate_anomaly_financial_impact(
        metric="cop_estimate",
        observed_value=2.2,
        baseline_value=3.8,
        projected_duration_hours=24.0
    )
    assert "kWh" in res["unit"]
    assert res["potential_avoidable_cost_24h_aed"] > 0
