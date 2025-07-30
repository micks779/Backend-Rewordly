from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=['*'])  # Allow all origins for deployment - can be restricted later

# Configure OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Rewordly API is running"})

@app.route('/api/reword', methods=['POST'])
def reword_text():
    """
    Reword selected text based on user-defined tone
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        selected_text = data.get('selectedText', '').strip()
        tone_instructions = data.get('toneInstructions', '').strip()
        
        if not selected_text:
            return jsonify({"error": "No text selected for rewording"}), 400
        
        if not tone_instructions:
            return jsonify({"error": "No tone instructions provided"}), 400
        
        # Check if OpenAI API key is available
        if not client.api_key:
            # Fallback to mock response
            mock_response = f"[Reworded with tone: {tone_instructions}] {selected_text}"
            logger.info(f"Mock rewording text with tone: {tone_instructions}")
            
            return jsonify({
                "success": True,
                "rewording_text": mock_response,
                "original_text": selected_text,
                "tone_instructions": tone_instructions
            })
        
        # Create the prompt for OpenAI
        prompt = f"""
        Please reword the following email text according to these tone instructions: "{tone_instructions}"
        
        Original text:
        {selected_text}
        
        Please provide only the rewording text without any explanations or additional formatting.
        """
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional email writing assistant. Reword the given text according to the specified tone while maintaining the original meaning and context."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        rewording_text = response.choices[0].message.content.strip()
        
        logger.info(f"Successfully rewording text with tone: {tone_instructions}")
        
        return jsonify({
            "success": True,
            "rewording_text": rewording_text,
            "original_text": selected_text,
            "tone_instructions": tone_instructions
        })
        
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        return jsonify({"error": "AI service error. Please try again."}), 500

@app.route('/api/compose', methods=['POST'])
def compose_email():
    """
    Compose a new email based on user instructions
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        composition_instructions = data.get('compositionInstructions', '').strip()
        
        if not composition_instructions:
            return jsonify({"error": "No composition instructions provided"}), 400
        
        # Check if OpenAI API key is available
        if not client.api_key:
            # Fallback to mock response
            mock_email = f"""Dear [Recipient],

This is a mock email composed based on your instructions: "{composition_instructions}"

Best regards,
[Your Name]"""
            
            logger.info(f"Mock composing email with instructions: {composition_instructions}")
            
            return jsonify({
                "success": True,
                "composed_email": mock_email,
                "composition_instructions": composition_instructions
            })
        
        # Create the prompt for OpenAI
        prompt = f"""
        Please compose a professional email based on these instructions: "{composition_instructions}"
        
        The email should be:
        - Professional and well-structured
        - Appropriate for business communication
        - Clear and concise
        - Include a proper greeting and closing
        
        Please provide only the email content without any explanations or additional formatting.
        """
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional email writing assistant. Compose emails that are clear, professional, and appropriate for business communication."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        composed_email = response.choices[0].message.content.strip()
        
        logger.info(f"Successfully composed email with instructions: {composition_instructions}")
        
        return jsonify({
            "success": True,
            "composed_email": composed_email,
            "composition_instructions": composition_instructions
        })
        
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        return jsonify({"error": "AI service error. Please try again."}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Starting Rewordly API server on http://localhost:{port}")
    
    if not client.api_key:
        print("⚠️  No OpenAI API key found - running in mock mode")
    else:
        print("✅ OpenAI API key configured - running in production mode")
    
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_ENV') == 'development') 