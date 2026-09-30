/* Öffentliche Spieler-Commands unter site_status/player_cmds */
(function () {
  if (window.__alpenPlayerCmdsTeam) return;
  window.__alpenPlayerCmdsTeam = true;

  var ROOT = 'site_status/player_cmds';
  var edition = 'java';
  var cache = { java: {}, bedrock: {} };
  var listening = false;

  var SEED = {
    java: [
      { name: '/tpa', desc: 'Teleport-Anfrage senden. Der andere klickt in Java auf die Chat-Nachricht.' },
      { name: '/rtp', desc: 'Zufälliger Teleport in die Welt.' },
      { name: '/sethome', desc: 'Home speichern (Base, Farm, Shop).' },
      { name: '/home 1', desc: 'Zum Home. Zahl = Home-Nummer.' },
      { name: '/sit', desc: 'Hinsetzen.' },
      { name: '/lay', desc: 'Hinlegen.' },
      { name: '/warp', desc: 'Warps: survival, strings, end, casino, shop, nether.' },
      { name: '/msg', desc: 'Private Nachricht.' },
      { name: '/voicechat invite', desc: 'Voice-Gruppe einladen (nur Java).' },
      { name: '/claim 5', desc: 'Claim mit Radius 5.' }
    ],
    bedrock: [
      { name: '/tpa', desc: 'Teleport-Anfrage senden. Annehmen nicht per Klick.' },
      { name: '/tpaccept', desc: 'TPA annehmen – auf Bedrock eintippen.' },
      { name: '/rtp', desc: 'Zufälliger Teleport, wie Java.' },
      { name: '/sethome', desc: 'Home speichern, wie Java.' },
      { name: '/home', desc: 'Zum Home, wie Java.' },
      { name: '/warp survival', desc: 'Warp Survival.' },
      { name: '/warp strings', desc: 'Warp Strings.' },
      { name: '/warp end', desc: 'Warp End.' },
      { name: '/warp casino', desc: 'Warp Casino.' },
      { name: '/warp shop', desc: 'Warp Shop.' },
      { name: '/warp nether', desc: 'Warp Nether.' }
    ]
  };

  function dbReady() { return typeof db !== 'undefined' && db && typeof db.ref === 'function'; }
  function path(ed) { return ROOT + '/' + (ed || edition); }
  function toastMsg(m) { if (typeof toast === 'function') toast(m); }

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function listOf(ed) {
    var raw = cache[ed] || {};
    return Object.keys(raw).map(function (k) {
      var x = raw[k] || {};
      return { key: k, name: x.name || '', desc: x.desc || '', order: x.order || x.ts || 0 };
    }).filter(function (x) { return x.name; }).sort(function (a, b) { return a.order - b.order; });
  }

  function status(msg, bad) {
    var el = document.getElementById('pcStatus');
    if (!el) return;
    el.textContent = msg || '';
    el.style.color = bad ? '#f87171' : '#94a3b8';
  }

  function draw() {
    var j = document.getElementById('pcEdJava');
    var b = document.getElementById('pcEdBedrock');
    if (j) j.className = 'btn-quick' + (edition === 'java' ? ' active' : '');
    if (b) b.className = 'btn-quick' + (edition === 'bedrock' ? ' active' : '');
    var list = document.getElementById('pcList');
    if (!list) return;
    var items = listOf(edition);
    if (!items.length) {
      list.innerHTML = '<div class="empty">Noch leer. Unten «Standard laden» oder selbst eintragen.</div>';
      return;
    }
    list.innerHTML = items.map(function (it) {
      return '<div class="item"><div><div class="name">' + esc(it.name) +
        '</div><div class="meta">' + esc(it.desc) + '</div></div>' +
        '<div style="display:flex;gap:6px;flex-shrink:0">' +
        '<button type="button" class="btn btn-sm btn-ghost" data-act="edit" data-key="' + esc(it.key) + '">Bearbeiten</button>' +
        '<button type="button" class="btn btn-sm btn-ghost" data-act="del" data-key="' + esc(it.key) + '">Löschen</button>' +
        '</div></div>';
    }).join('');
    list.querySelectorAll('[data-act]').forEach(function (btn) {
      btn.onclick = function () {
        if (btn.getAttribute('data-act') === 'edit') pcEdit(btn.getAttribute('data-key'));
        else pcDelete(btn.getAttribute('data-key'));
      };
    });
  }

  function bindForm() {
    var save = document.getElementById('pcSaveBtn');
    var reset = document.getElementById('pcResetBtn');
    var seed = document.getElementById('pcSeedBtn');
    if (save) save.onclick = pcSave;
    if (reset) reset.onclick = pcReset;
    if (seed) seed.onclick = pcSeed;
    var j = document.getElementById('pcEdJava');
    var b = document.getElementById('pcEdBedrock');
    if (j) j.onclick = function () { pcSetEdition('java'); };
    if (b) b.onclick = function () { pcSetEdition('bedrock'); };
  }

  function inject() {
    if (document.getElementById('alpenPlayerCmdCard')) { bindForm(); startListen(); return; }
    var tab = document.getElementById('tab-commands');
    if (!tab) return;
    var card = document.createElement('div');
    card.className = 'card';
    card.id = 'alpenPlayerCmdCard';
    card.style.marginTop = '26px';
    card.innerHTML =
      '<h2>💻 Spieler-Commands (Website)</h2>' +
      '<p class="desc">Erscheint auf der Startseite. Der interne Command-Tab oben bleibt getrennt.</p>' +
      '<div class="filter-row">' +
      '<button type="button" class="btn-quick active" id="pcEdJava">Java</button>' +
      '<button type="button" class="btn-quick" id="pcEdBedrock">Bedrock</button>' +
      '</div>' +
      '<input type="text" id="pcName" placeholder="Befehl z.B. /tpa">' +
      '<textarea id="pcDesc" placeholder="Beschreibung"></textarea>' +
      '<input type="hidden" id="pcEditKey" value="">' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
      '<button type="button" class="btn" id="pcSaveBtn">Speichern</button>' +
      '<button type="button" class="btn btn-ghost" id="pcResetBtn">Abbrechen</button>' +
      '<button type="button" class="btn btn-ghost" id="pcSeedBtn">Standard laden</button>' +
      '</div>' +
      '<p class="hint" id="pcStatus">Bereit</p>' +
      '<div class="list" id="pcList"></div>';
    tab.appendChild(card);
    bindForm();
    startListen();
    draw();
  }

  function startListen() {
    if (listening || !dbReady()) return;
    listening = true;
    ['java', 'bedrock'].forEach(function (ed) {
      db.ref(path(ed)).on('value', function (snap) {
        cache[ed] = snap.val() || {};
        if (ed === edition) draw();
        status('Verbunden · ' + listOf(ed).length + ' ' + ed + '-Einträge');
      }, function (err) {
        status('Lesen fehlgeschlagen: ' + (err && err.message ? err.message : err), true);
      });
    });
  }

  window.pcSetEdition = function (ed) {
    edition = ed === 'bedrock' ? 'bedrock' : 'java';
    pcReset();
    draw();
  };

  window.pcReset = function () {
    var k = document.getElementById('pcEditKey');
    var n = document.getElementById('pcName');
    var d = document.getElementById('pcDesc');
    if (k) k.value = '';
    if (n) n.value = '';
    if (d) d.value = '';
  };

  window.pcEdit = function (key) {
    var item = (cache[edition] || {})[key];
    if (!item) return;
    document.getElementById('pcEditKey').value = key;
    document.getElementById('pcName').value = item.name || '';
    document.getElementById('pcDesc').value = item.desc || '';
    document.getElementById('pcName').focus();
    status('Bearbeiten: ' + (item.name || ''));
  };

  window.pcDelete = function (key) {
    if (!dbReady()) return status('Keine Datenbank', true);
    db.ref(path() + '/' + key).remove()
      .then(function () { toastMsg('Gelöscht'); status('Gelöscht'); })
      .catch(function (e) { status('Löschen: ' + (e.message || e), true); });
  };

  window.pcSave = function () {
    if (!dbReady()) return status('Keine Datenbank – Seite neu laden', true);
    var name = (document.getElementById('pcName').value || '').trim();
    var desc = (document.getElementById('pcDesc').value || '').trim();
    if (!name) return status('Befehl fehlt', true);
    if (name.charAt(0) !== '/') name = '/' + name;
    if (desc.length < 2) return status('Beschreibung fehlt', true);
    var key = (document.getElementById('pcEditKey').value || '').trim();
    var payload = {
      name: name,
      desc: desc,
      edition: edition,
      by: (typeof currentUser !== 'undefined' && currentUser && currentUser.username) || 'team',
      ts: Date.now(),
      order: Date.now()
    };
    var req = key ? db.ref(path() + '/' + key).update(payload) : db.ref(path()).push(payload);
    req.then(function () {
      toastMsg('Gespeichert');
      status('Gespeichert: ' + name);
      pcReset();
    }).catch(function (e) {
      status('Speichern: ' + (e.message || e), true);
    });
  };

  window.pcSeed = function () {
    if (!dbReady()) return status('Keine Datenbank', true);
    if (listOf(edition).length) return status('Liste ist nicht leer – zuerst löschen oder einzeln speichern');
    var updates = {};
    SEED[edition].forEach(function (c, i) {
      var id = 'c' + (i + 1) + '_' + Date.now().toString(36);
      updates[id] = { name: c.name, desc: c.desc, edition: edition, ts: Date.now() + i, order: i + 1, by: 'seed' };
    });
    db.ref(path()).update(updates)
      .then(function () { toastMsg('Standard geladen'); status('Standard geladen'); })
      .catch(function (e) { status('Standard: ' + (e.message || e), true); });
  };

  function boot() {
    inject();
    if (!dbReady()) setTimeout(boot, 400);
    else startListen();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 600);
  setTimeout(boot, 1600);
})();
