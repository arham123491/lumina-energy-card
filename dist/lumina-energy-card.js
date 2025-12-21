/**
 * Lumina Energy Card
 * Custom Home Assistant card for energy flow visualization
 * Version: 1.0.2
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
    if (!customElements.get('lumina-energy-card-editor')) {
      await import('./lumina-energy-card-editor.js');
    }
    return document.createElement('lumina-energy-card-editor');
  }

  static getStubConfig() {
    return {
      language: 'en',
      card_title: 'LUMINA ENERGY',
      background_image: '/local/community/lumina-energy-card/lumina_background.jpg',
      sensor_pv1: 'sensor.solar_production',
      sensor_daily: 'sensor.daily_production',
      sensor_bat1_soc: 'sensor.battery_soc',
      sensor_bat1_power: 'sensor.battery_power',
      sensor_home_load: 'sensor.home_consumption',
      sensor_grid_power: 'sensor.grid_power',
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
      const duration = 30.0 - (Math.min(w / 6000, 1) * 29.5);
      return duration.toFixed(2) + 's';
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
        <text x="${T_SOLAR_X}" y="${T_SOLAR_Y - 10}" transform="${trans_solar}" fill="${C_CYAN}" font-size="16" style="${TxtStyle}">S1: ${this.formatPower(pv1_val, use_kw)}</text>
        <text x="${T_SOLAR_X}" y="${T_SOLAR_Y + 10}" transform="${trans_solar}" fill="${C_BLUE}" font-size="16" style="${TxtStyle}">S2: ${this.formatPower(pv2_val, use_kw)}</text>
      `;
    } else if (pv_sensors.length > 2) {
      pv_text_html = `<text x="${T_SOLAR_X}" y="${T_SOLAR_Y}" transform="${trans_solar}" fill="${C_CYAN}" font-size="16" style="${TxtStyle}">${label_pv_tot}: ${this.formatPower(total_pv_w, use_kw)}</text>`;
    } else {
      pv_text_html = `<text x="${T_SOLAR_X}" y="${T_SOLAR_Y}" transform="${trans_solar}" fill="${C_CYAN}" font-size="16" style="${TxtStyle}">${this.formatPower(total_pv_w, use_kw)}</text>`;
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
          <text x="400" y="32" class="title-text" font-size="16">${title_text}</text>
          
          <g transform="translate(600, 370)">
            <rect x="0" y="0" width="180" height="60" rx="10" ry="10" class="alive-box" />
            <text x="90" y="23" class="alive-text" style="font-family: sans-serif; text-anchor:middle; font-size:12px; font-weight:normal; letter-spacing: 1px;">${label_daily}</text>
            <text x="90" y="50" class="alive-text" style="font-family: sans-serif; text-anchor:middle; font-size:20px; font-weight:bold;">${total_daily_kwh} kWh</text>
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
          
          <text x="${T_BAT_X}" y="${T_BAT_Y}" transform="${trans_bat}" fill="${C_WHITE}" font-size="20" style="${TxtStyle}">${Math.floor(avg_soc)}%</text>
          <text x="${T_BAT_X}" y="${T_BAT_Y + 20}" transform="${trans_bat}" fill="${bat_col}" font-size="14" style="${TxtStyle}">${this.formatPower(Math.abs(total_bat_w), use_kw)}</text>
          
          <text x="${T_HOME_X}" y="${T_HOME_Y}" transform="${trans_home}" fill="${C_WHITE}" font-size="15" style="${TxtStyle}">${this.formatPower(load, use_kw)}</text>
          <text x="${T_GRID_X}" y="${T_GRID_Y}" transform="${trans_grid}" fill="${grid_col}" font-size="15" style="${TxtStyle}">${this.formatPower(Math.abs(grid), use_kw)}</text>
          
          <text x="${T_CAR_X}" y="${T_CAR_Y}" transform="${trans_car}" fill="${C_WHITE}" font-size="15" style="${TxtStyle}">${this.formatPower(car_w, use_kw)}</text>
          ${(config.show_car_soc && car_soc !== null) ? `
            <text x="${T_CAR_X}" y="${T_CAR_Y + 15}" transform="${trans_car}" fill="${config.car_pct_color || '#00FFFF'}" font-size="12" style="${TxtStyle}">${Math.round(car_soc)}%</text>
          ` : ''}
        </svg>
      </ha-card>
    `;
    this._forceRender = false;
  }

  static get version() {
    return '1.0.2';
  }
}

customElements.define('lumina-energy-card', LuminaEnergyCard);

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