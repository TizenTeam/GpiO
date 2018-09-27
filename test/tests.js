var fs = require('fs');
var assert = require('assert');
var sinon = require('sinon');
var gpio = require('../lib/gpio');
var pwm = require('../lib/pwm');

function read(file, fn) {
	fs.readFile(file, "utf-8", function(err, data) {
		if(!err && typeof fn === "function") fn(data);
	});
}

// remove whitespace
function rmws(str) {
	return str.replace(/\s+/g, '');
}

describe('GPIO', function() {

	var gpio4;

	before(function(done) {
		gpio4 = gpio.export(4, {
			direction: gpio.DIRECTION.OUT,
			ready: done
		});
	});

	after(function() {
		gpio4.unexport();
	});

	describe('Header Direction Out', function() {

		describe('initializing', function() {
			it('should open specified header', function(done) {
				read('/sys/class/gpio/gpio4/direction', function(val) {
					assert.equal(rmws(val), gpio.DIRECTION.OUT);
					done();
				});
			});
		});

		describe('#set', function() {
			it('should set header value to high', function(done) {
				gpio4.set(function() {
					read('/sys/class/gpio/gpio4/value', function(val) {
						assert.equal(rmws(val), '1');
						done();
					});
				});
			});
		});

		describe('#reset', function() {
			it('should set header value to low', function(done) {
				gpio4.reset(function() {
					read('/sys/class/gpio/gpio4/value', function(val) {
						assert.equal(rmws(val), '0');
						done();
					});
				});
			});
		});

		describe('#on :change', function() {
			it('should fire callback when value changes', function(done) {
				var callback = sinon.spy();
				gpio4.on('change', callback); 

				// set, then reset
				gpio4.set(function() { gpio4.reset(); });

				// set and reset is async, wait some time before running assertions
				setTimeout(function() {
					assert.ok(callback.calledTwice);
					done();
					gpio4.removeListener('change', callback);
				}, 10);
			});
		});
	});

	// For these tests, make sure header 4 is connected to header 25
	// header 25 is exported with direction OUT and header 4 is used
	// to simulate a hardware interrupt
	describe('Header Direction In', function() {

		var gpio25;

		before(function(done) {
			gpio25 = gpio.export(25, {
				direction: gpio.DIRECTION.IN,
				ready: done
			});
		});
		after(function() {
			gpio25.unexport();
		});

		describe('#on :change', function() {
			it('should respond to hardware set', function(done) {
				var callback = sinon.spy();
				gpio25.on('change', callback); 

				// wait a little before setting
				setTimeout(function() { gpio4.set(); }, 500);

				// filewatcher has default interval of 100ms
				setTimeout(function() {
					assert.equal(gpio25.value, 1);
					assert.ok(callback.calledOnce);
					gpio25.removeListener('change', callback);
					done();
				}, 600);
			});

			it('should respond to hardware reset', function(done) {
				var callback = sinon.spy();
				gpio25.on('change', callback); 

				// wait a little before setting
				setTimeout(function() { gpio4.reset(); }, 500);

				// filewatcher has default interval of 100ms
				setTimeout(function() {
					assert.equal(gpio25.value, 0);
					assert.ok(callback.calledOnce);
					gpio25.removeListener('change', callback);
					done();
				}, 600);
			});
		});
	});
}

describe('PWM', function() {

    var pwm5;

    before(function(done) {
	pwm5 = pwm.export(0, 5);
    });

    after(function() {
	pwm5.unexport();
    });

    describe('Header Direction Out', function() {

	describe('initializing', function() {
	    it('should open specified header', function(done) {
		read('/sys/class/pwm/pwmchip0/pwm5/polarity', function(val) {
		    assert.equal(rmws(val), 'normal');
		    done();
		});
	    });
	});

	describe('#setPeriod', function() {
	    it('should set period value value to 1000', function(done) {
		pwm5.setPeriod(1000, function() {
		    read('/sys/class/pwm/pwmchip0/pwm5/period', function(val) {
			assert.equal(rmws(val), '1000');
			done();
		    });
		});
	    });
	});

	describe('#setDutyCycle', function() {
	    it('should set duty cycle value value to 1000', function(done) {
		pwm5.setDutyCycle(1000, function() {
		    read('/sys/class/pwm/pwmchip0/pwm5/duty_cycle', function(val) {
			assert.equal(rmws(val), '1000');
			done();
		    });
		});
	    });
	});

	describe('#reset', function() {
	    it('should set all values to 0', function(done) {
		gpio4.reset(function() {
		    read('/sys/class/pwm/pwmchip0/pwm5/duty_cycle', function(val) {
			assert.equal(rmws(val), '0');
		    });
		    read('/sys/class/pwm/pwmchip0/pwm5/period', function(val) {
			assert.equal(rmws(val), '0');
			done();
		    });
		});
	    });
	});
    });
});
