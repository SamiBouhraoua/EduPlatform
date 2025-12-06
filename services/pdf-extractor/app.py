from flask import Flask, request, jsonify
from PyPDF2 import PdfReader
import sys

app = Flask(__name__)

@app.route('/extract', methods=['POST'])
def extract_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        reader = PdfReader(file)
        
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        return jsonify({'content': text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
