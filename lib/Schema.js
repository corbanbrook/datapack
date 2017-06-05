'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Component = require('./Component');

var _Component2 = _interopRequireDefault(_Component);

var _Types = require('./Types');

var _Types2 = _interopRequireDefault(_Types);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Schema = function () {
  function Schema(id, name) {
    var _this = this;

    var components = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    _classCallCheck(this, Schema);

    this.components = new Map();
    this.byteLength = 0;
    this.headerByteLength = 0;
    this.options = {};
    this.header = new Map();

    this.id = id;
    this.name = name;
    this.options = options;

    this.header.set('schemaId', new _Component2.default('schemaId', _Types2.default.Uint16));
    this.header.set('uid', new _Component2.default('uid', _Types2.default.Uint16));

    if (this.options.diff) {
      this.header.set('bitmask', new _Component2.default('bitmask', _Types2.default.Uint16));
    }

    this.header.forEach(function (component) {
      return _this.headerByteLength += component.byteLength;
    });

    this.byteLength = this.headerByteLength;

    components.forEach(function (component, componentIdx) {
      component.flag = 1 << componentIdx;
      _this.byteLength += component.byteLength;
      _this.components.set(component.name, component);
    }, 0);
  }

  _createClass(Schema, [{
    key: 'getByteLength',
    value: function getByteLength(components) {
      if (components && components.length) {
        return components.reduce(function (acc, c) {
          acc += c.byteLength;
          return acc;
        }, this.headerByteLength);
      } else {
        return this.byteLength;
      }
    }
  }, {
    key: 'getComponentsFromBitmask',
    value: function getComponentsFromBitmask(bitmask) {
      return Array.from(this.components.values()).filter(function (component) {
        return (0, _helpers.hasFlag)(bitmask, component.flag);
      });
    }
  }, {
    key: 'getComponentsBitmask',
    value: function getComponentsBitmask(components) {
      var bitmask = 0;

      components.forEach(function (component) {
        bitmask = bitmask | component.flag;
      });

      return bitmask;
    }
  }, {
    key: 'serialize',
    value: function serialize(dataView, offset, components, props) {
      var byteLength = 0;

      var headerProps = {
        schemaId: this.id,
        uid: props.uid,
        bitmask: undefined
      };

      if (this.options.diff) {
        headerProps.bitmask = this.getComponentsBitmask(components);
      }

      this.header.forEach(function (component, idx) {
        component.write(dataView, offset + byteLength, headerProps[component.name]);
        byteLength += component.byteLength;
      });

      components.forEach(function (component) {
        component.write(dataView, offset + byteLength, props[component.name]);
        byteLength += component.byteLength;
      });

      return byteLength;
    }
  }, {
    key: 'deserialize',
    value: function deserialize(dataView, offset, callback) {
      var result = {};
      var byteLength = 0;

      this.header.forEach(function (component) {
        result[component.name] = component.read(dataView, offset + byteLength);
        byteLength += component.byteLength;
      });

      var components = this.options.diff ? this.getComponentsFromBitmask(result.bitmask) : this.components;
      components.forEach(function (component) {
        result[component.name] = component.read(dataView, offset + byteLength);
        byteLength += component.byteLength;
      });

      callback(result);

      return byteLength;
    }
  }, {
    key: 'clone',
    value: function clone(item) {
      var result = {};

      this.components.forEach(function (component) {
        var name = component.name,
            _component$def = component.def,
            type = _component$def.type,
            length = _component$def.length;

        var value = item[name];
        if (type === _Types.DataTypes.Array) {
          result[name] = [];
          for (var idx = 0; idx < length; idx++) {
            result[name][idx] = value[idx];
          }
        } else {
          result[name] = value;
        }
      });

      return result;
    }
  }]);

  return Schema;
}();

exports.default = Schema;