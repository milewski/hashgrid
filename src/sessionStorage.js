var SessionStorage = (function() {

  function SessionStorage() {
    this.storage = window.sessionStorage;
  }

  SessionStorage.prototype.read = function(dataLabel) {
    var dataValue = this.storage.getItem(dataLabel);

    if(dataValue) {
      return JSON.parse(dataValue);
    }
    else {
      return null;
    }
  };

  SessionStorage.prototype.write = function(dataLabel, dataValue) {
    this.storage.setItem(dataLabel, JSON.stringify(dataValue));
    return dataValue;
  };

  SessionStorage.prototype.remove = function(dataLabel) {
    var removedDataValue = this.read(dataLabel);

    if(removedDataValue) {
      this.storage.removeItem(dataLabel);
      return removedDataValue;
    }
    else {
      return null;
    }
  };

  return SessionStorage;

})();

if (typeof module!="undefined" && module.exports) module.exports = SessionStorage;