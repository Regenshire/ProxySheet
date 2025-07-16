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
  saveConfigForm.reset();
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
  const configList = document.getElementById('configList');
  const data = await window.electronAPI.getUserConfigs();
  const collapseState = JSON.parse(localStorage.getItem('configCollapse') || '{}');

  configList.innerHTML = '';

  data.forEach(folderData => {
    const wrapper = document.createElement('div');
    wrapper.className = 'config-folder';

    const header = document.createElement('div');
    header.className = 'config-folder-header';
    header.textContent = folderData.folder;

    const toggleIcon = document.createElement('span');
    toggleIcon.textContent = collapseState[folderData.folder] ? '▸' : '▾';
    header.prepend(toggleIcon);

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

// Trigger on tab open
document.querySelector('[data-tab="configs"]').addEventListener('click', loadUserConfigs);
