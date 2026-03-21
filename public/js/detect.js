(function () {
    const cfg = (window && window.__ASL_CONFIG__) || {};
    const BASE = cfg.BACKEND_URL || '';
    const ENDPOINT = (BASE ? `${BASE.replace(/\/$/, '')}/detect` : '');

    const urlInput = document.getElementById('image-url');
    const fileInput = document.getElementById('image-file');
    const detectBtn = document.getElementById('detect-btn');
    const statusEl = document.getElementById('status');
    const resultEl = document.getElementById('result');

    function setStatus(msg) {
        if (statusEl) statusEl.textContent = msg || '';
    }

    function setResult(obj) {
        try {
            resultEl.textContent = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
        } catch (_) {
            resultEl.textContent = String(obj);
        }
    }

    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    detectBtn.addEventListener('click', async function () {
        setStatus('');
        setResult('(waiting)');
        detectBtn.disabled = true;

        try {
            const imageUrl = (urlInput.value || '').trim();
            let payload = null;

            if (imageUrl) {
                payload = { image_url: imageUrl };
            } else if (fileInput.files && fileInput.files[0]) {
                const dataUrl = await readFileAsDataURL(fileInput.files[0]);
                payload = { image_base64: dataUrl };
            } else {
                setStatus('Please enter an image URL or choose a file.');
                return;
            }

            setStatus('Sending request...');
            const ctrl = new AbortController();
            const id = setTimeout(() => ctrl.abort(), 25000);
            const resp = await fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: ctrl.signal
            });
            clearTimeout(id);

            let data;
            try { data = await resp.json(); } catch (_) { data = { error: 'Non-JSON response' }; }
            if (!resp.ok) {
                setStatus(`Error ${resp.status}`);
                setResult(data);
                return;
            }

            setStatus('Done');
            setResult(data);
        } catch (e) {
            setStatus('Network/Error: ' + (e && e.message || e));
        } finally {
            detectBtn.disabled = false;
        }
    });
})();


