//TODO
//Add area on <p bottom> when supported
//Sync % with input value
//Improve text positioning on small cards
//Select brightness, white_value or color
//Long press action
//Add support for media_players and sensors
import {
    LitElement,
    html,
    css
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";
var tap = false;
const delta = 3;
let startX;
let startY;
class DimmerButton extends LitElement {
  
  static get properties() {
    return {
      hass: {},
      config: {},
      active: {}
    };
  }

  static getStubConfig() {
    return { entity: "",name: "",background: "#202125",foreground: "#423C2E",icon: "",on_icon: "hass:lightbulb",off_icon: "hass:lightbulb-outline",on_color: "#FED664",off_color: "#DEDFE1" }
    }

  constructor() {
    super();
  }

  render() {
    var entity = this.config.entity;
    var entityStates = this.hass.states[entity]
    var background = this.config.background ? this.config.background : "var(--ha-card-background)";
    var foreground = this.config.foreground ? this.config.foreground : "var(--primary-color)";
    var name = this.config.name ? this.config.name : entityStates.attributes.friendly_name;
    var onColor = this.config.on_color ? this.config.on_color : "#fdd835";
    var offColor = this.config.off_color ? this.config.off_color : "gray";
    if (this.config.icon) {
      var iconOn = this.config.icon;
      var iconOff = this.config.icon; 
    }else{
      var iconOn = this.config.on_icon ? this.config.on_icon : "hass:lightbulb";
      var iconOff = this.config.off_icon ? this.config.off_icon : "hass:lightbulb-outline";
    }
    if (entityStates.attributes.supported_features !=0 && entityStates.attributes.supported_features !== undefined) {
      return html`
        <ha-card>
          <div class="button" style="--dimmer-background:${background};--dimmer-foreground:${foreground};--color-on:${onColor};--color-off:${offColor};">
            <p class="info top ${entityStates.state}"><ha-icon class="icon" icon=${entityStates.state === "on" ? iconOn : iconOff}></ha-icon>${entityStates.state} • ${entityStates.state === "on" ? Math.round(entityStates.attributes.brightness/2.55) : 0 }%</p>
            <p class="info middle">${name}</p>
            <input type="range" class="${entityStates.state}" .value="${entityStates.state === "on" ? Math.round(entityStates.attributes.brightness/2.55) : 0 }" 
              @touchstart=${e => this._startCords(e.changedTouches[0])}
              @touchend=${e => this._endCords(entityStates, e.changedTouches[0])}
              @mousedown=${e => this._startCords(e)}
              @mouseup=${e => this._endCords(entityStates, e)} 
              @change=${e => this._setBrightness(entityStates, e.target.value)}>
          </div>
        </ha-card>
      `;
    }else{
      return html`
        <ha-card>
          <div class="button" style="--dimmer-background:${background};--dimmer-foreground:${foreground};--color-on:${onColor};--color-off:${offColor};">
            <p class="top ${entityStates.state}"><ha-icon class="icon ${entityStates.state}" icon=${entityStates.state === "off" ? iconOff : iconOn}></ha-icon>${entityStates.state}</p>
            <p class="middle">${name}</p>
            <input type="range" min="0" max="1" class="${entityStates.state}" .value="${entityStates.state === "on" ? 1 : 0}" 
              @touchstart=${e => this._startCords(e.changedTouches[0])}
              @touchend=${e => this._endCords(entityStates, e.changedTouches[0])}
              @mousedown=${e => this._startCords(e)}
              @mouseup=${e => this._endCords(entityStates, e)} 
              @change=${e => this._setBrightness(entityStates, e.target.value)}>
          </div>
        </ha-card>
        `;
    }
  }

  updated() {}

  _startCords(e) {
      startX = e.pageX;
      startY = e.pageY;
    }

  _endCords(entity, e) {
    const diffX = Math.abs(e.pageX - startX);
    const diffY = Math.abs(e.pageY - startY);
    if (diffX < delta && diffY < delta) {
      tap = true;
      this.hass.callService("homeassistant", "toggle", {
        entity_id: entity.entity_id    
      });
    }else{
      tap = false;
      }
  }

  _setBrightness(entity, value) {
    if(!tap){
      this.hass.callService("homeassistant", "turn_on", {
          entity_id: entity.entity_id,
          brightness: value * 2.55
      });
    }
  }

  _navigate(path) {
      window.location.href = path;
  }
  
  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define entity");
    }
    this.config = config;
  }

  getCardSize() {
    return 3;
  }
  
  static get styles() {
    return css`
        p{
          position: relative;
          z-index: 1;
          pointer-events: none;
          text-transform: capitalize;
          margin: 0;
        }

        p.off {
          color: var(--color-off);
        }
        p.on {
          color: var(--color-on);
        }

        .icon{
          margin: 10px;
          --mdc-icon-size: 30px;
        }

        .top {
          font-size: var(--paper-font-title_-_font-size);
          padding: 30px 0 0 20px;
        }

        .middle {
          font-size: var(--paper-font-title_-_font-size);
          font-weight: var(--paper-font-title_-_font-weight);
          padding: 25px 35px;
        }

        .button {
          height: 150px;
          position: relative;
        }

        .button input[type="range"] {
          border-radius: var(--ha-card-border-radius);
          width: 100%;
          margin: 0;
          transition: box-shadow 0.2s ease-in-out;
          overflow: hidden;
          height: 100%;
          -webkit-appearance: none;
          background-color: var(--dimmer-background);
          position: absolute;
          top: 0;
          right: 0;
        }

        .button input[type="range"]::-webkit-slider-runnable-track {
          height: 100px;
          -webkit-appearance: none;
        }

        .button input[type="range"]::-webkit-slider-thumb {
          width: 1px;
          -webkit-appearance: none;
          box-shadow: -9999px 0 0 9999px var(--dimmer-foreground);
        }

        .button input[type="range"]::-moz-range-progress {
          height: 100%;
          background: var(--dimmer-foreground);
        }

        .button input[type="range"]::-moz-range-thumb{
          width: 0;
          border: 0;
        }

        .button input[type='range']:focus {
          outline: none;
        }

        .button input[type="range"]::-webkit-slider-thumb:hover {
          cursor: pointer;
        }

        .button input[type="range"]:hover {
          cursor: pointer;
        }
    `;
  }  
  
}

customElements.define('dimmer-button', DimmerButton);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "dimmer-button",
  name: "Dimmer Button",
  description: "Dimmable buttons in the style of Android 11’s quick access device controls"
});