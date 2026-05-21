#!/usr/bin/env python3
"""
Train / retrain the hand gesture classifier from image folders and/or landmark CSVs.

Data layout (images):
  data/raw/<gesture_name>/*.jpg

Landmark CSV (optional, e.g. from Kaggle ASL alphabet landmarks):
  label column + 63 numeric columns (x0,y0,z0,...,x20,y20,z20)

Usage:
  python sign_language/scripts/train_gesture_model.py
  python sign_language/scripts/train_gesture_model.py --data-dir sign_language/data/raw
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.utils.class_weight import compute_class_weight

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from backend.src.utils.landmark_features import (  # noqa: E402
    FEATURE_DIM,
    NUM_LANDMARKS,
    augment_landmarks,
    normalize_landmarks,
)

DEFAULT_DATA_DIRS = [
    REPO_ROOT / "sign_language" / "data" / "asl_alphabet_kaggle",
    REPO_ROOT / "sign_language" / "data" / "hand_gesture_rgb",
    REPO_ROOT / "sign_language" / "data" / "raw",
    REPO_ROOT / "sign_language" / "data" / "asl_alphabet",
]

MODEL_OUT = REPO_ROOT / "backend" / "models" / "hand_gesture_classifier.joblib"
META_OUT = REPO_ROOT / "backend" / "models" / "hand_gesture_classifier.meta.json"
ARTIFACT_OUT = REPO_ROOT / "sign_language" / "artifacts" / "hand_gesture_classifier.joblib"


def extract_landmarks_from_image(image_path: str, hands) -> np.ndarray | None:
    import cv2

    image = cv2.imread(image_path)
    if image is None:
        return None
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)
    if not results.multi_hand_landmarks:
        return None
    flat = []
    for lm in results.multi_hand_landmarks[0].landmark:
        flat.extend([lm.x, lm.y, lm.z])
    return np.array(flat, dtype=np.float64)


def load_image_dataset(data_dir: Path, max_per_class: int | None, hands) -> tuple[list, list]:
    X, y = [], []
    if not data_dir.is_dir():
        return X, y

    for gesture_dir in sorted(data_dir.iterdir()):
        if not gesture_dir.is_dir() or gesture_dir.name.startswith("."):
            continue
        label = gesture_dir.name.lower().strip()
        images = [
            p for p in gesture_dir.iterdir()
            if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
        ]
        if max_per_class:
            images = images[:max_per_class]

        for img_path in images:
            flat = extract_landmarks_from_image(str(img_path), hands)
            if flat is not None and flat.size == FEATURE_DIM:
                X.append(flat)
                y.append(label)
    return X, y


def _parse_landmark_row(row: dict, label_key: str) -> tuple[np.ndarray | None, str | None]:
    label = str(row.get(label_key, row.get("label", row.get("class", "")))).lower().strip()
    if not label:
        return None, None

    keys = sorted([k for k in row if k not in (label_key, "label", "class")])
    if len(keys) >= FEATURE_DIM:
        try:
            vals = [float(row[k]) for k in keys[:FEATURE_DIM]]
            return np.array(vals, dtype=np.float64), label
        except (TypeError, ValueError):
            pass

    vals = []
    for i in range(NUM_LANDMARKS):
        for axis in ("x", "y", "z"):
            key = f"{axis}{i}"
            if key not in row:
                return None, None
            vals.append(float(row[key]))
    if len(vals) == FEATURE_DIM:
        return np.array(vals, dtype=np.float64), label
    return None, None


def load_csv_dataset(csv_path: Path, label_key: str = "label") -> tuple[list, list]:
    import csv

    X, y = [], []
    with csv_path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            flat, label = _parse_landmark_row(row, label_key)
            if flat is not None and label:
                X.append(flat)
                y.append(label)
    return X, y


def find_csv_datasets(data_dir: Path) -> list[Path]:
    if not data_dir.is_dir():
        return []
    return list(data_dir.rglob("*.csv"))


def load_npy_landmark_dataset(landmarks_dir: Path, max_per_class: int | None) -> tuple[list, list]:
    """Load borisgraudt/asl-alphabet-hand-landmarks layout: landmarks/<A-Z>/*.npy"""
    X, y = [], []
    if not landmarks_dir.is_dir():
        return X, y

    for class_dir in sorted(landmarks_dir.iterdir()):
        if not class_dir.is_dir():
            continue
        label = class_dir.name.lower().strip()
        files = sorted(class_dir.glob("*.npy"))
        if max_per_class:
            files = files[:max_per_class]
        for npy_path in files:
            try:
                flat = np.load(npy_path).astype(np.float64).reshape(-1)
                if flat.size == FEATURE_DIM:
                    X.append(flat)
                    y.append(label)
            except Exception:
                continue
    return X, y


def load_all_sources(
    data_dirs: list[Path],
    max_per_class: int | None,
    augment_factor: int,
) -> tuple[np.ndarray, np.ndarray]:
    X_list, y_list = [], []

    for data_dir in data_dirs:
        if not data_dir.exists():
            continue
        landmarks_sub = data_dir / "landmarks"
        if landmarks_sub.is_dir():
            print(f"Loading .npy landmarks from {landmarks_sub}...")
            Xn, yn = load_npy_landmark_dataset(landmarks_sub, max_per_class)
            X_list.extend(Xn)
            y_list.extend(yn)
        for csv_path in find_csv_datasets(data_dir):
            print(f"Loading CSV {csv_path}...")
            Xc, yc = load_csv_dataset(csv_path)
            X_list.extend(Xc)
            y_list.extend(yc)

    # MediaPipe only when image folders exist (optional dependency path)
    image_dirs = [d for d in data_dirs if d.exists()]
    if image_dirs:
        try:
            import mediapipe as mp

            mp_hands = mp.solutions.hands
            hands = mp_hands.Hands(
                static_image_mode=True, max_num_hands=1, min_detection_confidence=0.5
            )
            try:
                for data_dir in image_dirs:
                    print(f"Loading images from {data_dir}...")
                    X, y = load_image_dataset(data_dir, max_per_class, hands)
                    X_list.extend(X)
                    y_list.extend(y)
            finally:
                hands.close()
        except Exception as e:
            print(f"Skipping image extraction (MediaPipe unavailable): {e}")

    if not X_list:
        return np.array([]), np.array([])

    rng = np.random.default_rng(42)
    X_base = [normalize_landmarks(x) for x in X_list]
    y_base = list(y_list)

    X_aug, y_aug = [], []
    for flat, label in zip(X_base, y_base):
        for _ in range(augment_factor):
            X_aug.append(normalize_landmarks(augment_landmarks(flat, rng)))
            y_aug.append(label)

    X_all = np.array(X_base + X_aug, dtype=np.float64)
    y_all = np.array(y_base + y_aug)
    return X_all, y_all


def train_model(X: np.ndarray, y: np.ndarray) -> tuple[RandomForestClassifier, dict]:
    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )

    classes = np.unique(y_enc)
    weights = compute_class_weight("balanced", classes=classes, y=y_train)
    class_weight = {int(c): float(w) for c, w in zip(classes, weights)}

    model = RandomForestClassifier(
        n_estimators=80,
        max_depth=14,
        min_samples_leaf=2,
        class_weight=class_weight,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    report = classification_report(
        y_test, y_pred, target_names=le.classes_, output_dict=True, zero_division=0
    )

    train_score = float(model.score(X_train, y_train))
    test_score = float(model.score(X_test, y_test))
    model.classes_ = le.classes_

    return model, {
        "train_score": train_score,
        "test_score": test_score,
        "n_samples": int(len(X)),
        "n_classes": int(len(le.classes_)),
        "classes": list(le.classes_),
        "classification_report": report,
        "normalized_landmarks": True,
    }


def main():
    parser = argparse.ArgumentParser(description="Train ASL hand gesture classifier")
    parser.add_argument(
        "--data-dir",
        action="append",
        default=None,
        help="Dataset root (repeatable). Default: sign_language/data/*",
    )
    parser.add_argument("--max-per-class", type=int, default=1200, help="Cap images per class")
    parser.add_argument("--augment-factor", type=int, default=2, help="Augmented copies per sample")
    parser.add_argument("--min-samples", type=int, default=500, help="Minimum total samples required")
    args = parser.parse_args()

    data_dirs = [Path(d) for d in args.data_dir] if args.data_dir else DEFAULT_DATA_DIRS

    print("Scanning datasets:", ", ".join(str(d) for d in data_dirs))
    X, y = load_all_sources(data_dirs, args.max_per_class, args.augment_factor)

    if len(X) < args.min_samples:
        print(
            f"\nNot enough training data ({len(X)} samples, need {args.min_samples}).\n"
            "Run: python sign_language/scripts/download_asl_datasets.py\n"
            "Or add image folders under sign_language/data/raw/<gesture_name>/\n"
        )
        sys.exit(1)

    print(f"Training on {len(X)} samples, {len(np.unique(y))} classes...")
    model, meta = train_model(X, y)
    meta["sklearn_version"] = "1.3.2"

    MODEL_OUT.parent.mkdir(parents=True, exist_ok=True)
    ARTIFACT_OUT.parent.mkdir(parents=True, exist_ok=True)

    joblib.dump(model, MODEL_OUT)
    joblib.dump(model, ARTIFACT_OUT)
    META_OUT.write_text(json.dumps(meta, indent=2))

    print(f"\nSaved model -> {MODEL_OUT}")
    print(f"Classes ({meta['n_classes']}): {', '.join(meta['classes'])}")
    print(f"Train accuracy: {meta['train_score']:.4f}  Test accuracy: {meta['test_score']:.4f}")


if __name__ == "__main__":
    main()
