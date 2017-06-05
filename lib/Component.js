'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Types = require('./Types');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Component = function () {
  function Component(name, def) {
    _classCallCheck(this, Component);

    this.flag = 0;

    this.name = name;
    this.def = def;
    this.byteLength = def.byteLength;
  }

  _createClass(Component, [{
    key: 'read',
    value: function read(dataView, offset) {
      var littleEndian = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      return this.def.read(dataView, offset, littleEndian);
    }
  }, {
    key: 'write',
    value: function write(dataView, offset, value) {
      var littleEndian = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      this.def.write(dataView, offset, value, littleEndian);
    }
  }, {
    key: 'isEqual',
    value: function isEqual(a, b) {
      var aValue = a[this.name],
          bValue = b[this.name];

      if (this.def.type === _Types.DataTypes.Array) {
        return !aValue.some(function (value, idx) {
          return value !== bValue[idx];
        });
      } else {
        return aValue === bValue;
      }
    }
  }]);

  return Component;
}();

exports.default = Component;