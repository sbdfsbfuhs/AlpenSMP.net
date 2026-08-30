/* Live-Fix: Upload darf nicht auf „Bild wird vorbereitet…“ stehen bleiben. */
(function () {
  function styleInputs() {
    const css = document.createElement('style');
    css.textContent = [
      '.ticket-box input,.ticket-box textarea,.ticket-box select,#ticketForm input,#ticketForm textarea,.review-form input,.review-form textarea,.review-form select{background:#12161e!important;color:#f3f4f6!important;color-scheme:dark;-webkit-appearance:none;appearance:none;}',
      'input:-webkit-autofill,textarea:-webkit-autofill{-webkit-text-fill-color:#f3f4f6!important;-webkit-box-shadow:0 0 0 1000px #12161e inset!important;}',
      '.file-drop{position:relative;overflow:hidden;background:#12161e;}',
      '.file-drop input[type=file]{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;font-size:0;}'
    ].join('');
    document.head.appendChild(css);
    const lab = document.getElementById('revFileLabel');
    if (lab) lab.textContent = 'Auch große Screenshots – werden automatisch klein gerechnet (max. ~15 Sek.)';
  }

  function withTimeout(promise, ms, msg) {
    return new Promise(function (resolve, reject) {
      const t = setTimeout(function () { reject(new Error(msg)); }, ms);
      promise.then(function (v) { clearTimeout(t); resolve(v); }, function (e) { clearTimeout(t); reject(e); });
    });
  }

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () { resolve({ img: img, url: url }); };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        const reader = new FileReader();
        reader.onload = function () {
          const img2 = new Image();
          img2.onload = function () { resolve({ img: img2, url: null }); };
          img2.onerror = function () { reject(new Error('Bild unlesbar – JPG statt PNG versuchen')); };
          img2.src = reader.result;
        };
        reader.onerror = function () { reject(new Error('Datei unlesbar')); };
        reader.readAsDataURL(file);
      };
      img.src = url;
    });
  }

  function canvasToJpegUrl(img, max, q) {
    let w = img.width || img.naturalWidth || 1;
    let h = img.height || img.naturalHeight || 1;
    if (w > max) { h = Math.round(h * max / w); w = max; }
    if (h > max) { w = Math.round(w * max / h); h = max; }
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, w);
    canvas.height = Math.max(1, h);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', q);
  }

  window.compressImageFile = function (file) {
    return withTimeout((async function () {
      if (!file) throw new Error('Keine Datei gewählt');
      const loaded = await loadImage(file);
      try {
        let max = 800, q = 0.55, url = '';
        for (let i = 0; i < 6; i++) {
          url = canvasToJpegUrl(loaded.img, max, q);
          const bytes = Math.ceil((url.length - 22) * 0.75);
          if (bytes <= 110 * 1024) break;
          max = Math.max(360, Math.round(max * 0.72));
          q = Math.max(0.32, q - 0.08);
        }
        return url;
      } finally {
        if (loaded.url) URL.revokeObjectURL(loaded.url);
      }
    })(), 15000, 'Komprimieren dauert zu lange – kleineres JPG nehmen oder Bild-URL nutzen');
  };

  /* Kein Firebase-Storage mehr – put() hängt oft endlos. compress liefert schon Data-URL. */
  window.uploadCommunityImage = function (data) {
    if (typeof data === 'string' && data.indexOf('data:') === 0) return Promise.resolve(data);
    if (!data) return Promise.reject(new Error('Kein Bild'));
    return new Promise(function (resolve, reject) {
      const t = setTimeout(function () { reject(new Error('Lesen-Timeout')); }, 8000);
      const r = new FileReader();
      r.onload = function () { clearTimeout(t); resolve(r.result); };
      r.onerror = function () { clearTimeout(t); reject(new Error('Lesefehler')); };
      if (data instanceof Blob) r.readAsDataURL(data);
      else { clearTimeout(t); reject(new Error('Ungültiges Bild')); }
    });
  };

  window.submitCommunity = async function (ev) {
    ev.preventDefault();
    const btn = document.getElementById('revSubmit');
    const hint = document.getElementById('revHint');
    if (document.getElementById('revCompany') && document.getElementById('revCompany').value) return false;
    const last = Number((function () { try { return localStorage.getItem('alpensmp_rev_ts'); } catch (e) { return 0; } })() || 0);
    const waitMs = (Number(window.CONFIG && CONFIG.reviewCooldownSec) || 60) * 1000;
    if (Date.now() - last < waitMs) {
      hint.textContent = 'Bitte warte eine Minute, bevor du erneut sendest.';
      return false;
    }
    const name = (document.getElementById('revName').value || '').trim().slice(0, 32);
    const text = (document.getElementById('revText').value || '').trim().slice(0, 600);
    const kind = document.getElementById('revKind').value;
    const rating = Number(document.getElementById('revStars').value || 5);
    let imageUrl = (document.getElementById('revImageUrl').value || '').trim();
    const file = document.getElementById('revFile').files[0];
    if (!name) { hint.textContent = 'Name fehlt.'; return false; }
    if (kind !== 'image' && text.length < 8) { hint.textContent = 'Schreib bitte etwas mehr Text.'; return false; }
    if ((kind === 'image' || kind === 'both') && !file && !imageUrl) { hint.textContent = 'Für ein Bild: Datei oder URL angeben.'; return false; }
    const db = typeof initFirebase === 'function' ? initFirebase() : (window._fbDb || null);
    if (!db) { hint.textContent = 'Keine Verbindung. Versuch es später.'; return false; }
    btn.disabled = true;
    hint.textContent = 'Wird gesendet…';
    try {
      if (file && !imageUrl) {
        hint.textContent = 'Bild wird verkleinert… das kann bei großen PNGs ein paar Sekunden dauern.';
        imageUrl = await window.compressImageFile(file);
        hint.textContent = 'Bild fertig, speichere Beitrag…';
      }
      const base = { name: name, text: text, rating: rating, kind: kind, imageUrl: imageUrl || '', status: 'pending', ts: Date.now(), source: 'website' };
      if (kind === 'review' || kind === 'both') {
        await withTimeout(db.ref('community_reviews').push(base), 12000, 'Speichern der Rezension dauert zu lange');
      }
      if ((kind === 'image' || kind === 'both') && imageUrl) {
        await withTimeout(db.ref('community_images').push({
          name: name,
          caption: text.slice(0, 120),
          imageUrl: imageUrl,
          status: 'pending',
          ts: Date.now()
        }), 12000, 'Speichern des Bildes dauert zu lange');
      } else if (kind === 'image' && !imageUrl) {
        hint.textContent = 'Kein Bild erkannt. Datei nochmal wählen (Vorschau muss erscheinen).';
        btn.disabled = false;
        return false;
      }
      try { localStorage.setItem('alpensmp_rev_ts', String(Date.now())); } catch (e) {}
      document.getElementById('communityForm').reset();
      if (typeof setStars === 'function') setStars(5);
      const prev = document.getElementById('revPreview');
      if (prev) prev.style.display = 'none';
      hint.textContent = 'Gesendet. Das Team gibt frei.';
      const tm = document.getElementById('thanksModal');
      const tb = document.getElementById('thanksBody');
      if (tb) tb.textContent = 'Dein Beitrag ist raus – das Team schaltet ihn frei, sobald er geprüft ist.';
      if (tm) tm.classList.add('show');
      if (typeof showToast === 'function') showToast('✓ Gesendet – wartet auf Freigabe');
    } catch (err) {
      hint.textContent = 'Fehler: ' + ((err && err.message) ? err.message : 'Senden fehlgeschlagen') + '. Versuch ein kleineres JPG oder eine Bild-URL.';
    }
    btn.disabled = false;
    return false;
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', styleInputs);
  else styleInputs();
})();
