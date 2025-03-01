from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from flask import Blueprint

charging_cost_bp = Blueprint("charging_cost", __name__)

app = Flask(__name__)
CORS(app)

# Open Charge Map API Endpoint & Key
OPENCHARGEMAP_API_URL = "https://api.openchargemap.io/v3/poi/"
API_KEY = "cd4b0e39-c1fe-4b35-8925-6346928c4bc8"  # Replace with your Open Charge Map API Key

@charging_cost_bp.route('/estimate-charging-cost', methods=['GET'])
def estimate_charging_cost():
    try:
        # Get user inputs from frontend
        charge_difference = float(request.args.get("chargeDifference", 0))
        battery_capacity = float(request.args.get("batteryCapacity", 0))  # Taken from frontend
        latitude = request.args.get("lat")
        longitude = request.args.get("lon")
        car_model = request.args.get("carModel", "")
        efficiency = float(request.args.get("efficiency", 0))  # Now received from frontend

        # Validate required inputs
        if not all([charge_difference, battery_capacity, latitude, longitude, car_model, efficiency]):
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
        price_per_kwh = station.get("UsageCost", None)

        # If price is not available, set a default
        if not price_per_kwh or "€" not in price_per_kwh:
            price_per_kwh = 0.30  # Default price per kWh
        else:
            # Extract numeric price value (e.g., "€0.35/kWh" -> 0.35)
            price_per_kwh = float(price_per_kwh.replace("€", "").split("/")[0])

        # Calculate required energy (kWh) based on user battery capacity
        energy_needed = (charge_difference / 100) * battery_capacity
        adjusted_energy_needed = (energy_needed * efficiency) / 100  # Scale by efficiency

        # Estimate total cost
        estimated_cost = adjusted_energy_needed * price_per_kwh

        return jsonify({
            "charging_station": station_name,
            "operator": station_operator,
            "car_model": car_model,
            "battery_capacity_kwh": battery_capacity,
            "efficiency_kwh_per_100km": efficiency,
            "energy_needed_kwh": round(adjusted_energy_needed, 2),
            "price_per_kwh": round(price_per_kwh, 2),
            "estimated_cost": round(estimated_cost, 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
