from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64

app = Flask(__name__)
CORS(app)

def encode_image_from_url(image_url):
    """Fetch image from URL and encode it in base64"""
    response = requests.get(image_url)
    if response.status_code == 200:
        return base64.b64encode(response.content).decode('utf-8')
    else:
        return None

def analyze_image(image_url):
    """Send image to Gemini API and get response"""
    api_key = "YOUR_GEMINI_API_KEY"
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    encoded_image = encode_image_from_url(image_url)
    if not encoded_image:
        return "Error: Failed to fetch image."

    headers = {"Content-Type": "application/json"}
    prompt = """Analyze this image and provide two sections:
1. Detailed Description: Describe the image in detail.
2. Eco-Friendly Alternatives: Suggest eco-friendly alternatives related to what's shown in the image."""

    payload = {
        "contents": [{
            "parts": [{
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": encoded_image
                }
            }, {
                "text": prompt
            }]
        }]
    }

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        try:
            full_response = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            # Split the response into description and eco-friendly sections
            sections = full_response.split("2. Eco-Friendly Alternatives:")
            description = sections[0].replace("1. Detailed Description:", "").strip()
            eco_friendly = sections[1].strip() if len(sections) > 1 else "No eco-friendly alternatives provided."
            return description, eco_friendly
        except KeyError:
            return "Error: Unexpected response format.", "Error: Unexpected response format."
    else:
        error_msg = f"Error: {response.status_code}, {response.text}"
        return error_msg, error_msg

@app.route('/analyze', methods=['POST'])
def analyze():
    """Handle frontend requests for image analysis"""
    data = request.json
    image_url = data.get("image_url")

    if not image_url:
        return jsonify({"error": "No image URL provided"}), 400

    print(f"Processing image: {image_url}")

    description, eco_friendly_alternatives = analyze_image(image_url)

    print(f"Description: {description}")
    print(f"Eco-Friendly Alternatives: {eco_friendly_alternatives}")

    return jsonify({
        "description": description,
        "eco_friendly_alternatives": eco_friendly_alternatives
    })

if __name__ == "__main__":
    app.run(debug=True) 
