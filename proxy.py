from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from shapely.geometry import LineString

app = Flask(__name__)
CORS(app)

API_BASE_URL = "http://ich-tanke-strom.switzerlandnorth.cloudapp.azure.com:8080/geoserver/ich-tanke-strom/ows"

@app.route("/proxy-api", methods=["GET"])
def proxy_request():
    try:
        # Extract query parameters
        source_lon = request.args.get("source_lon")
        source_lat = request.args.get("source_lat")
        dest_lon = request.args.get("dest_lon")
        dest_lat = request.args.get("dest_lat")
        max_distance = request.args.get("maxDistance")  # Extract maxDistance

        # Log received parameters
        print("Query Parameters:")
        print(f"source_lon: {source_lon}, source_lat: {source_lat}, dest_lon: {dest_lon}, dest_lat: {dest_lat}, max_distance: {max_distance}")

        # Validate presence of all parameters
        if not all([source_lon, source_lat, dest_lon, dest_lat, max_distance]):
            return jsonify({"error": "Missing required query parameters"}), 400

        # Convert parameters to float
        try:
            source_lon = float(source_lon)
            source_lat = float(source_lat)
            dest_lon = float(dest_lon)
            dest_lat = float(dest_lat)
            max_distance = float(max_distance)  # Convert maxDistance to float
        except ValueError:
            return jsonify({"error": "Invalid query parameters. Ensure they are numbers."}), 400

        # Process the max_distance parameter
        if max_distance <= 0:
            return jsonify({"error": "max_distance must be greater than 0"}), 400

        # Create a route line and buffer (max_distance in km)
        route_line = LineString([(source_lon, source_lat), (dest_lon, dest_lat)])
        buffer = route_line.buffer(max_distance / 111)  # Convert km to degrees (approximation)
        buffer_wkt = buffer.wkt  # Convert to WKT for the API

        # Construct API query
        api_url = f"{API_BASE_URL}?service=WFS&version=1.0.0&request=GetFeature&typeName=ich-tanke-strom%3Aevse&maxFeatures=100&outputFormat=application%2Fjson&cql_filter=INTERSECTS(geometry,{buffer_wkt})"
        print("API URL:", api_url)

        # Make the API call
        response = requests.get(api_url)

        # Handle API response
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"error": "Failed to fetch data from Ich Tanke Strom API"}), response.status_code
    except Exception as e:
        import traceback
        print("Error occurred:", traceback.format_exc())  # Log detailed traceback for debugging
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
