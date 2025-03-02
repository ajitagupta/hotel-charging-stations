import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import polyline
from geopy.distance import geodesic
from scipy.spatial import KDTree
import numpy as np
from charging_cost import charging_cost_bp  # ✅ Fixed Import

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# API Keys & URLs
GRAPHOPPER_API_KEY = "df7dbaa8-06dc-44d2-8bab-45ef03acdf44"
GEO_SERVER_URL = "http://ich-tanke-strom.switzerlandnorth.cloudapp.azure.com:8080/geoserver/ich-tanke-strom/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=ich-tanke-strom:chargingStations&outputFormat=application/json"
FOURSQUARE_API_KEY = "fsq3yqMebqUXB4tptfOlHpy5bBTGVwmD5nUGBsdIpxyDgGA="
FOURSQUARE_API_URL = "https://api.foursquare.com/v3/places/search"

# ✅ Register the Blueprint for Charging Cost API
app.register_blueprint(charging_cost_bp, url_prefix="/api")

@app.route("/proxy-api", methods=["GET"])
def get_route():
    source_lon = request.args.get("source_lon")
    source_lat = request.args.get("source_lat")
    dest_lon = request.args.get("dest_lon")
    dest_lat = request.args.get("dest_lat")
    max_distance = request.args.get("maxDistance", 10)  # Default 10 if missing

    # ✅ Fix: Ensure all parameters are provided
    if None in (source_lon, source_lat, dest_lon, dest_lat):
        return jsonify({"error": "Missing required parameters"}), 400

    source_lon = float(source_lon)
    source_lat = float(source_lat)
    dest_lon = float(dest_lon)
    dest_lat = float(dest_lat)
    max_distance = float(max_distance)


    # Step 1: Fetch Route from GraphHopper
    gh_url = f"https://graphhopper.com/api/1/route?point={source_lat},{source_lon}&point={dest_lat},{dest_lon}&vehicle=car&locale=en&key={GRAPHOPPER_API_KEY}&type=json"

    try:
        response = requests.get(gh_url)
        data = response.json()
        print("✅ GraphHopper API Response Received")

        if "paths" not in data or not data["paths"]:
            return jsonify({"error": "No route found"}), 404

        # Decode route polyline
        route_geometry = data["paths"][0]["points"]
        route_points = decode_polyline(route_geometry)
        route_points = route_points[::10]  # Optimize route points

    except Exception as e:
        return jsonify({"error": f"GraphHopper Request Failed: {str(e)}"}), 500

    # Step 2: Fetch Charging Stations
    try:
        station_response = requests.get(GEO_SERVER_URL)
        stations_data = station_response.json()
        print("✅ Charging station data received")

        if "features" not in stations_data or not stations_data["features"]:
            return jsonify({"error": "No charging stations available"}), 404

        stations = [
            {"lat": feature["geometry"]["coordinates"][1],
             "lon": feature["geometry"]["coordinates"][0]}
            for feature in stations_data["features"]
        ]

    except Exception as e:
        return jsonify({"error": f"GeoServer Request Failed: {str(e)}"}), 500

    # Step 3: Optimize Station Filtering Using KDTree
    route_array = np.array(route_points)
    station_array = np.array([[station["lat"], station["lon"]] for station in stations])
    tree = KDTree(route_array)
    distances, _ = tree.query(station_array)

    print("🔍 Filtering charging stations within max distance")
    valid_stations = [
        {
            "latitude": stations[i]["lat"],
            "longitude": stations[i]["lon"],
            "distance_km": round(distances[i], 2)
        }
        for i in range(len(stations)) if distances[i] <= max_distance
    ]

    # Sort and limit to top 20 stations
    valid_stations.sort(key=lambda x: x["distance_km"])
    valid_stations = valid_stations[:20]

    # Step 4: Check for Nearby Restaurants
    for station in valid_stations:
        has_restaurant = check_nearby_restaurants(station["latitude"], station["longitude"])
        station["has_restaurant"] = has_restaurant
        station["icon"] = "restaurant.png" if has_restaurant else "charging.png"

    response_json = {"route": route_points, "stations": valid_stations, "legend": {"restaurant.png": "Charging station with dining options", "charging.png": "Charging station only"}}
    return jsonify(response_json)


def check_nearby_restaurants(lat, lon):
    """Check if there is a restaurant near the given coordinates using Foursquare API."""
    headers = {"Authorization": FOURSQUARE_API_KEY, "Accept": "application/json"}
    params = {"ll": f"{lat},{lon}", "radius": 50, "categories": "13065"}

    try:
        response = requests.get(FOURSQUARE_API_URL, headers=headers, params=params)
        data = response.json()
        return len(data.get("results", [])) > 0
    except Exception as e:
        return False


def decode_polyline(polyline_str):
    """ Decode an encoded polyline into a list of (lat, lon) tuples """
    return polyline.decode(polyline_str)

if __name__ == "__main__":
    print("🚀 Backend server started!")

    # ✅ Render assigns a dynamic port
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
