// Minimal JS to upload a video to the backend and render results
(function () {
    const cfg = (window && window.__ASL_CONFIG__) || {};
    const rawBackend = (cfg.BACKEND_URL || '').trim();
    function isHttpUrl(u) {
        try { const p = new URL(u); return p.protocol === 'https:' || p.protocol === 'http:'; } catch (_) { return false; }
    }
    let BACKEND_URL = '';
    if (rawBackend && !rawBackend.includes('YOUR-BACKEND') && isHttpUrl(rawBackend)) {
        BACKEND_URL = rawBackend;
    } else if (window.location && window.location.origin && window.location.origin !== 'null' && isHttpUrl(window.location.origin)) {
        BACKEND_URL = window.location.origin;
    } else {
        BACKEND_URL = '';
    }

    // Modal-only mode: always post to /detect-frame; fallback to /detect
    // Quick backend health check to surface CORS/URL issues early
    // No health check: Modal cold-starts can delay first response.


    // ------- Batch video upload (existing) -------
    const form = document.getElementById('asl-form');
    const fileInput = document.getElementById('asl-video');
    const submitBtn = document.getElementById('asl-submit');
    const statusEl = document.getElementById('asl-status');
    const resultsEl = document.getElementById('asl-results');

    if (form && fileInput && submitBtn) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (resultsEl) resultsEl.textContent = '';

            const file = fileInput.files && fileInput.files[0];
            if (!file) {
                if (statusEl) statusEl.textContent = 'Please choose a video file first.';
                return;
            }

            if (!BACKEND_URL) {
                if (statusEl) statusEl.textContent = 'Backend URL not set. Add <meta name="asl-backend" content="https://your-backend">.';
                return;
            }
            if (statusEl) statusEl.textContent = 'Uploading and creating prediction job...';
            submitBtn.disabled = true;

            const formData = new FormData();
            formData.append('video', file);

            try {
                const url = `${BACKEND_URL}/predict-video`;
                const ctrl = new AbortController();
                const id = setTimeout(() => ctrl.abort(), 15000);
                const resp = await fetch(url, {
                    method: 'POST',
                    body: formData,
                    signal: ctrl.signal
                });
                clearTimeout(id);
                const data = await resp.json();

                if (!resp.ok) {
                    throw new Error(data && data.error ? data.error : 'Request failed');
                }

                if (statusEl) statusEl.textContent = 'Prediction complete.';
                if (resultsEl) resultsEl.textContent = JSON.stringify(data, null, 2);
            } catch (err) {
                const hint = ` (URL: ${BACKEND_URL || 'unset'}/predict-video)`;
                if (statusEl) statusEl.textContent = 'Network/Error: ' + (err && err.message || err) + hint;
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // ------- Live webcam mode -------
    const liveStartBtn = document.getElementById('asl-live-start');
    const liveStopBtn = document.getElementById('asl-live-stop');
    const liveVideo = document.getElementById('asl-live-video');
    const liveOutput = document.getElementById('asl-live-output');

    let mediaStream = null;
    let captureTimer = null;
    const FPS = 2; // tuned for Modal latency

    async function startCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            if (liveOutput) liveOutput.textContent = 'Camera not supported in this browser.';
            return;
        }
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            if (liveVideo) {
                liveVideo.srcObject = mediaStream;
                await liveVideo.play();
            }
            startCaptureLoop();
        } catch (e) {
            if (liveOutput) liveOutput.textContent = 'Could not access camera: ' + e.message;
        }
    }

    function stopCamera() {
        if (captureTimer) {
            clearInterval(captureTimer);
            captureTimer = null;
        }
        if (mediaStream) {
            mediaStream.getTracks().forEach(t => t.stop());
            mediaStream = null;
        }
        if (liveVideo) {
            liveVideo.pause();
            liveVideo.srcObject = null;
        }
        if (liveOutput) liveOutput.textContent = '';
    }

    function startCaptureLoop() {
        if (!liveVideo) return;
        if (!BACKEND_URL) {
            if (liveOutput) liveOutput.textContent = 'Backend URL not set. Add <meta name="asl-backend" content="https://your-backend">.';
            return;
        }
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        captureTimer = setInterval(async () => {
            try {
                const w = liveVideo.videoWidth || 640;
                const h = liveVideo.videoHeight || 480;
                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(liveVideo, 0, 0, w, h);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

                const primaryUrl = `${BACKEND_URL}/detect-frame`;
                const ctrl = new AbortController();
                const timeoutMs = 25000; // allow Modal cold-start
                const id = setTimeout(() => ctrl.abort(), timeoutMs);
                let resp = await fetch(primaryUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image_base64: dataUrl }),
                    signal: ctrl.signal
                });
                clearTimeout(id);
                // If modal doesn't have /detect-frame, try /detect with same payload
                if (resp.status === 404) {
                    const ctrl2 = new AbortController();
                    const id2 = setTimeout(() => ctrl2.abort(), timeoutMs);
                    resp = await fetch(`${BACKEND_URL}/detect`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image_base64: dataUrl }),
                        signal: ctrl2.signal
                    });
                    clearTimeout(id2);
                }
                let data;
                try { data = await resp.json(); } catch (_) { data = null; }
                if (!resp.ok) throw new Error(data && data.error ? data.error : `Request failed (${resp.status})`);

                // Display top prediction label if available
                if (liveOutput) {
                    let label = '';
                    try {
                        const preds = data.results?.predictions || data.results?.result?.predictions || [];
                        if (Array.isArray(preds) && preds.length) {
                            preds.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
                            const top = preds[0];
                            label = `${top.class || top.class_name || 'gesture'} (${Math.round((top.confidence || 0) * 100)}%)`;
                        }
                    } catch (_) { /* ignore */ }
                    liveOutput.textContent = label || 'No gesture detected';
                }
            } catch (e) {
                if (liveOutput) liveOutput.textContent = 'Network/Error: ' + (e && e.message || e) + ` (URL: ${BACKEND_URL || 'unset'}/predict-frame)`;
            }
        }, 1000 / FPS);
    }

    if (liveStartBtn) liveStartBtn.addEventListener('click', startCamera);
    if (liveStopBtn) liveStopBtn.addEventListener('click', stopCamera);
})();


