var gpio = require("gpio");
var pin = process.argv[2] ? Number(process.argv[2]) : 11;
var input = gpio.export(pin, {
  direction: "in",
  ready: function() {
    this.on("change", function(val) {
      console.log("log: GPIO" + this.headerNum + ": change: "+ val);
    });
    console.log("log: GPIO" + this.headerNum + ": ready: " + this.value);
  }
});
