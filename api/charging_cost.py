from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# Open Charge Map API Endpoint & Key
OPENCHARGEMAP_API_URL = "https://api.openchargemap.io/v3/poi/"
API_KEY = "cd4b0e39-c1fe-4b35-8925-6346928c4bc8"  # Replace with your Open Charge Map API Key

DEFAULT_BATTERY_CAPACITY = 75  # Assume a default EV battery size (kWh)

@app.route('/estimate-charging-cost', methods=['GET'])
def estimate_charging_cost():
    try:
        # Get user inputs
        charge_difference = float(request.args.get("charge_difference"))  # Percentage (e.g. 50% means charge by 50%)
        latitude = request.args.get("latitude")
        longitude = request.args.get("longitude")

        if not all([charge_difference, latitude, longitude]):
            return jsonify({"error": "Missing parameters"}), 400

        # Fetch nearest charging station from Open Charge Map API
        params = {
            "output": "json",
            "latitude": latitude,
            "longitude": longitude,
            "distance": 5,  # Search within 5km
            "maxresults": 1,  # Get the closest station
            "key": API_KEY
        }

        response = requests.get(OPENCHARGEMAP_API_URL, params=params)
        stations = response.json()

        if not stations:
            return jsonify({"error": "No charging stations found nearby."}), 404

        # Extract charging station details
        station = stations[0]
        station_name = station.get("AddressInfo", {}).get("Title", "Unknown Station")
        station_operator = station.get("OperatorInfo", {}).get("Title", "Unknown Operator")

        # Attempt to fetch pricing (not always available)
        price_per_kwh = station.get("UsageCost", None)  # Example: "€0.35/kWh"

        # If price is not available, set a default
        if not price_per_kwh or "€" not in price_per_kwh:
            price_per_kwh = 0.30  # Default price per kWh
        else:
            # Extract numeric price value (e.g., "€0.35/kWh" -> 0.35)
            price_per_kwh = float(price_per_kwh.replace("€", "").split("/")[0])

        # Calculate required energy (kWh)
        energy_needed = (charge_difference / 100) * DEFAULT_BATTERY_CAPACITY

        # Estimate total cost
        estimated_cost = energy_needed * price_per_kwh

        return jsonify({
            "charging_station": station_name,
            "operator": station_operator,
            "energy_needed_kwh": round(energy_needed, 2),
            "price_per_kwh": round(price_per_kwh, 2),
            "estimated_cost": round(estimated_cost, 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
