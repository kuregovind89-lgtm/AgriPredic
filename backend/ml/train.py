"""
Train the crop disease CNN on the PlantVillage dataset.

1. Download the PlantVillage dataset (color images), e.g. from Kaggle:
   https://www.kaggle.com/datasets/emmarex/plantdisease
2. Arrange it like:
     dataset/
       Tomato___Healthy/
         img1.jpg ...
       Tomato___Early_Blight/
         img1.jpg ...
       ...
3. Run:  python train.py --data_dir ./dataset --epochs 15
4. The trained model is saved to ml/saved_model/agripredic_model.h5
   and the class index mapping to ml/saved_model/class_indices.json
"""
import os
import json
import argparse
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

from model_def import build_model, IMG_SIZE

SAVE_DIR = os.path.join(os.path.dirname(__file__), "saved_model")


def main(data_dir: str, epochs: int, batch_size: int):
    os.makedirs(SAVE_DIR, exist_ok=True)

    datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        validation_split=0.2,
        rotation_range=25,
        width_shift_range=0.15,
        height_shift_range=0.15,
        shear_range=0.15,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode="nearest",
    )

    train_gen = datagen.flow_from_directory(
        data_dir, target_size=(IMG_SIZE, IMG_SIZE), batch_size=batch_size,
        class_mode="categorical", subset="training",
    )
    val_gen = datagen.flow_from_directory(
        data_dir, target_size=(IMG_SIZE, IMG_SIZE), batch_size=batch_size,
        class_mode="categorical", subset="validation",
    )

    num_classes = len(train_gen.class_indices)
    model = build_model(num_classes=num_classes)

    callbacks = [
        EarlyStopping(monitor="val_accuracy", patience=4, restore_best_weights=True),
        ModelCheckpoint(os.path.join(SAVE_DIR, "agripredic_model.h5"),
                         monitor="val_accuracy", save_best_only=True),
    ]

    model.fit(train_gen, validation_data=val_gen, epochs=epochs, callbacks=callbacks)

    # Persist class index -> label mapping so predict.py can decode outputs
    with open(os.path.join(SAVE_DIR, "class_indices.json"), "w") as f:
        json.dump({v: k for k, v in train_gen.class_indices.items()}, f, indent=2)

    print("Training complete. Model saved to", SAVE_DIR)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, required=True,
                         help="Path to PlantVillage-style folder of class subfolders")
    parser.add_argument("--epochs", type=int, default=15)
    parser.add_argument("--batch_size", type=int, default=32)
    args = parser.parse_args()
    main(args.data_dir, args.epochs, args.batch_size)
