# ml-service/predictor.py
import joblib
import numpy as np
from PIL import Image
from skimage.feature import hog
import io

# Load model bundle once at startup
bundle    = joblib.load('model/pneumonia.pkl')
scaler    = bundle['scaler']
clf       = bundle['clf']
threshold = bundle['threshold']
classes   = bundle['classes']
hp        = bundle['hog_params']

def preprocess_and_predict(image_bytes: bytes) -> dict:
    """
    Receives raw image bytes, extracts HOG features,
    runs Random Forest prediction, returns result dict.
    """
    # 1. Load and preprocess image
    img = Image.open(io.BytesIO(image_bytes)).convert('L')   # grayscale
    img = img.resize(hp['image_size'], Image.LANCZOS)         # e.g. 128x128
    arr = np.array(img, dtype=np.float32) / 255.0             # normalize

    # 2. Extract HOG features
    features = hog(
        arr,
        orientations=hp['orientations'],
        pixels_per_cell=hp['pixels_per_cell'],
        cells_per_block=hp['cells_per_block'],
        feature_vector=True
    ).reshape(1, -1)

    # 3. Scale features using saved StandardScaler
    features_scaled = scaler.transform(features)

    # 4. Predict using saved threshold
    prob       = clf.predict_proba(features_scaled)[0]   # [P(NORMAL), P(PNEUMONIA)]
    pred_index = int(prob[1] >= threshold)
    label      = classes[pred_index]
    confidence = float(prob[pred_index])

    return {
        "prediction":     label,
        "confidence":     round(confidence, 4),
        "threshold":      threshold,
        "prob_normal":    round(float(prob[0]), 4),
        "prob_pneumonia": round(float(prob[1]), 4)
    }
