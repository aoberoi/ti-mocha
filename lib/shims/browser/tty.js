
exports.isatty = function(){
  return true;
};

exports.getWindowSize = function(){
  return [global.innerHeight, global.innerWidth];
};
