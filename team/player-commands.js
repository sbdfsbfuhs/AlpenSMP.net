/* Öffentliche Spieler-Commands (Java/Bedrock) – getrennt von internen Staff-Commands */
(function () {
  if (window.__alpenPlayerCmdsTeam) return;
  window.__alpenPlayerCmdsTeam = true;

  var edition = 'java';
  var cache = { java: {}, bedrock: {} };
  var editKey = '';

  var SEED = {
    java: [
      { name: '/tpa', desc: 'Teleport-Anfrage senden. Der andere klickt in Java einfach auf die Chat-Nachricht.' },
      { name: '/rtp', desc: 'Zufälliger Teleport in die Welt.' },
      { name: '/sethome', desc: 'Home speichern (Base, Farm, Shop).' },
      { name: '/home 1', desc: 'Zum gespeicherten Home teleportieren. Zahl = Home-Nummer.' },
      { name: '/sit', desc: 'Hinsetzen.' },
      { name: '/lay', desc: 'Hinlegen.' },
      { name: '/warp', desc: 'Zu öffentlichen Warps: survival, strings, end, casino, shop, nether.' },
      { name: '/msg', desc: 'Private Nachricht an einen Spieler.' },
      { name: '/voicechat invite', desc: 'Jemanden in eine Voice-Gruppe einladen (nur Java, Mod nötig).' },
      { name: '/claim 5', desc: 'Claim mit Radius 5 setzen. Zahl = Radius.' }
    ],
    bedrock: [
      { name: '/tpa', desc: 'Teleport-Anfrage senden. Annehmen geht nicht per Klick.' },
      { name: '/tpaccept', desc: 'TPA annehmen. Auf Bedrock musst du das eintippen.' },
      { name: '/rtp', desc: 'Zufälliger Teleport – gleich wie bei Java.' },
      { name: '/sethome', desc: 'Home speichern – gleich wie bei Java.' },
      { name: '/home', desc: 'Zum Home teleportieren – gleich wie bei Java.' },
      { name: '/warp survival', desc: 'Warp Survival.' },
      { name: '/warp strings', desc: 'Warp Strings.' },
      { name: '/warp end', desc: 'Warp End.' },
      { name: '/warp casino', desc: 'Warp Casino.' },
      { name: '/warp shop', desc: 'Warp Shop.' },
      { name: '/warp nether', desc: 'Warp Nether.' }
    ]
  };

  function refPath(ed) { return 'site_player_commands/' + (ed || edition); }

  function inject() {
    if (document.getElementById('alpenPlayerCmdCard')) return;
    var tab = document.getElementById('tab-commands');
    if (!tab) return;
    var card = document.createElement('div');
    card.className = 'card';
    card.id = 'alpenPlayerCmdCard';
    card.style.marginTop = '26px';
    card.innerHTML =
      '<h2>💻 Spieler-Commands (Website)</h2>' +
      '<p class="desc">Diese Liste steht öffentlich auf der Startseite. Interner Commands-Tab oben bleibt unverändert.</p>' +
      '<div class="filter-row">' +
      '<button class="btn-quick" id="pcEdJava" onclick="pcSetEdition(\'java\')">Java</button>' +
      '<button class="btn-quick" id="pcEdBedrock" onclick="pcSetEdition(\'bedrock\')">Bedrock</button>' +
      '</div>' +
      '<div class="form-row">' +
      '<input type="text" id="pcName" placeholder="Befehl z.B. /tpa">' +
      '</div>' +
      '<textarea id="pcDesc" placeholder="Beschreibung für Spieler"></textarea>' +
      '<input type="hidden" id="pcEditKey">' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
      '<button class="btn" onclick="pcSave()">Speichern</button>' +
      '<button class="btn btn-ghost" onclick="pcReset()">Abbrechen</button>' +
      '<button class="btn btn-ghost" onclick="pcSeedIfEmpty()">Standard laden (wenn leer)</button>' +
      '</div>' +
      '<div class="list" id="pcList"></div>';
    tab.appendChild(card);
    listen();
  }

  function listen() {
    if (typeof db === 'undefined' || !db) { setTimeout(listen, 400); return; }
    ['java', 'bedrock'].forEach(function (ed) {
      db.ref(refPath(ed)).on('value', function (snap) {
        cache[ed] = snap.val() || {};
        if (ed === edition) draw();
      });
    });
  }

  function rows(ed) {
    var raw = cache[ed] || {};
    return Object.keys(raw).map(function (k) {
      var x = raw[k] || {};
      return { key: k, name: x.name || '', desc: x.desc || '', ts: x.ts || 0 };
    }).sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
  }

  function draw() {
    var j = document.getElementById('pcEdJava');
    var b = document.getElementById('pcEdBedrock');
    if (j) j.classList.toggle('active', edition === 'java');
    if (b) b.classList.toggle('active', edition === 'bedrock');
    var list = document.getElementById('pcList');
    if (!list) return;
    var items = rows(edition);
    if (!items.length) {
      list.innerHTML = '<div class="empty">Noch keine öffentlichen ' + (edition === 'bedrock' ? 'Bedrock' : 'Java') + '-Commands. Standard laden oder neu hinzufügen.</div>';
      return;
    }
    list.innerHTML = items.map(function (it) {
      return '<div class="item"><div><div class="name">' + escapeHtml(it.name) +
        '</div><div class="meta">' + escapeHtml(it.desc) + '</div></div>' +
        '<div style="display:flex;gap:6px">' +
        '<button class="btn-icon" title="Bearbeiten" onclick="pcEdit(\'' + it.key + '\')">✎</button>' +
        '<button class="btn-icon" title="Löschen" onclick="pcDelete(\'' + it.key + '\')">✕</button>' +
        '</div></div>';
    }).join('');
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  window.pcSetEdition = function (ed) {
    edition = ed === 'bedrock' ? 'bedrock' : 'java';
    pcReset();
    draw();
  };

  window.pcReset = function () {
    editKey = '';
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
    editKey = key;
    document.getElementById('pcEditKey').value = key;
    document.getElementById('pcName').value = item.name || '';
    document.getElementById('pcDesc').value = item.desc || '';
    document.getElementById('pcName').focus();
  };

  window.pcDelete = function (key) {
    if (!currentUser) return toast('Nicht angemeldet');
    if (!confirm('Diesen Spieler-Command löschen?')) return;
    db.ref(refPath() + '/' + key).remove().then(function () { toast('Gelöscht'); }).catch(function () { toast('Löschen fehlgeschlagen'); });
  };

  window.pcSave = function () {
    if (!currentUser) return toast('Nicht angemeldet');
    var name = (document.getElementById('pcName').value || '').trim();
    var desc = (document.getElementById('pcDesc').value || '').trim();
    if (!name) return toast('Befehl fehlt');
    if (name.charAt(0) !== '/') name = '/' + name;
    if (desc.length < 3) return toast('Beschreibung zu kurz');
    var payload = {
      name: name,
      desc: desc,
      edition: edition,
      by: currentUser.username,
      ts: Date.now()
    };
    var key = document.getElementById('pcEditKey').value || editKey;
    var op = key
      ? db.ref(refPath() + '/' + key).update(payload)
      : db.ref(refPath()).push(payload);
    op.then(function () { toast('Gespeichert'); pcReset(); }).catch(function () { toast('Speichern fehlgeschlagen – Firebase-Rechte prüfen'); });
  };

  window.pcSeedIfEmpty = function () {
    if (!currentUser) return toast('Nicht angemeldet');
    if (rows(edition).length) return toast('Liste ist nicht leer');
    var updates = {};
    SEED[edition].forEach(function (c, i) {
      var id = db.ref(refPath()).push().key;
      updates[id] = { name: c.name, desc: c.desc, edition: edition, by: currentUser.username, ts: Date.now() + i };
    });
    db.ref(refPath()).update(updates).then(function () { toast('Standard geladen'); }).catch(function () { toast('Standard laden fehlgeschlagen'); });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
  setTimeout(inject, 500);
  setTimeout(inject, 1400);
})();
