const NodeHelper = require("node_helper");
const { spawn } = require("child_process");
const fliclib = require(__dirname +
  "/lib/fliclib-linux-hci/clientlib/nodejs/fliclibNodeJs.js");
const FlicClient = fliclib.FlicClient;
const FlicConnectionChannel = fliclib.FlicConnectionChannel;

module.exports = NodeHelper.create({
  start: async function() {
    this.client = await this.startFlicd();
    let parent = this;
    this.client.once("ready", function() {
      parent.client.getInfo(function(info) {
        info.bdAddrOfVerifiedButtons.forEach(function(bdAddr) {
          parent.listenToButton(bdAddr);
        });
      });
    });
    this.client.on("newVerifiedButton", function(bdAddr) {
      parent.listenToButton(bdAddr);
    });
  },

  // starts listening to a button and sends socket notifications to the module
  // when an event is registered.
  listenToButton: function(bdAddr) {
    let cc = new FlicConnectionChannel(bdAddr);
    this.client.addConnectionChannel(cc);
    let parent = this;
    cc.on("buttonSingleOrDoubleClickOrHold", function(clickType, wasQueued, timeDiff) {
      parent.sendSocketNotification("buttonSingleOrDoubleClickOrHold", {
        bdAddr: bdAddr,
        clickType: clickType,
        wasQueued: wasQueued,
        timeDiff: timeDiff
      });
    });
    cc.on("connectionStatusChanged", function(
      connectionStatus,
      disconnectReason
    ) {
      parent.sendSocketNotification("connectionStatusChanged", {
        bdAddr: bdAddr,
        connectionStatus: connectionStatus,
        disconnectReason: disconnectReason
      });
    });
  },

  // launch flicd and returns a promise that resolves to the FlicClient.
  startFlicd: function() {
    const flicdDir = __dirname + "/lib/fliclib-linux-hci/bin/" + getArch();
    const flicd = spawn(flicdDir + "/flicd", [
      "-f",
      __dirname + "/flic.sqlite3"
    ]);
    flicd.on("error", error => {
      console.log(`flicd error: ${error.message}`);
      process.exit(1);
    });
    return new Promise(resolve => {
      flicd.stderr.on("data", data => {
        // wait for flicd to finish launching
        // log status of flicd, specifically to debug pm2 issues
        console.log("Flicd launched.", data.toString());
        if (
          data
            .toString()
            .endsWith("Initialization of Bluetooth controller done!\n")
        ) {
          resolve(new FlicClient("localhost", 5551));
        }
      });
    });
  }
});

// get architecture name for lib/fliclib-linux-hci folder
function getArch() {
  switch (process.arch) {
    case "arm":
      return "armv6l";
    case "x32":
    case "ia32":
      return "i386";
    case "x64":
      return "x86_64";
  }
}
