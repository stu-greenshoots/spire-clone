import { useState, useCallback, useEffect, useRef } from 'react';
import { audioManager } from '../systems/audioSystem';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../systems/settingsSystem';
import { downloadExport, importAllData } from '../systems/saveSystem';

function Settings() {
  const [settings, setSettings] = useState(() => loadSettings());

  // Sync audio manager with loaded settings on mount
  useEffect(() => {
    audioManager.setMasterVolume(settings.masterVolume);
    audioManager.setSFXVolume(settings.sfxVolume);
    audioManager.setMusicVolume(settings.musicVolume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  const handleMasterChange = useCallback((e) => {
    const value = parseFloat(e.target.value);
    updateSetting('masterVolume', value);
    audioManager.setMasterVolume(value);
  }, [updateSetting]);

  const handleSfxChange = useCallback((e) => {
    const value = parseFloat(e.target.value);
    updateSetting('sfxVolume', value);
    audioManager.setSFXVolume(value);
  }, [updateSetting]);

  const handleMusicChange = useCallback((e) => {
    const value = parseFloat(e.target.value);
    updateSetting('musicVolume', value);
    audioManager.setMusicVolume(value);
  }, [updateSetting]);

  const handleMuteToggle = useCallback(() => {
    audioManager.toggleMute();
  }, []);

  const handleResetDefaults = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
    saveSettings({ ...DEFAULT_SETTINGS });
    audioManager.setMasterVolume(DEFAULT_SETTINGS.masterVolume);
    audioManager.setSFXVolume(DEFAULT_SETTINGS.sfxVolume);
    audioManager.setMusicVolume(DEFAULT_SETTINGS.musicVolume);
  }, []);

  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);

  const handleExport = useCallback(() => {
    downloadExport();
  }, []);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = importAllData(evt.target.result);
      if (result.success) {
        setImportStatus(`Restored ${result.keysRestored} data entries. Reload to apply.`);
        // Reload settings into current component
        setSettings(loadSettings());
      } else {
        setImportStatus(result.error);
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be re-selected
    e.target.value = '';
  }, []);

  const containerStyle = {
    ...styles.container,
    fontSize: settings.textSize === 'large' ? '1.1rem' : '1rem'
  };

  return (
    <div className="settings-panel" style={containerStyle}>
      <h2 style={styles.title}>Settings</h2>

      {/* Audio Section */}
      <h3 style={styles.sectionTitle}>Audio</h3>

      <div style={styles.setting}>
        <label style={styles.label}>
          Master Volume: {Math.round(settings.masterVolume * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={settings.masterVolume}
          onChange={handleMasterChange}
          style={styles.slider}
          aria-label="Master Volume"
        />
      </div>

      <div style={styles.setting}>
        <label style={styles.label}>
          SFX Volume: {Math.round(settings.sfxVolume * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={settings.sfxVolume}
          onChange={handleSfxChange}
          style={styles.slider}
          aria-label="SFX Volume"
        />
      </div>

      <div style={styles.setting}>
        <label style={styles.label}>
          Music Volume: {Math.round(settings.musicVolume * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={settings.musicVolume}
          onChange={handleMusicChange}
          style={styles.slider}
          aria-label="Music Volume"
        />
      </div>

      <div style={styles.setting}>
        <button
          onClick={handleMuteToggle}
          style={styles.muteButton}
          aria-label="Toggle Mute"
        >
          Mute / Unmute All
        </button>
      </div>

      {/* Gameplay Section */}
      <h3 style={styles.sectionTitle}>Gameplay</h3>

      <div style={styles.setting}>
        <label style={styles.label}>Animation Speed</label>
        <select
          value={settings.animationSpeed}
          onChange={(e) => updateSetting('animationSpeed', e.target.value)}
          style={styles.select}
          aria-label="Animation Speed"
        >
          <option value="normal">Normal</option>
          <option value="fast">Fast</option>
          <option value="instant">Instant</option>
        </select>
      </div>

      <div style={styles.setting}>
        <label style={styles.toggleRow}>
          <span style={styles.toggleLabel}>Screen Shake</span>
          <input
            type="checkbox"
            checked={settings.screenShake}
            onChange={(e) => updateSetting('screenShake', e.target.checked)}
            style={styles.checkbox}
            aria-label="Screen Shake"
          />
          <span style={styles.toggleStatus}>
            {settings.screenShake ? 'On' : 'Off'}
          </span>
        </label>
      </div>

      <div style={styles.setting}>
        <label style={styles.toggleRow}>
          <span style={styles.toggleLabel}>Confirm End Turn</span>
          <input
            type="checkbox"
            checked={settings.confirmEndTurn}
            onChange={(e) => updateSetting('confirmEndTurn', e.target.checked)}
            style={styles.checkbox}
            aria-label="Confirm End Turn"
          />
          <span style={styles.toggleStatus}>
            {settings.confirmEndTurn ? 'On' : 'Off'}
          </span>
        </label>
      </div>

      <div style={styles.setting}>
        <label style={styles.toggleRow}>
          <span style={styles.toggleLabel}>Show Damage Numbers</span>
          <input
            type="checkbox"
            checked={settings.showDamageNumbers}
            onChange={(e) => updateSetting('showDamageNumbers', e.target.checked)}
            style={styles.checkbox}
            aria-label="Show Damage Numbers"
          />
          <span style={styles.toggleStatus}>
            {settings.showDamageNumbers ? 'On' : 'Off'}
          </span>
        </label>
      </div>

      {/* Accessibility Section */}
      <h3 style={styles.sectionTitle}>Accessibility</h3>

      <div style={styles.setting}>
        <label style={styles.label}>Text Size</label>
        <select
          value={settings.textSize}
          onChange={(e) => updateSetting('textSize', e.target.value)}
          style={styles.select}
          aria-label="Text Size"
        >
          <option value="normal">Normal</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div style={styles.setting}>
        <label style={styles.toggleRow}>
          <span style={styles.toggleLabel}>High Contrast Mode</span>
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={(e) => updateSetting('highContrast', e.target.checked)}
            style={styles.checkbox}
            aria-label="High Contrast Mode"
          />
          <span style={styles.toggleStatus}>
            {settings.highContrast ? 'On' : 'Off'}
          </span>
        </label>
      </div>

      {/* Data Management Section */}
      <h3 style={styles.sectionTitle}>Data</h3>

      <div style={styles.setting}>
        <button
          onClick={handleExport}
          style={styles.muteButton}
          aria-label="Export Save Data"
        >
          Export Save Data
        </button>
      </div>

      <div style={styles.setting}>
        <button
          onClick={handleImportClick}
          style={styles.muteButton}
          aria-label="Import Save Data"
        >
          Import Save Data
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFile}
          style={{ display: 'none' }}
          aria-label="Import file input"
        />
      </div>

      {importStatus && (
        <div style={{ ...styles.setting, color: importStatus.includes('Restored') ? '#4caf50' : '#f44336', fontSize: '0.85rem' }}>
          {importStatus}
        </div>
      )}

      {/* Reset */}
      <div style={{ ...styles.setting, marginTop: '24px' }}>
        <button
          onClick={handleResetDefaults}
          style={styles.resetButton}
          aria-label="Reset to Defaults"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
    color: '#eee',
    maxWidth: '450px',
    margin: '0 auto',
    maxHeight: '70vh',
    overflowY: 'auto'
  },
  title: {
    marginBottom: '20px',
    textAlign: 'center',
    color: '#fff',
    fontSize: '1.4rem'
  },
  sectionTitle: {
    marginTop: '20px',
    marginBottom: '12px',
    color: '#aaa',
    fontSize: '1rem',
    borderBottom: '1px solid #333',
    paddingBottom: '6px'
  },
  setting: {
    marginBottom: '14px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '0.9rem',
    color: '#ccc'
  },
  slider: {
    width: '100%',
    cursor: 'pointer'
  },
  select: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #444',
    backgroundColor: '#2a2a4e',
    color: '#eee',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer'
  },
  toggleLabel: {
    fontSize: '0.9rem',
    color: '#ccc',
    flex: 1
  },
  toggleStatus: {
    fontSize: '0.85rem',
    color: '#888',
    marginLeft: '8px',
    minWidth: '28px'
  },
  checkbox: {
    cursor: 'pointer',
    width: '18px',
    height: '18px'
  },
  muteButton: {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    backgroundColor: '#555'
  },
  resetButton: {
    width: '100%',
    padding: '10px',
    border: '1px solid #666',
    borderRadius: '4px',
    color: '#ccc',
    fontSize: '0.9rem',
    cursor: 'pointer',
    backgroundColor: 'transparent'
  }
};

export default Settings;
