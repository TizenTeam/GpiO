var gpio = require("gpio");
var pin = process.argv[2] ? Number(process.argv[2]) : 5;
var output = gpio.export(pin, {
  direction: "out",
  ready: function() {
    var intervalTimer = setInterval(function() {
      output.set();
      setTimeout(function() { output.reset(); }, 500);
    }, 1000);
  }});
