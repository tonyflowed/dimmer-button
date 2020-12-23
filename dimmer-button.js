//TODO
//Add automatic area on <p bottom> when supported
//value template support
//Scale text when card is smaller than ~200px
//Select mode color
//Keep displaying newValue until the old value is updated
import {
    LitElement,
    html,
    css
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

class DimmerButton extends LitElement {
  
  static get properties() {
    return {
      hass: {},
      config: {}
    };
  }

  static getStubConfig() {
    return { entity: '#Required',name: '#friendly_name',mode: '#supports "brightness" or "color_temp" for light and "volume" for media_player', bottom: "#optional text under name", height: "",background: "",foreground: "",icon: "",on_icon: "",off_icon: "",on_color: "",off_color: "" }
    }

  constructor() {
    super();
    this.hold = false;
    this.dim = false;
    this.disabled = false;
    this.delta = 3;
    this.startY;
    this.startX;
    this.clientY;
    this.mode;
    this.iconOn;
    this.iconOff;
    this.displayState;
    this.rangeMax = 100;
    this.rangeValue = 0;
    this.maxVol;
    this.newValue = 0;
    this.longPress = null;
  }

  entityConfig(entity) {
    if(entity.entity_id.includes("light.")||entity.entity_id.includes("switch.")) {
      this.iconOn = this.config.icon ? this.config.icon : this.config.on_icon ? this.config.on_icon : entity.attributes.icon ? entity.attributes.icon : entity.entity_id.includes("light.") ? "hass:lightbulb" : "mdi:toggle-switch";
      this.iconOff = this.config.icon ? this.config.icon : this.config.off_icon ? this.config.off_icon : entity.attributes.icon ? entity.attributes.icon : entity.entity_id.includes("light.") ? "hass:lightbulb-outline" : "mdi:toggle-switch-off-outline";
      if(entity.attributes.supported_features & 1) {
        if(entity.attributes.supported_features & 2 && this.config.mode == "color_temp"){
          this.mode = "color_temp";
          this.displayState = entity.state === "on" ? ('• '+(this.newValue != 0 ? Math.round(1000000/(((entity.attributes.max_mireds-entity.attributes.min_mireds)*(this.newValue/100))+entity.attributes.min_mireds))+' K' : Math.round((1000000/(entity.attributes.color_temp)))+' K')) : '';
          this.rangeValue = entity.state === "on" ? Math.round(((entity.attributes.color_temp-entity.attributes.min_mireds)*100)/(entity.attributes.max_mireds-entity.attributes.min_mireds)) : 0;
        }else{
          this.mode = "brightness";
          this.displayState = '• '+(this.newValue != 0 ? this.newValue : (entity.state === "on" ? Math.round(entity.attributes.brightness/2.55) : 0))+'%';
          this.rangeValue = entity.state === "on" ? Math.round(entity.attributes.brightness/2.55) : 0;
        }
      }else{
        this.mode = "toggle";
        this.displayState = '';
        this.rangeMax = 1;
        this.rangeValue = entity.state === "on" ? 1 : 0;
      }
    }else if(entity.entity_id.includes("sensor.")){
      this.iconOn = this.config.icon ? this.config.icon : this.config.on_icon ? this.config.on_icon : entity.attributes.icon ? entity.attributes.icon : "mdi:eye";
      this.iconOff = this.config.icon ? this.config.icon : this.config.off_icon ? this.config.off_icon : entity.attributes.icon ? entity.attributes.icon : "mdi:eye";
      this.mode = "static";
      this.displayState = entity.attributes.unit_of_measurement ? entity.attributes.unit_of_measurement: '';
      this.disabled = true;
      this.rangeMax = 0;
    }else if(entity.entity_id.includes("media_player.")){
      this.iconOn = this.config.icon ? this.config.icon : this.config.on_icon ? this.config.on_icon : entity.attributes.icon ? entity.attributes.icon : "mdi:cast";
      this.iconOff = this.config.icon ? this.config.icon : this.config.off_icon ? this.config.off_icon : entity.attributes.icon ? entity.attributes.icon : "mdi:cast";
      if(entity.attributes.supported_features & 4 && this.config.mode == "volume") {
        this.mode = "volume";
        this.displayState = (entity.state === "playing" ? '• '+(this.newValue != 0 ? this.newValue : (entity.attributes.volume_level*100))+'%' : '');
        this.rangeMax = this.maxVol;
        this.rangeValue = (entity.attributes.volume_level*100);
      }else{
        this.mode = "pause";
        this.displayState = '';
        this.rangeMax = 1;
        this.rangeValue = entity.state === "on" ? 1 : 0;
      }
    }else{
      this.mode = "static";
    }
  }

  render() {
    const entity = this.config.entity;
    const entityStates = this.hass.states[entity]
    let background = this.config.background ? this.config.background : "var(--ha-card-background)";
    let foreground = this.config.foreground ? this.config.foreground : "var(--primary-color)";
    const name = this.config.name ? this.config.name : entityStates.attributes.friendly_name;
    const onColor = this.config.on_color ? this.config.on_color : "#fdd835";
    const offColor = this.config.off_color ? this.config.off_color : "gray";
    const cardHeight = this.config.height ? this.config.height : "150px";
    const bottomText = this.config.bottom;
    this.entityConfig(entityStates);
    return html`
      <ha-card>
        <div class="button" style="${this.mode == "static" ? (entityStates.state == "on" ? "--dimmer-background:"+foreground : "--dimmer-background:"+background) : "--dimmer-background:"+background};--dimmer-foreground:${foreground};--color-on:${onColor};--color-off:${offColor};--card-height:${cardHeight};">
          <p class="top ${entityStates.state}"><ha-icon class="icon" icon=${entityStates.state === "off" ? this.iconOff : this.iconOn}></ha-icon>${entityStates.state} ${this.displayState}</p>
          <p class="middle">${name}</p>
          ${bottomText ? html`<p class="bottom">${bottomText}</p>`: ''}
          <input type="range" ?disabled="${this.disabled}" min="0" max="${this.rangeMax}" class="${entityStates.state}" .value="${this.rangeValue}" 
            @pointerdown=${e => this._startCords(entity, e)}
            @pointerup=${e => this._endCords(entityStates, e)}
            @pointermove=${e => this._moveHandler(e)}
            @change=${e => this._setValue(entityStates, e)}
            @input=${e => this._displayValue(e.target.value)}
            >
        </div>
      </ha-card>
    `;
  }

  _moveHandler(e) {
    let diffX = Math.abs(this.startX-e.pageX);
    let diffY = Math.abs(this.startY-e.pageY);
    let posDelta = 6;
    if(diffX > posDelta || diffY > posDelta){
    	clearTimeout(this.longPress);
    };
  }

  _displayValue(e) {
    this.newValue = parseInt(e);
    this.requestUpdate();
  }

  _startCords(entity, e) {
      this.startX = e.pageX;
      this.startY = e.pageY;
      this.clientY = e.clientY;
      let target = e.target.parentElement;
      this.longPress = setTimeout(() => this._moreInfo('hass-more-info', { entityId: this.config.entity }, target), 600);
    }

  _endCords(entity, e) {
    clearTimeout(this.longPress);
    this.newValue = 0;
    let diffX = Math.abs(e.pageX - this.startX);
    let diffY = Math.abs(e.pageY - this.startY);
    let scrollY = Math.abs(e.clientY - this.clientY);
    if(this.hold){
    	this.hold = false;
    	return false;
    };
    if((diffX < this.delta && diffY < this.delta)&&(e.button == 0 || e.button == undefined)){
        this.dim = false;
        this._toggle(entity);
    }else{
    	this.dim = true;
    };
    if(scrollY > 50){
      this.dim = false;
    }
  }

  _moreInfo(entity, detail, e){
    navigator.vibrate(100);
    let flash = document.createElement("span");
    flash.classList.add("effect");
    const old = e.getElementsByClassName("effect")[0];
    if (old) {
      old.remove();
    }
    e.appendChild(flash);
    this.hold = true;
    event = new Event(entity, {
      bubbles: true,
      cancelable: false,
      composed: true
    });
    event.detail = detail || {};
    this.shadowRoot.dispatchEvent(event);
    return event;
  }

  _toggle(entity){
    switch(this.mode){
      case "color_temp":
      case "brightness":
      case "toggle":
        this.hass.callService("homeassistant", "toggle", {
          entity_id: entity.entity_id    
        });
        break;
      case "volume":
      case "pause":
        this.hass.callService("media_player", "media_play_pause", {
          entity_id: entity.entity_id    
        });
        break;
      }
    }

  _setValue(entity, e) {
    let value = e.target.value;
    let num = 0;
    if(this.dim){
      switch(this.mode){
      	case "brightness":
      		this.hass.callService("homeassistant", "turn_on", {
	            entity_id: entity.entity_id,
	            brightness: value * 2.55
	        });
      		break;
      	case "color_temp":
      		num = Math.round(((entity.attributes.max_mireds-entity.attributes.min_mireds)*(value/100))+entity.attributes.min_mireds);
      		this.hass.callService("light", "turn_on", {
      		    entity_id: entity.entity_id,
      		    color_temp: num
      		});
      		break;
      	case "volume":
      		this.maxVol = this.config.max_volume ? this.config.max_volume : 100;
      		num = this.maxVol>value ? (value/100) : (this.maxVol/100);
      		this.hass.callService("media_player", "volume_set", {
      		  entity_id: entity.entity_id,    
      		  volume_level: num
      		});
      		break;
      	case "pause":
      		this._pause(entity);
      		break;
      	case "toggle":
      		this._toggle(entity);
      		break;
      }
    }else{
    	e.target.value = this.rangeValue;
    	this.newValue = 0;
    	this.dim = false;
    	this.requestUpdate();
    	return false;
    }
    this.dim = false;
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

        p.off, p.paused, p.unavailable {
          color: var(--color-off);
        }
        p.on, p.playing {
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
          padding: 20px 0 5px 35px;
        }

        .bottom {
          font-size: var(--paper-font-body1_-_font-size);
          font-weight: var(--paper-font-body1_-_font-weight);
          padding: 5px 0 0 35px;
        }

        .button {
          height: var(--card-height);
          position: relative;
          background: var(--dimmer-background);
          background-size: cover;
          border-radius: var(--ha-card-border-radius);
          touch-action: pan-y;
        }

        .button input[type="range"] {
          border-radius: var(--ha-card-border-radius);
          width: 100%;
          margin: 0;
          transition: box-shadow 0.2s ease-in-out;
          overflow: hidden;
          height: 100%;
          -webkit-appearance: none;
          background: none;
          position: absolute;
          top: 0;
          right: 0;
        }

        .button input[type="range"]::-webkit-slider-runnable-track {
          height: 100px;
          -webkit-appearance: none;
        }

        .button input[type="range"]::-webkit-slider-thumb {
          width: 0;
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
        span.effect {
          position: absolute;
          opacity: 0;
          animation: ripple 200ms ease-in-out;
          background-color: rgba(255, 255, 255, 0.9);
          height: 100%;
          width: 100%;
          left: 0;
          top: 0;
          border-radius: var(--ha-card-border-radius);
          pointer-events: none;
        }

        @keyframes ripple {
          to {
            opacity: 1;
          }
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
