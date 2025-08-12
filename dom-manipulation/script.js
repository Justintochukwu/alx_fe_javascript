// script.js
// Quotes app with server-sync simulation (JSONPlaceholder), periodic fetching, and conflict handling.

// -------------------- CONFIG --------------------
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // mock API
let autoSyncIntervalId = null;
let pendingConflicts = []; // store conflicts for user review

// -------------------- HELPERS --------------------
function generateId() {
  return 'local-' + Date.now().toString(36) + '-' + Math.floor(Math.random()*10000).toString(36);
}

function now() { return Date.now(); }

// -------------------- LOCAL STORAGE INIT --------------------
const defaultQuotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" },
  { text: "I can do all things through Christ who strengthens me.", category: "Faith" }
];

let quotes = JSON.parse(localStorage.getItem('quotes'));
if (!Array.isArray(quotes) || quotes.length === 0) {
  quotes = defaultQuotes.map(q => ({
    id: generateId(),
    serverId: null,
    text: q.text,
    category: q.category,
    updatedAt: now()
  }));
  saveQuotes();
} else {
  // Normalize loaded structure
  quotes = quotes.map(q => ({
    id: q.id || generateId(),
    serverId: q.serverId || null,
    text: q.text || '',
    category: q.category || 'Uncategorized',
    updatedAt: q.updatedAt || now()
  }));
}

let lastSelectedCategory = localStorage.getItem('selectedCategory') || 'all';

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function setSelectedCategory(cat) {
  lastSelectedCategory = cat;
  localStorage.setItem('selectedCategory', cat);
}

// -------------------- RENDERING & FILTER --------------------
function populateCategories() {
  const sel = document.getElementById('categoryFilter');
  if (!sel) return;
  sel.innerHTML = '<option value="all">All Categories</option>';
  const categories = [...new Set(quotes.map(q => q.category))].sort();
  categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
  sel.value = lastSelectedCategory;
}

function renderQuotesForCategory(category = null) {
  const container = document.getElementById('quoteDisplay');
  container.innerHTML = '';
  const selected = category || document.getElementById('categoryFilter').value || 'all';
  const filtered = selected === 'all' ? quotes : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    container.innerHTML = '<p>No quotes available for this category.</p>';
    return;
  }

  filtered.forEach(q => {
    const wrapper = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = `"${q.text}"`;
    p.style.margin = '6px 0';

    const s = document.createElement('span');
    s.textContent = ` — ${q.category}`;
    s.style.fontStyle = 'italic';
    s.style.color = '#555';

    const meta = document.createElement('div');
    meta.style.fontSize = '0.8em';
    meta.style.color = '#888';
    meta.textContent = `id: ${q.id}${q.serverId ? ' | srvId:' + q.serverId : ''} | updated: ${new Date(q.updatedAt).toLocaleString()}`;

    wrapper.appendChild(p);
    wrapper.appendChild(s);
    wrapper.appendChild(meta);
    wrapper.appendChild(document.createElement('hr'));
    container.appendChild(wrapper);
  });
}

function filterQuotes() {
  const selected = document.getElementById('categoryFilter').value;
  setSelectedCategory(selected);
  renderQuotesForCategory(selected);
}

// -------------------- QUOTE INTERACTION --------------------
function showRandomQuote() {
  const selected = lastSelectedCategory || 'all';
  const candidate = selected === 'all' ? quotes : quotes.filter(q => q.category === selected);
  if (!candidate || candidate.length === 0) {
    alert('No quotes available to show.');
    return;
  }
  const idx = Math.floor(Math.random() * candidate.length);
  const quote = candidate[idx];
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));

  const container = document.getElementById('quoteDisplay');
  container.innerHTML = '';
  const p = document.createElement('p');
  p.textContent = `"${quote.text}"`;
  const s = document.createElement('span');
  s.textContent = ` — ${quote.category}`;
  s.style.fontStyle = 'italic';
  s.style.color = '#555';
  container.appendChild(p);
  container.appendChild(s);
}

function loadLastViewedQuote() {
  const last = sessionStorage.getItem('lastViewedQuote');
  if (!last) return;
  try {
    const q = JSON.parse(last);
    const container = document.getElementById('quoteDisplay');
    container.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = `"${q.text}"`;
    const s = document.createElement('span');
    s.textContent = ` — ${q.category}`;
    s.style.fontStyle = 'italic';
    s.style.color = '#555';
    container.appendChild(p);
    container.appendChild(s);
  } catch (e) {
    // ignore parse errors
  }
}

// -------------------- ADD FORM --------------------
function createAddQuoteForm() {
  const formContainer = document.getElementById('form-container');
  formContainer.innerHTML = '';
  const form = document.createElement('form');

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.placeholder = 'Enter quote text';
  textInput.required = true;
  textInput.style.width = '60%';

  const categoryInput = document.createElement('input');
  categoryInput.type = 'text';
  categoryInput.placeholder = 'Enter category';
  categoryInput.required = true;
  categoryInput.style.marginLeft = '8px';

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = 'Add Quote';
  submitBtn.style.marginLeft = '8px';

  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(submitBtn);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const newQuote = {
      id: generateId(),
      serverId: null,
      text: textInput.value.trim(),
      category: categoryInput.value.trim() || 'Uncategorized',
      updatedAt: now()
    };
    if (!newQuote.text) return alert('Quote text required.');
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    filterQuotes();
    textInput.value = '';
    categoryInput.value = '';
    notify('Quote added locally. It will be pushed to server on next sync.');
  });

  formContainer.appendChild(form);
}

// -------------------- IMPORT / EXPORT --------------------
function exportToJsonFile() {
  const jsonString = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    try {
      const imported = JSON.parse(ev.target.result);
      if (!Array.isArray(imported)) throw new Error('JSON must be an array of quotes.');
      let added = 0;
      imported.forEach(item => {
        const text = item.text || item.title || '';
        const category = item.category || item.body || 'Imported';
        if (!text) return;
        const exists = quotes.some(q => q.text === text && q.category === category);
        if (!exists) {
          quotes.push({
            id: item.id && typeof item.id === 'string' && item.id.startsWith('local-') ? item.id : generateId(),
            serverId: item.serverId || null,
            text,
            category,
            updatedAt: item.updatedAt || now()
          });
          added++;
        }
      });
      if (added > 0) {
        saveQuotes();
        populateCategories();
        filterQuotes();
      }
      notify(`${added} quote(s) imported.`);
    } catch (err) {
      alert('Failed to import JSON: ' + (err.message || err));
    } finally {
      // reset input so same file may be imported again later
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

// Expose for inline onchange handler in the HTML
window.importFromJsonFile = importFromJsonFile;

// -------------------- NOTIFICATIONS --------------------
function notify(msg, withReviewButton = false) {
  const node = document.getElementById('sync-notifications');
  if (!node) return;
  node.innerHTML = '';
  const p = document.createElement('div');
  p.textContent = msg;
  node.appendChild(p);
  if (withReviewButton && pendingConflicts.length > 0) {
    const btn = document.createElement('button');
    btn.textContent = `Review Conflicts (${pendingConflicts.length})`;
    btn.addEventListener('click', showConflictModal);
    node.appendChild(btn);
  }
}

// -------------------- SERVER MAPPING HELPERS --------------------
function mapServerPostToNormalized(post) {
  return {
    serverId: post.id,
    text: post.title || (`Server quote #${post.id}`),
    category: post.body ? String(post.body).split('\n')[0].slice(0, 40) || 'Server' : 'Server',
    // we do not change local.id here — caller decides whether to create new local id
  };
}

async function fetchServerQuotes(limit = 15) {
  const res = await fetch(`${SERVER_URL}?_limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch server data');
  const arr = await res.json();
  return arr.map(mapServerPostToNormalized);
}

async function pushQuoteToServer(localQuote) {
  const payload = { title: localQuote.text, body: localQuote.category, userId: 1 };
  const res = await fetch(SERVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to push to server');
  const created = await res.json(); // {id: ...}
  localQuote.serverId = created.id;
  localQuote.updatedAt = now();
  return created.id;
}

async function updateServerQuote(localQuote) {
  if (!localQuote.serverId) return pushQuoteToServer(localQuote);
  const payload = { id: localQuote.serverId, title: localQuote.text, body: localQuote.category, userId: 1 };
  const res = await fetch(`${SERVER_URL}/${localQuote.serverId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update server');
  const updated = await res.json();
  localQuote.updatedAt = now();
  return updated;
}

// -------------------- SYNC LOGIC --------------------
/*
  Strategy (server-wins by default):
  1. Fetch server items.
  2. For each server item:
     - If local item with same serverId exists:
         - If data differs, server wins -> overwrite local but save backup for manual review (conflict).
     - If server item not present locally: create local copy (server-added).
  3. For local items without serverId: push to server (POST) to obtain serverId.
  4. For local items with serverId that were not present in server results: treat as deleted-on-server (remove locally, keep backup in conflicts).
  5. Save changes and notify user; keep pendingConflicts for manual review.
*/
async function syncWithServer(limit = 20) {
  // disable sync controls while running
  setSyncControlsEnabled(false);
  notify('Syncing with server...');
  try {
    const serverItems = await fetchServerQuotes(limit);
    const serverById = new Map(serverItems.map(si => [si.serverId, si]));

    // STEP 1: Ensure server items exist locally or update existing local (server precedence)
    for (const si of serverItems) {
      // find local by serverId
      const localIndex = quotes.findIndex(q => q.serverId === si.serverId);
      if (localIndex >= 0) {
        const local = quotes[localIndex];
        // compare basic fields
        if (local.text !== si.text || local.category !== si.category) {
          // conflict: server differs; server wins automatically but save backup for review
          const backup = { ...local }; // store local copy
          pendingConflicts.push({ type: 'updated', server: { ...si }, localBackup: backup });
          // overwrite local with server values (keep local id)
          quotes[localIndex] = {
            ...local,
            text: si.text,
            category: si.category,
            updatedAt: now()
          };
        }
        // else identical -> nothing to do
      } else {
        // server item not in local -> add to local store
        const newLocal = {
          id: generateId(),
          serverId: si.serverId,
          text: si.text,
          category: si.category,
          updatedAt: now()
        };
        quotes.push(newLocal);
        // record as informational change (server added)
        pendingConflicts.push({ type: 'server_added', server: { ...si }, localBackup: null });
      }
    }

    // STEP 2: Find local items that lack serverId -> push them to server
    const localWithoutServer = quotes.filter(q => !q.serverId);
    for (const local of localWithoutServer) {
      try {
        const createdId = await pushQuoteToServer(local);
        // push succeeded -> serverId set inside pushQuoteToServer
      } catch (err) {
        // keep local copy; pushing failed (network) — we can notify later
        console.warn('Failed to push local quote to server:', err);
      }
    }

    // STEP 3: Local items that have serverId but server didn't return them (server deletion)
    const serverIds = new Set(serverItems.map(s => s.serverId));
    const localWithServer = quotes.filter(q => q.serverId);
    for (const local of localWithServer) {
      if (!serverIds.has(local.serverId)) {
        // server no longer returned this id -> treat as deleted on server (server wins)
        const backup = { ...local };
        pendingConflicts.push({ type: 'deleted_on_server', server: null, localBackup: backup });
        // remove local item
        quotes = quotes.filter(q => q.id !== local.id);
      }
    }

    // Save and re-render
    saveQuotes();
    populateCategories();
    filterQuotes();

    if (pendingConflicts.length > 0) {
      notify(`Sync complete. ${pendingConflicts.length} change(s) applied or need review.`, true);
    } else {
      notify('Sync complete. No conflicts detected.');
    }
  } catch (err) {
    console.warn('Sync failed:', err);
    notify('Sync failed: ' + (err.message || err));
  } finally {
    setSyncControlsEnabled(true);
  }
}

// -------------------- CONFLICT UI / MANUAL RESOLUTION --------------------
function showConflictModal() {
  const modalContainer = document.getElementById('conflict-modal');
  modalContainer.innerHTML = ''; // reset
  modalContainer.classList.remove('hidden');

  // overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.position = 'fixed';
  overlay.style.left = '0';
  overlay.style.top = '0';
  overlay.style.right = '0';
  overlay.style.bottom = '0';
  overlay.style.background = 'rgba(0,0,0,0.4)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '9999';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.background = '#fff';
  modal.style.padding = '16px';
  modal.style.maxWidth = '900px';
  modal.style.width = '95%';
  modal.style.borderRadius = '6px';
  modal.style.maxHeight = '80vh';
  modal.style.overflow = 'auto';

  const title = document.createElement('h3');
  title.textContent = 'Sync Conflicts & Changes';
  modal.appendChild(title);

  if (pendingConflicts.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'No pending conflicts.';
    modal.appendChild(p);
  } else {
    pendingConflicts.forEach((c, idx) => {
      const row = document.createElement('div');
      row.className = 'conflict-row';
      row.style.marginBottom = '12px';

      const header = document.createElement('div');
      header.style.fontWeight = '600';
      header.textContent = `#${idx+1} — ${c.type}`;
      row.appendChild(header);

      if (c.type === 'updated' && c.localBackup && c.server) {
        const serverDiv = document.createElement('div');
        serverDiv.textContent = `Server → Text: "${c.server.text}" | Category: ${c.server.category}`;
        serverDiv.style.color = '#0a6';
        row.appendChild(serverDiv);

        const localDiv = document.createElement('div');
        localDiv.textContent = `Your previous local copy → Text: "${c.localBackup.text}" | Category: ${c.localBackup.category}`;
        localDiv.style.color = '#a60';
        row.appendChild(localDiv);

        const btnKeepLocal = document.createElement('button');
        btnKeepLocal.textContent = 'Restore Local (push to server)';
        btnKeepLocal.addEventListener('click', async () => {
          // restore localBackup replacing existing local that was overwritten
          const idxLocal = quotes.findIndex(q => q.serverId === c.server.serverId);
          if (idxLocal >= 0) {
            quotes[idxLocal] = { ...c.localBackup, updatedAt: now() };
            saveQuotes();
            // push local back to server (update)
            try {
              await updateServerQuote(quotes[idxLocal]);
              // resolved: remove this conflict
              pendingConflicts.splice(pendingConflicts.indexOf(c), 1);
              populateCategories();
              filterQuotes();
              notify('Restored local and pushed to server.');
              showConflictModal(); // refresh modal
            } catch (err) {
              alert('Failed to push local copy to server: ' + (err.message || err));
            }
          } else {
            // if local not found (rare), just push as new
            quotes.push({ ...c.localBackup, id: generateId(), serverId: null, updatedAt: now() });
            saveQuotes();
            populateCategories();
            filterQuotes();
            try {
              await pushQuoteToServer(quotes[quotes.length-1]);
              pendingConflicts.splice(pendingConflicts.indexOf(c), 1);
              notify('Restored local and pushed to server.');
              showConflictModal();
            } catch (err) {
              alert('Failed to push local copy to server: ' + (err.message || err));
            }
          }
        });

        const btnKeepServer = document.createElement('button');
        btnKeepServer.textContent = 'Keep Server (accept)';
        btnKeepServer.style.marginLeft = '8px';
        btnKeepServer.addEventListener('click', () => {
          // accept server resolution (it was already applied)
          pendingConflicts.splice(pendingConflicts.indexOf(c), 1);
          notify('Server version accepted.');
          showConflictModal(); // refresh modal
        });

        row.appendChild(btnKeepLocal);
        row.appendChild(btnKeepServer);
      } else if (c.type === 'deleted_on_server' && c.localBackup) {
        const localDiv = document.createElement('div');
        localDiv.textContent = `This quote was deleted on the server. Local backup → Text: "${c.localBackup.text}" | Category: ${c.localBackup.category}`;
        localDiv.style.color = '#a60';
        row.appendChild(localDiv);

        const btnRestore = document.createElement('button');
        btnRestore.textContent = 'Restore Local (push to server)';
        btnRestore.addEventListener('click', async () => {
          // push backup to server again
          const restored = { ...c.localBackup, id: generateId(), serverId: null, updatedAt: now() };
          quotes.push(restored);
          saveQuotes();
          populateCategories();
          filterQuotes();
          try {
            await pushQuoteToServer(restored);
            // remove conflict
            pendingConflicts.splice(pendingConflicts.indexOf(c), 1);
            notify('Restored and pushed to server.');
            showConflictModal();
          } catch (err) {
            alert('Failed to push restored quote: ' + (err.message || err));
          }
        });

        const btnDiscard = document.createElement('button');
        btnDiscard.textContent = 'Discard Local Backup';
        btnDiscard.style.marginLeft = '8px';
        btnDiscard.addEventListener('click', () => {
          // user chooses server deletion as final
          pendingConflicts.splice(pendingConflicts.indexOf(c), 1);
          notify('Local backup discarded.');
          showConflictModal();
        });

        row.appendChild(btnRestore);
        row.appendChild(btnDiscard);
      } else if (c.type === 'server_added') {
        const serverDiv = document.createElement('div');
        serverDiv.textContent = `New server quote added → Text: "${c.server.text}" | Category: ${c.server.category}`;
        serverDiv.style.color = '#0a6';
        row.appendChild(serverDiv);

        const btnIgnore = document.createElement('button');
        btnIgnore.textContent = 'Ignore (keep local unchanged)';
        btnIgnore.addEventListener('click', () => {
          pendingConflicts.splice(pendingConflicts.indexOf(c), 1);
          notify('Change acknowledged.');
          showConflictModal();
        });

        row.appendChild(btnIgnore);
      }

      modal.appendChild(row);
    });
  }

  // controls
  const controls = document.createElement('div');
  controls.style.marginTop = '12px';

  const btnClose = document.createElement('button');
  btnClose.textContent = 'Close';
  btnClose.addEventListener('click', () => {
    modalContainer.classList.add('hidden');
    modalContainer.innerHTML = '';
    notify('Conflict review closed.', pendingConflicts.length > 0);
  });

  const btnClearAll = document.createElement('button');
  btnClearAll.textContent = 'Clear All Conflicts';
  btnClearAll.style.marginLeft = '8px';
  btnClearAll.addEventListener('click', () => {
    if (!confirm('Remove all pending conflict records? This will not change stored quotes.')) return;
    pendingConflicts = [];
    modalContainer.classList.add('hidden');
    modalContainer.innerHTML = '';
    notify('All conflict records cleared.');
  });

  controls.appendChild(btnClose);
  controls.appendChild(btnClearAll);
  modal.appendChild(controls);

  overlay.appendChild(modal);
  modalContainer.appendChild(overlay);
}

window.showConflictModal = showConflictModal; // expose globally to allow other handlers

// -------------------- AUTO SYNC CONTROLS --------------------
function setSyncControlsEnabled(enabled) {
  const ids = ['sync-now-btn', 'toggle-auto-sync-btn', 'sync-interval'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = !enabled;
  });
}

function startAutoSync() {
  const intervalInput = document.getElementById('sync-interval');
  let s = Number(intervalInput.value);
  if (!s || s < 5) s = 30;
  const ms = s * 1000;
  if (autoSyncIntervalId) clearInterval(autoSyncIntervalId);
  autoSyncIntervalId = setInterval(() => {
    syncWithServer().catch(err => console.warn('Auto-sync failed', err));
  }, ms);
  document.getElementById('toggle-auto-sync-btn').textContent = 'Stop Auto Sync';
  notify(`Auto-sync started (every ${s}s).`);
}

function stopAutoSync() {
  if (autoSyncIntervalId) {
    clearInterval(autoSyncIntervalId);
    autoSyncIntervalId = null;
  }
  document.getElementById('toggle-auto-sync-btn').textContent = 'Start Auto Sync';
  notify('Auto-sync stopped.');
}

function toggleAutoSync() {
  if (autoSyncIntervalId) stopAutoSync();
  else startAutoSync();
}

// -------------------- INIT & EVENT BINDING --------------------
window.addEventListener('DOMContentLoaded', () => {
  // populate UI
  populateCategories();
  filterQuotes();
  loadLastViewedQuote();

  // buttons
  const showBtn = document.getElementById('show-quote-btn');
  if (showBtn) showBtn.addEventListener('click', showRandomQuote);

  const addBtn = document.getElementById('add-quote-btn');
  if (addBtn) addBtn.addEventListener('click', createAddQuoteForm);

  const exportBtn = document.getElementById('export-json-btn');
  if (exportBtn) exportBtn.addEventListener('click', exportToJsonFile);

  const syncNow = document.getElementById('sync-now-btn');
  if (syncNow) syncNow.addEventListener('click', () => syncWithServer().catch(err => console.warn(err)));

  const toggleBtn = document.getElementById('toggle-auto-sync-btn');
  if (toggleBtn) toggleBtn.addEventListener('click', toggleAutoSync);

  const categorySel = document.getElementById('categoryFilter');
  if (categorySel) categorySel.addEventListener('change', filterQuotes);

  // initial form
  createAddQuoteForm();
});
