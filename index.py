import os
from flask import Flask, request, render_template, redirect, flash
from werkzeug.utils import secure_filename
from main import getPrediction

UPLOAD_FOLDER = 'static/input_img'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)  # Create 'static/' if it doesn't exist

app = Flask(__name__)                    
app.secret_key = '8662747133'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/", methods=['POST'])
def submit_image():
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    
    file = request.files['file']

    if file.filename == '':
        flash('No file selected for uploading')
        return redirect(request.url)
    
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)  # Use correct path
        file.save(file_path)
        
        answer, probability_results, filename = getPrediction(filename)
        flash(answer)
        flash(probability_results)
        flash(filename)
        return redirect('/')

if __name__ == "__main__":
    app.run(debug=True)
