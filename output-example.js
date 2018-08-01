var gpio = require("gpio");
var pin = process.argv[2] ? Number(process.argv[2]) : 5;
var output = gpio.export(pin, {
  direction: gpio.DIRECTION.OUT,
  ready: function() {
    var intervalTimer = setInterval(function() {
      console.log("log: set");
      output.set();
      setTimeout(function() { output.reset(); }, 500);
    }, 1000);
  }});
