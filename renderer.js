function debugLog(msg) {
  const logEl = document.getElementById('debug-log');
  logEl.textContent = `[DEBUG] ${msg}`;
}

// === Cut Mark fields toggle (global) ===
window._toggleCutMarkFields = function () {
  const showCropMarksCheckbox = document.querySelector('input[name="showCropMarks"]');
  const cutMarkSizeInput = document.querySelector('input[name="cutMarkSize"]');
  const cutOffsetInput = document.querySelector('input[name="cutOffset"]');

  if (!showCropMarksCheckbox || !cutMarkSizeInput || !cutOffsetInput) return;

  const cutMarkSizeLabel = cutMarkSizeInput.closest('label');
  const cutOffsetLabel = cutOffsetInput.closest('label');

  const show = !!showCropMarksCheckbox.checked;
  if (cutMarkSizeLabel) cutMarkSizeLabel.style.display = show ? '' : 'none';
  if (cutOffsetLabel) cutOffsetLabel.style.display = show ? '' : 'none';
};

window._toggleEdgeToEdgeFields = function () {
  const sil = document.querySelector('input[name="useSilhouette"]')?.checked;
  const magicContainer = document.getElementById('useMagicVersionContainer');

  if (!magicContainer) return;
  if (sil) {
    magicContainer.style.display = '';
  } else {
    magicContainer.style.display = 'none';
    const magicChk = document.querySelector('input[name="useMagicVersion"]');
    if (magicChk) magicChk.checked = false;
  }
};

window._toggleGapBleedFields = function () {
  const silChk = document.querySelector('input[name="useSilhouette"]');
  const cropBleedInput = document.querySelector('input[name="cropBleed"]');
  const cardGapInput = document.querySelector('input[name="cardGap"]');

  if (!cropBleedInput || !cardGapInput) return;

  const cropBleedLabel = cropBleedInput.closest('label');
  const cardGapLabel = cardGapInput.closest('label');

  const silhouetteOn = !!silChk?.checked;

  if (silhouetteOn) {
    if (cropBleedLabel) cropBleedLabel.style.display = 'none';
    if (cardGapLabel) cardGapLabel.style.display = 'none';
    // Keep current behavior: clear values when hidden
    cropBleedInput.value = '0.00';
    cardGapInput.value = '0.00';
  } else {
    if (cropBleedLabel) cropBleedLabel.style.display = '';
    if (cardGapLabel) cardGapLabel.style.display = '';
  }
};

// Tab switching logic
document.querySelectorAll('.tab-button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const selected = btn.getAttribute('data-tab');

    document.querySelectorAll('.tab-button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.tab-panel').forEach((panel) => {
      if (panel.id === `tab-${selected}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
  });
});

// === Load Global Settings ===
const loadGlobalSettings = () => {
  const stored = localStorage.getItem('globalSettings');
  if (!stored)
    return {
      batchHistory: true,
      displayBatchNumber: false
    };

  try {
    const parsed = JSON.parse(stored);
    return {
      batchHistory: parsed.batchHistory ?? true,
      displayBatchNumber: parsed.displayBatchNumber ?? false
    };
  } catch {
    return { batchHistory: true, displayBatchNumber: false };
  }
};

// Load saved config from localStorage
window.addEventListener('DOMContentLoaded', () => {
  // Keep Cut Mark fields in sync with "Print Cut Marks"
  const showCropMarksCheckboxNow = document.querySelector('input[name="showCropMarks"]');
  if (showCropMarksCheckboxNow) {
    showCropMarksCheckboxNow.addEventListener('change', () => window._toggleCutMarkFields());
  }
  // Apply initial state on load
  window._toggleCutMarkFields();

  // Prevent negative values for Card Gap and Crop Bleed
  ['cardGap', 'cropBleed'].forEach((fieldName) => {
    const inputEl = document.querySelector(`input[name="${fieldName}"]`);
    if (inputEl) {
      inputEl.addEventListener('input', () => {
        if (parseFloat(inputEl.value) < 0) {
          inputEl.value = '0.00';
        }
      });
    }
  });

  // Hide Cut Mark Size & Cut Mark Offset unless "Print Cut Marks" is checked
  const showCropMarksCheckbox = document.querySelector('input[name="showCropMarks"]');
  const cutMarkSizeInput = document.querySelector('input[name="cutMarkSize"]');
  const cutOffsetInput = document.querySelector('input[name="cutOffset"]');
  const cutMarkSizeLabel = cutMarkSizeInput.closest('label');
  const cutOffsetLabel = cutOffsetInput.closest('label');

  const toggleCutMarkFields = () => {
    if (showCropMarksCheckbox.checked) {
      cutMarkSizeLabel.style.display = '';
      cutOffsetLabel.style.display = '';
    } else {
      cutMarkSizeLabel.style.display = 'none';
      cutOffsetLabel.style.display = 'none';
    }
  };

  // Initial toggle on page load
  toggleCutMarkFields();

  // Watch for changes
  showCropMarksCheckbox.addEventListener('change', toggleCutMarkFields);

  // Initial toggle for Card Gap & Crop Bleed based on Silhouette
  window._toggleGapBleedFields?.();

  // Show/hide Magic Registration on initial load based on Silhouette checkbox
  window._toggleEdgeToEdgeFields?.();
  // When Silhouette is checked, uncheck Show Crop Marks

  document.querySelector('input[name="useSilhouette"]').addEventListener('change', (e) => {
    // Keep Edge-to-Edge and Gap/Bleed visibility in sync
    window._toggleEdgeToEdgeFields?.();
    window._toggleGapBleedFields?.();

    // If Silhouette is ON, force-hide cut marks (matches prior behavior)
    const cropMarksCheckbox = document.querySelector('input[name="showCropMarks"]');
    if (e.target.checked && cropMarksCheckbox) {
      cropMarksCheckbox.checked = false;
    }

    // Ensure Cut Mark sub-fields match current Print Cut Marks value
    window._toggleCutMarkFields?.();
  });

  document.getElementById('paperTypeSelect').addEventListener('change', (e) => {
    if (window.restoringConfig) return; // <-- skip preset logic during restore
    const select = document.getElementById('paperTypeSelect');
    const width = document.querySelector('input[name="pageWidthInches"]');
    const height = document.querySelector('input[name="pageHeightInches"]');

    const presets = {
      Letter: [8.5, 11],
      A4: [8.27, 11.69],
      Legal: [8.5, 14],
      A3: [11.69, 16.54],
      Tabloid: [11, 17],
      ArchB: [12, 18]
    };

    const val = select.value;
    if (presets[val]) {
      const units = document.getElementById('pageUnits')?.value || 'in';
      const wIn = presets[val][0];
      const hIn = presets[val][1];
      width.value = toDisplay(wIn, units).toFixed(units === 'mm' ? 2 : 3);
      height.value = toDisplay(hIn, units).toFixed(units === 'mm' ? 2 : 3);
    }
    // Persist the new size (in inches) and the selected paper type right away
    {
      const { wIn: wInches, hIn: hInches } = getPageSizeInches();
      localStorage.setItem('lastPageWidthInches', wInches);
      localStorage.setItem('lastPageHeightInches', hInches);
      localStorage.setItem('lastPaperType', val);
    }

    updateLayoutOptions();

    // Restore last-used layout if it’s available for the current page size + silhouette setting
    try {
      const savedLayout = localStorage.getItem('lastLayout');
      const layoutSelect = document.querySelector('select[name="layout"]');
      if (savedLayout && layoutSelect) {
        // only apply if the option exists (i.e., updateLayoutOptions added it)
        const optionExists = Array.from(layoutSelect.options).some((o) => o.value === savedLayout);
        if (optionExists) {
          layoutSelect.value = savedLayout;
          // If you have any “on change” side effects for layout, trigger them here:
          layoutSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    } catch {}

    // Refresh layout options when page size changes by hand
    document.querySelector('input[name="pageWidthInches"]').addEventListener('input', () => {
      const { wIn, hIn } = getPageSizeInches();
      localStorage.setItem('lastPageWidthInches', wIn);
      localStorage.setItem('lastPageHeightInches', hIn);
      updateLayoutOptions();
    });

    document.querySelector('input[name="pageHeightInches"]').addEventListener('input', () => {
      const { wIn, hIn } = getPageSizeInches();
      localStorage.setItem('lastPageWidthInches', wIn);
      localStorage.setItem('lastPageHeightInches', hIn);
      updateLayoutOptions();
    });

    // Also refresh when toggling Silhouette checkbox so unsupported layouts get disabled

    document.querySelector('input[name="useSilhouette"]').addEventListener('change', (e) => {
      updateLayoutOptions(e);
    });
  });

  // === Always save last page size in inches when width/height change ===
  document.querySelector('input[name="pageWidthInches"]').addEventListener('input', () => {
    const { wIn, hIn } = getPageSizeInches();
    localStorage.setItem('lastPageWidthInches', wIn);
    localStorage.setItem('lastPageHeightInches', hIn);
  });

  document.querySelector('input[name="pageHeightInches"]').addEventListener('input', () => {
    const { wIn, hIn } = getPageSizeInches();
    localStorage.setItem('lastPageWidthInches', wIn);
    localStorage.setItem('lastPageHeightInches', hIn);
  });

  // Units toggle (in <-> mm). UI reflects selected units; backend always inches.
  const pageUnitsSel = document.getElementById('pageUnits');
  if (pageUnitsSel) {
    const savedUnits = localStorage.getItem('pageUnits') || 'in';
    pageUnitsSel.value = savedUnits;

    // On first load, inputs are in inches (from HTML defaults) -> display in savedUnits
    //renderPageSizeForUnits(savedUnits, 'in');

    // Restore last saved page size in inches (fallback to defaults if none)
    let lastWIn = parseFloat(localStorage.getItem('lastPageWidthInches')) || 8.5;
    let lastHIn = parseFloat(localStorage.getItem('lastPageHeightInches')) || 11;

    // Show them in the saved units
    const widthEl = document.querySelector('input[name="pageWidthInches"]');
    const heightEl = document.querySelector('input[name="pageHeightInches"]');
    widthEl.value = toDisplay(lastWIn, savedUnits).toFixed(savedUnits === 'mm' ? 2 : 3);
    heightEl.value = toDisplay(lastHIn, savedUnits).toFixed(savedUnits === 'mm' ? 2 : 3);

    // Apply last used paper type if available (handles the “no submit” case)
    {
      const lastPaper = localStorage.getItem('lastPaperType');
      const paperSelect = document.getElementById('paperTypeSelect');
      if (lastPaper && paperSelect) {
        paperSelect.value = lastPaper;
      }
    }

    window.electronAPI.writeLog(`[Startup] savedUnits=${savedUnits} lastPageWidthInches=${localStorage.getItem('lastPageWidthInches')} lastPageHeightInches=${localStorage.getItem('lastPageHeightInches')}`);

    // DEBUG: startup page size + paper type (no await here)
    try {
      const lastPaper = localStorage.getItem('lastPaperType') || '(none)';
      window.electronAPI.writeLog(`[Startup] lastPaper=${lastPaper} lastWIn=${lastWIn} lastHIn=${lastHIn}`);
    } catch (e) {
      // swallow logging errors
    }

    // Ensure inches equivalents are saved even if starting in mm mode
    localStorage.setItem('lastPageWidthInches', lastWIn);
    localStorage.setItem('lastPageHeightInches', lastHIn);

    // Update unit labels and tracker
    const wLab = document.getElementById('pageUnitLabelW');
    const hLab = document.getElementById('pageUnitLabelH');
    if (wLab) wLab.textContent = savedUnits;
    if (hLab) hLab.textContent = savedUnits;
    currentDisplayUnits = savedUnits;

    const { wIn, hIn } = getPageSizeInches();
    localStorage.setItem('lastPageWidthInches', wIn);
    localStorage.setItem('lastPageHeightInches', hIn);

    pageUnitsSel.addEventListener('change', () => {
      const prevUnits = currentDisplayUnits; // what’s in the inputs right now
      const newUnits = pageUnitsSel.value; // what user wants to see
      renderPageSizeForUnits(newUnits, prevUnits); // convert numbers to new units
      localStorage.setItem('pageUnits', newUnits); // save preference for future
      currentDisplayUnits = newUnits; // update tracker

      // Persist the converted values in inches for next startup
      const { wIn, hIn } = getPageSizeInches();
      localStorage.setItem('lastPageWidthInches', wIn);
      localStorage.setItem('lastPageHeightInches', hIn);

      try {
        window.electronAPI.writeLog(`[IN pageUnitsSel.addEventListener('change' AFTER:  localStorage.setItem'lastPageHeightInches'] wIn=${wIn} hIn=${hIn}`);
      } catch (e) {
        // swallow logging errors
      }
      try {
        window.electronAPI.writeLog(`[FIRE updateLayoutOptions] - pageUnitsSel.addEventListener('change')`);
      } catch (e) {}
      updateLayoutOptions();
    });
  }

  // === Open PDF Output Folder ===
  document.getElementById('pdfOutputBtn').addEventListener('click', async () => {
    await window.electronAPI.openPdfOutputFolder();
  });

  const savedCardFolder = localStorage.getItem('batchCardFacePath');
  const savedCardBack = localStorage.getItem('batchCardBackFile');

  if (savedCardFolder && savedCardBack) {
    try {
      const backObj = JSON.parse(savedCardBack);
      window.batchCardFacePath = savedCardFolder;
      window.batchCardBackFile = backObj;

      const summary = document.getElementById('batchInputSummary');
      if (summary) {
        summary.textContent = `📁 Card Folder: ${savedCardFolder} | 🃏 Back: ${backObj.name}`;
      }
    } catch (err) {
      console.warn('⚠️ Failed to restore batch paths:', err);
    }
  }

  document.querySelector('input[name="batchMultiPage"]').addEventListener('change', async (e) => {
    const summary = document.getElementById('batchInputSummary');
    summary.textContent = '';

    if (e.target.checked) {
      const form = document.getElementById('createForm');
      const noBackImage = form.noBackImage?.checked;

      const folder = await window.electronAPI.selectCardImageFolder();
      if (folder.canceled) {
        e.target.checked = false;
        return;
      }

      window.batchCardFacePath = folder.path;
      localStorage.setItem('batchCardFacePath', folder.path);

      if (!noBackImage) {
        const back = await window.electronAPI.selectCardBackImage();
        if (back.canceled) {
          e.target.checked = false;
          return;
        }

        window.batchCardBackFile = { name: back.name, path: back.path };
        localStorage.setItem('batchCardBackFile', JSON.stringify({ name: back.name, path: back.path }));
        summary.textContent = `📁 Card Folder: ${folder.path} | 🃏 Back: ${back.name}`;
      } else {
        window.batchCardBackFile = null;
        localStorage.removeItem('batchCardBackFile');
        summary.textContent = `📁 Card Folder: ${folder.path} | ⚠️ No Back Image`;
      }
    }
  });

  const saved = localStorage.getItem('mtgProxyLastConfig');
  if (!saved) return;

  try {
    const savedOffsetX = localStorage.getItem('adjustmentOffsetX');
    const savedOffsetY = localStorage.getItem('adjustmentOffsetY');
    if (savedOffsetX !== null) document.querySelector('#adjustmentForm input[name="offsetX"]').value = savedOffsetX;
    if (savedOffsetY !== null) document.querySelector('#adjustmentForm input[name="offsetY"]').value = savedOffsetY;
  } catch (err) {}

  try {
    const config = JSON.parse(saved);
    const form = document.getElementById('createForm');
    window.restoringConfig = true; // prevent paperTypeSelect change handler from running

    // Explicitly restore paperType before looping so dropdown is correct
    {
      const paperSelect = document.getElementById('paperTypeSelect');
      if (paperSelect) {
        const lastPaper = localStorage.getItem('lastPaperType');
        paperSelect.value = lastPaper || config.paperType || paperSelect.value;
      }
    }

    for (const [key, value] of Object.entries(config)) {
      const field = form.elements[key];
      if (!field) continue;

      // Do not let old config override current page size or paper type
      if (key === 'paperType' || key === 'pageWidthInches' || key === 'pageHeightInches') {
        continue;
      }

      // Do NOT overwrite page size here; we already restored from lastPageWidth/Height.
      if (key === 'pageWidthInches' || key === 'pageHeightInches') {
        continue;
      }

      if (field.type === 'checkbox') {
        field.checked = value;
      } else {
        field.value = value;
      }
    }

    window.restoringConfig = false; // allow paperTypeSelect changes again

    // Toggle UI Options
    window._toggleCutMarkFields?.();
    window._toggleEdgeToEdgeFields?.();
    window._toggleGapBleedFields?.();
  } catch (err) {
    console.warn('⚠️ Failed to restore previous settings:', err);
  }

  document.getElementById('applyOffsetToAllConfigs').addEventListener('click', async () => {
    const form = document.getElementById('adjustmentForm');
    const offsetX = form.offsetX.value.trim();
    const offsetY = form.offsetY.value.trim();

    const confirmMsg = `⚠️ This will overwrite the Offset X (mm) and Offset Y (mm) values in all your saved config files.  Use this with caution.  You cannot undo this action.\n\n` + `New values: X = ${offsetX}, Y = ${offsetY}\n\nAre you sure you want to overwrite all configs?`;

    if (!confirm(confirmMsg)) return;

    localStorage.setItem('adjustmentOffsetX', offsetX);
    localStorage.setItem('adjustmentOffsetY', offsetY);

    const result = await window.electronAPI.applyOffsetToAllConfigs(offsetX || 0, offsetY || 0);
    if (result.success) {
      alert(`✅ Offset applied to ${result.updated} config files.`);
    } else {
      alert(`❌ Failed to update configs:\n${result.message}`);
    }
  });

  // === Hint popover (created once)
  let hintEl = null;
  function ensureHintEl() {
    if (hintEl) return hintEl;
    hintEl = document.createElement('div');
    hintEl.className = 'hint-popover';
    hintEl.style.display = 'none';
    hintEl.innerHTML = `
      <div class="hint-title"></div>
      <div class="hint-body"></div>
    `;
    document.body.appendChild(hintEl);
    return hintEl;
  }

  function positionHint(x, y) {
    const el = ensureHintEl();
    const pad = 8;
    const { innerWidth: vw, innerHeight: vh } = window;
    const rect = el.getBoundingClientRect();
    let left = x + 12;
    let top = y + 12;
    if (left + rect.width + pad > vw) left = Math.max(pad, x - rect.width - 12);
    if (top + rect.height + pad > vh) top = Math.max(pad, y - rect.height - 12);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }

  function hideHint() {
    try {
      clearTimeout(hoverTimer);
    } catch {}
    hoverTimer = null;
    hoverTarget = null;
    if (hintEl) hintEl.style.display = 'none';
  }

  // === Hint HTML helpers (allow-listed) ===
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  // If no tags are present, treat as plaintext and convert newlines to <br>
  function prepareHintHtml(s) {
    if (!s) return '';
    const hasTag = /<[^>]+>/.test(s);
    return hasTag ? s : escapeHtml(s).replace(/\r?\n/g, '<br>');
  }

  // Tiny sanitizer: keep only a small whitelist of tags; strip all attributes.
  function sanitizeHintHtml(html) {
    const allowed = new Set(['b', 'strong', 'i', 'em', 'u', 'code', 'br', 'ul', 'ol', 'li', 'p']);
    const tpl = document.createElement('template');
    tpl.innerHTML = html;

    function sanitizeNode(node) {
      let child = node.firstChild;
      while (child) {
        const next = child.nextSibling;
        if (child.nodeType === Node.ELEMENT_NODE) {
          const tag = child.tagName.toLowerCase();
          if (!allowed.has(tag)) {
            // unwrap disallowed element: keep its children, drop the tag
            while (child.firstChild) node.insertBefore(child.firstChild, child);
            node.removeChild(child);
          } else {
            // strip ALL attributes (no styles/events)
            for (const attr of Array.from(child.attributes)) child.removeAttribute(attr.name);
            sanitizeNode(child);
          }
        } else if (child.nodeType === Node.COMMENT_NODE) {
          node.removeChild(child);
        }
        child = next;
      }
    }

    sanitizeNode(tpl.content);
    const div = document.createElement('div');
    div.appendChild(tpl.content.cloneNode(true));
    return div.innerHTML;
  }

  function showHintAt(x, y, title, body) {
    const el = ensureHintEl();
    el.querySelector('.hint-title').textContent = title || 'Hint';
    const html = prepareHintHtml(body || '');
    el.querySelector('.hint-body').innerHTML = sanitizeHintHtml(html);
    el.style.display = 'block';
    positionHint(x, y);
  }

  function resolveHintKey(target) {
    if (!target) return null;
    // Allow explicit override
    const override = target.getAttribute('data-hint-key') || target.closest('[data-hint-key]')?.getAttribute('data-hint-key');
    if (override) return override;

    // Prefer input/select/textarea name; fall back to id
    const el = target.matches('input, select, textarea, button') ? target : target.closest('label')?.querySelector('input, select, textarea, button');

    return el?.name || el?.id || null;
  }

  // === Modal used for system notices (optional image) ===
  function showSystemHintModal(title, body, imageRelPath) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const wrap = document.createElement('div');
    wrap.className = 'modal-content';
    const h2 = document.createElement('h2');
    h2.textContent = title || 'Notice';
    const p = document.createElement('p');
    p.textContent = body || '';
    wrap.appendChild(h2);
    if (imageRelPath) {
      const img = document.createElement('img');
      img.src = imageRelPath; // put things under /hints/
      img.alt = '';
      img.style.maxWidth = '100%';
      img.style.display = 'block';
      img.style.margin = '0 auto 14px';
      wrap.appendChild(img);
    }
    wrap.appendChild(p);
    const btns = document.createElement('div');
    btns.className = 'modal-buttons';
    const ok = document.createElement('button');
    ok.className = 'ok';
    ok.textContent = 'OK';
    ok.onclick = () => document.body.removeChild(overlay);
    btns.appendChild(ok);
    wrap.appendChild(btns);
    overlay.appendChild(wrap);
    document.body.appendChild(overlay);
  }

  // Global right-click handler: show hint when a field is targeted
  document.addEventListener(
    'contextmenu',
    async (e) => {
      const key = resolveHintKey(e.target);
      if (!key) return; // no field → let native menu open

      try {
        const res = await window.electronAPI.getHint(key);
        if (res?.found) {
          e.preventDefault(); // only block native menu when we show a hint
          showHintAt(e.pageX, e.pageY, res.title || key, res.text || '');
        } else {
          // No hint found: do nothing (don’t show a placeholder bubble)
          hideHint();
        }
      } catch {
        // On error, do nothing—allow native context menu to appear
      }
    },
    true
  );

  // Dismiss on click or ESC
  // Dismiss on click or ESC (use capturing so nothing can swallow it)
  // Also cancel any pending hover timer so it doesn't immediately re-show
  document.addEventListener(
    'click',
    () => {
      try {
        cancelHoverHint();
      } catch {}
      hideHint();
    },
    true
  );

  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape') {
        try {
          cancelHoverHint();
        } catch {}
        hideHint();
      }
    },
    true
  );

  // Extra safety: hide when window loses focus
  window.addEventListener('blur', () => {
    try {
      cancelHoverHint();
    } catch {}
    hideHint();
  });

  // === Hover-to-hint (2s)
  let hoverTimer = null;
  let hoverTarget = null;

  function scheduleHoverHint(target) {
    clearTimeout(hoverTimer);
    hoverTarget = target;
    hoverTimer = setTimeout(async () => {
      const key = resolveHintKey(hoverTarget);
      if (!key) return;
      try {
        const res = await window.electronAPI.getHint(key);
        if (res?.found) {
          const rect = hoverTarget.getBoundingClientRect();
          const x = rect.left + window.scrollX + rect.width - 8;
          const y = rect.top + window.scrollY + 8;
          showHintAt(x, y, res.title || key, res.text || '');
        }
      } catch {
        /* ignore */
      }
    }, 2000); // 2 seconds
  }

  function cancelHoverHint() {
    clearTimeout(hoverTimer);
    hoverTimer = null;
    hoverTarget = null;
    hideHint();
  }

  // Start timer when pointer enters a hintable element
  document.addEventListener(
    'pointerover',
    (e) => {
      const el = e.target?.closest('input, select, textarea, button, [data-hint-key]');
      if (!el) return;
      scheduleHoverHint(el);
    },
    true
  );

  // Cancel when pointer leaves the currently targeted element
  document.addEventListener(
    'pointerout',
    (e) => {
      if (!hoverTarget) return;
      const stillInside = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('input, select, textarea, button, [data-hint-key]');
      if (!stillInside) cancelHoverHint();
    },
    true
  );

  // Cancel on interactions that imply user moved on
  document.addEventListener('pointerdown', cancelHoverHint, true);
  document.addEventListener('scroll', cancelHoverHint, true);

  // Check if .jsx defaults to Photoshop
  (async () => {
    try {
      const res = await window.electronAPI.checkJsxAssociation();
      if (res && res.isPhotoshop === false) {
        const key = res.platform === 'darwin' ? 'system.jsx.association.mac' : 'system.jsx.association.win';
        const hint = await window.electronAPI.getHint(key);
        const title = hint?.title || 'Photoshop is not set as Default app for .jsx';
        const text = hint?.text || 'ProxySheet requires that JSX files be associated with Adobe Photoshop as the default application. Associate .jsx files with Adobe Photoshop so that ProxySheet can launch scripts in Photoshop. Please set Photoshop as the default app for .jsx files.';
        showSystemHintModal(title, text, null);
      }
    } catch {}
  })();
});

// Handle "Run Now" form submission
// === Settings Modal ===
const settingsModal = document.getElementById('settingsModal');
const settingsForm = document.getElementById('settingsForm');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');

// Open settings modal from gear button
document.getElementById('settingsBtn').addEventListener('click', () => {
  const settings = loadGlobalSettings();
  document.getElementById('setting_batchHistory').checked = settings.batchHistory;
  document.getElementById('setting_displayBatchNumber').checked = settings.displayBatchNumber;
  settingsModal.classList.remove('hidden');
});

// ESC key closes settings
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    settingsModal.classList.add('hidden');
  }
});

// "X" close button
document.getElementById('settingsCloseX').addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

// Close settings modal
closeSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

// Save settings on toggle
['setting_batchHistory', 'setting_displayBatchNumber'].forEach((id) => {
  document.getElementById(id).addEventListener('change', () => {
    const batchHistory = document.getElementById('setting_batchHistory').checked;
    const displayBatchNumber = document.getElementById('setting_displayBatchNumber').checked;

    const globalSettings = {
      batchHistory,
      displayBatchNumber
    };

    localStorage.setItem('globalSettings', JSON.stringify(globalSettings));
  });
});

document.getElementById('conversionCardFormat').addEventListener('change', (e) => {
  const show = e.target.value === 'NoBleed';
  document.getElementById('bleedOptionContainer').style.display = show ? 'block' : 'none';
});

// Handle Conversion Tool Submit
document.getElementById('conversionForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const config = {
    exportSingles: true,
    dpi: parseInt(form.dpi.value),
    cardFormat: form.cardFormat.value,
    exportFormat: form.exportFormat.value.toLowerCase(),
    exportAddBleed: form.exportAddBleed.value,
    bright: parseInt(form.bright.value),
    contr: parseInt(form.contr.value),
    vib: parseInt(form.vib.value),
    sat: parseInt(form.sat.value),
    gmm: parseFloat(form.gmm.value),
    whitepoint: parseInt(form.whitepoint.value),
    blackpoint: parseInt(form.blackpoint.value)
  };

  const statusBox = document.getElementById('conversionStatus');
  //statusBox.textContent = "⏳ Running conversion...";

  const result = await window.electronAPI.generateJSX(config);

  if (result.success) {
    //statusBox.textContent = "✅ Conversion script launched in Photoshop.";
    statusBox.className = 'status-message success';
  } else {
    //statusBox.textContent = "❌ " + result.message;
    statusBox.className = 'status-message error';
  }
});

// Adjustment Measurement Sheet Tool
document.getElementById('adjustmentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const offsetX = form.offsetX.value.trim();
  const offsetY = form.offsetY.value.trim();

  localStorage.setItem('adjustmentOffsetX', offsetX);
  localStorage.setItem('adjustmentOffsetY', offsetY);

  const statusBox = document.getElementById('adjustmentStatus');
  statusBox.className = 'status-message';
  statusBox.textContent = '🟡 Running Photoshop script...';

  const config = {
    adjustmentMeasureSheet: true,
    backOffsetXmm: parseFloat(offsetX) || 0,
    backOffsetYmm: parseFloat(offsetY) || 0,
    dpi: 800,
    pageWidthInches: 8.5,
    pageHeightInches: 11
  };

  const runResult = await window.electronAPI.generateJSX(config);
  if (!runResult.success) {
    statusBox.textContent = '❌ Failed to launch script.';
    statusBox.classList.add('error');
    return;
  }

  const sentinalPath = 'TempConfig/sentinal_batch_status.txt';
  const stopWatcher = monitorSentinelStatus(
    (line) => (statusBox.textContent = '🔁 ' + line),
    async () => {
      statusBox.textContent = '✅ Photoshop finished. Merging final PDF...';

      const inputPaths = ['RE_Utilities/align_Front.pdf', 'TempConfig/TempPDF/align_Back_Offset.pdf'];
      const outputPath = 'PDFOutput/ProxySheet_AdjustmentSheet.pdf';

      const success = await window.electronAPI.mergePDFs(inputPaths, outputPath);
      if (!success) {
        statusBox.textContent = '❌ Failed to merge final PDF.';
        return;
      }

      // ✅ Wait for file to exist before trying to open it
      let tries = 0;
      while (tries < 10) {
        const exists = await window.electronAPI.fileExists(outputPath);
        if (exists) break;
        await delay(300); // wait 300ms
        tries++;
      }

      if (tries >= 10) {
        statusBox.textContent = 'PDF merge succeeded, but final file could not be found.';
        return;
      }

      //await window.electronAPI.writeLog('✅ Adjustment Sheet complete.');
      try {
        const launchResult = await window.electronAPI.openFileWithDefaultApp(outputPath);
        if (launchResult && typeof launchResult === 'string' && launchResult.includes('could not')) {
          throw new Error(launchResult);
        }
        statusBox.textContent = '✅ Adjustment Sheet opened! Please close sheet before Re-running.';
      } catch {
        await window.electronAPI.openPdfOutputFolder();
        statusBox.textContent = '📂 Opened output folder';
      }

      // Final Cleanup
      await delay(1000); // brief delay to ensure no file locks
      await window.electronAPI.cleanupBatchTemp();
    }
  );

  // Optional: add Cancel button later
});

// === Save Config Modal ===
const openSaveConfigBtn = document.getElementById('saveConfigBtn');
const saveConfigModal = document.getElementById('saveConfigModal');
const saveConfigForm = document.getElementById('saveConfigForm');
const cancelSaveBtn = document.getElementById('cancelSaveConfig');
const saveStatus = document.getElementById('saveConfigStatus');
const folderOptions = document.getElementById('folderOptions');

// Show the modal
openSaveConfigBtn.addEventListener('click', async () => {
  saveStatus.textContent = '';

  const folderInput = saveConfigForm.configFolder;
  const configInput = saveConfigForm.configName;

  if (window.editingConfigContext) {
    folderInput.value = window.editingConfigContext.folderName || '';
    configInput.value = window.editingConfigContext.configName || '';
  } else {
    saveConfigForm.reset(); // Only reset if not editing
  }

  saveConfigModal.classList.remove('hidden');

  const folders = await window.electronAPI.listUserConfigFolders();
  folderOptions.innerHTML = '';
  folders.forEach((folder) => {
    const opt = document.createElement('option');
    opt.value = folder;
    folderOptions.appendChild(opt);
  });
});

// Cancel/close
cancelSaveBtn.addEventListener('click', () => {
  saveConfigModal.classList.add('hidden');
  //window.editingConfigContext = null;
});

// Handle Create
saveConfigForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const folderName = saveConfigForm.configFolder.value.trim();
  const configName = saveConfigForm.configName.value.trim();

  const validPattern = /^[\w\s-]+$/;
  if (!validPattern.test(folderName) || folderName.length > 40) {
    saveStatus.textContent = '⚠ Invalid folder name.';
    return;
  }

  if (!validPattern.test(configName) || configName.length > 100) {
    saveStatus.textContent = '⚠ Invalid configuration name.';
    return;
  }

  const form = document.getElementById('createForm');
  const config = {};
  for (const element of form.elements) {
    if (!element.name) continue;
    config[element.name] = element.type === 'checkbox' ? element.checked : element.value;
  }

  // Ensure explicit boolean for Use Magic Registration
  config.useMagicVersion = !!form.useMagicVersion?.checked;

  // Force width/height to be saved in INCHES regardless of current display units
  {
    const { wIn, hIn } = getPageSizeInches(); // converts mm->in when needed
    config.pageWidthInches = wIn;
    config.pageHeightInches = hIn;
    // Optional: persist the unit and paper type for clarity
    config.pageUnits = document.getElementById('pageUnits')?.value || 'in';
    config.paperType = document.getElementById('paperTypeSelect')?.value || config.paperType;
    // Debug (no await)
    window.electronAPI.writeLog(`[SaveConfig] units=${config.pageUnits} saving wIn=${wIn} hIn=${hIn} paper=${config.paperType}`);
  }

  const result = await window.electronAPI.saveUserConfig(folderName, configName, config);

  if (result.success) {
    saveStatus.textContent = '✅ Configuration saved successfully!';
    const statusBox = document.getElementById('statusMessage');
    //statusBox.textContent = "📝 Saved to: " + result.path;
    statusBox.className = 'status-message success';
    setTimeout(() => saveConfigModal.classList.add('hidden'), 1000);
  } else {
    saveStatus.textContent = '❌ ' + result.message;
  }

  window.editingConfigContext = null;
});

function resetDefaults() {
  const form = document.getElementById('createForm');
  form.reset();
  localStorage.removeItem('mtgProxyLastConfig');
  localStorage.removeItem('batchCardFacePath');
  localStorage.removeItem('batchCardBackFile');

  try {
  } catch {}

  try {
    window.batchCardFacePath = null;
    window.batchCardBackFile = null;

    const batchSummary = document.getElementById('batchInputSummary');
    if (batchSummary) batchSummary.textContent = '';
  } catch (e) {}

  const statusBox = document.getElementById('statusMessage');
  statusBox.className = 'status-message';

  window.editingConfigContext = null;
}

// Dynamically update layout options if page size is changed manually
document.querySelector('input[name="pageWidthInches"]').addEventListener('input', updateLayoutOptions);
document.querySelector('input[name="pageHeightInches"]').addEventListener('input', updateLayoutOptions);
document.querySelector('select[name="layout"]').addEventListener('change', (e) => {
  // remember last used layout
  localStorage.setItem('lastLayout', e.target.value);
  try {
    window.electronAPI.writeLog(`[FIRE updateLayoutOptions] - document.querySelector('select[name="layout"]').addEventListener('change')`);
  } catch (e) {}
  updateLayoutOptions();
});

// Handle Reset to Defaults
document.getElementById('resetDefaultsBtn').addEventListener('click', () => {
  const confirmed = confirm('Are you sure you want to reset all settings to defaults?\nThis will clear your saved preferences.');
  if (confirmed) resetDefaults();
});

document.getElementById('createForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const { wIn, hIn } = getPageSizeInches();

  const config = {
    layout: form.layout.value,
    pageWidthInches: wIn,
    pageHeightInches: hIn,
    dpi: parseInt(form.dpi.value),
    paperType: form.paperType.value,
    cardFormat: form.cardFormat.value,
    cardWidthMM: parseFloat(form.cardWidthMM.value),
    cardHeightMM: parseFloat(form.cardHeightMM.value),
    cutMarkSize: parseFloat(form.cutMarkSize.value),
    cutOffset: parseFloat(form.cutOffset.value),
    cropBleed: parseFloat(form.cropBleed.value),
    cardGap: parseFloat(form.cardGap.value),
    showCropMarks: form.showCropMarks.checked,
    bright: parseInt(form.bright.value),
    contr: parseInt(form.contr.value),
    vib: parseInt(form.vib.value),
    sat: parseInt(form.sat.value),
    gmm: parseFloat(form.gmm.value),
    whitepoint: parseInt(form.whitepoint.value),
    blackpoint: parseInt(form.blackpoint.value),
    cardBack: form.cardBack.checked,
    backOffsetXmm: parseFloat(form.backOffsetXmm.value),
    backOffsetYmm: parseFloat(form.backOffsetYmm.value),
    selectEachCard: form.selectEachCard.checked,
    useSilhouette: form.useSilhouette.checked,
    useMagicVersion: form.useMagicVersion?.checked || false,
    notesOn: form.notesOn.checked,
    noteFontSize: parseInt(form.noteFontSize.value),
    separateBackPDF: form.separateBackPDF.checked,
    //excludeCardSlots: form.excludeCardSlots.value.trim(),
    addPerCardAdjustLayer: form.addPerCardAdjustLayer.checked,
    manualNote: form.manualNote.value,
    noBackImage: form.noBackImage.checked
  };

  if (form.batchMultiPage.checked) {
    const summary = document.getElementById('batchInputSummary');
    summary.textContent = '';

    if (!window.batchCardFacePath || (!window.batchCardBackFile && !config.noBackImage)) {
      const folder = await window.electronAPI.selectCardImageFolder();
      if (folder.canceled) return;

      window.batchCardFacePath = folder.path;
      localStorage.setItem('batchCardFacePath', folder.path);

      if (!config.noBackImage) {
        const back = await window.electronAPI.selectCardBackImage();
        if (back.canceled) return;

        window.batchCardBackFile = { name: back.name, path: back.path };
        localStorage.setItem('batchCardBackFile', JSON.stringify(window.batchCardBackFile));
      } else {
        window.batchCardBackFile = null;
        localStorage.removeItem('batchCardBackFile');
      }
    }

    const ok = await prepareBatchCardData();
    if (!ok) return;

    createPageBatches(config);
  }

  if (form.batchMultiPage.checked) {
    if (!window.pageBatches || window.pageBatches.length === 0) {
      //statusBox.textContent = "❌ No page batches found. Please select your card folder and try again.";
      return;
    }

    //statusBox.textContent = `🔁 Starting batch run with ${window.pageBatches.length} page(s)...`;

    // === BEGIN SENTINEL WATCH ===
    const overlay = document.getElementById('processingOverlay');
    const statusBox = document.getElementById('processingStatus');
    const cancelBtn = document.getElementById('cancelProcessing');

    overlay.classList.remove('hidden');
    statusBox.textContent = '🟡 Waiting for Photoshop...';

    const stopWatching = monitorSentinelStatus(
      (line) => {
        statusBox.textContent = `🔁 ${line}`;
      },
      async () => {
        statusBox.textContent = '✅ Photoshop batch complete.\nMerging PDFs...';

        const batchNum = config.batchNumber;
        const paddedBatch = String(batchNum).padStart(3, '0');

        const pdfDir = 'TempConfig/TempPDF';
        const outDir = 'PDFOutput';

        // Step 1: Read all PDFs
        const { success, files } = await window.electronAPI.readDirFiltered(pdfDir, '.pdf');
        if (!success || files.length === 0) {
          statusBox.textContent = '❌ No PDFs found to merge.';
          return;
        }

        // Step 2: Sort PDFs into fronts and backs
        const frontFiles = files.filter((f) => !f.includes('_Back')).sort();
        const backFiles = files.filter((f) => f.includes('_Back')).sort();

        const mergedPaths = [];

        if (config.separateBackPDF) {
          // Merge fronts
          const frontOut = `${outDir}/ProxySheet_Batch_${paddedBatch}_Front.pdf`;
          const frontPaths = frontFiles.map((f) => `${pdfDir}/${f}`);
          const mergedFront = await window.electronAPI.mergePDFs(frontPaths, frontOut);
          if (mergedFront) {
            mergedPaths.push(frontOut);
          } else {
            await window.electronAPI.writeLog('!!! Failed to merge Front PDFs');
            statusBox.textContent = 'Failed to merge Front PDFs.';
          }

          await delay(500);

          // Merge backs
          const backOut = `${outDir}/ProxySheet_Batch_${paddedBatch}_Back.pdf`;
          const backPaths = backFiles.map((f) => `${pdfDir}/${f}`);
          const mergedBack = await window.electronAPI.mergePDFs(backPaths, backOut);
          if (mergedBack) {
            mergedPaths.push(backOut);
          } else {
            await window.electronAPI.writeLog('!!! Failed to merge Back PDFs');
            statusBox.textContent = 'Failed to merge Back PDFs.';
          }
        } else {
          // Interleave front and back
          const combinedOut = `${outDir}/ProxySheet_Batch_${paddedBatch}_Combined.pdf`;
          const interleaved = [];

          for (const front of frontFiles.sort()) {
            interleaved.push(`${pdfDir}/${front}`);
            const back = front.replace('.pdf', '_Back.pdf');
            if (files.includes(back)) {
              interleaved.push(`${pdfDir}/${back}`);
            }
          }

          const merged = await window.electronAPI.mergePDFs(interleaved, combinedOut);
          if (merged) {
            mergedPaths.push(combinedOut);
          }
        }

        // Step 3: Validate output
        const allExist = mergedPaths.every((p) => window.electronAPI.fileExists(p));
        if (!allExist) {
          statusBox.textContent = '❌ Merged PDF(s) not found after creation.';
          return;
        }

        statusBox.textContent = '🧹 Cleaning up temporary files...';
        await delay(500);
        await window.electronAPI.cleanupBatchTemp();

        statusBox.textContent = '✅ Batch complete!';
        await delay(800);
        overlay.classList.add('hidden');
      }
    );

    // Allow manual cancel
    cancelBtn.onclick = () => {
      stopWatching();
      overlay.classList.add('hidden');
    };
    // === END SENTINEL WATCH ===

    if (!config.batchNumber) {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const yyyymmdd = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
      const hhmmss = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      config.batchNumber = parseInt(`${yyyymmdd}${hhmmss}`); // ← numeric
    }

    await runBatchPages(config);
    return; // Skip default single-sheet run
  }

  // Save to localStorage
  localStorage.setItem('mtgProxyLastConfig', JSON.stringify(config));

  // Inject global settings into temp run
  const globalSettings = JSON.parse(localStorage.getItem('globalSettings') || '{}');
  config.batchHistory = globalSettings.batchHistory ?? true;
  config.displayBatchNumber = globalSettings.displayBatchNumber ?? false;

  // Send to backend
  const result = await window.electronAPI.generateJSX(config);

  const statusBox = document.getElementById('statusMessage');

  if (result.success) {
    //statusBox.textContent = "✅ Photoshop script launched successfully.";
    statusBox.className = 'status-message success';
  } else {
    //statusBox.textContent = `❌ Failed to launch script: ${result.message}`;
    statusBox.className = 'status-message error';
  }
});

const loadBatchHistory = async () => {
  const list = document.getElementById('historyList');
  const sortKey = document.getElementById('historySort').value;
  const direction = document.getElementById('historyDirection').value;
  const data = await window.electronAPI.getBatchHistory();

  const sorted = data.sort((a, b) => {
    const aVal = a[sortKey] || '';
    const bVal = b[sortKey] || '';

    const compare = sortKey === 'batchNumber' || sortKey === 'dpi' ? Number(aVal) - Number(bVal) : aVal.toString().localeCompare(bVal.toString());

    return direction === 'asc' ? compare : -compare;
  });

  list.innerHTML = '';

  sorted.forEach((item) => {
    const el = document.createElement('div');
    el.className = 'history-item';

    const info = document.createElement('div');
    info.className = 'history-info';
    info.innerHTML = `
      <div><strong>Batch #${item.batchNumber}</strong> — ${item.date}</div>
      <div>${item.layout}, ${item.cardFormat}, DPI ${item.dpi}</div>
      <div style="font-size: 0.85rem; color: #aaa;">${item.infoText}</div>
    `;

    const btn = document.createElement('button');
    btn.textContent = 'Run';
    btn.onclick = () => window.electronAPI.runBatchFile(item.filePath);

    el.appendChild(info);
    el.appendChild(btn);
    list.appendChild(el);
  });
};

document.getElementById('historySort').addEventListener('change', loadBatchHistory);
document.getElementById('historyDirection').addEventListener('change', loadBatchHistory);

// Load on tab switch
document.querySelector('[data-tab="history"]').addEventListener('click', loadBatchHistory);

const loadUserConfigs = async () => {
  let activeEditInput = null;
  const configList = document.getElementById('configList');

  let dragSrcEl = null;

  const onDragStart = (e) => {
    dragSrcEl = e.currentTarget;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e) => {
    e.preventDefault();
    const dragging = document.querySelector('.config-folder.dragging');
    const afterElement = getDragAfterElement(configList, e.clientY);
    if (afterElement == null) {
      configList.appendChild(dragging);
    } else {
      configList.insertBefore(dragging, afterElement);
    }
  };

  const onDragEnd = async () => {
    const folders = [...configList.querySelectorAll('.config-folder')];
    folders.forEach((el) => el.classList.remove('dragging'));

    const newOrder = folders.map((el, i) => ({
      name: el.dataset.folder,
      sortOrder: i + 1
    }));

    await window.electronAPI.updateFolderSortOrder(newOrder);
  };

  const data = await window.electronAPI.getUserConfigs();
  const collapseState = JSON.parse(localStorage.getItem('configCollapse') || '{}');

  // --- apply search filter ---
  const query = document.getElementById('configSearch').value.trim().toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);

  // Build filtered list where each folder only contains matching scripts
  const dataToRender = query
    ? data
        .map((fd) => {
          const filteredScripts = fd.scripts.filter((s) => {
            const visibleLayoutLine = [s.layout, s.cardFormat, `DPI ${s.dpi}`, s.cardBack ? 'Card Back' : ''].filter(Boolean).join(' ').toLowerCase();

            const visibleText = [s.fileName, s.infoText, visibleLayoutLine].filter(Boolean).join(' ').toLowerCase();

            return terms.every((term) => visibleText.includes(term));
          });

          if (filteredScripts.length > 0) {
            return { ...fd, scripts: filteredScripts };
          }

          return null;
        })
        .filter(Boolean)
    : data;

  configList.innerHTML = '';

  dataToRender.forEach((folderData) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'config-folder';

    wrapper.setAttribute('draggable', true);
    wrapper.dataset.folder = folderData.folder;
    wrapper.addEventListener('dragstart', onDragStart);
    wrapper.addEventListener('dragend', onDragEnd);
    configList.addEventListener('dragover', onDragOver);

    const header = document.createElement('div');
    header.className = 'config-folder-header';

    const toggleIcon = document.createElement('span');
    toggleIcon.textContent = collapseState[folderData.folder] ? '▸' : '▾';
    toggleIcon.style.marginRight = '10px';

    const label = document.createElement('div');
    label.className = 'folder-label';

    const folderName = document.createElement('div');
    folderName.className = 'folder-name';
    folderName.textContent = folderData.folder;

    label.appendChild(folderName);

    const descDisplay = document.createElement('div');
    descDisplay.className = 'folder-description';
    descDisplay.textContent = folderData.description || '';
    label.appendChild(descDisplay);

    const descInput = document.createElement('input');
    descInput.className = 'folder-description-input';
    descInput.value = folderData.description || '';
    descInput.style.display = 'none';
    label.appendChild(descInput);

    descInput.addEventListener('blur', async () => {
      const newDesc = descInput.value.trim();

      descInput.style.display = 'none';
      descDisplay.style.display = 'block';

      if (newDesc !== folderData.description) {
        await window.electronAPI.updateFolderDescription(folderData.folder, newDesc);
        loadUserConfigs();
      }

      activeEditInput = null;
    });

    descInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        descInput.blur(); // Saves
      } else if (e.key === 'Escape') {
        descInput.value = folderData.description || '';
        descInput.blur(); // Cancels
      }
    });

    const editFolderDescBtn = document.createElement('button');
    editFolderDescBtn.textContent = '✎';
    editFolderDescBtn.title = 'Edit Folder Description';
    editFolderDescBtn.className = 'edit-folder-btn';
    editFolderDescBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (activeEditInput && activeEditInput !== descInput) {
        activeEditInput.blur();
      }

      descDisplay.style.display = 'none';
      descInput.style.display = 'block';
      descInput.focus();

      const val = descInput.value;
      descInput.value = '';
      descInput.value = val;

      activeEditInput = descInput;
    });

    header.appendChild(toggleIcon);
    header.appendChild(label);
    header.appendChild(editFolderDescBtn);

    const content = document.createElement('div');
    content.className = 'config-folder-scripts';
    if (!collapseState[folderData.folder]) {
      content.style.display = 'flex';
    }

    header.addEventListener('click', () => {
      const expanded = content.style.display === 'flex';
      content.style.display = expanded ? 'none' : 'flex';
      collapseState[folderData.folder] = !expanded;
      localStorage.setItem('configCollapse', JSON.stringify(collapseState));
      toggleIcon.textContent = expanded ? '▸' : '▾';
    });

    folderData.scripts.forEach((script) => {
      const item = document.createElement('div');
      item.className = 'config-script';

      const info = document.createElement('div');
      info.className = 'config-info';
      const layoutLine = [script.paperType && script.paperType !== 'Custom' ? `${script.paperType}` : null, script.layout, script.cardFormat, `DPI ${script.dpi}`, script.cardBack === true ? 'Card Back' : null].filter(Boolean).join(', ');

      info.innerHTML = `
        <div><strong>${script.fileName.replace(/\.jsx$/i, '')}</strong></div>
        <div>${layoutLine}</div>
        <div style="font-size: 0.85rem; color: #aaa;">${script.infoText}</div>
      `;

      const runBtn = document.createElement('button');
      runBtn.textContent = 'Run';
      //runBtn.onclick = () => window.electronAPI.runUserConfigFile(script.filePath);
      runBtn.onclick = async () => {
        const res = await fetch(`file://${script.filePath}`);
        const raw = await res.text();
        const config = {};

        for (const line of raw.split('\n')) {
          if (line.startsWith('var ')) {
            try {
              eval(line.replace('var ', 'config.'));
            } catch (e) {}
          }
        }

        if (config.batchMultiPage) {
          const folder = await window.electronAPI.selectCardImageFolder();
          if (folder.canceled) return;

          window.batchCardFacePath = folder.path;
          localStorage.setItem('batchCardFacePath', folder.path);

          if (!config.noBackImage) {
            const back = await window.electronAPI.selectCardBackImage();
            if (back.canceled) return;

            window.batchCardBackFile = { name: back.name, path: back.path };
            localStorage.setItem('batchCardBackFile', JSON.stringify({ name: back.name, path: back.path }));
          } else {
            window.batchCardBackFile = null;
            localStorage.removeItem('batchCardBackFile');
          }

          const ok = await prepareBatchCardData();
          if (!ok) return;

          createPageBatches(config);
          if (!window.pageBatches || window.pageBatches.length === 0) return;

          if (!config.batchNumber) {
            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const yyyymmdd = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
            const hhmmss = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
            config.batchNumber = parseInt(`${yyyymmdd}${hhmmss}`);
          }

          const overlay = document.getElementById('processingOverlay');
          const statusBox = document.getElementById('processingStatus');
          const cancelBtn = document.getElementById('cancelProcessing');

          overlay.classList.remove('hidden');
          statusBox.textContent = '🟡 Waiting for Photoshop...';

          const stopWatching = monitorSentinelStatus(
            (line) => {
              statusBox.textContent = `🔁 ${line}`;
            },
            async () => {
              statusBox.textContent = '✅ Photoshop batch complete.\nMerging PDFs...';

              const batchNum = config.batchNumber;
              const paddedBatch = String(batchNum).padStart(3, '0');
              const pdfDir = 'TempConfig/TempPDF';
              const outDir = 'PDFOutput';

              const { success, files } = await window.electronAPI.readDirFiltered(pdfDir, '.pdf');
              if (!success || files.length === 0) {
                statusBox.textContent = '❌ No PDFs found to merge.';
                return;
              }

              const frontFiles = files.filter((f) => !f.includes('_Back')).sort();
              const backFiles = files.filter((f) => f.includes('_Back')).sort();

              const mergedPaths = [];

              if (config.separateBackPDF) {
                const frontOut = `${outDir}/ProxySheet_Batch_${paddedBatch}_Front.pdf`;
                const backOut = `${outDir}/ProxySheet_Batch_${paddedBatch}_Back.pdf`;

                const frontPaths = frontFiles.map((f) => `${pdfDir}/${f}`);
                const backPaths = backFiles.map((f) => `${pdfDir}/${f}`);

                if (await window.electronAPI.mergePDFs(frontPaths, frontOut)) mergedPaths.push(frontOut);
                if (await window.electronAPI.mergePDFs(backPaths, backOut)) mergedPaths.push(backOut);
              } else {
                const combinedOut = `${outDir}/ProxySheet_Batch_${paddedBatch}_Combined.pdf`;
                const interleaved = [];

                for (const front of frontFiles) {
                  interleaved.push(`${pdfDir}/${front}`);
                  const back = front.replace('.pdf', '_Back.pdf');
                  if (files.includes(back)) {
                    interleaved.push(`${pdfDir}/${back}`);
                  }
                }

                if (await window.electronAPI.mergePDFs(interleaved, combinedOut)) mergedPaths.push(combinedOut);
              }

              const allExist = mergedPaths.every((p) => window.electronAPI.fileExists(p));
              if (!allExist) {
                statusBox.textContent = '❌ Merged PDF(s) not found after creation.';
                return;
              }

              statusBox.textContent = '🧹 Cleaning up temporary files...';
              await delay(500);
              await window.electronAPI.cleanupBatchTemp();

              statusBox.textContent = '✅ Batch complete!';
              await delay(800);
              overlay.classList.add('hidden');
            }
          );

          cancelBtn.onclick = () => {
            stopWatching();
            overlay.classList.add('hidden');
          };

          await runBatchPages(config);
        } else {
          await window.electronAPI.runUserConfigFile(script.filePath);
        }
      };

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.className = 'edit-btn';
      editBtn.onclick = async () => {
        resetDefaults();
        const res = await fetch(`file://${script.filePath}`);
        const raw = await res.text();
        const config = {};

        for (const line of raw.split('\n')) {
          if (line.startsWith('var ')) {
            try {
              eval(line.replace('var ', 'config.'));
            } catch (e) {}
          }
        }

        localStorage.setItem('mtgProxyLastConfig', JSON.stringify(config));
        document.querySelector('[data-tab="create"]').click();
        const form = document.getElementById('createForm');

        // --- Restore Units preference before populating size fields ---
        const savedUnits = localStorage.getItem('pageUnits') || 'in';
        const unitsDropdown = document.getElementById('pageUnits');
        if (unitsDropdown) {
          unitsDropdown.value = savedUnits;
          currentDisplayUnits = savedUnits;
        }

        // STEP 1: Apply dimension-related values first
        const order = ['pageWidthInches', 'pageHeightInches', 'cardWidthMM', 'cardHeightMM'];
        order.forEach((key) => {
          if (key in config) {
            const field = form.elements[key];
            if (field) {
              if (key === 'pageWidthInches' || key === 'pageHeightInches') {
                // Config stores inches; convert to savedUnits for display
                field.value = toDisplay(config[key], savedUnits).toFixed(savedUnits === 'mm' ? 2 : 3);
              } else {
                field.value = config[key];
              }
            }
          }
        });

        // STEP 2: Update layout options based on dimensions
        try {
          window.electronAPI.writeLog(`[FIRE updateLayoutOptions] - editBtn.onclick = async ()`);
        } catch (e) {}
        updateLayoutOptions();

        // STEP 3: Apply remaining fields (but layout goes LAST)
        for (const [key, value] of Object.entries(config)) {
          if (order.includes(key)) continue; // already handled above

          const field = form.elements[key];
          if (!field) continue;

          if (key === 'layout') {
            // Skip for now — set last
            continue;
          }

          if (field.type === 'checkbox') {
            field.checked = value;
          } else {
            field.value = value;
          }
        }

        // Ensure Use Magic Registration reflects the config (string/number/boolean safe)
        if (form.useMagicVersion) {
          const v = config.useMagicVersion;
          const coerceBool = (x) => x === true || x === 'true' || x === 1 || x === '1';
          form.useMagicVersion.checked = coerceBool(v);
        }

        // STEP 4: Finally set layout
        if ('layout' in config) {
          const layoutField = form.elements['layout'];
          if (layoutField) layoutField.value = config['layout'];
        }

        if ('addPerCardAdjustLayer' in config) {
          form.addPerCardAdjustLayer.checked = !!config.addPerCardAdjustLayer;
        }

        // Toggle UI Options
        window._toggleCutMarkFields?.();
        window._toggleEdgeToEdgeFields?.();
        window._toggleGapBleedFields?.();

        document.getElementById('configName').value = script.fileName.replace('.jsx', '');
        document.getElementById('configFolder').value = folderData.folder;

        window.editingConfigContext = {
          folderName: folderData.folder,
          configName: script.fileName.replace('.jsx', '')
        };
      };

      const buttonGroup = document.createElement('div');
      buttonGroup.className = 'config-buttons';
      buttonGroup.appendChild(runBtn);
      buttonGroup.appendChild(editBtn);

      item.appendChild(info);
      item.appendChild(buttonGroup);

      content.appendChild(item);
    });

    wrapper.appendChild(header);
    wrapper.appendChild(content);
    configList.appendChild(wrapper);
  });
};

const loadSilhouetteTemplates = async () => {
  const container = document.getElementById('tab-silhouette');
  container.innerHTML = '';

  const controls = document.createElement('div');
  controls.id = 'silhouetteControls';
  controls.innerHTML = `
    <span>Sort by:</span>
    <select id="silhouetteSort">
      <option value="sortOrder">Sort Order</option>
      <option value="title">Title</option>
      <option value="tags">Tags</option>
      <option value="fileName">File Name</option>
    </select>
    <label for="silhouetteDirection">Order:</label>
    <select id="silhouetteDirection">
      <option value="asc">Asc</option>
      <option value="desc">Desc</option>
    </select>
  `;
  container.appendChild(controls);

  const list = document.createElement('div');
  list.id = 'silhouetteList';
  list.className = 'history-list';
  container.appendChild(list);

  const render = async () => {
    const data = await window.electronAPI.getSilhouetteTemplates();
    const sortKey = document.getElementById('silhouetteSort').value;
    const direction = document.getElementById('silhouetteDirection').value;

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortKey] || '';
      const bVal = b[sortKey] || '';

      const compare = sortKey === 'sortOrder' ? Number(aVal) - Number(bVal) : aVal.toString().localeCompare(bVal.toString());

      return direction === 'asc' ? compare : -compare;
    });

    const list = document.getElementById('silhouetteList');
    list.innerHTML = '';

    sorted.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'history-item';

      const info = document.createElement('div');
      info.className = 'history-info';

      const title = item.title?.trim() || item.fileName;
      const tags = item.tags?.trim() || '';
      const description = item.description?.trim() || '';
      const fileName = item.fileName;

      info.innerHTML = `
        <div><strong>${title}</strong> — ${fileName}</div>
        <div>${tags}</div>
        <div style="font-size: 0.85rem; color: #aaa; max-width: 90%; text-align: justify; text-align-last: left;">${description}</div>
      `;

      const btn = document.createElement('button');
      btn.textContent = 'Run';
      btn.onclick = () => window.electronAPI.runUserConfigFile(item.filePath);

      el.appendChild(info);
      el.appendChild(btn);
      list.appendChild(el);
    });
  };

  document.getElementById('silhouetteSort').addEventListener('change', render);
  document.getElementById('silhouetteDirection').addEventListener('change', render);

  render();
};

function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll('.config-folder:not(.dragging)')];

  return elements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

document.querySelectorAll('.tool-header').forEach((header) => {
  header.addEventListener('click', () => {
    const targetId = header.dataset.target;
    const target = document.querySelector(targetId);

    if (target.classList.contains('collapsed')) {
      target.classList.remove('collapsed');
      header.classList.remove('collapsed');
    } else {
      target.classList.add('collapsed');
      header.classList.add('collapsed');
    }
  });
});

function normalizeName(name) {
  return name
    .replace(/\.[^/.]+$/, '') // remove extension
    .replace(/\s*\[(back)\]|\s*\((back)\)|\s*\{(back)\}/i, '') // strip [Back], (Back), etc.
    .toLowerCase()
    .trim();
}

function isBackSide(name) {
  return /\[(back)\]|\((back)\)|\{(back)\}/i.test(name);
}

async function prepareBatchCardData() {
  await window.electronAPI.writeLog('****** prepareBatchCardData() started *****');

  const summaryBox = document.getElementById('batchInputSummary');
  summaryBox.textContent = '';

  const form = document.getElementById('createForm');
  const noBackImage = form.noBackImage?.checked;

  if (!window.batchCardFacePath || (!window.batchCardBackFile && !noBackImage)) {
    summaryBox.textContent = '❌ Card folder or back image missing.';
    return false;
  }

  //statusBox.textContent = "Scanning card folder for images...";
  await window.electronAPI.writeLog('Scanning card folder for images...');

  try {
    const { doubleSidedCards, singleSidedCards } = await scanCardDirectory(window.batchCardFacePath);
    await window.electronAPI.writeLog(`📂 scanCardDirectory returned: ${singleSidedCards.length} single, ${doubleSidedCards.length} double-sided cards`);
    //statusBox.textContent = `🔍 Found ${doubleSidedCards.length} double-sided and ${singleSidedCards.length} single-sided card(s).`;

    window.doubleSidedCards = doubleSidedCards;
    window.singleSidedCards = singleSidedCards;

    summaryBox.innerHTML = `✅ Found ${doubleSidedCards.length} double-sided card(s) and ${singleSidedCards.length} single-sided card(s).`;
    //statusBox.textContent = `✅ prepareBatchCardData completed: ${doubleSidedCards.length} double | ${singleSidedCards.length} single.`;

    await window.electronAPI.writeLog(`✅ prepareBatchCardData completed: ${doubleSidedCards.length} double | ${singleSidedCards.length} single.`);

    return true;
  } catch (err) {
    summaryBox.textContent = '⚠️ Failed to read card files: ' + err.message;
    await window.electronAPI.writeLog('⚠️ Failed to read card files: ' + err.message);
    return false;
  }
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Groups cards into page-sized batches based on layout
 * Output: window.pageBatches[]
 */
function createPageBatches(config) {
  const layout = config.layout || 'horizontal';
  let cardsPerPage = 8;

  if (layout === 'SevenCard') {
    cardsPerPage = 7;
  } else if (layout === 'Silhouette10Card') {
    cardsPerPage = 10;
  } else if (layout === 'horizontal') {
    cardsPerPage = 8;
  } else if (layout === 'vertical') {
    cardsPerPage = 9;
  } else if (layout === 'horizontal2x5') {
    cardsPerPage = 10;
  } else if (layout === 'horizontal2x6') {
    cardsPerPage = 12;
  } else if (layout === 'horizontal3x6') {
    cardsPerPage = 18;
  } else if (layout === 'vertical4x3') {
    cardsPerPage = 12;
  } else if (layout === 'vertical5x3') {
    cardsPerPage = 15;
  } else if (layout === 'vertical4x4') {
    cardsPerPage = 16;
  } else {
    cardsPerPage = 8; // fallback for horizontal (2x4)
  }

  const batches = [];

  // --- SINGLE-SIDED ---
  for (let i = 0; i < window.singleSidedCards.length; i += cardsPerPage) {
    const group = window.singleSidedCards.slice(i, i + cardsPerPage);

    batches.push({
      type: 'single',
      frontCards: group,
      //backCards: group.map(() => window.batchCardBackFile)
      backCards: config.noBackImage ? [] : group.map(() => window.batchCardBackFile)
    });
  }

  // --- DOUBLE-SIDED ---
  for (let i = 0; i < window.doubleSidedCards.length; i += cardsPerPage) {
    const group = window.doubleSidedCards.slice(i, i + cardsPerPage);

    batches.push({
      type: 'double',
      frontCards: group.map((c) => c.front),
      backCards: group.map((c) => c.back)
    });
  }

  window.pageBatches = batches;

  const summary = document.getElementById('batchInputSummary');
  summary.innerHTML += `<br />📄 Total Pages: ${batches.length}`;
}

function buildConfigPath(fileName) {
  return `TempConfig/${fileName}`;
}

async function runBatchPages(config) {
  await window.electronAPI.writeLog(`🔄 runBatchPages started. Total pages: ${window.pageBatches?.length || 0}`);

  if (!window.pageBatches || window.pageBatches.length === 0) {
    //statusBox.textContent = "No card batches were prepared. Please select your card folder and try again.";
    return;
  }

  const includePath = '../RE_PhotoEngine/RE_PhotoEngine.jsx';
  const tempDir = 'TempConfig';

  const { pageBatches } = window;
  const statusBox = document.getElementById('statusMessage');

  let firstFrontScript = null;
  let firstBackScript = null;

  const padded = String(config.batchNumber).padStart(3, '0');
  const outputBase = `MTG_Batch_Page`;

  if (config.separateBackPDF) {
    for (let i = 0; i < pageBatches.length; i++) {
      const batch = pageBatches[i];
      //if (batch.backCards && batch.backCards.length > 0) {
      if (!config.noBackImage && batch.backCards && batch.backCards.length > 0) {
        const firstBackName = `${outputBase}_${i + 1}_Back.jsx`;
        firstBackScript = `TempConfig/${firstBackName}`;
        break;
      }
    }
  }

  for (let i = 0; i < pageBatches.length; i++) {
    const batch = pageBatches[i];

    const frontFsPaths = batch.frontCards.map((c) => c.path);
    const backFsPaths = batch.backCards.map((c) => c.path);

    const pageNum = i + 1;

    // === Front Page ===
    const frontName = `${outputBase}_${pageNum}.jsx`;
    const padded = String(config.batchNumber).padStart(3, '0');
    const pageLabel = `Page${pageNum}`;
    const frontPdfExportPath = `PDFOutput/ProxySheet_${padded}_${pageLabel}.pdf`;

    await window.electronAPI.writeLog(` - i: ${i} | page: ${pageNum} | frontName: ${outputBase}_${pageNum}.jsx | frontPdfExportPath: PDFOutput/ProxySheet_${padded}_${pageLabel}.pdf`);

    const isLastFront = i === pageBatches.length - 1;
    const nextFrontName = `${outputBase}_${pageNum + 1}.jsx`;
    //const frontNextConfigPath = isLastFront ? "" : buildConfigPath(nextFrontName);
    const frontNextConfigPath = isLastFront ? firstBackScript || '' : buildConfigPath(nextFrontName);

    await window.electronAPI.writeLog(` - frontNextConfigPath: ${frontNextConfigPath}`);

    const frontPath = await window.electronAPI.buildBatchJsx(frontFsPaths, config, includePath, false, pageNum, frontPdfExportPath, frontName, frontNextConfigPath);

    //statusBox.textContent = `Generating Config for Page ${pageNum}...`;
    if (i === 0) {
      await window.electronAPI.writeLog(` Setting firstFrontScript: ${frontPath}`);
      firstFrontScript = frontPath;
    }

    // === Back Page (if double-sided) ===
    //if (batch.type === 'double') {
    await window.electronAPI.writeLog(` - Checking for backCards - backCards.length: ${batch.backCards.length}`);
    if (batch.backCards && batch.backCards.length > 0) {
      const padded = String(config.batchNumber).padStart(3, '0');

      await window.electronAPI.writeLog(` - Back Page - Padded: ${padded}`);

      //const pageLabel = `Page${pageNum}`;
      const backLabel = '_Back';
      //const outputName = `ProxySheet_${padded}_${pageLabel}${backLabel}.pdf`;

      //const pdfExportPath = `${pdfOutputDir}\\${outputName}`;
      const backPdfExportPath = `PDFOutput/ProxySheet_${padded}_${pageLabel}${backLabel}.pdf`;

      const backName = `${outputBase}_${pageNum}_Back.jsx`;

      await window.electronAPI.writeLog(` - Back Page i: ${i} | page: ${pageNum} | backPdfExportPath : ${backPdfExportPath} | backName: ${backName}`);

      const isLastBack = i === pageBatches.length - 1;
      const nextBackName = `${outputBase}_${pageNum + 1}_Back.jsx`;
      const backNextConfigPath = isLastBack ? '' : buildConfigPath(nextBackName);

      await window.electronAPI.writeLog(` - Setting backPath`);

      const backPath = await window.electronAPI.buildBatchJsx(backFsPaths, config, includePath, true, pageNum, backPdfExportPath, backName, backNextConfigPath);

      await window.electronAPI.writeLog(` - backPath Set`);

      if (i === 0) {
        await window.electronAPI.writeLog(` Setting firstBackScript: ${backPath}`);
        //firstBackScript = buildConfigPath(backName);
        firstBackScript = backPath;
      }

      await window.electronAPI.writeLog(` - Back Page - firstBackScript: ${firstBackScript}`);
      //statusBox.textContent = `Generating Config for Back Page ${pageNum}...`;
    }
    await window.electronAPI.writeLog(` - Loop ${i} Completed | Ready for next record`);
  }

  await window.electronAPI.writeLog(`Launching first batch script: ${firstFrontScript}`);

  if (firstFrontScript) {
    await window.electronAPI.writeLog(`▶️ Launching batch in Photoshop...`);
    await window.electronAPI.runBatchFile(firstFrontScript);
  }
}

/**
 * Scans a FileSystemDirectoryHandle for valid card images,
 * separating double-sided pairs from single-sided ones.
 * Returns: { doubleSidedCards, singleSidedCards }
 */
async function scanCardDirectory(folderPath) {
  await window.electronAPI.writeLog(`🔍 scanCardDirectory called with folder: ${folderPath}`);

  const result = await window.electronAPI.getCardImageFiles(folderPath);

  if (!result.success) {
    await window.electronAPI.writeLog(`❌ getCardImageFiles failed: ${result.message}`);
    throw new Error(result.message);
  }

  const allFiles = result.files;
  await window.electronAPI.writeLog(`📁 getCardImageFiles returned ${allFiles.length} entries`);

  const fronts = {};
  const backs = [];

  allFiles.forEach(({ name }) => {
    if (isBackSide(name)) {
      backs.push(name);
    } else {
      fronts[normalizeName(name)] = name;
    }
  });

  const doubleSidedCards = [];
  const singleSidedCards = [];

  backs.forEach((backName) => {
    const normalized = normalizeName(backName);
    const frontName = fronts[normalized];
    if (frontName) {
      doubleSidedCards.push({
        name: normalized,
        front: { name: frontName, path: `${folderPath}\\${frontName}` },
        back: { name: backName, path: `${folderPath}\\${backName}` }
      });
      delete fronts[normalized];
    }
  });

  Object.values(fronts).forEach((name) => {
    singleSidedCards.push({
      name,
      path: `${folderPath}\\${name}`
    });
  });

  return { doubleSidedCards, singleSidedCards };
}

function monitorSentinelStatus(onUpdate, onComplete) {
  const filePath = 'TempConfig/sentinal_batch_status.txt';
  let lastSeen = '';

  const interval = setInterval(async () => {
    try {
      const response = await window.electronAPI.readSentinelFile(filePath);
      if (!response.success) return;

      const content = response.content.trim();
      if (content === lastSeen) return;
      lastSeen = content;

      const lines = content.split(/\r?\n/);
      const lastLine = lines[lines.length - 1];

      onUpdate(lastLine);

      if (lastLine.trim() === 'DONE') {
        clearInterval(interval);
        onComplete();
      }
    } catch (err) {
      console.error('Sentinel watcher error:', err.message);
    }
  }, 2000);

  return () => clearInterval(interval); // return cleanup function
}

let currentDisplayUnits = 'in'; // Tracks what units the numbers in the inputs currently represent

// === Units Helpers (UI only) ===
const IN_PER_MM = 1 / 25.4;
const MM_PER_IN = 25.4;

function toInches(val, units) {
  const n = parseFloat(val || '0');
  return units === 'mm' ? n * IN_PER_MM : n;
}

function toDisplay(valInches, units) {
  return units === 'mm' ? valInches * MM_PER_IN : valInches;
}

function getPageSizeInchesFromUnits(interpretUnits) {
  const wStr = document.querySelector('input[name="pageWidthInches"]').value;
  const hStr = document.querySelector('input[name="pageHeightInches"]').value;
  const w = parseFloat(wStr || '0');
  const h = parseFloat(hStr || '0');
  if (interpretUnits === 'mm') {
    return { wIn: w / 25.4, hIn: h / 25.4 };
  }
  return { wIn: w, hIn: h };
}

function getPageSizeInches() {
  const units = document.getElementById('pageUnits')?.value || 'in';
  return getPageSizeInchesFromUnits(units);
}

// Update displayed values when units change.
function renderPageSizeForUnits(targetUnits, interpretFromUnits) {
  const interpret = interpretFromUnits || document.getElementById('pageUnits')?.value || 'in';

  const widthEl = document.querySelector('input[name="pageWidthInches"]');
  const heightEl = document.querySelector('input[name="pageHeightInches"]');

  // Read current numbers as "interpret" units -> inches
  const wNow = parseFloat(widthEl.value || '0');
  const hNow = parseFloat(heightEl.value || '0');
  const wIn = interpret === 'mm' ? wNow / 25.4 : wNow;
  const hIn = interpret === 'mm' ? hNow / 25.4 : hNow;

  // Write them back in target units
  widthEl.value = (targetUnits === 'mm' ? wIn * 25.4 : wIn).toFixed(targetUnits === 'mm' ? 2 : 3);
  heightEl.value = (targetUnits === 'mm' ? hIn * 25.4 : hIn).toFixed(targetUnits === 'mm' ? 2 : 3);

  // Update unit labels
  const wLab = document.getElementById('pageUnitLabelW');
  const hLab = document.getElementById('pageUnitLabelH');
  if (wLab) wLab.textContent = targetUnits;
  if (hLab) hLab.textContent = targetUnits;
}

function updateLayoutOptions() {
  try {
    window.electronAPI.writeLog(`[IN updateLayoutOptions - START] wIn=${wIn} hIn=${hIn}`);
  } catch (e) {
    // swallow logging errors
  }
  const layoutSelect = document.querySelector('select[name="layout"]');
  const cardwidthMM = parseFloat(document.querySelector('input[name="cardWidthMM"]').value || '69');
  const cardheightMM = parseFloat(document.querySelector('input[name="cardHeightMM"]').value || '94');
  //const width = parseFloat(document.querySelector('input[name="pageWidthInches"]').value);
  //const height = parseFloat(document.querySelector('input[name="pageHeightInches"]').value);

  const { wIn, hIn } = getPageSizeInches();
  const width = wIn;
  const height = hIn;

  try {
    window.electronAPI.writeLog(`[IN updateLayoutOptions - AFTER: const { wIn, hIn } = getPageSizeInches()] wIn=${wIn} hIn=${hIn} layoutSelect=${layoutSelect}`);
  } catch (e) {
    // swallow logging errors
  }

  let availableLayouts;

  if (cardwidthMM <= 63 && cardheightMM <= 88) {
    availableLayouts = [
      { value: 'horizontal', label: 'Horizontal (2x4)', minW: 0, minH: 0, silSupport: true },
      { value: 'vertical', label: 'Vertical (3x3)', minW: 0, minH: 0, silSupport: true },
      { value: 'horizontalAuto', label: 'Horizontal (Auto)', minW: 0, minH: 0, silSupport: false },
      { value: 'verticalAuto', label: 'Vertical (Auto)', minW: 0, minH: 0, silSupport: false },
      { value: 'SevenCard', label: 'SevenCard', minW: 0, minH: 0, silSupport: true },
      { value: 'horizontal2x5', label: 'Horizontal (2x5)', minW: 8, minH: 13, silSupport: false },
      { value: 'horizontal2x6', label: 'Horizontal (2x6)', minW: 11, minH: 16, silSupport: false },
      { value: 'horizontal3x6', label: 'Horizontal (3x6)', minW: 11, minH: 16, silSupport: false },
      { value: 'vertical4x3', label: 'Vertical (4x3)', minW: 8.27, minH: 14, silSupport: false },
      { value: 'vertical4x4', label: 'Vertical (4x4)', minW: 10.8, minH: 14, silSupport: false },
      { value: 'vertical5x3', label: 'Vertical (5x3)', minW: 10, minH: 18, silSupport: false },
      { value: 'Silhouette10Card', label: 'Silhouette Legal (10-Card)', minW: 8.5, minH: 14, silSupport: true },
      { value: 'grid5x23', label: 'Grid (5x23, 115 cards)', minW: 60, minH: 18, silSupport: false }
    ];
  } else {
    availableLayouts = [
      { value: 'horizontal', label: 'Horizontal (2x4)', minW: 0, minH: 0, silSupport: true },
      { value: 'vertical', label: 'Vertical (3x3)', minW: 0, minH: 0, silSupport: true },
      { value: 'horizontalAuto', label: 'Horizontal (Auto)', minW: 0, minH: 0, silSupport: false },
      { value: 'verticalAuto', label: 'Vertical (Auto)', minW: 0, minH: 0, silSupport: false },
      { value: 'SevenCard', label: 'SevenCard', minW: 0, minH: 0, silSupport: true },
      {
        value: 'horizontal2x5',
        label: 'Horizontal (2x5)',
        minW: 8.27,
        minH: 14,
        silSupport: false
      },
      {
        value: 'horizontal2x6',
        label: 'Horizontal (2x6)',
        minW: 11,
        minH: 16.54,
        silSupport: false
      },
      {
        value: 'horizontal3x6',
        label: 'Horizontal (3x6)',
        minW: 12,
        minH: 16.54,
        silSupport: false
      },
      { value: 'vertical4x3', label: 'Vertical (4x3)', minW: 9, minH: 16, silSupport: false },
      { value: 'vertical4x4', label: 'Vertical (4x4)', minW: 12, minH: 18, silSupport: false },
      { value: 'vertical5x3', label: 'Vertical (5x3)', minW: 11, minH: 20, silSupport: false },
      { value: 'Silhouette10Card', label: 'Silhouette Legal (10-Card)', minW: 8.5, minH: 14, silSupport: true },
      { value: 'grid5x23', label: 'Grid (5x23, 115 cards)', minW: 60, minH: 18, silSupport: false }
    ];
  }

  // If Silhouette Registration is ON, hide the Auto layouts for THIS render only.
  // Work on a local copy so we don’t mutate the base list across calls.
  const silhouetteChecked = document.querySelector('input[name="useSilhouette"]').checked;
  let list = availableLayouts.slice();

  if (silhouetteChecked) {
    list = list.filter((opt) => opt.value !== 'horizontalAuto' && opt.value !== 'verticalAuto');
  }

  // Dedupe by value in case any upstream builder appended duplicates earlier
  list = list.filter((opt, idx, arr) => arr.findIndex((o) => o.value === opt.value) === idx);

  // Preserve current selection
  const current = layoutSelect.value;
  layoutSelect.innerHTML = '';

  list.forEach((opt) => {
    if (width >= opt.minW && height >= opt.minH) {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      layoutSelect.appendChild(o);
    }
  });

  // Reselect previous layout if still valid, otherwise fall back to horizontal
  const stillExists = [...layoutSelect.options].some((o) => o.value === current);
  layoutSelect.value = stillExists ? current : 'horizontal';

  const silhouetteCheckbox = document.querySelector('input[name="useSilhouette"]');
  const selectedLayout = layoutSelect.value;
  const layoutMeta = availableLayouts.find((l) => l.value === selectedLayout);

  if (layoutMeta && layoutMeta.silSupport === false) {
    silhouetteCheckbox.checked = false;
    silhouetteCheckbox.disabled = true;
    silhouetteCheckbox.title = 'Silhouette Registration (Disabled)';
  } else {
    silhouetteCheckbox.disabled = false;
    silhouetteCheckbox.title = '';
  }
}

// Trigger on tab open
document.querySelector('[data-tab="configs"]').addEventListener('click', loadUserConfigs);
document.querySelector('[data-tab="silhouette"]').addEventListener('click', loadSilhouetteTemplates);
document.querySelector('[data-tab="create"]').addEventListener('click', updateLayoutOptions);

// Re-run the configs list when the search input changes
const configSearchInput = document.getElementById('configSearch');
if (configSearchInput) {
  configSearchInput.addEventListener('input', loadUserConfigs);
}
