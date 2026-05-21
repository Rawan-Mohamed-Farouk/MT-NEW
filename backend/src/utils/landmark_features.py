"""Hand landmark feature extraction shared by training and inference."""
from __future__ import annotations

import numpy as np

NUM_LANDMARKS = 21
FEATURES_PER_LANDMARK = 3
FEATURE_DIM = NUM_LANDMARKS * FEATURES_PER_LANDMARK  # 63

WRIST_INDEX = 0


def flat_to_landmarks(flat: list[float] | np.ndarray) -> np.ndarray:
    """Shape (63,) -> (21, 3)."""
    arr = np.asarray(flat, dtype=np.float64).reshape(-1)
    if arr.size != FEATURE_DIM:
        raise ValueError(f"Expected {FEATURE_DIM} values, got {arr.size}")
    return arr.reshape(NUM_LANDMARKS, FEATURES_PER_LANDMARK)


def landmarks_to_flat(landmarks: np.ndarray) -> np.ndarray:
    """Shape (21, 3) -> (63,)."""
    return landmarks.reshape(-1)


def normalize_landmarks(flat: list[float] | np.ndarray) -> np.ndarray:
    """
    Wrist-centered, scale-normalized landmarks (translation + scale invariance).
    Improves live webcam accuracy vs raw MediaPipe coordinates.
    """
    pts = flat_to_landmarks(flat).copy()
    wrist = pts[WRIST_INDEX, :2]
    pts[:, :2] -= wrist

    # Scale by palm span (wrist to middle-finger MCP)
    ref = pts[9, :2]
    scale = float(np.linalg.norm(ref))
    if scale < 1e-6:
        scale = float(np.max(np.linalg.norm(pts[:, :2], axis=1))) or 1.0
    pts[:, :2] /= scale

    return landmarks_to_flat(pts)


def augment_landmarks(
    flat: np.ndarray,
    rng: np.random.Generator,
    noise_std: float = 0.02,
    flip_x_prob: float = 0.5,
) -> np.ndarray:
    """Light landmark augmentation for training."""
    pts = flat_to_landmarks(flat).copy()
    if rng.random() < flip_x_prob:
        pts[:, 0] *= -1
    pts += rng.normal(0, noise_std, pts.shape)
    return landmarks_to_flat(pts)
