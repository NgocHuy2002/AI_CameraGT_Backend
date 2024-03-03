if (!Array.prototype.clone) { // define format of Array
  Array.prototype.clone = function() {
    return this.slice(0);
  };
}

if (!String.prototype.format) { // define format of string
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] !== 'undefined' ? args[number] : '';
    });
  };
}


if (!String.prototype.toDate) { // define format of string
  String.prototype.toDate = function() {
    let date = new Date(this);
    return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
  };
}

if (!Array.prototype.last) { // get last item of array
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
}

if (!Array.prototype.first) { // get last item of array
  Array.prototype.first = function() {
    return this[0];
  };
}

if (!Array.prototype.max) {
  Array.prototype.max = function() {
    return Math.max.apply(null, this);
  };
}
if (!Array.prototype.min) {
  Array.prototype.min = function() {
    return Math.min.apply(null, this);
  };
}
if (!Array.prototype.insert) {
  Array.prototype.insert = function(index, item) {
    this.splice(index, 0, item);
  };
}
Object.defineProperties(Array.prototype, {
  count: {
    value: function(value) {
      return this.filter(x => x == value).length;
    },
  },
});
