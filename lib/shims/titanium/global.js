/**
 * Node shims.
 *
 * skip: true
 */

var global = exports;

/**
 * Shim for process
 */

process = {};

/**
 * exit is a dummy method
 */

process.exit = function(code){
  console.log('process.exit() called with code: ' + code);
};

/**
 * stdout is a dummy object, not a real Writable Stream
 */

process.stdout = {};

/**
 * next tick implementation.
 */

process.nextTick = function(f){
  setTimeout(f, 0);
};

/**
 * Remove uncaughtException listener.
 */

process.removeListener = function(e){};

/**
 * Implements uncaughtException listener.
 */

process.on = function(e, fn){
  if ('uncaughtException' == e) {
    console.warn('attaching handlers to the uncaughtException event is not supported in the Titanium environment');
  }
};
