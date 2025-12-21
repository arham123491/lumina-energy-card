/**
 * Lumina Energy Card
 * Custom Home Assistant card for energy flow visualization
 * Version: 1.0.5
 * Tested with Home Assistant 2025.12+
 */

class LuminaEnergyCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._lastRender = 0;
    this._forceRender = false;
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
    this._forceRender = true;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.config) {
      return;
    }
    if (this._isEditorActive()) {
      if (this._forceRender) {
        this.render();
      }
      this._forceRender = false;
      return;
    }
    const now = Date.now();
    const configuredInterval = Number(this.config.update_interval);
    const intervalSeconds = Number.isFinite(configuredInterval) ? configuredInterval : 30;
    const clampedSeconds = Math.min(Math.max(intervalSeconds, 10), 60);
    const intervalMs = clampedSeconds * 1000;
    if (this._forceRender || !this._lastRender || now - this._lastRender >= intervalMs) {
      this.render();
      this._forceRender = false;
    }
  }

  getCardSize() {
    return 5;
  }

  static async getConfigElement() {
    return document.createElement('lumina-energy-card-editor');
  }

  static getStubConfig() {
    return {
      language: 'en',
      card_title: 'LUMINA ENERGY',
      background_image: '/local/community/lumina-energy-card/lumina_background.jpg',
      header_font_size: 16,
      daily_label_font_size: 12,
      daily_value_font_size: 20,
      pv_font_size: 16,
      battery_soc_font_size: 20,
      battery_power_font_size: 14,
      load_font_size: 15,
      grid_font_size: 15,
      car_power_font_size: 15,
      car_soc_font_size: 12,
      animation_speed_factor: 1,
      sensor_pv1: '',
      sensor_daily: '',
      sensor_bat1_soc: '',
      sensor_bat1_power: '',
      sensor_home_load: '',
      sensor_grid_power: '',
      display_unit: 'kW',
      update_interval: 30
    };
  }

  _isEditorActive() {
    return Boolean(this.closest('hui-card-preview'));
  }

  getStateSafe(entity_id) {
    if (!entity_id || !this._hass.states[entity_id] || 
        this._hass.states[entity_id].state === 'unavailable' || 
        this._hass.states[entity_id].state === 'unknown') {
      return 0;
    }
    
    let value = parseFloat(this._hass.states[entity_id].state);
    const unit = this._hass.states[entity_id].attributes.unit_of_measurement;
    
    if (unit && (unit.toLowerCase() === 'kw' || unit.toLowerCase() === 'kwh')) {
      value = value * 1000;
    }
    
    return value;
  }

  formatPower(watts, use_kw) {
    if (use_kw) {
      return (watts / 1000).toFixed(2) + ' kW';
    }
    return Math.round(watts) + ' W';
  }

  render() {
    if (!this._hass || !this.config) return;

    const config = this.config;
    this._lastRender = Date.now();
    
    // Get PV sensors
    const pv_sensors = [
      config.sensor_pv1, config.sensor_pv2, config.sensor_pv3,
      config.sensor_pv4, config.sensor_pv5, config.sensor_pv6
    ].filter(s => s && s !== '');

    // Calculate PV totals
    let total_pv_w = 0;
    let pv1_val = 0, pv2_val = 0;
    pv_sensors.forEach((sensor, i) => {
      const val = this.getStateSafe(sensor);
      total_pv_w += val;
      if (i === 0) pv1_val = val;
      if (i === 1) pv2_val = val;
    });

    // Get battery configs
    const bat_configs = [
      { soc: config.sensor_bat1_soc, pow: config.sensor_bat1_power },
      { soc: config.sensor_bat2_soc, pow: config.sensor_bat2_power },
      { soc: config.sensor_bat3_soc, pow: config.sensor_bat3_power },
      { soc: config.sensor_bat4_soc, pow: config.sensor_bat4_power }
    ].filter(b => b.soc && b.soc !== '');

    // Calculate battery totals
    let total_bat_w = 0;
    let total_soc = 0;
    let active_bat_count = 0;
    
    bat_configs.forEach(b => {
      if (this._hass.states[b.soc] && this._hass.states[b.soc].state !== 'unavailable') {
        total_soc += this.getStateSafe(b.soc);
        total_bat_w += this.getStateSafe(b.pow);
        active_bat_count++;
      }
    });
    
    const avg_soc = active_bat_count > 0 ? Math.round(total_soc / active_bat_count) : 0;

    // Get other sensors
    const grid_raw = this.getStateSafe(config.sensor_grid_power);
    const grid = config.invert_grid ? (grid_raw * -1) : grid_raw;
    const load = this.getStateSafe(config.sensor_home_load);
    const daily_raw = this.getStateSafe(config.sensor_daily);
    const total_daily_kwh = (daily_raw / 1000).toFixed(1);

    // EV Car
    const car_w = config.sensor_car_power ? this.getStateSafe(config.sensor_car_power) : 0;
    const car_soc = config.sensor_car_soc ? this.getStateSafe(config.sensor_car_soc) : null;

    // Display settings
    const bg_img = config.background_image || '/local/community/lumina-energy-card/lumina_background.jpg';
    const display_unit = config.display_unit || 'W';
    const use_kw = display_unit.toUpperCase() === 'KW';
    const title_text = config.card_title || 'LUMINA ENERGY';

    const clampValue = (value, min, max, fallback) => {
      const num = Number(value);
      if (!Number.isFinite(num)) {
        return fallback;
      }
      return Math.min(Math.max(num, min), max);
    };

    const header_font_size = clampValue(config.header_font_size, 12, 32, 16);
    const daily_label_font_size = clampValue(config.daily_label_font_size, 8, 24, 12);
    const daily_value_font_size = clampValue(config.daily_value_font_size, 12, 32, 20);
    const pv_font_size = clampValue(config.pv_font_size, 12, 28, 16);
    const battery_soc_font_size = clampValue(config.battery_soc_font_size, 12, 32, 20);
    const battery_power_font_size = clampValue(config.battery_power_font_size, 10, 28, 14);
    const load_font_size = clampValue(config.load_font_size, 10, 28, 15);
    const grid_font_size = clampValue(config.grid_font_size, 10, 28, 15);
    const car_power_font_size = clampValue(config.car_power_font_size, 10, 28, 15);
    const car_soc_font_size = clampValue(config.car_soc_font_size, 8, 24, 12);
    const animation_speed_factor = clampValue(config.animation_speed_factor, 0.25, 4, 1);

    // Language
    const lang = config.language || 'en';
    const dict_daily = { it: 'PRODUZIONE OGGI', en: 'DAILY YIELD', de: 'TAGESERTRAG' };
    const dict_pv_tot = { it: 'PV TOT', en: 'PV TOT', de: 'PV GES' };
    const label_daily = dict_daily[lang] || dict_daily['en'];
    const label_pv_tot = dict_pv_tot[lang] || dict_pv_tot['en'];

    // 3D coordinates
    const BAT_X = 260, BAT_Y_BASE = 350, BAT_W = 55, BAT_MAX_H = 84;
    const current_h = (avg_soc / 100) * BAT_MAX_H;
    const bat_transform = `translate(${BAT_X}, ${BAT_Y_BASE}) rotate(-6) skewX(-4) skewY(30) translate(-${BAT_X}, -${BAT_Y_BASE})`;

    // Text positions
    const T_SOLAR_X = 177, T_SOLAR_Y = 320;
    const T_BAT_X = 245, T_BAT_Y = 375;
    const T_HOME_X = 460, T_HOME_Y = 245;
    const T_GRID_X = 580, T_GRID_Y = 90;
    const T_CAR_X = 590, T_CAR_Y = 305;

    const getTxtTrans = (x, y, r, sx, sy) => 
      `translate(${x}, ${y}) rotate(${r}) skewX(${sx}) skewY(${sy}) translate(-${x}, -${y})`;

    const trans_solar = getTxtTrans(T_SOLAR_X, T_SOLAR_Y, -16, -20, 0);
    const trans_bat = getTxtTrans(T_BAT_X, T_BAT_Y, -25, -25, 5);
    const trans_home = getTxtTrans(T_HOME_X, T_HOME_Y, -20, -20, 3);
    const trans_grid = getTxtTrans(T_GRID_X, T_GRID_Y, -8, -10, 0);
    const trans_car = getTxtTrans(T_CAR_X, T_CAR_Y, 16, 20, 0);

    // Animation durations
    const getDur = (watts) => {
      const w = Math.abs(watts);
      if (w < 10) return '0s';
      const base = 30.0 - (Math.min(w / 6000, 1) * 29.5);
      const scaled = base / animation_speed_factor;
      return scaled.toFixed(2) + 's';
    };

    const dur_pv1 = getDur(total_pv_w);
    const dur_pv2 = getDur(total_pv_w);
    const show_double_flow = (pv_sensors.length >= 2 && total_pv_w > 10);
    const dur_bat = getDur(total_bat_w);
    const dur_load = getDur(load);
    const dur_grid = getDur(grid);
    const dur_car = getDur(car_w);

    // Colors and classes
    const C_CYAN = '#00FFFF', C_BLUE = '#0088FF', C_WHITE = '#FFFFFF', C_RED = '#FF3333';
    const pv1_class = (total_pv_w > 10) ? 'flow-pv1' : '';
    const pv2_class = show_double_flow ? 'flow-pv2' : '';
    const load_class = (load > 10) ? 'flow-generic' : '';
    const car_class = (car_w > 10) ? 'flow-generic' : '';
    const bat_class = (total_bat_w > 10) ? 'flow-generic' : (total_bat_w < -10) ? 'flow-reverse' : '';
    const bat_col = (total_bat_w >= 0) ? C_CYAN : C_WHITE;
    const grid_class = (grid > 10) ? 'flow-grid-import' : (grid < -10) ? 'flow-generic' : '';
    const grid_col = (grid > 10) ? C_RED : C_CYAN;
    const liquid_fill = (avg_soc < 25) ? 'rgba(255, 50, 50, 0.85)' : 'rgba(0, 255, 255, 0.85)';

    // SVG paths
    const PATH_PV1 = 'M 250 237 L 282 230 L 420 280';
    const PATH_PV2 = 'M 200 205 L 282 238 L 420 288';
    const PATH_BAT_INV = 'M 423 310 L 325 350';
    const PATH_LOAD = 'M 471 303 L 550 273 L 380 220';
    const PATH_GRID = 'M 470 280 L 575 240 L 575 223';
    const PATH_CAR = 'M 475 329 L 490 335 L 600 285';

    // PV text
    const TxtStyle = 'font-weight:bold; font-family: sans-serif; text-anchor:middle; text-shadow: 0 0 5px black;';
    let pv_text_html = '';
    
    if (pv_sensors.length === 2) {
      pv_text_html = `
        <text x="${T_SOLAR_X}" y="${T_SOLAR_Y - 10}" transform="${trans_solar}" fill="${C_CYAN}" font-size="${pv_font_size}" style="${TxtStyle}">S1: ${this.formatPower(pv1_val, use_kw)}</text>
        <text x="${T_SOLAR_X}" y="${T_SOLAR_Y + 10}" transform="${trans_solar}" fill="${C_BLUE}" font-size="${pv_font_size}" style="${TxtStyle}">S2: ${this.formatPower(pv2_val, use_kw)}</text>
      `;
    } else if (pv_sensors.length > 2) {
      pv_text_html = `<text x="${T_SOLAR_X}" y="${T_SOLAR_Y}" transform="${trans_solar}" fill="${C_CYAN}" font-size="${pv_font_size}" style="${TxtStyle}">${label_pv_tot}: ${this.formatPower(total_pv_w, use_kw)}</text>`;
    } else {
      pv_text_html = `<text x="${T_SOLAR_X}" y="${T_SOLAR_Y}" transform="${trans_solar}" fill="${C_CYAN}" font-size="${pv_font_size}" style="${TxtStyle}">${this.formatPower(total_pv_w, use_kw)}</text>`;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          aspect-ratio: 16/9;
        }
        ha-card {
          height: 100%;
          overflow: hidden;
          background: transparent;
          border: none;
          box-shadow: none;
        }
        .track-path { stroke: #555555; stroke-width: 2px; fill: none; opacity: 0; }
        .flow-path { stroke-dasharray: 8 16; stroke-linecap: round; stroke-width: 3px; fill: none; opacity: 0; transition: all 0.5s ease; }
        @keyframes laser-flow { to { stroke-dashoffset: -320; } }
        @keyframes pulse-cyan { 0% { filter: drop-shadow(0 0 2px #00FFFF); opacity: 0.9; } 50% { filter: drop-shadow(0 0 10px #00FFFF); opacity: 1; } 100% { filter: drop-shadow(0 0 2px #00FFFF); opacity: 0.9; } }
        .alive-box { animation: pulse-cyan 3s infinite ease-in-out; stroke: #00FFFF; stroke-width: 2px; fill: rgba(0, 20, 40, 0.7); }
        .alive-text { animation: pulse-cyan 3s infinite ease-in-out; fill: #00FFFF; text-shadow: 0 0 5px #00FFFF; }
        @keyframes wave-slide { 0% { transform: translateX(0); } 100% { transform: translateX(-80px); } }
        .liquid-shape { animation: wave-slide 2s linear infinite; }
        .flow-pv1 { opacity: 1; animation: laser-flow 2s linear infinite; filter: drop-shadow(0 0 12px #00FFFF); stroke: #00FFFF; }
        .flow-pv2 { opacity: 1; animation: laser-flow 2s linear infinite; filter: drop-shadow(0 0 12px #0088FF); stroke: #0088FF; }
        .flow-generic { opacity: 1; animation: laser-flow 2s linear infinite; filter: drop-shadow(0 0 8px #00FFFF); stroke: #00FFFF; }
        .flow-reverse { opacity: 1; animation: laser-flow 2s linear infinite reverse; filter: drop-shadow(0 0 8px #FFFFFF); stroke: #FFFFFF; }
        .flow-grid-import { opacity: 1; animation: laser-flow 2s linear infinite reverse; filter: drop-shadow(0 0 8px #FF3333); stroke: #FF3333; }
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        .title-text { animation: pulse-cyan 2.5s infinite ease-in-out; fill: #00FFFF; font-weight: 900; font-family: 'Orbitron', sans-serif; text-anchor: middle; letter-spacing: 3px; text-transform: uppercase; }
      </style>
      <ha-card>
        <svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="width: 100%; height: 100%;">
          <defs>
            <clipPath id="battery-clip"><rect x="${BAT_X}" y="${BAT_Y_BASE - BAT_MAX_H}" width="${BAT_W}" height="${BAT_MAX_H}" rx="2" /></clipPath>
          </defs>
          
          <image href="${bg_img}" xlink:href="${bg_img}" x="0" y="0" width="800" height="450" preserveAspectRatio="none" />
          
          <rect x="290" y="10" width="220" height="32" rx="6" ry="6" fill="rgba(0, 20, 40, 0.85)" stroke="#00FFFF" stroke-width="1.5"/>
          <text x="400" y="32" class="title-text" font-size="${header_font_size}">${title_text}</text>
          
          <g transform="translate(600, 370)">
            <rect x="0" y="0" width="180" height="60" rx="10" ry="10" class="alive-box" />
            <text x="90" y="23" class="alive-text" style="font-family: sans-serif; text-anchor:middle; font-size:${daily_label_font_size}px; font-weight:normal; letter-spacing: 1px;">${label_daily}</text>
            <text x="90" y="50" class="alive-text" style="font-family: sans-serif; text-anchor:middle; font-size:${daily_value_font_size}px; font-weight:bold;">${total_daily_kwh} kWh</text>
          </g>
          
          <g transform="${bat_transform}">
            <g clip-path="url(#battery-clip)">
              <g style="transition: transform 1s ease-in-out;" transform="translate(0, ${BAT_MAX_H - current_h})">
                <g transform="translate(0, ${BAT_Y_BASE - BAT_MAX_H})">
                  <path class="liquid-shape" fill="${liquid_fill}" d="M ${BAT_X - 20} 5 Q ${BAT_X} 0 ${BAT_X + 20} 5 T ${BAT_X + 60} 5 T ${BAT_X + 100} 5 T ${BAT_X + 140} 5 V 150 H ${BAT_X - 20} Z" />
                </g>
              </g>
            </g>
          </g>
          
          <path class="track-path" d="${PATH_PV1}" /><path class="flow-path ${pv1_class}" d="${PATH_PV1}" style="animation-duration: ${dur_pv1};" />
          ${show_double_flow ? `<path class="track-path" d="${PATH_PV2}" /><path class="flow-path ${pv2_class}" d="${PATH_PV2}" style="animation-duration: ${dur_pv2};" />` : ''}
          
          <path class="track-path" d="${PATH_BAT_INV}" /><path class="flow-path ${bat_class}" d="${PATH_BAT_INV}" stroke="${bat_col}" style="animation-duration: ${dur_bat};" />
          <path class="track-path" d="${PATH_LOAD}" /><path class="flow-path ${load_class}" d="${PATH_LOAD}" stroke="${C_CYAN}" style="animation-duration: ${dur_load};" />
          <path class="track-path" d="${PATH_GRID}" /><path class="flow-path ${grid_class}" d="${PATH_GRID}" stroke="${grid_col}" style="animation-duration: ${dur_grid};" />
          <path class="track-path" d="${PATH_CAR}" /><path class="flow-path ${car_class}" d="${PATH_CAR}" stroke="${C_CYAN}" style="animation-duration: ${dur_car};" />
          
          ${pv_text_html}
          
          <text x="${T_BAT_X}" y="${T_BAT_Y}" transform="${trans_bat}" fill="${C_WHITE}" font-size="${battery_soc_font_size}" style="${TxtStyle}">${Math.floor(avg_soc)}%</text>
          <text x="${T_BAT_X}" y="${T_BAT_Y + 20}" transform="${trans_bat}" fill="${bat_col}" font-size="${battery_power_font_size}" style="${TxtStyle}">${this.formatPower(Math.abs(total_bat_w), use_kw)}</text>
          
          <text x="${T_HOME_X}" y="${T_HOME_Y}" transform="${trans_home}" fill="${C_WHITE}" font-size="${load_font_size}" style="${TxtStyle}">${this.formatPower(load, use_kw)}</text>
          <text x="${T_GRID_X}" y="${T_GRID_Y}" transform="${trans_grid}" fill="${grid_col}" font-size="${grid_font_size}" style="${TxtStyle}">${this.formatPower(Math.abs(grid), use_kw)}</text>
          
          <text x="${T_CAR_X}" y="${T_CAR_Y}" transform="${trans_car}" fill="${C_WHITE}" font-size="${car_power_font_size}" style="${TxtStyle}">${this.formatPower(car_w, use_kw)}</text>
          ${(config.show_car_soc && car_soc !== null) ? `
            <text x="${T_CAR_X}" y="${T_CAR_Y + 15}" transform="${trans_car}" fill="${config.car_pct_color || '#00FFFF'}" font-size="${car_soc_font_size}" style="${TxtStyle}">${Math.round(car_soc)}%</text>
          ` : ''}
        </svg>
      </ha-card>
    `;
    this._forceRender = false;
  }

  static get version() {
    return '1.0.5';
  }
}

if (!customElements.get('lumina-energy-card')) {
  customElements.define('lumina-energy-card', LuminaEnergyCard);
}

class LuminaEnergyCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._rendered = false;
    this._activeTab = 'config';
    this._defaults = (typeof LuminaEnergyCard !== 'undefined' && typeof LuminaEnergyCard.getStubConfig === 'function')
      ? { ...LuminaEnergyCard.getStubConfig() }
      : {};
    this._schemas = this._buildSchemas();
    if (window.loadCardHelpers) {
      window.loadCardHelpers();
    }
  }

  _buildSchemas() {
    const entitySelector = { entity: { domain: ['sensor', 'input_number'] } };
    const languageOptions = [
      { value: 'en', label: 'English' },
      { value: 'it', label: 'Italiano' },
      { value: 'de', label: 'Deutsch' }
    ];
    const unitOptions = [
      { value: 'W', label: 'Watts (W)' },
      { value: 'kW', label: 'Kilowatts (kW)' }
    ];
    const define = (entries) => entries.map((entry) => {
      const result = { ...entry };
      if (entry.name && this._defaults[entry.name] !== undefined && result.default === undefined) {
        result.default = this._defaults[entry.name];
      }
      return result;
    });

    return {
      general: define([
        { name: 'card_title', label: 'Card Title', selector: { text: {} }, helper: 'Title displayed at the top of the card.' },
        { name: 'background_image', label: 'Background Image Path', selector: { text: {} }, helper: 'Path to the background image (e.g., /local/community/lumina-energy-card/lumina_background.jpg).' },
        { name: 'language', label: 'Language', selector: { select: { options: languageOptions } } },
        { name: 'display_unit', label: 'Display Unit', selector: { select: { options: unitOptions } } }
      ]),
      refresh: define([
        { name: 'update_interval', label: 'Update Interval', selector: { number: { min: 10, max: 60, step: 5, mode: 'slider', unit_of_measurement: 's' } }, helper: 'Refresh cadence for card updates.' },
        { name: 'animation_speed_factor', label: 'Animation Speed Factor', selector: { number: { min: 0.25, max: 4, step: 0.25, mode: 'slider', unit_of_measurement: 'x' } }, helper: 'Adjust animation speed multiplier (0.25x–4x).' }
      ]),
      pv: define([
        { name: 'sensor_pv1', label: 'PV Sensor 1 (Required)', selector: entitySelector, helper: 'Primary solar production sensor.' },
        { name: 'sensor_pv2', label: 'PV Sensor 2', selector: entitySelector },
        { name: 'sensor_pv3', label: 'PV Sensor 3', selector: entitySelector },
        { name: 'sensor_pv4', label: 'PV Sensor 4', selector: entitySelector },
        { name: 'sensor_pv5', label: 'PV Sensor 5', selector: entitySelector },
        { name: 'sensor_pv6', label: 'PV Sensor 6', selector: entitySelector },
        { name: 'sensor_daily', label: 'Daily Production Sensor', selector: entitySelector, helper: 'Sensor reporting daily production totals.' }
      ]),
      battery: define([
        { name: 'sensor_bat1_soc', label: 'Battery 1 SOC', selector: entitySelector },
        { name: 'sensor_bat1_power', label: 'Battery 1 Power', selector: entitySelector },
        { name: 'sensor_bat2_soc', label: 'Battery 2 SOC', selector: entitySelector },
        { name: 'sensor_bat2_power', label: 'Battery 2 Power', selector: entitySelector },
        { name: 'sensor_bat3_soc', label: 'Battery 3 SOC', selector: entitySelector },
        { name: 'sensor_bat3_power', label: 'Battery 3 Power', selector: entitySelector },
        { name: 'sensor_bat4_soc', label: 'Battery 4 SOC', selector: entitySelector },
        { name: 'sensor_bat4_power', label: 'Battery 4 Power', selector: entitySelector }
      ]),
      other: define([
        { name: 'sensor_home_load', label: 'Home Load/Consumption', selector: entitySelector, helper: 'Total household consumption sensor.' },
        { name: 'sensor_grid_power', label: 'Grid Power', selector: entitySelector, helper: 'Positive/negative grid flow sensor.' },
        { name: 'invert_grid', label: 'Invert Grid Values', selector: { boolean: {} }, default: false, helper: 'Enable if import/export polarity is reversed.' }
      ]),
      ev: define([
        { name: 'sensor_car_power', label: 'Car Power Sensor', selector: entitySelector },
        { name: 'sensor_car_soc', label: 'Car SOC Sensor', selector: entitySelector },
        { name: 'show_car_soc', label: 'Show Car SOC', selector: { boolean: {} }, default: false },
        { name: 'car_pct_color', label: 'Car SOC Color', selector: { text: {} }, default: '#00FFFF', helper: 'Hex color for EV SOC text (e.g., #00FFFF).' }
      ]),
      typography: define([
        { name: 'header_font_size', label: 'Header Font Size', selector: { number: { min: 12, max: 32, step: 1, mode: 'slider', unit_of_measurement: 'px' } } },
        { name: 'daily_label_font_size', label: 'Daily Label Font Size', selector: { number: { min: 8, max: 24, step: 1, mode: 'slider', unit_of_measurement: 'px' } } },
        { name: 'daily_value_font_size', label: 'Daily Value Font Size', selector: { number: { min: 12, max: 32, step: 1, mode: 'slider', unit_of_measurement: 'px' } } },
        { name: 'pv_font_size', label: 'PV Text Font Size', selector: { number: { min: 12, max: 28, step: 1, mode: 'slider', unit_of_measurement: 'px' } } },
        { name: 'battery_soc_font_size', label: 'Battery SOC Font Size', selector: { number: { min: 12, max: 32, step: 1, mode: 'slider', unit_of_measurement: 'px' } } },
        { name: 'battery_power_font_size', label: 'Battery Power Font Size', selector: { number: { min: 10, max: 28, step: 1, mode: 'slider', unit_of_measurement: 'px' } } },
        { name: 'load_font_size', label: 'Load Font Size', selector: { number: { min: 10, max: 28, step: 1, mode: 'slider', unit_of_measurement: 'px' } } },
        { name: 'grid_font_size', label: 'Grid Font Size', selector: { number: { min: 10, max: 28, step: 1, mode: 'slider', unit_of_measurement: 'px' } } },
        { name: 'car_power_font_size', label: 'Car Power Font Size', selector: { number: { min: 10, max: 28, step: 1, mode: 'slider', unit_of_measurement: 'px' } } },
        { name: 'car_soc_font_size', label: 'Car SOC Font Size', selector: { number: { min: 8, max: 24, step: 1, mode: 'slider', unit_of_measurement: 'px' } } }
      ])
    };
  }

  _configWithDefaults() {
    return { ...this._defaults, ...this._config };
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

  _onTabChanged(ev, tabs) {
    const target = ev.target;
    const index = target && Number.isFinite(target.selected) ? target.selected : 0;
    const clampedIndex = Math.min(Math.max(index, 0), tabs.length - 1);
    const selectedTab = tabs[clampedIndex];
    if (selectedTab && selectedTab.id !== this._activeTab) {
      this._activeTab = selectedTab.id;
      this._rendered = false;
      this.render();
    }
  }

  _createSection(title, helper, schema) {
    const section = document.createElement('div');
    section.className = 'section';

    const heading = document.createElement('div');
    heading.className = 'section-title';
    heading.textContent = title;
    section.appendChild(heading);

    if (helper) {
      const helperEl = document.createElement('div');
      helperEl.className = 'section-helper';
      helperEl.textContent = helper;
      section.appendChild(helperEl);
    }

    section.appendChild(this._createForm(schema));
    return section;
  }

  _createForm(schema) {
    const form = document.createElement('ha-form');
    form.hass = this._hass;
    form.data = this._configWithDefaults();
    form.schema = schema;
    form.computeLabel = (field) => field.label || field.name;
    form.computeHelper = (field) => field.helper;
    form.addEventListener('value-changed', (ev) => {
      if (ev.target !== form) {
        return;
      }
      this._onFormValueChanged(ev, schema);
    });
    return form;
  }

  _onFormValueChanged(ev, schema) {
    ev.stopPropagation();
    if (!this._config) {
      return;
    }
    const value = ev.detail ? ev.detail.value : undefined;
    if (!value || typeof value !== 'object') {
      return;
    }

    const newConfig = { ...this._config };
    schema.forEach((field) => {
      if (!field.name) {
        return;
      }
      const fieldValue = value[field.name];
      const defaultVal = field.default !== undefined ? field.default : this._defaults[field.name];
      if (
        fieldValue === '' ||
        fieldValue === null ||
        fieldValue === undefined ||
        (defaultVal !== undefined && fieldValue === defaultVal)
      ) {
        delete newConfig[field.name];
      } else {
        newConfig[field.name] = fieldValue;
      }
    });

    this._config = newConfig;
    this.configChanged(newConfig);
    this._rendered = false;
    this.render();
  }

  _buildConfigContent() {
    const container = document.createElement('div');
    container.className = 'card-config';

    const sections = [
      { title: 'Configuration', helper: 'General card settings.', schema: this._schemas.general },
      { title: 'Refresh & Animation', helper: 'Control polling interval and flow animation speed.', schema: this._schemas.refresh },
      { title: 'PV (Solar) Sensors', helper: 'Configure up to six PV or input_number entities.', schema: this._schemas.pv },
      { title: 'Battery Sensors', helper: 'Provide SOC and power sensors for each battery.', schema: this._schemas.battery },
      { title: 'Other Sensors', helper: 'Home load, grid, and inversion options.', schema: this._schemas.other },
      { title: 'EV Car (Optional)', helper: 'Optional EV metrics and styling.', schema: this._schemas.ev }
    ];

    sections.forEach((section) => {
      container.appendChild(this._createSection(section.title, section.helper, section.schema));
    });

    return container;
  }

  _buildTypographyContent() {
    const container = document.createElement('div');
    container.className = 'card-config';
    container.appendChild(this._createSection('Typography', 'Tune font sizes for each text block.', this._schemas.typography));
    return container;
  }

  render() {
    if (!this._hass || !this._config) {
      return;
    }

    const config = this._config;

    this.shadowRoot.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = `
      .tabs-container {
        margin-bottom: 8px;
      }
      ha-tabs {
        margin: 0 16px;
        --paper-tabs-selection-bar-color: var(--primary-color);
      }
      paper-tab {
        text-transform: uppercase;
        font-weight: 600;
      }
      .section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
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
      .section-helper {
        font-size: 0.9em;
        color: var(--secondary-text-color);
        margin-bottom: 8px;
      }
      ha-form {
        width: 100%;
      }
    `;

    const lang = (config.language || 'en').toLowerCase();
    const tabLabels = {
      config: { en: 'Configuration', it: 'Configurazione', de: 'Konfiguration' },
      typography: { en: 'Typography', it: 'Tipografia', de: 'Typografie' }
    };

    const resolveLabel = (key) => {
      const entry = tabLabels[key];
      if (!entry) {
        return key;
      }
      return entry[lang] || entry.en;
    };

    const tabs = [
      { id: 'config', label: resolveLabel('config') },
      { id: 'typography', label: resolveLabel('typography') }
    ];

    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs-container';
    const tabsEl = document.createElement('ha-tabs');
    tabsEl.selected = Math.max(0, tabs.findIndex((tab) => tab.id === this._activeTab));
    tabsEl.addEventListener('iron-activate', (ev) => this._onTabChanged(ev, tabs));

    tabs.forEach((tab) => {
      const tabEl = document.createElement('paper-tab');
      tabEl.textContent = tab.label;
      tabsEl.appendChild(tabEl);
    });

    tabsContainer.appendChild(tabsEl);

    const activeContent = this._activeTab === 'typography'
      ? this._buildTypographyContent()
      : this._buildConfigContent();

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(tabsContainer);
    this.shadowRoot.appendChild(activeContent);
    this._rendered = true;
  }
}

if (!customElements.get('lumina-energy-card-editor')) {
  customElements.define('lumina-energy-card-editor', LuminaEnergyCardEditor);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'lumina-energy-card',
  name: 'Lumina Energy Card',
  description: 'Advanced energy flow visualization card with support for multiple PV strings and batteries',
  preview: true,
  documentationURL: 'https://github.com/ratava/lumina-energy-card'
});

console.info(
  `%c LUMINA ENERGY CARD %c v${LuminaEnergyCard.version} `,
  'color: white; background: #00FFFF; font-weight: 700;',
  'color: #00FFFF; background: black; font-weight: 700;'
);