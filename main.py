import numpy as np
import keras
import tensorflow as tf
from tensorflow.keras.preprocessing.image import load_img, img_to_array # type: ignore
from tensorflow.keras.applications.vgg16 import preprocess_input, decode_predictions, VGG16 # type: ignore
import os

# Define the model path and static directory
MODEL_PATH = "final_model_weights.keras"  # Adjusted for local use
UPLOAD_FOLDER = "static/input_img"  # Ensures compatibility with Flask setup

def getPrediction(filename):
    # Ensure the model file exists before loading
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file '{MODEL_PATH}' not found.")

    model = tf.keras.models.load_model(MODEL_PATH)

    img_path = os.path.join(UPLOAD_FOLDER, filename)  # Adjusted path
    if not os.path.exists(img_path):
        raise FileNotFoundError(f"Image file '{img_path}' not found.")

    img = load_img(img_path, target_size=(180, 180))
    img = img_to_array(img) / 255.0  # Normalize pixel values
    img = np.expand_dims(img, axis=0)

    predictions = model.predict(img)
    category = np.argmax(predictions, axis=-1)[0]
    probability_results = predictions[0][category]

    answer = "Recycle" if category == 1 else "Organic"

    return str(answer), str(probability_results), filename