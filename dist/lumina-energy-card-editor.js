/**
 * Lumina Energy Card
 * Custom Home Assistant card for energy flow visualization
 * Version: 1.0.2
 * Tested with Home Assistant 2025.12+
 */


class LuminaEnergyCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._rendered = false;
  }

  setConfig(config) {
    this._config = { ...config };
    this._rendered = false;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config || this._rendered) {
      return;
    }
    this.render();
  }

  configChanged(newConfig) {
    const event = new Event('config-changed', {
      bubbles: true,
      composed: true,
    });
    event.detail = { config: newConfig };
    this.dispatchEvent(event);
  }

  _valueChanged(ev) {
    if (!this._config || !this._hass) {
      return;
    }
    const target = ev.target;
    if (!target) return;
    
    const value = target.value;
    const key = target.configValue;

    if (this._config[key] === value) {
      return;
    }

    const newConfig = { ...this._config };
    if (value === '' || value === undefined) {
      delete newConfig[key];
    } else {
      newConfig[key] = value;
    }
    this._config = newConfig;
    this.configChanged(newConfig);
  }

  _selectChanged(ev) {
    if (!this._config || !this._hass) {
      return;
    }
    const target = ev.target;
    if (!target) return;
    
    const value = target.value;
    const key = target.configValue;

    if (this._config[key] === value) {
      return;
    }

    const newConfig = { ...this._config };
    if (value === '' || value === undefined) {
      delete newConfig[key];
    } else {
      newConfig[key] = value;
    }
    this._config = newConfig;
    this.configChanged(newConfig);
  }

  _boolChanged(ev) {
    if (!this._config || !this._hass) {
      return;
    }
    const target = ev.target;
    if (!target) return;
    
    const checked = target.checked;
    const key = target.configValue;

    const newConfig = { ...this._config };
    if (checked === false) {
      delete newConfig[key];
    } else {
      newConfig[key] = checked;
    }
    this._config = newConfig;
    this.configChanged(newConfig);
  }

  _sliderChanged(ev, min, max) {
    const target = ev.target;
    if (!target) {
      const fallback = Number.isFinite(min) ? min : 0;
      return fallback;
    }

    const raw = Number(target.value);
    const minBound = Number.isFinite(min) ? min : Number(target.min ?? raw);
    const maxBound = Number.isFinite(max) ? max : Number(target.max ?? raw);
    const stepAttr = Number(target.step);
    const stepSize = Number.isFinite(stepAttr) && stepAttr > 0 ? stepAttr : null;
    let clamped = Number.isFinite(raw) ? Math.min(Math.max(raw, minBound), maxBound) : minBound;
    if (stepSize) {
      const steps = Math.round((clamped - minBound) / stepSize);
      clamped = Math.min(Math.max(minBound + steps * stepSize, minBound), maxBound);
    }
    target.value = clamped;

    if (!this._config || !this._hass) {
      return clamped;
    }

    const key = target.configValue;
    if (Number(this._config[key]) === clamped) {
      return clamped;
    }

    const newConfig = { ...this._config };
    newConfig[key] = clamped;
    this._config = newConfig;
    this.configChanged(newConfig);
    return clamped;
  }

  _entityChanged(ev) {
    if (!this._config || !this._hass) {
      return;
    }
    const target = ev.target;
    if (!target) return;

    const value = ev.detail && ev.detail.value !== undefined ? ev.detail.value : target.value;
    const key = target.configValue;

    if (this._config[key] === value || (value === undefined && this._config[key] === undefined)) {
      return;
    }

    const newConfig = { ...this._config };
    if (!value) {
      delete newConfig[key];
    } else {
      newConfig[key] = value;
    }
    this._config = newConfig;
    this.configChanged(newConfig);
  }

  _createTextField(label, configKey, value) {
    const textField = document.createElement('ha-textfield');
    textField.label = label;
    textField.value = value || '';
    textField.configValue = configKey;
    textField.addEventListener('input', this._valueChanged.bind(this));
    return textField;
  }

  _createEntityPicker(label, configKey, value, includeDomains = ['sensor']) {
    const picker = document.createElement('ha-entity-picker');
    picker.label = label;
    picker.value = value || '';
    picker.configValue = configKey;
    picker.hass = this._hass;
    picker.includeDomains = includeDomains;
    picker.allowCustomEntity = true;
    picker.addEventListener('value-changed', this._entityChanged.bind(this));
    return picker;
  }

  _createSelect(label, configKey, value, options) {
    const select = document.createElement('ha-select');
    select.label = label;
    select.value = value || options[0][0];
    select.configValue = configKey;
    select.addEventListener('selected', this._selectChanged.bind(this));
    select.addEventListener('closed', (ev) => ev.stopPropagation());
    
    options.forEach(([val, txt]) => {
      const item = document.createElement('mwc-list-item');
      item.value = val;
      item.textContent = txt;
      select.appendChild(item);
    });
    
    return select;
  }

  _createSwitch(label, configKey, checked) {
    const container = document.createElement('div');
    container.className = 'switch-container';
    
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    
    const switchEl = document.createElement('ha-switch');
    switchEl.checked = checked || false;
    switchEl.configValue = configKey;
    switchEl.addEventListener('change', this._boolChanged.bind(this));
    
    container.appendChild(labelEl);
    container.appendChild(switchEl);
    return container;
  }

  _createSlider(label, configKey, value, min, max, step, unit) {
    const container = document.createElement('div');
    container.className = 'slider-container';

    const labelEl = document.createElement('div');
    labelEl.className = 'slider-label';

    const numeric = Number(value);
    const stepSize = Number.isFinite(step) && step > 0 ? step : null;
    let clamped = Number.isFinite(numeric) ? Math.min(Math.max(numeric, min), max) : min;
    if (stepSize) {
      const steps = Math.round((clamped - min) / stepSize);
      clamped = Math.min(Math.max(min + steps * stepSize, min), max);
    }
    labelEl.textContent = `${label}: ${clamped} ${unit}`;

    const slider = document.createElement('ha-slider');
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = clamped;
    slider.pin = true;
    slider.configValue = configKey;
    slider.addEventListener('value-changed', (ev) => {
      const updatedVal = this._sliderChanged(ev, min, max);
      labelEl.textContent = `${label}: ${updatedVal} ${unit}`;
    });

    container.appendChild(labelEl);
    container.appendChild(slider);

    return container;
  }

  render() {
    if (!this._hass || !this._config) {
      return;
    }

    const config = this._config;

    // Clear shadow root
    this.shadowRoot.innerHTML = '';
    
    // Create styles
    const style = document.createElement('style');
    style.textContent = `
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
      }
      .section-title {
        font-weight: bold;
        font-size: 1.1em;
        margin-top: 16px;
        margin-bottom: 8px;
        color: var(--primary-color);
        border-bottom: 1px solid var(--divider-color);
        padding-bottom: 4px;
      }
      ha-textfield {
        width: 100%;
      }
      ha-select {
        width: 100%;
      }
      ha-switch {
        padding: 16px 0;
      }
      .helper-text {
        font-size: 0.9em;
        color: var(--secondary-text-color);
        margin-top: -8px;
        margin-bottom: 8px;
      }
      .switch-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
      }
      .slider-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px 0;
      }
      .slider-label {
        font-size: 0.95em;
        font-weight: 500;
        color: var(--primary-text-color);
      }
    `;
    
    const container = document.createElement('div');
    container.className = 'card-config';
    
    // Card Settings Section
    const cardSettingsTitle = document.createElement('div');
    cardSettingsTitle.className = 'section-title';
    cardSettingsTitle.textContent = 'Card Settings';
    container.appendChild(cardSettingsTitle);
    
    container.appendChild(this._createTextField('Card Title', 'card_title', config.card_title || 'LUMINA ENERGY'));
    container.appendChild(this._createTextField('Background Image Path', 'background_image', config.background_image || '/local/community/lumina-energy-card/lumina_background.jpg'));
    
    const bgHelper = document.createElement('div');
    bgHelper.className = 'helper-text';
    bgHelper.textContent = 'Path to background image (e.g., /local/community/lumina-energy-card/bg.jpg)';
    container.appendChild(bgHelper);
    
    container.appendChild(this._createSelect('Language', 'language', config.language || 'en', [
      ['en', 'English'],
      ['it', 'Italiano'],
      ['de', 'Deutsch']
    ]));
    
    container.appendChild(this._createSelect('Display Unit', 'display_unit', config.display_unit || 'kW', [
      ['W', 'Watts (W)'],
      ['kW', 'Kilowatts (kW)']
    ]));

    container.appendChild(this._createSlider('Update Interval', 'update_interval', config.update_interval ?? 30, 10, 60, 10, 'seconds'));
    
    // PV Sensors Section
    const pvTitle = document.createElement('div');
    pvTitle.className = 'section-title';
    pvTitle.textContent = 'PV (Solar) Sensors';
    container.appendChild(pvTitle);
    
    const pvHelper = document.createElement('div');
    pvHelper.className = 'helper-text';
    pvHelper.textContent = 'Configure up to 6 PV/solar sensors. Only PV1 is required.';
    container.appendChild(pvHelper);
    
    container.appendChild(this._createEntityPicker('PV Sensor 1 (Required)', 'sensor_pv1', config.sensor_pv1));
    container.appendChild(this._createEntityPicker('PV Sensor 2 (Optional)', 'sensor_pv2', config.sensor_pv2));
    container.appendChild(this._createEntityPicker('PV Sensor 3 (Optional)', 'sensor_pv3', config.sensor_pv3));
    container.appendChild(this._createEntityPicker('PV Sensor 4 (Optional)', 'sensor_pv4', config.sensor_pv4));
    container.appendChild(this._createEntityPicker('PV Sensor 5 (Optional)', 'sensor_pv5', config.sensor_pv5));
    container.appendChild(this._createEntityPicker('PV Sensor 6 (Optional)', 'sensor_pv6', config.sensor_pv6));
    container.appendChild(this._createEntityPicker('Daily Production Sensor', 'sensor_daily', config.sensor_daily));
    
    // Battery Sensors Section
    const batTitle = document.createElement('div');
    batTitle.className = 'section-title';
    batTitle.textContent = 'Battery Sensors';
    container.appendChild(batTitle);
    
    const batHelper = document.createElement('div');
    batHelper.className = 'helper-text';
    batHelper.textContent = 'Configure up to 4 batteries. Each battery needs SOC and Power sensors.';
    container.appendChild(batHelper);
    
    container.appendChild(this._createEntityPicker('Battery 1 SOC', 'sensor_bat1_soc', config.sensor_bat1_soc));
    container.appendChild(this._createEntityPicker('Battery 1 Power', 'sensor_bat1_power', config.sensor_bat1_power));
    container.appendChild(this._createEntityPicker('Battery 2 SOC (Optional)', 'sensor_bat2_soc', config.sensor_bat2_soc));
    container.appendChild(this._createEntityPicker('Battery 2 Power (Optional)', 'sensor_bat2_power', config.sensor_bat2_power));
    container.appendChild(this._createEntityPicker('Battery 3 SOC (Optional)', 'sensor_bat3_soc', config.sensor_bat3_soc));
    container.appendChild(this._createEntityPicker('Battery 3 Power (Optional)', 'sensor_bat3_power', config.sensor_bat3_power));
    container.appendChild(this._createEntityPicker('Battery 4 SOC (Optional)', 'sensor_bat4_soc', config.sensor_bat4_soc));
    container.appendChild(this._createEntityPicker('Battery 4 Power (Optional)', 'sensor_bat4_power', config.sensor_bat4_power));
    
    // Other Sensors Section
    const otherTitle = document.createElement('div');
    otherTitle.className = 'section-title';
    otherTitle.textContent = 'Other Sensors';
    container.appendChild(otherTitle);
    
    container.appendChild(this._createEntityPicker('Home Load/Consumption', 'sensor_home_load', config.sensor_home_load));
    container.appendChild(this._createEntityPicker('Grid Power', 'sensor_grid_power', config.sensor_grid_power));
    
    container.appendChild(this._createSwitch('Invert Grid Values', 'invert_grid', config.invert_grid));
    
    const gridHelper = document.createElement('div');
    gridHelper.className = 'helper-text';
    gridHelper.textContent = 'Invert grid power values if import/export is reversed';
    container.appendChild(gridHelper);
    
    // EV Car Section
    const carTitle = document.createElement('div');
    carTitle.className = 'section-title';
    carTitle.textContent = 'EV Car (Optional)';
    container.appendChild(carTitle);
    
    container.appendChild(this._createEntityPicker('Car Power Sensor', 'sensor_car_power', config.sensor_car_power));
    container.appendChild(this._createEntityPicker('Car SOC Sensor', 'sensor_car_soc', config.sensor_car_soc));
    container.appendChild(this._createSwitch('Show Car SOC', 'show_car_soc', config.show_car_soc));
    container.appendChild(this._createTextField('Car SOC Color', 'car_pct_color', config.car_pct_color || '#00FFFF'));
    
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);
    this._rendered = true;
  }
}

customElements.define('lumina-energy-card-editor', LuminaEnergyCardEditor);
