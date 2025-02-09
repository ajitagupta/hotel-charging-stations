import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import polyline
from geopy.distance import geodesic
from scipy.spatial import KDTree
import numpy as np

app = Flask(__name__)
CORS(app, resources={r"/proxy-api/*": {"origins": "*"}})

GRAPHOPPER_API_KEY = "df7dbaa8-06dc-44d2-8bab-45ef03acdf44"
GEO_SERVER_URL = "http://ich-tanke-strom.switzerlandnorth.cloudapp.azure.com:8080/geoserver/ich-tanke-strom/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=ich-tanke-strom:chargingStations&outputFormat=application/json"

@app.route("/proxy-api", methods=["GET"])
def get_route():
    source_lon = float(request.args.get("source_lon"))
    source_lat = float(request.args.get("source_lat"))
    dest_lon = float(request.args.get("dest_lon"))
    dest_lat = float(request.args.get("dest_lat"))
    max_distance = float(request.args.get("maxDistance", 10))  # Default max distance

    if not all([source_lon, source_lat, dest_lon, dest_lat]):
        return jsonify({"error": "Missing parameters"}), 400

    # Step 1: Fetch Route from GraphHopper
    gh_url = f"https://graphhopper.com/api/1/route?point={source_lat},{source_lon}&point={dest_lat},{dest_lon}&vehicle=car&locale=en&key={GRAPHOPPER_API_KEY}&type=json"

    try:
        response = requests.get(gh_url)
        data = response.json()

        if "paths" not in data or not data["paths"]:
            return jsonify({"error": "No route found"}), 404

        # Decode route polyline
        route_geometry = data["paths"][0]["points"]
        route_points = decode_polyline(route_geometry)
        route_points = route_points[::5]  # Sample every 5th point for efficiency

    except Exception as e:
        return jsonify({"error": f"GraphHopper Request Failed: {str(e)}"}), 500

    # Step 2: Fetch Charging Stations
    try:
        station_response = requests.get(GEO_SERVER_URL)
        stations_data = station_response.json()

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

    # Build KDTree for efficient nearest neighbor search
    tree = KDTree(route_array)

    # Find the closest route point for each station and its distance
    distances, _ = tree.query(station_array)

    # Filter stations within the max_distance
    valid_stations = [
        {"latitude": stations[i]["lat"],
         "longitude": stations[i]["lon"],
         "distance_km": round(distances[i], 2)}
        for i in range(len(stations))
        if distances[i] <= max_distance
    ]

    valid_stations.sort(key=lambda x: x["distance_km"])  # Sort by distance

    return jsonify({"route": route_points, "stations": valid_stations[:10]})  # Return top 10 nearest stations


def decode_polyline(polyline_str):
    """ Decode an encoded polyline into a list of (lat, lon) tuples """
    return polyline.decode(polyline_str)


if __name__ == "__main__":
    app.run(debug=True)
