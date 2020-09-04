# MMM-flicio

A [MagicMirror](https://magicmirror.builders/) module to send notifications to other modules using [flic buttons](https://www.flic.io) (see [MagicMirror Module documentation](https://docs.magicmirror.builders/development/core-module-file.html) for information about notifications). This module uses [fliclib-linux-hci](https://github.com/50ButtonsEach/fliclib-linux-hci) and therfore only works on Linux on the following architectures: armv6l, i386 and x86_64

## Installation

Navigate to the `modules` folder and clone the repository with all submodules:

`git clone --recurse-submodules https://www.github.com/nomis6432/MMM-flicio`

## Configuration

Navigate to the `config/config.js` file and add a new entry in `modules` (see [MagicMirror Module Configuration documentation](https://docs.magicmirror.builders/modules/configuration.html)).

Before adding the `config` parameter you should first register your buttons. This module uses [fliclib-linux-hci](https://github.com/50ButtonsEach/fliclib-linux-hci) and will spawn the flicd deamon when MagicMirror launches. In order to register the buttons you should first launch MagicMirror (or launch flicd manually with the `flic.sqlite3` file located in the root folder of this module). Once this is done run `npm run register` from within the root folder of this module. Follow the instructions to register the button. You'll need the MAC address that appears to configure your button. You can run `npm test` to test your buttons.

The `config` attribute has 3 parameters:

* `allowQueued`: can be `true` or `false`. When `false` all button inputs that couldn't be delivered within `queueTimeout` seconds will be discarded. `true` by default.
* `queueTimeout`: number of seconds to wait when `allowQueued` is `false`. Is ignored when `alllowQueued` is `true`. `5` by default.
* `buttons`: an Object with as key the MAC addresses of the buttons and as value another Object. This Object has as key as String describing the button action, either `'ButtonDown'` or `'ButtonUp'`. The value of this Object is a list of Objects containing `notification` (a String) with the notification and `payload` (Any Type, optionally) the payload that should be sent together with that notification.

An example of a module entry:

```js
{
	module: "MMM-flicio",
	config: {
		allowQueued: false,
		buttons: {
			"AA:BB:CC:DD:EE:FF": {
				ButtonDown: [
					{
						notification: "DO-SOMETHING",
						payload: {
							foo: "bar",
							foofoo: "barbar"
						}
					},
					{
						notification: "ALSO-DO",
					}
				]
			},
			"11:22:33:44:55:66": {
				ButtonUp: [
					{
						notification: "DO-SOMETHING-COOL",
						payload: "foo"
					}
				]
			}
		}
	},
}
```
## notifications

This module will also send a notification `'FLICIO-connectionStatusChanged'` whenever the connection status of a button changes. The payload of this notification is an Object with as attributes:

* `bdAddr`: the MAC address of the button of which the connection changed.
* `connectionStatus`: the current connection status: `"Disconnected"` or `"Connected"`.
* `disconnectReason`: the reason for the disconnect.
