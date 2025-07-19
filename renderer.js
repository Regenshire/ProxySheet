function debugLog(msg) {
  const logEl = document.getElementById('debug-log');
  logEl.textContent = `[DEBUG] ${msg}`;
}

// Tab switching logic
document.querySelectorAll('.tab-button').forEach(btn => {
  btn.addEventListener('click', () => {
    const selected = btn.getAttribute('data-tab');

    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.tab-panel').forEach(panel => {
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
  if (!stored) return {
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
  // When Silhouette is checked, uncheck Show Crop Marks
  document.querySelector('input[name="useSilhouette"]').addEventListener('change', (e) => {
    const cropMarksCheckbox = document.querySelector('input[name="showCropMarks"]');
    if (e.target.checked) {
      cropMarksCheckbox.checked = false;
    }
  });

  document.getElementById('paperTypeSelect').addEventListener('change', () => {
    const select = document.getElementById('paperTypeSelect');
    const width = document.querySelector('input[name="pageWidthInches"]');
    const height = document.querySelector('input[name="pageHeightInches"]');

    const presets = {
      Letter: [8.5, 11],
      A4: [8.27, 11.69],
      A3: [11.69, 16.54],
      Legal: [8.5, 14],
      Tabloid: [11, 17]
    };

    const val = select.value;
    if (presets[val]) {
      width.value = presets[val][0];
      height.value = presets[val][1];
    }
  });

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
      console.warn("⚠️ Failed to restore batch paths:", err);
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
    const config = JSON.parse(saved);
    const form = document.getElementById('createForm');

    for (const [key, value] of Object.entries(config)) {
      const field = form.elements[key];
      if (!field) continue;

      if (field.type === "checkbox") {
        field.checked = value;
      } else {
        field.value = value;
      }
    }
  } catch (err) {
    console.warn("⚠️ Failed to restore previous settings:", err);
  }
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
['setting_batchHistory', 'setting_displayBatchNumber'].forEach(id => {
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
    statusBox.className = "status-message success";
  } else {
    //statusBox.textContent = "❌ " + result.message;
    statusBox.className = "status-message error";
  }
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
  saveStatus.textContent = "";

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
  folders.forEach(folder => {
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
    saveStatus.textContent = "⚠ Invalid folder name.";
    return;
  }

  if (!validPattern.test(configName) || configName.length > 100) {
    saveStatus.textContent = "⚠ Invalid configuration name.";
    return;
  }

  const form = document.getElementById('createForm');
  const config = {};
  for (const element of form.elements) {
    if (!element.name) continue;
    config[element.name] = (element.type === "checkbox") ? element.checked : element.value;
  }

  const result = await window.electronAPI.saveUserConfig(folderName, configName, config);

  if (result.success) {
    saveStatus.textContent = "✅ Configuration saved successfully!";
    const statusBox = document.getElementById('statusMessage');
    //statusBox.textContent = "📝 Saved to: " + result.path;
    statusBox.className = "status-message success";
    setTimeout(() => saveConfigModal.classList.add('hidden'), 1000);
  } else {
    saveStatus.textContent = "❌ " + result.message;
  }

  window.editingConfigContext = null;
});

function resetDefaults() {
  const form = document.getElementById('createForm');
  form.reset();
  localStorage.removeItem('mtgProxyLastConfig');
  localStorage.removeItem('batchCardFacePath');
  localStorage.removeItem('batchCardBackFile');

  const statusBox = document.getElementById('statusMessage');
  statusBox.className = "status-message";

  window.editingConfigContext = null;
}

// Handle Reset to Defaults
document.getElementById('resetDefaultsBtn').addEventListener('click', () => {
  const confirmed = confirm("Are you sure you want to reset all settings to defaults?\nThis will clear your saved preferences.");
  if (confirmed) resetDefaults();
});


document.getElementById('createForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;

  const config = {
    layout: form.layout.value,
    pageWidthInches: parseFloat(form.pageWidthInches.value),
    pageHeightInches: parseFloat(form.pageHeightInches.value),
    dpi: parseInt(form.dpi.value),
    paperType: form.paperType.value,
    cardFormat: form.cardFormat.value,
    cardWidthMM: parseFloat(form.cardWidthMM.value),
    cardHeightMM: parseFloat(form.cardHeightMM.value),
    cutMarkSize: parseFloat(form.cutMarkSize.value),
    cutOffset: parseFloat(form.cutOffset.value),
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
    notesOn: form.notesOn.checked,
    noteFontSize: parseInt(form.noteFontSize.value),
    separateBackPDF: form.separateBackPDF.checked,
    //excludeCardSlots: form.excludeCardSlots.value.trim(),
    manualNote: form.manualNote.value,
    noBackImage: form.noBackImage.checked
  };

  if (form.batchMultiPage.checked) {
    const ok = await prepareBatchCardData();

    if (!ok) {
      //statusBox.textContent = "❌ Failed to prepare card data. Please check your folder and back image.";
      return;
    }
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
    statusBox.textContent = "🟡 Waiting for Photoshop...";

    const stopWatching = monitorSentinelStatus((line) => {
      statusBox.textContent = `🔁 ${line}`;
    }, async () => {
        statusBox.textContent = "✅ Photoshop batch complete.\nMerging PDFs...";

        const batchNum = config.batchNumber;
        const paddedBatch = String(batchNum).padStart(3, "0");

        const pdfDir = 'TempConfig/TempPDF';
        const outDir = 'PDFOutput';

        // Step 1: Read all PDFs
        const { success, files } = await window.electronAPI.readDirFiltered(pdfDir, '.pdf');
        if (!success || files.length === 0) {
          statusBox.textContent = "❌ No PDFs found to merge.";
          return;
        }

        // Step 2: Sort PDFs into fronts and backs
        const frontFiles = files.filter(f => !f.includes('_Back')).sort();
        const backFiles = files.filter(f => f.includes('_Back')).sort();

        const mergedPaths = [];

        if (config.separateBackPDF) {
          // Merge fronts
          const frontOut = `${outDir}/ProxySheet_Batch_${paddedBatch}_Front.pdf`;
          const frontPaths = frontFiles.map(f => `${pdfDir}/${f}`);
          const mergedFront = await window.electronAPI.mergePDFs(frontPaths, frontOut);
          if (mergedFront) mergedPaths.push(frontOut);

          // Merge backs
          const backOut = `${outDir}/ProxySheet_Batch_${paddedBatch}_Back.pdf`;
          const backPaths = backFiles.map(f => `${pdfDir}/${f}`);
          const mergedBack = await window.electronAPI.mergePDFs(backPaths, backOut);
          if (mergedBack) mergedPaths.push(backOut);
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
          if (merged) mergedPaths.push(combinedOut);
        }

        // Step 3: Validate output
        const allExist = mergedPaths.every(p => window.electronAPI.fileExists(p));
        if (!allExist) {
          statusBox.textContent = "❌ Merged PDF(s) not found after creation.";
          return;
        }

        statusBox.textContent = "🧹 Cleaning up temporary files...";
        await delay(500);
        await window.electronAPI.cleanupBatchTemp();

        statusBox.textContent = "✅ Batch complete!";
        await delay(800);
        overlay.classList.add('hidden');

    });

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
    statusBox.className = "status-message success";
  } else {
    //statusBox.textContent = `❌ Failed to launch script: ${result.message}`;
    statusBox.className = "status-message error";
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

    const compare = (sortKey === 'batchNumber' || sortKey === 'dpi')
      ? Number(aVal) - Number(bVal)
      : aVal.toString().localeCompare(bVal.toString());

    return direction === 'asc' ? compare : -compare;
  });

  list.innerHTML = '';

  sorted.forEach(item => {
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
    folders.forEach(el => el.classList.remove('dragging'));

    const newOrder = folders.map((el, i) => ({
      name: el.dataset.folder,
      sortOrder: i + 1
    }));

    await window.electronAPI.updateFolderSortOrder(newOrder);
  };

  const data = await window.electronAPI.getUserConfigs();
  const collapseState = JSON.parse(localStorage.getItem('configCollapse') || '{}');

  // --- apply search filter ---
  /*const query = document.getElementById('configSearch').value.trim().toLowerCase();
  const dataToRender = query
    ? data.filter(fd => {
        // 1) Match folder name or description
        const folderText = `${fd.folder} ${(fd.description||'')}`.toLowerCase();
        if (folderText.includes(query)) return true;

        // 2) Match any script’s fileName, infoText, or the rendered layout string (including “Card Back”)
        return fd.scripts.some(s => {
          // recreate exactly what you display in the UI
          const layoutString = [
            s.layout,
            s.cardFormat,
            `DPI ${s.dpi}`,
            s.cardBack ? 'Card Back' : ''
          ]
            .filter(Boolean)
            .join(' ');

          // combine fileName, infoText, and that layoutString into one search string
          const haystack = [
            s.fileName,
            s.infoText,
            layoutString
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return haystack.includes(query);
        });

      })
    : data;
*/

// --- apply search filter ---
const query = document.getElementById('configSearch').value.trim().toLowerCase();
const terms = query.split(/\s+/).filter(Boolean);

// Build filtered list where each folder only contains matching scripts
const dataToRender = query
  ? data
      .map(fd => {
        const filteredScripts = fd.scripts.filter(s => {
          const visibleLayoutLine = [
            s.layout,
            s.cardFormat,
            `DPI ${s.dpi}`,
            s.cardBack ? 'Card Back' : ''
          ].filter(Boolean).join(' ').toLowerCase();

          const visibleText = [
            s.fileName,
            s.infoText,
            visibleLayoutLine
          ].filter(Boolean).join(' ').toLowerCase();

          return terms.every(term => visibleText.includes(term));
        });

        if (filteredScripts.length > 0) {
          return { ...fd, scripts: filteredScripts };
        }

        return null;
      })
      .filter(Boolean)
  : data;


  configList.innerHTML = '';

  dataToRender.forEach(folderData => {

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

    folderData.scripts.forEach(script => {
      const item = document.createElement('div');
      item.className = 'config-script';

      const info = document.createElement('div');
      info.className = 'config-info';
      const layoutLine = [
        script.paperType && script.paperType !== 'Custom' ? `${script.paperType}` : null,
        script.layout,
        script.cardFormat,
        `DPI ${script.dpi}`,
        script.cardBack === true ? 'Card Back' : null
      ].filter(Boolean).join(', ');

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
          statusBox.textContent = "🟡 Waiting for Photoshop...";

          const stopWatching = monitorSentinelStatus((line) => {
            statusBox.textContent = `🔁 ${line}`;
          }, async () => {
            statusBox.textContent = "✅ Photoshop batch complete.\nMerging PDFs...";

            const batchNum = config.batchNumber;
            const paddedBatch = String(batchNum).padStart(3, "0");
            const pdfDir = 'TempConfig/TempPDF';
            const outDir = 'PDFOutput';

            const { success, files } = await window.electronAPI.readDirFiltered(pdfDir, '.pdf');
            if (!success || files.length === 0) {
              statusBox.textContent = "❌ No PDFs found to merge.";
              return;
            }

            const frontFiles = files.filter(f => !f.includes('_Back')).sort();
            const backFiles = files.filter(f => f.includes('_Back')).sort();

            const mergedPaths = [];

            if (config.separateBackPDF) {
              const frontOut = `${outDir}/ProxySheet_Batch_${paddedBatch}_Front.pdf`;
              const backOut = `${outDir}/ProxySheet_Batch_${paddedBatch}_Back.pdf`;

              const frontPaths = frontFiles.map(f => `${pdfDir}/${f}`);
              const backPaths = backFiles.map(f => `${pdfDir}/${f}`);

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

            const allExist = mergedPaths.every(p => window.electronAPI.fileExists(p));
            if (!allExist) {
              statusBox.textContent = "❌ Merged PDF(s) not found after creation.";
              return;
            }

            statusBox.textContent = "🧹 Cleaning up temporary files...";
            await delay(500);
            await window.electronAPI.cleanupBatchTemp();

            statusBox.textContent = "✅ Batch complete!";
            await delay(800);
            overlay.classList.add('hidden');
          });

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
        for (const [key, value] of Object.entries(config)) {
          const field = form.elements[key];
          if (!field) continue;
          if (field.type === 'checkbox') field.checked = value;
          else field.value = value;
        }

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

      const compare = (sortKey === 'sortOrder')
        ? Number(aVal) - Number(bVal)
        : aVal.toString().localeCompare(bVal.toString());

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

  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

document.querySelectorAll('.tool-header').forEach(header => {
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
    .replace(/\.[^/.]+$/, "") // remove extension
    .replace(/\s*\[(back)\]|\s*\((back)\)|\s*\{(back)\}/i, "") // strip [Back], (Back), etc.
    .toLowerCase()
    .trim();
}

function isBackSide(name) {
  return /\[(back)\]|\((back)\)|\{(back)\}/i.test(name);
}

async function prepareBatchCardData() {
  await window.electronAPI.writeLog("****** prepareBatchCardData() started *****");
  
  const summaryBox = document.getElementById('batchInputSummary');
  summaryBox.textContent = '';
  
  const form = document.getElementById('createForm');
  const noBackImage = form.noBackImage?.checked;

  if (!window.batchCardFacePath || (!window.batchCardBackFile && !noBackImage)) {
    summaryBox.textContent = "❌ Card folder or back image missing.";
    return false;
  }

  //statusBox.textContent = "Scanning card folder for images...";
  await window.electronAPI.writeLog("Scanning card folder for images...");

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
    summaryBox.textContent = "⚠️ Failed to read card files: " + err.message;
    await window.electronAPI.writeLog("⚠️ Failed to read card files: " + err.message);
    return false;
  }
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}


/**
 * Groups cards into page-sized batches based on layout
 * Output: window.pageBatches[]
 */
function createPageBatches(config) {
  const layout = config.layout || 'horizontal';
  let cardsPerPage = 8;

  if (layout === 'vertical') cardsPerPage = 9;
  else if (layout === 'SevenCard') cardsPerPage = 7;

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
      frontCards: group.map(c => c.front),
      backCards: group.map(c => c.back)
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

  const padded = String(config.batchNumber).padStart(3, "0");
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

  /*
  if (config.separateBackPDF && pageBatches.length > 0) {
    const firstBackName = `${outputBase}_1_Back.jsx`;
    firstBackScript = buildConfigPath(firstBackName);
  }
    */

  for (let i = 0; i < pageBatches.length; i++) {
    const batch = pageBatches[i];

    const frontFsPaths = batch.frontCards.map(c => c.path);
    const backFsPaths = batch.backCards.map(c => c.path);

    const pageNum = i + 1;

    // === Front Page ===
    const frontName = `${outputBase}_${pageNum}.jsx`;
    const padded = String(config.batchNumber).padStart(3, "0");
    const pageLabel = `Page${pageNum}`;
    const frontPdfExportPath = `PDFOutput/ProxySheet_${padded}_${pageLabel}.pdf`;

    await window.electronAPI.writeLog(` - i: ${i} | page: ${pageNum} | frontName: ${outputBase}_${pageNum}.jsx | frontPdfExportPath: PDFOutput/ProxySheet_${padded}_${pageLabel}.pdf`);

    const isLastFront = i === pageBatches.length - 1;
    const nextFrontName = `${outputBase}_${pageNum + 1}.jsx`;
    //const frontNextConfigPath = isLastFront ? "" : buildConfigPath(nextFrontName);
    const frontNextConfigPath = isLastFront
      ? (firstBackScript || "")
      : buildConfigPath(nextFrontName);

    await window.electronAPI.writeLog(` - frontNextConfigPath: ${frontNextConfigPath}`);

    const frontPath = await window.electronAPI.buildBatchJsx(
      frontFsPaths,
      config,
      includePath,
      false,
      pageNum,
      frontPdfExportPath,
      frontName,
      frontNextConfigPath
    );

    //statusBox.textContent = `Generating Config for Page ${pageNum}...`;
    if (i === 0) {
      await window.electronAPI.writeLog(` Setting firstFrontScript: ${frontPath}`);
      firstFrontScript = frontPath;
    }

    // === Back Page (if double-sided) ===
    //if (batch.type === 'double') {
    await window.electronAPI.writeLog(` - Checking for backCards - backCards.length: ${batch.backCards.length}`);
    if (batch.backCards && batch.backCards.length > 0) {
      const padded = String(config.batchNumber).padStart(3, "0");

      await window.electronAPI.writeLog(` - Back Page - Padded: ${padded}`);

      //const pageLabel = `Page${pageNum}`;
      const backLabel = "_Back";
      //const outputName = `ProxySheet_${padded}_${pageLabel}${backLabel}.pdf`;

      //const pdfExportPath = `${pdfOutputDir}\\${outputName}`;
      const backPdfExportPath = `PDFOutput/ProxySheet_${padded}_${pageLabel}${backLabel}.pdf`;

      const backName = `${outputBase}_${pageNum}_Back.jsx`;

      await window.electronAPI.writeLog(` - Back Page i: ${i} | page: ${pageNum} | backPdfExportPath : ${backPdfExportPath } | backName: ${backName}`);


      const isLastBack = i === pageBatches.length - 1;
      const nextBackName = `${outputBase}_${pageNum + 1}_Back.jsx`;
      const backNextConfigPath = isLastBack ? "" : buildConfigPath(nextBackName);

      await window.electronAPI.writeLog(` - Setting backPath`);

      const backPath = await window.electronAPI.buildBatchJsx(
        backFsPaths,
        config,
        includePath,
        true,
        pageNum,
        backPdfExportPath,
        backName,
        backNextConfigPath
      );

      await window.electronAPI.writeLog(` - backPath Set`);
      
      if (i === 0) {
        await window.electronAPI.writeLog(` Setting firstBackScript: ${frontPath}`);
        //firstBackScript = buildConfigPath(backName);
        firstBackScript = backPath;
      }

      await window.electronAPI.writeLog(` - Back Page - firstBackScript: ${firstBackScript}`);      
      //statusBox.textContent = `Generating Config for Back Page ${pageNum}...`;
    }
    await window.electronAPI.writeLog(` - Loop ${i} Completed | Ready for next record`);
  }

  //statusBox.textContent = `✅ All batch config pages generated successfully.`;
  //await window.electronAPI.runBatchFile(backPath);
  //await delay(1500);
  //statusBox.textContent = 'First script to run: ' + firstFrontScript;
  await window.electronAPI.writeLog(`Launching first batch script: ${firstFrontScript}`);

  if (firstFrontScript) {
    //statusBox.textContent = `▶️ Launching batch in Photoshop...`;
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

  backs.forEach(backName => {
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

  Object.values(fronts).forEach(name => {
    singleSidedCards.push({
      name,
      path: `${folderPath}\\${name}`
    });
  });

  return { doubleSidedCards, singleSidedCards };
}

function monitorSentinelStatus(onUpdate, onComplete) {
  const filePath = 'TempConfig/sentinal_batch_status.txt';
  let lastSeen = "";

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

      if (lastLine.trim() === "DONE") {
        clearInterval(interval);
        onComplete();
      }
    } catch (err) {
      console.error("Sentinel watcher error:", err.message);
    }
  }, 2000);

  return () => clearInterval(interval); // return cleanup function
}

// Trigger on tab open
document.querySelector('[data-tab="configs"]').addEventListener('click', loadUserConfigs);
document.querySelector('[data-tab="silhouette"]').addEventListener('click', loadSilhouetteTemplates);

// Re-run the configs list when the search input changes
const configSearchInput = document.getElementById('configSearch');
if (configSearchInput) {
  configSearchInput.addEventListener('input', loadUserConfigs);
}