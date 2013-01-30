/**
 * Browser based bootup
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

  var Mocha = window.Mocha = require('mocha'),
      mocha = window.mocha = new Mocha({ reporter: 'html' });

  /**
   * Override ui to ensure that the ui functions are initialized.
   * Normally this would happen in Mocha.prototype.loadFiles.
   */

  mocha.ui = function(ui){
    Mocha.prototype.ui.call(this, ui);
    this.suite.emit('pre-require', window, null, this);
    return this;
  };

  /**
   * Setup mocha with the given setting options.
   */

  mocha.setup = function(opts){
    if ('string' == typeof opts) opts = { ui: opts };
    for (var opt in opts) this[opt](opts[opt]);
    return this;
  };

  /**
   * Run mocha, returning the Runner.
   */

  mocha.run = function(fn){
    var options = mocha.options;
    mocha.globals('location');

    var query = Mocha.utils.parseQuery(window.location.search || '');
    if (query.grep) mocha.grep(query.grep);
    if (query.invert) mocha.invert();

    return Mocha.prototype.run.call(mocha, function(){
      Mocha.utils.highlightTags('code');
      if (fn) fn();
    });
  };
})();

global = window;
