/*
 * Things to remove when compiling for titanium:
 * require functions (but do require's work unmodified? probably not, probably need scoping)
 * EventEmitter implementation. use require('tipm-emitter2')
 * Array.prototype.reduce already exists, no need for modules such as 'RedVentures-reduce'
 * abstract any references to `root` object. do so by testing for existence of Titanium object and otherwise fallback
 * to window
 * something about http response Content-Type headers
 * possibly assignment of module.exports
 *
 * line 1392: looks like i need a path.resolve() function
 * rather, because of the require() call on line 1394, it looks like the while Mocha.prototype.loadFiles method will
 * have to be rewritten
 */

/**
 * Module dependencies.
 */

var fs = require('fs');

/**
 * Arguments.
 */

var target = process.argv[2],
    args = process.argv.slice(3)
  , pending = args.length
  , files = {};

console.log('');

// parse arguments

args.forEach(function(file){
  var mod = file.replace('lib/', '');
  fs.readFile(file, 'utf8', function(err, js){
    if (err) throw err;
    console.log('  \u001b[90mcompile : \u001b[0m\u001b[36m%s\u001b[0m', file);
    files[file] = ~js.indexOf('require: off')
      ? js
      : parse(js);
    --pending || compile();
  });
});

/**
 * Parse the given `js`.
 */

function parse(js) {
  return parseRequires(parseInheritance(js));
}

/**
 * Parse requires.
 */

function parseRequires(js) {
  return js
    .replace(/require\('events'\)/g, "require('browser/events')")
    .replace(/require\('debug'\)/g, "require('browser/debug')")
    .replace(/require\('path'\)/g, "require('browser/path')")
    .replace(/require\('diff'\)/g, "require('browser/diff')")
    .replace(/require\('tty'\)/g, "require('browser/tty')")
    .replace(/require\('fs'\)/g, "require('browser/fs')")
}

/**
 * Parse __proto__.
 */

function parseInheritance(js) {
  return js
    .replace(/^ *(\w+)\.prototype\.__proto__ * = *(\w+)\.prototype *;?/gm, function(_, child, parent){
      return 'function F(){};\n'
        + 'F.prototype = ' + parent + '.prototype;\n'
        + child + '.prototype = new F;\n'
        + child + '.prototype.constructor = '+ child + ';\n';
    });
}

/**
 * Compile the files.
 */

function compile() {
  var outputFile,
      buf = '';

  // start file with a CommonJS require() implementation
  buf += '\n// CommonJS require()\n\n';
  buf += browser.require + '\n\n';
  buf += 'require.modules = {};\n\n';
  buf += 'require.resolve = ' + browser.resolve + ';\n\n';
  buf += 'require.register = ' + browser.register + ';\n\n';
  buf += 'require.relative = ' + browser.relative + ';\n\n';

  // add all files in ./lib directory, makes use of CommonJS require() above
  args.forEach(function(file){
    var js = files[file];
    if (js.indexOf('skip: true') !== -1) return;
    file = file.replace('lib/', '');
    buf += '\nrequire.register("' + file + '", function(module, exports, require){\n';
    buf += js;
    buf += '\n}); // module: ' + file + '\n';
  });

  // target specific actions:
  //   assign outputFile name
  //   all global.js and boot.js
  if (target === '--browser') {
    outputFile = '_mocha.js';
    buf += files['lib/browser/global.js'];
    buf += files['lib/browser/boot.js'];
  } else if (target === '--titanium') {
    outputFile = '_aoberoi-ti-mocha.js';
    buf += files['lib/titanium/global.js'];
    buf += files['lib/titanium/boot.js'];
  } else {
    throw new Error('target not specified, use --browser or --titanium as the first argument');
  }

  // write out compiled file
  fs.writeFile(outputFile, buf, function(err){
    if (err) throw err;
    console.log('  \u001b[90m create : \u001b[0m\u001b[36m%s\u001b[0m', outputFile);
    console.log();
  });
}

// refactored version of weepy's
// https://github.com/weepy/brequire/blob/master/browser/brequire.js

var browser = {
  
  /**
   * Require a module.
   */
  
  require: function require(p){
    var path = require.resolve(p)
      , mod = require.modules[path];
    if (!mod) throw new Error('failed to require "' + p + '"');
    if (!mod.exports) {
      mod.exports = {};
      mod.call(mod.exports, mod, mod.exports, require.relative(path));
    }
    return mod.exports;
  },
  
  /**
   * Resolve module path.
   */

  resolve: function(path){
    var orig = path
      , reg = path + '.js'
      , index = path + '/index.js';
    return require.modules[reg] && reg
      || require.modules[index] && index
      || orig;
  },
  
  /**
   * Return relative require().
   */

  relative: function(parent) {
    return function(p){
      if ('.' != p.charAt(0)) return require(p);
      
      var path = parent.split('/')
        , segs = p.split('/');
      path.pop();
      
      for (var i = 0; i < segs.length; i++) {
        var seg = segs[i];
        if ('..' == seg) path.pop();
        else if ('.' != seg) path.push(seg);
      }

      return require(path.join('/'));
    };
  },
  
  /**
   * Register a module.
   */

  register: function(path, fn){
    require.modules[path] = fn;
  }
};
