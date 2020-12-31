# Dimmer buttons
These are dimmable buttons for home assistant inspired by Android 11's quick access device controls, designed primarily for compact and easy control of lights and switches on touch screen devices.

![](preview.gif)

The buttons support turning on/off as well as dimming, one tap toggles the device and sliding over the button sets the brightness. For devices without support for setting the brightness, both sliding and tapping toggles the device on or off.

## Installation

Download the .js file to configuration/www and add it to your configuration:

```yaml
resources:
  url: /local/dimmer-button.js
  type: module
```
## Configuration

Most parts of the card can be changed in the configuration.

### Options

| Name         | Type   | Default                  | Description                                                               |
|--------------|--------|--------------------------|---------------------------------------------------------------------------|
| `type`       | string | **Required**             | `custom:dimmer-button`                                                    |
| `entity`     | string | **Required**             | Any entity is accepted                                                    |
| `name`       | string | `friendly_name`          | Use to set a custom name                                                  |
| `direction`  | string | `horizontal`             | Set to vertical to make the slider vertical                               |
| `mode`       | string |                          | Select mode for the entity, 'brightness' or 'color_temp' for lights and 'volume' for media players (Media_player plays/pauses on sliding wihout defining 'mode: volume') |
| `max_volume` | number |                          | Set max allowed volume for slider when using mode: volume (only affects this card)|
| `bottom`     | string |                          | Display optional text under name                                          |
| `height`     | number | `150px`                  | Specify height of card                                                    |
| `background` | string | `--ha-card-background`   | Set the background of the button                                          |
| `foreground` | string | `--primary-color`        | Set the foreground of the button                                          |
| `on_color`   | string | `#fdd835`                | Set the color of the top row when on                                      |
| `off_color`  | string | `gray`                   | Set the color of the top row when off                                     |
| `on_icon`    | string | `entity icon if defined, otherwise depending on type`         | Set the icon to display when on                                           |
| `off_icon`   | string | `entity icon if defined, otherwise depending on type` | Set the icon to display when off                                          |
| `icon`       | string |                          | Use to set the same icon for on and off(Overrides setting on/off individually)                         |
