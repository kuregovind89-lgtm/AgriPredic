# Sample Dataset Guide

Real PlantVillage images are not bundled in this repo (dataset is ~2GB and
under its own license terms). This folder shows the **exact structure**
`backend/ml/train.py` expects, with a couple of placeholder files so you
can verify the pipeline runs end-to-end before swapping in real data.

## Folder structure required by `train.py`

```
sample_dataset/
├── Tomato_Healthy/
│   ├── img1.jpg
│   ├── img2.jpg
├── Tomato_Early_Blight/
│   ├── img1.jpg
├── Tomato_Late_Blight/
│   ├── img1.jpg
```

Each subfolder name becomes a class label. Add as many crop/disease folders
as you like (Potato_Healthy, Corn_Common_Rust, etc.) — just keep the
`Crop_Disease` naming pattern used in `backend/ml/disease_info.py` so
treatment/fertilizer/prevention text matches automatically.

## Getting the real PlantVillage dataset

1. Download from Kaggle: https://www.kaggle.com/datasets/emmarex/plantdisease
   (or the original PlantVillage GitHub repo).
2. Unzip so you get one folder per class, matching the structure above.
3. Point the trainer at it:
   ```bash
   cd backend
   python ml/train.py --data_dir /path/to/plantvillage --epochs 15
   ```
4. This produces:
   - `backend/ml/saved_model/agripredic_model.h5`
   - `backend/ml/saved_model/class_indices.json`
5. Restart the backend — `ml/predict.py` automatically detects and loads
   the trained model. Until then, the app runs in **DEMO MODE**, using an
   OpenCV color-based heuristic so every feature is testable immediately.
