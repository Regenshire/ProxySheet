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
  statusBox.textContent = "⏳ Running conversion...";

  const result = await window.electronAPI.generateJSX(config);

  if (result.success) {
    statusBox.textContent = "✅ Conversion script launched in Photoshop.";
    statusBox.className = "status-message success";
  } else {
    statusBox.textContent = "❌ " + result.message;
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
    statusBox.textContent = "📝 Saved to: " + result.path;
    statusBox.className = "status-message success";
    setTimeout(() => saveConfigModal.classList.add('hidden'), 1000);
  } else {
    saveStatus.textContent = "❌ " + result.message;
  }

  window.editingConfigContext = null;
});

// Handle Reset to Defaults
document.getElementById('resetDefaultsBtn').addEventListener('click', () => {
  const confirmed = confirm("Are you sure you want to reset all settings to defaults?\nThis will clear your saved preferences.");
  if (!confirmed) return;

  const form = document.getElementById('createForm');
  form.reset();
  localStorage.removeItem('mtgProxyLastConfig');

  const statusBox = document.getElementById('statusMessage');
  statusBox.textContent = "↩️ Settings have been reset to defaults.";
  statusBox.className = "status-message";

  window.editingConfigContext = null;
});


document.getElementById('createForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;

  const config = {
    layout: form.layout.value,
    pageWidthInches: parseFloat(form.pageWidthInches.value),
    pageHeightInches: parseFloat(form.pageHeightInches.value),
    dpi: parseInt(form.dpi.value),
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
    manualNote: form.manualNote.value
  };

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
    statusBox.textContent = "✅ Photoshop script launched successfully.";
    statusBox.className = "status-message success";
  } else {
    statusBox.textContent = `❌ Failed to launch script: ${result.message}`;
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

  configList.innerHTML = '';

  data.forEach(folderData => {
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
      runBtn.onclick = () => window.electronAPI.runUserConfigFile(script.filePath);

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.className = 'edit-btn';
      editBtn.onclick = async () => {
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

// Trigger on tab open
document.querySelector('[data-tab="configs"]').addEventListener('click', loadUserConfigs);
document.querySelector('[data-tab="silhouette"]').addEventListener('click', loadSilhouetteTemplates);

