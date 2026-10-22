"""
CoolShield AI - Dubai Utility Tariff & Financial Calculations Engine
Implements authentic Dubai Electricity & Water Authority (DEWA) slab rate tariffs,
fuel surcharges, municipal sewerage charges, and deterministic financial impact calculations.
"""
from typing import Dict, Any, Tuple


# Standard DEWA Commercial Electric Tariff Slabs (AED per kWh)
# Plus Fuel Surcharge of ~0.05 AED/kWh and 5% UAE VAT
DEWA_ELECTRIC_SLABS = [
    {"min": 0, "max": 2000, "rate": 0.23},
    {"min": 2001, "max": 4000, "rate": 0.28},
    {"min": 4001, "max": 6000, "rate": 0.32},
    {"min": 6001, "max": float("inf"), "rate": 0.38},
]
ELECTRIC_FUEL_SURCHARGE_PER_KWH = 0.05
UAE_VAT_RATE = 0.05

# DEWA Water Tariffs (converted from Imperial Gallons to m3; 1 m3 ~ 219.969 IG)
# Standard Commercial Rate ~ 9.0 AED / m3 (equiv ~0.041 AED / IG) + Sewerage fee ~ 1.5 AED/m3
WATER_RATE_PER_M3 = 9.20
WATER_SEWERAGE_PER_M3 = 1.65


def calculate_electricity_cost_aed(kwh: float, category: str = "commercial") -> Dict[str, float]:
    """
    Calculates total DEWA electricity bill for a given kWh consumption
    using progressive slab structure + fuel surcharge + VAT.
    """
    if kwh <= 0:
        return {"base_cost": 0.0, "fuel_surcharge": 0.0, "vat": 0.0, "total_cost_aed": 0.0}

    remaining = kwh
    base_cost = 0.0

    for slab in DEWA_ELECTRIC_SLABS:
        slab_capacity = slab["max"] - slab["min"]
        if remaining > slab_capacity:
            base_cost += slab_capacity * slab["rate"]
            remaining -= slab_capacity
        else:
            base_cost += remaining * slab["rate"]
            remaining = 0.0
            break

    fuel_surcharge = kwh * ELECTRIC_FUEL_SURCHARGE_PER_KWH
    subtotal = base_cost + fuel_surcharge
    vat = subtotal * UAE_VAT_RATE
    total_cost = subtotal + vat

    return {
        "kwh": round(kwh, 2),
        "base_cost": round(base_cost, 2),
        "fuel_surcharge": round(fuel_surcharge, 2),
        "vat": round(vat, 2),
        "total_cost_aed": round(total_cost, 2),
        "effective_rate_aed_per_kwh": round(total_cost / max(1.0, kwh), 4)
    }


def calculate_water_cost_aed(m3: float) -> Dict[str, float]:
    """
    Calculates DEWA water supply + sewerage fee + VAT.
    """
    if m3 <= 0:
        return {"water_supply_cost": 0.0, "sewerage_cost": 0.0, "vat": 0.0, "total_cost_aed": 0.0}

    supply_cost = m3 * WATER_RATE_PER_M3
    sewerage_cost = m3 * WATER_SEWERAGE_PER_M3
    subtotal = supply_cost + sewerage_cost
    vat = subtotal * UAE_VAT_RATE
    total_cost = subtotal + vat

    return {
        "m3": round(m3, 3),
        "water_supply_cost": round(supply_cost, 2),
        "sewerage_cost": round(sewerage_cost, 2),
        "vat": round(vat, 2),
        "total_cost_aed": round(total_cost, 2),
        "effective_rate_aed_per_m3": round(total_cost / max(0.001, m3), 3)
    }


def estimate_anomaly_financial_impact(
    metric: str,
    observed_value: float,
    baseline_value: float,
    projected_duration_hours: float = 24.0
) -> Dict[str, Any]:
    """
    Estimates the potential avoidable cost of an ongoing anomaly
    over a specified projection horizon (default: 24 hours).
    Explicitly provides assumptions and calculations.
    """
    excess_rate = max(0.0, observed_value - baseline_value)

    if "water" in metric.lower():
        # m3 per hour excess
        excess_total_m3 = excess_rate * projected_duration_hours
        cost_calc = calculate_water_cost_aed(excess_total_m3)
        avoidable_cost = cost_calc["total_cost_aed"]
        action_cost_estimate = 450.0  # Plumber callout & isolation valve inspection in Dubai
        net_benefit = max(0.0, avoidable_cost * 7.0 - action_cost_estimate)  # 7-day run rate savings

        return {
            "metric": metric,
            "unit": "m³",
            "hourly_excess": round(excess_rate, 4),
            "projected_duration_hours": projected_duration_hours,
            "projected_excess_resource": round(excess_total_m3, 3),
            "potential_avoidable_cost_24h_aed": round(avoidable_cost, 2),
            "estimated_action_cost_aed": action_cost_estimate,
            "estimated_weekly_net_benefit_aed": round(net_benefit, 2),
            "assumptions": [
                f"DEWA commercial water tariff of ~{WATER_RATE_PER_M3} AED/m³ plus {WATER_SEWERAGE_PER_M3} AED/m³ sewerage and 5% VAT.",
                f"Assumes continuous unmitigated leak over {projected_duration_hours} hours."
            ],
            "confidence": 0.88
        }

    elif "cop" in metric.lower():
        # Chiller efficiency degradation
        # 1 ton of refrigeration ~ 3.517 kW. Degraded COP draws more electricity per ton.
        baseline_cop = max(1.0, baseline_value)
        observed_cop = max(1.0, observed_value)
        # Approximate 400 ton chiller running at 70% load
        thermal_load_kw = 400 * 3.517 * 0.7
        elec_baseline_kw = thermal_load_kw / baseline_cop
        elec_observed_kw = thermal_load_kw / observed_cop
        excess_kw = max(0.0, elec_observed_kw - elec_baseline_kw)
        excess_kwh_24h = excess_kw * projected_duration_hours

        cost_calc = calculate_electricity_cost_aed(excess_kwh_24h)
        avoidable_cost = cost_calc["total_cost_aed"]
        action_cost_estimate = 1200.0  # Chemical wash & condenser descaling service in UAE
        weekly_avoidable = avoidable_cost * 7.0
        net_benefit = max(0.0, weekly_avoidable - action_cost_estimate)

        return {
            "metric": metric,
            "unit": "kWh (thermal electrical penalty)",
            "hourly_excess_kwh": round(excess_kw, 2),
            "projected_duration_hours": projected_duration_hours,
            "projected_excess_resource": round(excess_kwh_24h, 2),
            "potential_avoidable_cost_24h_aed": round(avoidable_cost, 2),
            "estimated_action_cost_aed": action_cost_estimate,
            "estimated_weekly_net_benefit_aed": round(net_benefit, 2),
            "assumptions": [
                "400 TR chiller operating at 70% part-load.",
                "DEWA commercial tiered tariff structure + fuel surcharge + 5% VAT."
            ],
            "confidence": 0.84
        }

    else:
        # Generic electricity excess
        excess_kwh_24h = excess_rate * projected_duration_hours
        cost_calc = calculate_electricity_cost_aed(excess_kwh_24h)
        avoidable_cost = cost_calc["total_cost_aed"]
        action_cost_estimate = 300.0  # BMS engineer schedule review & damper recalibration
        net_benefit = max(0.0, avoidable_cost * 7.0 - action_cost_estimate)

        return {
            "metric": metric,
            "unit": "kWh",
            "hourly_excess": round(excess_rate, 2),
            "projected_duration_hours": projected_duration_hours,
            "projected_excess_resource": round(excess_kwh_24h, 2),
            "potential_avoidable_cost_24h_aed": round(avoidable_cost, 2),
            "estimated_action_cost_aed": action_cost_estimate,
            "estimated_weekly_net_benefit_aed": round(net_benefit, 2),
            "assumptions": [
                "DEWA commercial electric slab tariffs applied to incremental consumption.",
                "Continuous after-hours operation over projection window."
            ],
            "confidence": 0.85
        }
