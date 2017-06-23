'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Types;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DataTypes = exports.DataTypes = {
  Int8: 'Int8',
  Uint8: 'Uint8',
  Int16: 'Int16',
  Uint16: 'Uint16',
  Int32: 'Int32',
  Uint32: 'Uint32',
  Float32: 'Float32',
  Float64: 'Float64',
  Array: 'Array',
  Map: 'Map'
};

var Types = (_Types = {}, _defineProperty(_Types, DataTypes.Int8, { type: DataTypes.Int8, byteLength: 1, length: 1 }), _defineProperty(_Types, DataTypes.Uint8, { type: DataTypes.Uint8, byteLength: 1, length: 1 }), _defineProperty(_Types, DataTypes.Int16, { type: DataTypes.Int16, byteLength: 2, length: 1 }), _defineProperty(_Types, DataTypes.Uint16, { type: DataTypes.Uint16, byteLength: 2, length: 1 }), _defineProperty(_Types, DataTypes.Int32, { type: DataTypes.Int32, byteLength: 4, length: 1 }), _defineProperty(_Types, DataTypes.Uint32, { type: DataTypes.Uint32, byteLength: 4, length: 1 }), _defineProperty(_Types, DataTypes.Float32, { type: DataTypes.Float32, byteLength: 4, length: 1 }), _defineProperty(_Types, DataTypes.Float64, { type: DataTypes.Float64, byteLength: 4, length: 1 }), _defineProperty(_Types, DataTypes.Array, function (def, length) {
  var byteLength = def.byteLength * length;
  var read = function read(dataView, offset) {
    var littleEndian = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var result = [];
    for (var i = 0; i < length; i++) {
      var value = def.read(dataView, offset + i * def.byteLength, littleEndian);
      result.push(value);
    }
    return result;
  };
  var write = function write(dataView, offset) {
    var value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var littleEndian = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    for (var i = 0; i < length; i++) {
      def.write(dataView, offset + i * def.byteLength, value[i], littleEndian);
    }
  };
  return { type: DataTypes.Array, def: def, length: length, byteLength: byteLength, read: read, write: write };
}), _Types);

var createReader = function createReader(fn) {
  return function (dataView, byteOffset) {
    var littleEndian = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    return fn.call(dataView, byteOffset, littleEndian);
  };
};

var createWriter = function createWriter(fn) {
  return function (dataView, byteOffset, value) {
    var littleEndian = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    return fn.call(dataView, byteOffset, value, littleEndian

    // Cache read and write methods for each type
    );
  };
};Object.keys(Types).forEach(function (key) {
  var def = Types[key];
  if (key !== DataTypes.Array) {
    // $FlowFixMe: flow does not allow access to computed property on DataView
    def.read = createReader(DataView.prototype['get' + def.type]
    // $FlowFixMe: flow does not allow access to computed property on DataView
    );def.write = createWriter(DataView.prototype['set' + def.type]);
  }
}

// Aliases
);Types['Byte'] = Types[DataTypes.Uint8];
Types['Short'] = Types[DataTypes.Int16];
Types['UnsignedShort'] = Types[DataTypes.Uint16];
Types['Long'] = Types[DataTypes.Int32];
Types['UnsignedLong'] = Types[DataTypes.Uint32];
Types['Float'] = Types[DataTypes.Float32];
Types['Double'] = Types[DataTypes.Float64];

exports.default = Types;