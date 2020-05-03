"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var DataType;
(function (DataType) {
    DataType["Int8"] = "Int8";
    DataType["Uint8"] = "Uint8";
    DataType["Int16"] = "Int16";
    DataType["Uint16"] = "Uint16";
    DataType["Int32"] = "Int32";
    DataType["Uint32"] = "Uint32";
    DataType["Float32"] = "Float32";
    DataType["Float64"] = "Float64";
    DataType["Array"] = "Array";
})(DataType = exports.DataType || (exports.DataType = {}));
var DataTypeAlias;
(function (DataTypeAlias) {
    DataTypeAlias["Byte"] = "Uint8";
    DataTypeAlias["Short"] = "Int16";
    DataTypeAlias["UnsignedShort"] = "Uint16";
    DataTypeAlias["Long"] = "Int32";
    DataTypeAlias["UnsignedLong"] = "Uint32";
    DataTypeAlias["Float"] = "Float32";
    DataTypeAlias["Double"] = "Float64";
})(DataTypeAlias || (DataTypeAlias = {}));
var dataTypeConfigs = (_a = {},
    _a[DataType.Int8] = {
        type: DataType.Int8,
        byteLength: 1,
        length: 1
    },
    _a[DataType.Uint8] = {
        type: DataType.Uint8,
        byteLength: 1,
        length: 1
    },
    _a[DataType.Int16] = {
        type: DataType.Int16,
        byteLength: 2,
        length: 1
    },
    _a[DataType.Uint16] = {
        type: DataType.Uint16,
        byteLength: 2,
        length: 1
    },
    _a[DataType.Int32] = {
        type: DataType.Int32,
        byteLength: 4,
        length: 1
    },
    _a[DataType.Uint32] = {
        type: DataType.Uint32,
        byteLength: 4,
        length: 1
    },
    _a[DataType.Float32] = {
        type: DataType.Float32,
        byteLength: 4,
        length: 1
    },
    _a[DataType.Float64] = {
        type: DataType.Float64,
        byteLength: 4,
        length: 1
    },
    _a);
var createReader = function (fn) { return function (dataView, byteOffset, littleEndian) {
    if (littleEndian === void 0) { littleEndian = false; }
    return fn.call(dataView, byteOffset, littleEndian);
}; };
var createWriter = function (fn) { return function (dataView, byteOffset, value, littleEndian) {
    if (littleEndian === void 0) { littleEndian = false; }
    return fn.call(dataView, byteOffset, value, littleEndian);
}; };
var dataTypeDefinitions = Object.keys(dataTypeConfigs).reduce(function (acc, type) {
    var def = dataTypeConfigs[type];
    def.read = createReader(DataView.prototype["get" + type]);
    def.write = createWriter(DataView.prototype["set" + type]);
    acc[type] = def;
    return acc;
}, {});
var dataTypeAliasDefinitions = Object.keys(DataTypeAlias).reduce(function (acc, alias) {
    var type = DataTypeAlias[alias];
    acc[alias] = dataTypeDefinitions[type];
    return acc;
}, {});
var Type = __assign(__assign(__assign({}, dataTypeDefinitions), dataTypeAliasDefinitions), (_b = {}, _b[DataType.Array] = function (def, length) {
    var byteLength = def.byteLength * length;
    var read = function (dataView, offset, littleEndian) {
        if (littleEndian === void 0) { littleEndian = false; }
        var result = [];
        for (var i = 0; i < length; i++) {
            var value = def.read(dataView, offset + i * def.byteLength, littleEndian);
            result.push(value);
        }
        return result;
    };
    var write = function (dataView, offset, value, littleEndian) {
        if (value === void 0) { value = []; }
        if (littleEndian === void 0) { littleEndian = false; }
        for (var i = 0; i < length; i++) {
            def.write(dataView, offset + i * def.byteLength, value[i], littleEndian);
        }
    };
    return { type: DataType.Array, def: def, length: length, byteLength: byteLength, read: read, write: write };
}, _b));
Type.Uint16;
Type.Byte;
exports.default = Type;
//# sourceMappingURL=Type.js.map