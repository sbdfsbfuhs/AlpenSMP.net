/* Overrides for live AlpenSMP – large PNG compress + dark inputs + clearer errors */
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
    if (lab && /PNG, JPG/.test(lab.textContent || '')) {
      lab.textContent = 'Auch große Screenshots (20 MB) gehen – werden automatisch klein gerechnet';
    }
  }

  window.compressImageFile = function (file) {
    return new Promise(function (resolve, reject) {
      if (!file) return reject(new Error('Keine Datei gewählt'));
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = function () {
        let max = 1000, q = 0.62;
        const tryOnce = function () {
          let w = img.width, h = img.height;
          if (w > max) { h = Math.round(h * max / w); w = max; }
          if (h > max) { w = Math.round(w * max / h); h = max; }
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, w);
          canvas.height = Math.max(1, h);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(function (blob) {
            if (!blob) return reject(new Error('Komprimieren fehlgeschlagen'));
            if (blob.size > 140 * 1024 && (max > 480 || q > 0.4)) {
              max = Math.max(480, Math.round(max * 0.78));
              q = Math.max(0.38, q - 0.1);
              tryOnce();
              return;
            }
            URL.revokeObjectURL(url);
            resolve(blob);
          }, 'image/jpeg', q);
        };
        tryOnce();
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('Bild unlesbar – anderes Format versuchen'));
      };
      img.src = url;
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', styleInputs);
  } else {
    styleInputs();
  }
})();
