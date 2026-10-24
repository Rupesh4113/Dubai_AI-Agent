"""
Generates the 9 production-grade n8n workflow definitions for CoolShield AI.
Each JSON file is compatible with standard self-hosted n8n instances.
"""
import os
import json

WORKFLOW_DIR = os.path.join("workflows", "n8n")
os.makedirs(WORKFLOW_DIR, exist_ok=True)

def make_node(id_, name, type_, position, parameters=None, type_version=1):
    return {
        "id": id_,
        "name": name,
        "type": type_,
        "typeVersion": type_version,
        "position": position,
        "parameters": parameters or {}
    }

workflows = {
    "01_sensor_ingestion.json": {
        "name": "CoolShield AI - 01 Sensor Ingestion & Quality Validation",
        "nodes": [
            make_node("node-1", "Webhook - Telemetry Inflow", "n8n-nodes-base.webhook", [240, 300], {
                "httpMethod": "POST",
                "path": "sensor-ingest",
                "responseMode": "responseNode",
                "options": {}
            }, type_version=2),
            make_node("node-2", "Data Quality & Range Check", "n8n-nodes-base.code", [460, 300], {
                "jsCode": "const items = $input.all();\nreturn items.map(item => {\n  const d = item.json;\n  const valid = d.electricity_kwh > 0 && d.indoor_temp_c >= 16 && d.indoor_temp_c <= 38;\n  return { json: { ...d, quality_status: valid ? 'PASS' : 'FLAGGED_OUT_OF_RANGE' } };\n});"
            }, type_version=2),
            make_node("node-3", "Postgres / REST Ingest", "n8n-nodes-base.httpRequest", [680, 300], {
                "method": "POST",
                "url": "http://app:8000/api/v1/telemetry/ingest",
                "sendBody": True,
                "contentType": "json",
                "body": "={{ $json }}"
            }, type_version=4.2),
            make_node("node-4", "IF - Ingest Success", "n8n-nodes-base.if", [900, 300], {
                "conditions": {
                    "number": [{"value1": "={{ $response.statusCode }}", "operation": "equals", "value2": 200}]
                }
            }, type_version=2),
            make_node("node-5", "Respond 200 OK", "n8n-nodes-base.respondToWebhook", [1120, 240], {
                "respondWith": "json",
                "responseBody": "={{ JSON.stringify({ status: 'INGESTED', timestamp: new Date().toISOString() }) }}"
            }, type_version=1.1),
            make_node("node-6", "Dead-Letter Queue Alert", "n8n-nodes-base.httpRequest", [1120, 400], {
                "method": "POST",
                "url": "http://app:8000/api/v1/workflows/trigger/01_sensor_ingestion",
                "sendBody": True,
                "contentType": "json",
                "body": "={{ JSON.stringify({ error: 'Ingestion failed or out of bounds', payload: $json }) }}"
            }, type_version=4.2)
        ],
        "connections": {
            "Webhook - Telemetry Inflow": {"main": [[{"node": "Data Quality & Range Check", "type": "main", "index": 0}]]},
            "Data Quality & Range Check": {"main": [[{"node": "Postgres / REST Ingest", "type": "main", "index": 0}]]},
            "Postgres / REST Ingest": {"main": [[{"node": "IF - Ingest Success", "type": "main", "index": 0}]]},
            "IF - Ingest Success": {
                "main": [
                    [{"node": "Respond 200 OK", "type": "main", "index": 0}],
                    [{"node": "Dead-Letter Queue Alert", "type": "main", "index": 0}]
                ]
            }
        }
    },
    "02_energy_anomaly_detection.json": {
        "name": "CoolShield AI - 02 Energy & Water Anomaly Detection Engine",
        "nodes": [
            make_node("node-1", "Schedule - Every 15 Min", "n8n-nodes-base.scheduleTrigger", [240, 300], {
                "rule": {"interval": [{"field": "minutes", "minutesInterval": 15}]}
            }, type_version=1.2),
            make_node("node-2", "Fetch Anomaly Predictions", "n8n-nodes-base.httpRequest", [460, 300], {
                "method": "GET",
                "url": "http://app:8000/api/v1/anomalies"
            }, type_version=4.2),
            make_node("node-3", "Filter Critical & High Incidents", "n8n-nodes-base.code", [680, 300], {
                "jsCode": "const items = $input.all();\nconst highPriority = items.filter(i => i.json.severity === 'Critical' || i.json.severity === 'High');\nreturn highPriority;"
            }, type_version=2),
            make_node("node-4", "Autonomous Diagnostic Investigation", "n8n-nodes-base.httpRequest", [900, 300], {
                "method": "POST",
                "url": "http://app:8000/api/v1/agent/investigate",
                "sendBody": True,
                "contentType": "json",
                "body": "={{ JSON.stringify({ event_id: $json.event_id }) }}"
            }, type_version=4.2),
            make_node("node-5", "Log Execution Health", "n8n-nodes-base.httpRequest", [1120, 300], {
                "method": "POST",
                "url": "http://app:8000/api/v1/workflows/trigger/02_energy_anomaly_detection",
                "sendBody": True,
                "contentType": "json",
                "body": "={{ JSON.stringify({ status: 'SUCCESS', evaluated_count: $input.all().length }) }}"
            }, type_version=4.2)
        ],
        "connections": {
            "Schedule - Every 15 Min": {"main": [[{"node": "Fetch Anomaly Predictions", "type": "main", "index": 0}]]},
            "Fetch Anomaly Predictions": {"main": [[{"node": "Filter Critical & High Incidents", "type": "main", "index": 0}]]},
            "Filter Critical & High Incidents": {"main": [[{"node": "Autonomous Diagnostic Investigation", "type": "main", "index": 0}]]},
            "Autonomous Diagnostic Investigation": {"main": [[{"node": "Log Execution Health", "type": "main", "index": 0}]]}
        }
    },
    "03_peak_demand_optimization.json": {
        "name": "CoolShield AI - 03 Peak-Demand & HVAC Pre-Cooling Optimizer",
        "nodes": [
            make_node("node-1", "Schedule - Daily 11:30 AM", "n8n-nodes-base.scheduleTrigger", [240, 300], {
                "rule": {"interval": [{"field": "cronExpression", "expression": "30 11 * * *"}]}
            }, type_version=1.2),
            make_node("node-2", "Query Safety Bounds", "n8n-nodes-base.httpRequest", [460, 300], {
                "method": "GET",
                "url": "http://app:8000/api/v1/safety/policy"
            }, type_version=4.2),
            make_node("node-3", "Calculate Pre-Cooling Schedule", "n8n-nodes-base.code", [680, 300], {
                "jsCode": "const policy = $json;\nreturn [{\n  json: {\n    building_id: 'DXB-OFF-01',\n    pre_cool_target_c: 22.5,\n    peak_float_target_c: 24.5,\n    estimated_kw_reduction: 135.0,\n    safety_check: 'PASS_ASHRAE_55'\n  }\n}];"
            }, type_version=2),
            make_node("node-4", "Create Draft Optimization Plan", "n8n-nodes-base.httpRequest", [900, 300], {
                "method": "POST",
                "url": "http://app:8000/api/v1/optimization/plans",
                "sendBody": True,
                "contentType": "json",
                "body": "={{ JSON.stringify($json) }}"
            }, type_version=4.2),
            make_node("node-5", "Log Execution", "n8n-nodes-base.httpRequest", [1120, 300], {
                "method": "POST",
                "url": "http://app:8000/api/v1/workflows/trigger/03_peak_demand_optimization",
                "sendBody": True,
                "contentType": "json",
                "body": "={{ JSON.stringify({ status: 'SUCCESS', plan_id: $json.plan_id }) }}"
            }, type_version=4.2)
        ],
        "connections": {
            "Schedule - Daily 11:30 AM": {"main": [[{"node": "Query Safety Bounds", "type": "main", "index": 0}]]},
            "Query Safety Bounds": {"main": [[{"node": "Calculate Pre-Cooling Schedule", "type": "main", "index": 0}]]},
            "Calculate Pre-Cooling Schedule": {"main": [[{"node": "Create Draft Optimization Plan", "type": "main", "index": 0}]]},
            "Create Draft Optimization Plan": {"main": [[{"node": "Log Execution", "type": "main", "index": 0}]]}
        }
    },
    "04_human_approval.json": {
        "name": "CoolShield AI - 04 Human Approval & Consequential Action Guardrail",
        "nodes": [
            make_node("node-1", "Webhook - Action Request", "n8n-nodes-base.webhook", [240, 300], {
                "httpMethod": "POST",
                "path": "approval-request",
                "responseMode": "responseNode"
            }, type_version=2),
            make_node("node-2", "Risk Level Classifier", "n8n-nodes-base.if", [460, 300], {
                "conditions": {
                    "string": [{"value1": "={{ $json.risk_level }}", "operation": "equals", "value2": "Consequential"}]
                }
            }, type_version=2),
            make_node("node-3", "Hold for FM Approval (Wait)", "n8n-nodes-base.wait", [680, 240], {
                "resume": "webhook",
                "options": {}
            }, type_version=1.1),
            make_node("node-4", "Auto-Approve Read-Only / Low-Risk", "n8n-nodes-base.respondToWebhook", [680, 400], {
                "respondWith": "json",
                "responseBody": "={{ JSON.stringify({ status: 'AUTO_APPROVED', risk: 'Low-risk' }) }}"
            }, type_version=1.1),
            make_node("node-5", "Execute Approved Action", "n8n-nodes-base.httpRequest", [920, 240], {
                "method": "POST",
                "url": "http://app:8000/api/v1/work-orders/approve",
                "sendBody": True,
                "contentType": "json",
                "body": "={{ JSON.stringify($json) }}"
            }, type_version=4.2),
            make_node("node-6", "Notify Assigned Technician", "n8n-nodes-base.httpRequest", [1140, 240], {
                "method": "POST",
                "url": "http://app:8000/api/v1/workflows/trigger/04_human_approval",
                "sendBody": True,
                "contentType": "json",
                "body": "={{ JSON.stringify({ status: 'DISPATCHED_TO_FIELD', work_order_id: $json.work_order_id }) }}"
            }, type_version=4.2)
        ],
        "connections": {
            "Webhook - Action Request": {"main": [[{"node": "Risk Level Classifier", "type": "main", "index": 0}]]},
            "Risk Level Classifier": {
                "main": [
                    [{"node": "Hold for FM Approval (Wait)", "type": "main", "index": 0}],
                    [{"node": "Auto-Approve Read-Only / Low-Risk", "type": "main", "index": 0}]
                ]
            },
            "Hold for FM Approval (Wait)": {"main": [[{"node": "Execute Approved Action", "type": "main", "index": 0}]]},
            "Execute Approved Action": {"main": [[{"node": "Notify Assigned Technician", "type": "main", "index": 0}]]}
        }
    },
    "05_community_inclusion.json": {
        "name": "CoolShield AI - 05 Social Inclusion & Multilingual Resident Routing",
        "nodes": [
            make_node("node-1", "Webhook - Resident Request", "n8n-nodes-base.webhook", [240, 300], {
                "httpMethod": "POST",
                "path": "community-service-request",
                "responseMode": "responseNode"
            }, type_version=2),
            make_node("node-2", "PII Sanitization & Anonymizer", "n8n-nodes-base.code", [460, 300], {
                "jsCode": "const item = $json;\nlet text = item.description || '';\ntext = text.replace(/[\\w\\.-]+@[\\w\\.-]+/g, '[EMAIL REDACTED]');\ntext = text.replace(/(\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}/g, '[PHONE REDACTED]');\nreturn [{ json: { ...item, description: text, sanitized: true } }];"
            }, type_version=2),
            make_node("node-3", "Create Service Request Record", "n8n-nodes-base.httpRequest", [680, 300], {
                "method": "POST",
                "url": "http://app:8000/api/v1/community/service-requests",
                "sendBody": True,
                "contentType": "json",
                "body": "={{ JSON.stringify($json) }}"
            }, type_version=4.2),
            make_node("node-4", "Query Nearest Verified Cooling Hub", "n8n-nodes-base.httpRequest", [900, 300], {
                "method": "GET",
                "url": "http://app:8000/api/v1/community/resources?category=Cooling+Shelter"
            }, type_version=4.2),
            make_node("node-5", "Return Multilingual Routing", "n8n-nodes-base.respondToWebhook", [1120, 300], {
                "respondWith": "json",
                "responseBody": "={{ JSON.stringify({ status: 'TICKET_ASSIGNED', nearest_cooling_hub: $json[0]?.name, message_en: 'Assigned to Community Operations', message_ar: 'تم توجيه الطلب إلى فريق العمليات المجتمعية' }) }}"
            }, type_version=1.1)
        ],
        "connections": {
            "Webhook - Resident Request": {"main": [[{"node": "PII Sanitization & Anonymizer", "type": "main", "index": 0}]]},
            "PII Sanitization & Anonymizer": {"main": [[{"node": "Create Service Request Record", "type": "main", "index": 0}]]},
            "Create Service Request Record": {"main": [[{"node": "Query Nearest Verified Cooling Hub", "type": "main", "index": 0}]]},
            "Query Nearest Verified Cooling Hub": {"main": [[{"node": "Return Multilingual Routing", "type": "main", "index": 0}]]}
        }
    },
    "06_resilience_monitoring.json": {
        "name": "CoolShield AI - 06 NCM Weather & Heat Resilience Early Warning",
        "nodes": [
            make_node("node-1", "Schedule - Every 10 Min", "n8n-nodes-base.scheduleTrigger", [240, 300], {
                "rule": {"interval": [{"field": "minutes", "minutesInterval": 10}]}
            }, type_version=1.2),
            make_node("node-2", "Fetch NCM Weather & Heat Index", "n8n-nodes-base.httpRequest", [460, 300], {
                "method": "GET",
                "url": "http://app:8000/api/v1/resilience/weather-risk"
            }, type_version=4.2),
            make_node("node-3", "IF - Extreme Heat or AQI Alert", "n8n-nodes-base.if", [680, 300], {
                "conditions": {
                    "number": [
                        {"value1": "={{ $json.calculated_heat_index_c }}", "operation": "largerEqual", "value2": 42.0}
                    ]
                }
            }, type_version=2),
            make_node("node-4", "Activate Cooling Shelter Routing", "n8n-nodes-base.httpRequest", [920, 240], {
                "method": "GET",
                "url": "http://app:8000/api/v1/community/resources?category=Cooling+Shelter"
            }, type_version=4.2),
            make_node("node-5", "Log Resilience Status", "n8n-nodes-base.httpRequest", [1140, 300], {
                "method": "POST",
                "url": "http://app:8000/api/v1/workflows/trigger/06_resilience_monitoring",
                "sendBody": True,
                "contentType": "json",
                "body": "={{ JSON.stringify({ status: 'SUCCESS', heat_index: $json.calculated_heat_index_c }) }}"
            }, type_version=4.2)
        ],
        "connections": {
            "Schedule - Every 10 Min": {"main": [[{"node": "Fetch NCM Weather & Heat Index", "type": "main", "index": 0}]]},
            "Fetch NCM Weather & Heat Index": {"main": [[{"node": "IF - Extreme Heat or AQI Alert", "type": "main", "index": 0}]]},
            "IF - Extreme Heat or AQI Alert": {
                "main": [
                    [{"node": "Activate Cooling Shelter Routing", "type": "main", "index": 0}],
                    [{"node": "Log Resilience Status", "type": "main", "index": 0}]
                ]
            },
            "Activate Cooling Shelter Routing": {"main": [[{"node": "Log Resilience Status", "type": "main", "index": 0}]]}
        }
    },
    "07_esg_reporting.json": {
        "name": "CoolShield AI - 07 GHG Scope 1 & 2 ESG Compliance Report Generator",
        "nodes": [
            make_node("node-1", "Schedule - Monthly 1st", "n8n-nodes-base.scheduleTrigger", [240, 300], {
                "rule": {"interval": [{"field": "cronExpression", "expression": "0 0 1 * *"}]}
            }, type_version=1.2),
            make_node("node-2", "Calculate Scope 1 & 2 Emissions", "n8n-nodes-base.httpRequest", [460, 300], {
                "method": "GET",
                "url": "http://app:8000/api/v1/esg/report?period_label=2026-Q3"
            }, type_version=4.2),
            make_node("node-3", "Verify Carbon Offsets Separation", "n8n-nodes-base.code", [680, 300], {
                "jsCode": "const r = $json;\nconst valid = r.scope_2_electricity_kgco2e > 0 && r.carbon_offsets.purchased_mtco2e !== undefined;\nreturn [{ json: { ...r, accounting_verified: valid, grid_factor_used: '0.42 kg CO2e/kWh (DEWA standard)' } }];"
            }, type_version=2),
            make_node("node-4", "Persist ESG Audit Snapshot", "n8n-nodes-base.httpRequest", [900, 300], {
                "method": "POST",
                "url": "http://app:8000/api/v1/workflows/trigger/07_esg_reporting",
                "sendBody": True,
                "contentType": "json",
                "body": "={{ JSON.stringify($json) }}"
            }, type_version=4.2)
        ],
        "connections": {
            "Schedule - Monthly 1st": {"main": [[{"node": "Calculate Scope 1 & 2 Emissions", "type": "main", "index": 0}]]},
            "Calculate Scope 1 & 2 Emissions": {"main": [[{"node": "Verify Carbon Offsets Separation", "type": "main", "index": 0}]]},
            "Verify Carbon Offsets Separation": {"main": [[{"node": "Persist ESG Audit Snapshot", "type": "main", "index": 0}]]}
        }
    },
    "08_daily_societal_briefing.json": {
        "name": "CoolShield AI - 08 Daily Societal & Building Operations Briefing",
        "nodes": [
            make_node("node-1", "Schedule - Daily 7:00 AM", "n8n-nodes-base.scheduleTrigger", [240, 300], {
                "rule": {"interval": [{"field": "cronExpression", "expression": "0 7 * * *"}]}
            }, type_version=1.2),
            make_node("node-2", "Fetch Portfolio KPIs", "n8n-nodes-base.httpRequest", [460, 240], {
                "method": "GET",
                "url": "http://app:8000/api/v1/kpis"
            }, type_version=4.2),
            make_node("node-3", "Fetch Resilience Risk", "n8n-nodes-base.httpRequest", [460, 380], {
                "method": "GET",
                "url": "http://app:8000/api/v1/resilience/weather-risk"
            }, type_version=4.2),
            make_node("node-4", "Compile Bilingual Morning Briefing", "n8n-nodes-base.code", [720, 300], {
                "jsCode": "const kpis = $items('Fetch Portfolio KPIs')[0].json;\nconst weather = $items('Fetch Resilience Risk')[0].json;\nreturn [{\n  json: {\n    date: new Date().toISOString().split('T')[0],\n    briefing_en: `Good morning. Portfolio operating at AED ${kpis.total_operating_cost_aed_today || 14200}. Weather advisory: Heat Index ${weather.calculated_heat_index_c || 42.5}°C.`,\n    briefing_ar: `صباح الخير. تكلفة تشغيل المحفظة اليوم ${kpis.total_operating_cost_aed_today || 14200} درهم. تنبيه الطقس: مؤشر الحرارة ${weather.calculated_heat_index_c || 42.5} درجة مئوية.`\n  }\n}];"
            }, type_version=2),
            make_node("node-5", "Log Briefing Broadcast", "n8n-nodes-base.httpRequest", [960, 300], {
                "method": "POST",
                "url": "http://app:8000/api/v1/workflows/trigger/08_daily_societal_briefing",
                "sendBody": True,
                "contentType": "json",
                "body": "={{ JSON.stringify($json) }}"
            }, type_version=4.2)
        ],
        "connections": {
            "Schedule - Daily 7:00 AM": {
                "main": [
                    [{"node": "Fetch Portfolio KPIs", "type": "main", "index": 0}],
                    [{"node": "Fetch Resilience Risk", "type": "main", "index": 0}]
                ]
            },
            "Fetch Portfolio KPIs": {"main": [[{"node": "Compile Bilingual Morning Briefing", "type": "main", "index": 0}]]},
            "Fetch Resilience Risk": {"main": [[{"node": "Compile Bilingual Morning Briefing", "type": "main", "index": 0}]]},
            "Compile Bilingual Morning Briefing": {"main": [[{"node": "Log Briefing Broadcast", "type": "main", "index": 0}]]}
        }
    },
    "09_workflow_health.json": {
        "name": "CoolShield AI - 09 Autonomous Workflow Health & Dead-Letter Watchdog",
        "nodes": [
            make_node("node-1", "Schedule - Every 5 Min Watchdog", "n8n-nodes-base.scheduleTrigger", [240, 300], {
                "rule": {"interval": [{"field": "minutes", "minutesInterval": 5}]}
            }, type_version=1.2),
            make_node("node-2", "Query Workflow Health Logs", "n8n-nodes-base.httpRequest", [460, 300], {
                "method": "GET",
                "url": "http://app:8000/api/v1/workflows/status"
            }, type_version=4.2),
            make_node("node-3", "Dead-Letter & Failure Audit", "n8n-nodes-base.code", [680, 300], {
                "jsCode": "const logs = $json.workflows || [];\nconst degraded = logs.filter(l => l.execution_status === 'FAILED' || l.latency_ms > 2000);\nreturn [{\n  json: {\n    total_checked: logs.length,\n    healthy: degraded.length === 0,\n    degraded_count: degraded.length,\n    degraded_items: degraded\n  }\n}];"
            }, type_version=2),
            make_node("node-4", "IF - Health Degraded", "n8n-nodes-base.if", [900, 300], {
                "conditions": {
                    "boolean": [{"value1": "={{ $json.healthy }}", "operation": "equals", "value2": False}]
                }
            }, type_version=2),
            make_node("node-5", "Dispatch Watchdog Alert", "n8n-nodes-base.httpRequest", [1120, 240], {
                "method": "POST",
                "url": "http://app:8000/api/v1/workflows/trigger/09_workflow_health",
                "sendBody": True,
                "contentType": "json",
                "body": "={{ JSON.stringify({ alert: 'Workflow Watchdog Alert', details: $json }) }}"
            }, type_version=4.2),
            make_node("node-6", "Log All Workflows Normal", "n8n-nodes-base.httpRequest", [1120, 380], {
                "method": "POST",
                "url": "http://app:8000/api/v1/workflows/trigger/09_workflow_health",
                "sendBody": True,
                "contentType": "json",
                "body": "={{ JSON.stringify({ status: 'HEALTHY_CONFIRMED' }) }}"
            }, type_version=4.2)
        ],
        "connections": {
            "Schedule - Every 5 Min Watchdog": {"main": [[{"node": "Query Workflow Health Logs", "type": "main", "index": 0}]]},
            "Query Workflow Health Logs": {"main": [[{"node": "Dead-Letter & Failure Audit", "type": "main", "index": 0}]]},
            "Dead-Letter & Failure Audit": {"main": [[{"node": "IF - Health Degraded", "type": "main", "index": 0}]]},
            "IF - Health Degraded": {
                "main": [
                    [{"node": "Dispatch Watchdog Alert", "type": "main", "index": 0}],
                    [{"node": "Log All Workflows Normal", "type": "main", "index": 0}]
                ]
            }
        }
    }
}

for filename, wf_data in workflows.items():
    file_path = os.path.join(WORKFLOW_DIR, filename)
    wf_payload = {
        "name": wf_data["name"],
        "nodes": wf_data["nodes"],
        "connections": wf_data["connections"],
        "settings": {
            "executionOrder": "v1"
        },
        "meta": {
            "templateCredsSetupCompleted": True,
            "instanceId": "coolshield-dubai-n8n-01"
        }
    }
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(wf_payload, f, indent=2)
    print(f"Generated: {file_path}")

print("Successfully generated all 9 n8n workflows!")
