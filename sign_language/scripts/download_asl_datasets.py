#!/usr/bin/env python3
"""
Download ASL training datasets into sign_language/data/.

Requires: pip install kagglehub
Optional: Kaggle API credentials (~/.kaggle/kaggle.json) for private rate limits.

Datasets:
  1. hand-gesture-recognition-dataset-one-hand (numbers + directions + stop)
  2. asl-alphabet-hand-landmarks (A–Z letters, pre-extracted landmarks CSV)
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DATA_ROOT = REPO_ROOT / "sign_language" / "data"


def download_kaggle(slug: str, dest_name: str) -> Path | None:
    try:
        import kagglehub
    except ImportError:
        print("Install kagglehub: pip install kagglehub")
        return None

    print(f"Downloading {slug}...")
    try:
        path = kagglehub.dataset_download(slug)
    except Exception as e:
        print(f"  Failed: {e}")
        return None

    src = Path(path)
    dest = DATA_ROOT / dest_name
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(src, dest)
    print(f"  -> {dest}")
    return dest


def link_hand_gesture_rgb(dataset_root: Path) -> None:
    """Point training script at RGB images (gesture folders)."""
    candidates = list(dataset_root.rglob("Dataset_RGB"))
    if not candidates:
        candidates = [dataset_root]
    for candidate in candidates:
        if any(candidate.iterdir()):
            target = DATA_ROOT / "hand_gesture_rgb"
            if target.exists():
                shutil.rmtree(target)
            shutil.copytree(candidate, target)
            print(f"Prepared hand_gesture_rgb from {candidate}")
            return
    print("Could not find Dataset_RGB inside hand gesture download.")


def link_asl_landmarks(dataset_root: Path) -> None:
    landmarks = dataset_root / "landmarks"
    if landmarks.is_dir():
        print(f"ASL alphabet landmarks ready at {dataset_root} ({len(list(landmarks.iterdir()))} letters)")
        return
    csv_files = list(dataset_root.rglob("*.csv"))
    if csv_files:
        target_dir = DATA_ROOT / "asl_alphabet"
        target_dir.mkdir(parents=True, exist_ok=True)
        for csv in csv_files:
            shutil.copy2(csv, target_dir / csv.name)
        print(f"Copied {len(csv_files)} CSV(s) to {target_dir}")
    else:
        print("No landmarks/ or CSV found in ASL alphabet download.")


def main():
    DATA_ROOT.mkdir(parents=True, exist_ok=True)

    hg = None
    for slug in (
        "prathumarora/hand-gesture-recognition-dataset-one-hand",
        "gesture-recognition-dataset-one-hand",
        "meetnagadia/hand-gesture-recognition-dataset-one-hand",
    ):
        hg = download_kaggle(slug, "hand_gesture_kaggle")
        if hg:
            break
    if hg:
        link_hand_gesture_rgb(hg)

    asl = download_kaggle(
        "borisgraudt/asl-alphabet-hand-landmarks",
        "asl_alphabet_kaggle",
    )
    if asl:
        link_asl_landmarks(asl)

    print("\nDone. Train with:")
    print("  python sign_language/scripts/train_gesture_model.py")


if __name__ == "__main__":
    main()
