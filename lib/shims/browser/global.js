/**
 * Node shims.
 *
 * skip: true
 *
 * These are meant only to allow
 * mocha.js to run untouched, not
 * to allow running node code in
 * the browser.
 */

var global = window;

/**
 * Shim for process
 */

process = {};
process.exit = function(status){};
process.stdout = {};

/**
 * next tick implementation.
 */

process.nextTick = (function(){
  // postMessage behaves badly on IE8
  if (global.ActiveXObject || !global.postMessage) {
    return function(fn){ fn() };
  }

  // based on setZeroTimeout by David Baron
  // - http://dbaron.org/log/20100309-faster-timeouts
  var timeouts = []
    , name = 'mocha-zero-timeout'

  global.addEventListener('message', function(e){
    if (e.source == global && e.data == name) {
      if (e.stopPropagation) e.stopPropagation();
      if (timeouts.length) timeouts.shift()();
    }
  }, true);

  return function(fn){
    timeouts.push(fn);
    global.postMessage(name, '*');
  }
})();

/**
 * Remove uncaughtException listener.
 */

process.removeListener = function(e){
  if ('uncaughtException' == e) {
    global.onerror = null;
  }
};

/**
 * Implements uncaughtException listener.
 */

process.on = function(e, fn){
  if ('uncaughtException' == e) {
    global.onerror = function(err, url, line){
      fn(new Error(err + ' (' + url + ':' + line + ')'));
    };
  }
};
