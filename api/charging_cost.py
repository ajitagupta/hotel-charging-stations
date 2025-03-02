import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from flask import Blueprint

# Create Blueprint
charging_cost_bp = Blueprint("charging_cost", __name__)

# Open Charge Map API Endpoint & Key
OPENCHARGEMAP_API_URL = "https://api.openchargemap.io/v3/poi/"
API_KEY = "cd4b0e39-c1fe-4b35-8925-6346928c4bc8"  # Replace with your Open Charge Map API Key

@charging_cost_bp.route('/estimate-charging-cost', methods=['GET'])
def estimate_charging_cost():
    try:
        # Get user inputs from frontend
        charge_difference = float(request.args.get("chargeDifference", 0))
        battery_capacity = float(request.args.get("batteryCapacity", 0))  
        latitude = request.args.get("lat")
        longitude = request.args.get("lon")
        car_model = request.args.get("carModel", "")
        efficiency = float(request.args.get("efficiency", 0))

        # Validate required inputs
        if not all([charge_difference, battery_capacity, latitude, longitude, car_model, efficiency]):
            return jsonify({"error": "Missing parameters"}), 400

        # Fetch nearest charging station
        params = {
            "output": "json",
            "latitude": latitude,
            "longitude": longitude,
            "distance": 5,
            "maxresults": 1,
            "key": API_KEY
        }

        response = requests.get(OPENCHARGEMAP_API_URL, params=params)
        stations = response.json()

        if not stations:
            return jsonify({"error": "No charging stations found nearby."}), 404

        # Extract station details
        station = stations[0]
        station_name = station.get("AddressInfo", {}).get("Title", "Unknown Station")
        station_operator = station.get("OperatorInfo", {}).get("Title", "Unknown Operator")

        # Fetch pricing
        price_per_kwh = station.get("UsageCost", None)

        if not price_per_kwh or "€" not in price_per_kwh:
            price_per_kwh = 0.30  
        else:
            price_per_kwh = float(price_per_kwh.replace("€", "").split("/")[0])

        # Calculate required energy
        energy_needed = (charge_difference / 100) * battery_capacity
        adjusted_energy_needed = (energy_needed * efficiency) / 100  

        # Estimate cost
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
