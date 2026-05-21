# ASL training data

Place datasets here, then run training:

```bash
pip install kagglehub scikit-learn==1.3.2 joblib tqdm opencv-python-headless mediapipe
python sign_language/scripts/download_asl_datasets.py
python sign_language/scripts/train_gesture_model.py
```

## Folder layout (images)

```
data/hand_gesture_rgb/
  zero/
  one/
  ...
  stop/

data/raw/          # optional extra gestures you record
  hello/
  thanks/
```

## CSV layout (pre-extracted landmarks)

Put `.csv` files under `data/asl_alphabet/` with a `label` column and 63 numeric landmark columns.

## After training

Models are written to:

- `backend/models/hand_gesture_classifier.joblib`
- `sign_language/artifacts/hand_gesture_classifier.joblib`

Commit the `.joblib` and redeploy the Vercel **backend** project.
