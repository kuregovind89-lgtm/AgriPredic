"""
OpenCV-based preprocessing pipeline for crop leaf images.
Used both at training time (train.py) and inference time (predict.py)
so the model always sees images prepared the same way.
"""
import cv2
import numpy as np

IMG_SIZE = 224  # matches MobileNetV2 input size used in model_def.py


def load_and_preprocess(image_path: str) -> np.ndarray:
    """Read an image from disk, clean it up, and return a normalized
    float32 array of shape (IMG_SIZE, IMG_SIZE, 3) ready for the CNN."""
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image at {image_path}")

    # Convert BGR (OpenCV default) -> RGB (TensorFlow expected)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Denoise to reduce camera-sensor noise from field photos
    img = cv2.fastNlMeansDenoisingColored(img, None, 5, 5, 7, 21)

    # Mild contrast enhancement (CLAHE on the L channel) to normalize
    # lighting differences between photos taken at different times of day
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    img = cv2.cvtColor(cv2.merge((l, a, b)), cv2.COLOR_LAB2RGB)

    # Resize to model's expected input dimensions
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE), interpolation=cv2.INTER_AREA)

    # Normalize to [0, 1]
    img = img.astype("float32") / 255.0

    return img


def batch_preprocess(image_paths):
    return np.stack([load_and_preprocess(p) for p in image_paths])
