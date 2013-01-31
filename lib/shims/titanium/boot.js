/**
 * Titanim based bootup
 *
 * skip: true
 *
 * Creates a Mocha instance that is ready to go with the options
 * that make sense inside the browser.
 */

;(function(){

  /**
   * Expose mocha.
   */

  var Mocha = global.Mocha = require('mocha'),
      mocha = global.mocha = new Mocha({ reporter: 'ti-json' });

  /**
   * Override ui to ensure that the ui functions are initialized.
   * Normally this would happen in Mocha.prototype.loadFiles.
   */

  //mocha.ui = function(ui){
  //  Mocha.prototype.ui.call(this, ui);
  //  this.suite.emit('pre-require', global, null, this);
  //  return this;
  //};

  /**
   * Run mocha, returning the Runner.
   */

  //mocha.run = function(fn){
  //  var options = mocha.options;
  //  mocha.globals('location');

  //  var query = Mocha.utils.parseQuery(window.location.search || '');
  //  if (query.grep) mocha.grep(query.grep);
  //  if (query.invert) mocha.invert();

  //  return Mocha.prototype.run.call(mocha, function(){
  //    Mocha.utils.highlightTags('code');
  //    if (fn) fn();
  //  });
  //};

  /**
   * Reimplementation of Mocha#loadFiles
   */

  mocha.loadFiles = function() {
    var self = this;
    var suite = this.suite;
    var pending = this.files.length;
    this.files.forEach(function(file){
      // assume that `file` is already relative to the Resources directory
      //file = path.resolve(file);
      suite.emit('pre-require', global, file, self);
      suite.emit('require', nativeRequire(file).injectContext(global), file, self);
      suite.emit('post-require', global, file, self);
      --pending || (fn && fn());
    });
  };

})();

