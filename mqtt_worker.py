"""Optional MQTT-to-database adapter.
Expected topic: coolshield/readings
Payload: JSON matching SensorReading fields documented in README.md.
"""
import json, os, time
import pandas as pd
import paho.mqtt.client as mqtt
from dotenv import load_dotenv
from coolshield.db import init_db, save_readings

load_dotenv()
BROKER = os.getenv("MQTT_BROKER", "mosquitto")
PORT = int(os.getenv("MQTT_PORT", "1883"))
TOPIC = os.getenv("MQTT_TOPIC", "coolshield/readings")

def on_connect(client, userdata, flags, reason_code, properties=None):
    print(f"MQTT connected: {reason_code}")
    client.subscribe(TOPIC)

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode("utf-8"))
        payload["timestamp"] = pd.to_datetime(payload["timestamp"], utc=True, errors="raise").isoformat()
        payload["source_type"] = "mqtt"
        payload["quality_status"] = "valid"
        save_readings(pd.DataFrame([payload]))
        print(f"Stored reading from {payload.get('asset_id')}")
    except Exception as exc:
        print(f"Rejected MQTT message: {exc}")

if __name__ == "__main__":
    init_db()
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.on_connect = on_connect
    client.on_message = on_message
    while True:
        try:
            client.connect(BROKER, PORT, 60)
            client.loop_forever()
        except Exception as exc:
            print(f"MQTT reconnect after error: {exc}")
            time.sleep(5)
