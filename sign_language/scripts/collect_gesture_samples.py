#!/usr/bin/env python3
"""
Record extra ASL samples from your webcam into sign_language/data/raw/<gesture>/.

Usage:
  python sign_language/scripts/collect_gesture_samples.py hello
  python sign_language/scripts/collect_gesture_samples.py thanks --count 80
"""
from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np

REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_ROOT = REPO_ROOT / "sign_language" / "data" / "raw"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("gesture", help="Folder name / label (e.g. hello, thanks, please)")
    parser.add_argument("--count", type=int, default=60, help="Images to capture")
    args = parser.parse_args()

    label = args.gesture.lower().strip()
    out_dir = OUT_ROOT / label
    out_dir.mkdir(parents=True, exist_ok=True)

    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.6)
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Could not open webcam.")
        sys.exit(1)

    saved = 0
    print(f"Hold the '{label}' sign. Press SPACE to save, Q to quit. Target: {args.count}")

    while saved < args.count:
        ok, frame = cap.read()
        if not ok:
            break
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)
        if results.multi_hand_landmarks:
            mp.solutions.drawing_utils.draw_landmarks(
                frame, results.multi_hand_landmarks[0], mp_hands.HAND_CONNECTIONS
            )
        cv2.putText(
            frame,
            f"{label}: {saved}/{args.count}  SPACE=save Q=quit",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2,
        )
        cv2.imshow("Collect ASL samples", frame)
        key = cv2.waitKey(1) & 0xFF
        if key == ord("q"):
            break
        if key == ord(" ") and results.multi_hand_landmarks:
            path = out_dir / f"{label}_{int(time.time() * 1000)}.jpg"
            cv2.imwrite(str(path), frame)
            saved += 1
            print(f"Saved {path.name}")

    cap.release()
    cv2.destroyAllWindows()
    hands.close()
    print(f"Done. {saved} images in {out_dir}")
    print("Retrain: python sign_language/scripts/train_gesture_model.py")


if __name__ == "__main__":
    main()
