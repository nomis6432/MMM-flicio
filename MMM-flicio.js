Module.register("MMM-flicio", {
  // Default module config.
  defaults: {
    allowQueued: true,
    queueTimeout: 5,
    buttons: {}
  },

  // the modules sends a notification to open the socket.
  start: function() {
    this.sendSocketNotification("START");
  },

  // create empty Dom object which is expected by MagicMirror
  getDom: function() {
    return document.createElement("div");
  },

  // convert socket notifications to normal notifications and use config settings
  socketNotificationReceived: function(notification, payload) {
    // check if message was queued and ignore if configured to.
    if (
      !this.config.allowQueued &&
      payload.wasQueued &&
      payload.queueTimeout > this.config.queueTimeout
    ) {
      return;
    }
    // check if button MAC/button address is in config
    if (this.config.buttons[payload.bdAddr]) {
      let button = this.config.buttons[payload.bdAddr];
      let messages;
      if (notification == "buttonUpOrDown") {
        messages = button[payload.clickType];
      } else if (
        notification == "connectionStatusChanged" &&
        button.connectionStatusChanged
      ) {
        messages = {
          notification: "FLICIO-connectionStatusChanged",
          payload: payload
        };
      }
      if (messages) {
        for (message of messages) {
          this.sendNotification(message.notification, message.payload);
        }
      }
    }
  }
});
