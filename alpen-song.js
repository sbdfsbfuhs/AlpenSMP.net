/* Suno-Song entfernt – Player aufräumen */
(function () {
  window.__alpenSong4 = true;
  function wipe() {
    [
      '#alpenSong', '#alpen-song', '.alpen-song', '[data-alpen-song]',
      'iframe[src*="suno.com"]', 'a[href*="suno.com"]'
    ].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        var box = el.closest('.alpen-song, #alpenSong, .hero-song, .song-player') || el;
        if (box && box.parentNode) box.parentNode.removeChild(box);
      });
    });
    document.querySelectorAll('div,aside,section').forEach(function (el) {
      var t = (el.textContent || '').replace(/\s+/g, ' ');
      if (t.indexOf('linghingdonkh') !== -1 && el.children.length < 12) {
        if (el.parentNode) el.parentNode.removeChild(el);
      }
    });
  }
  wipe();
  setTimeout(wipe, 200);
  setTimeout(wipe, 800);
  setTimeout(wipe, 2000);
})();
