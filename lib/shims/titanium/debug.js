
module.exports = function(type){
  return function(msg){
    console.debug(type + ': ' + msg);
  };
};
