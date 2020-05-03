"use strict";
//@flow
Object.defineProperty(exports, "__esModule", { value: true });
var Type_1 = require("./Type");
var Component = /** @class */ (function () {
    function Component(name, def) {
        this.flag = 0;
        this.byteLength = 0;
        this.name = name;
        this.def = def;
        this.byteLength = def.byteLength;
    }
    Component.prototype.read = function (dataView, offset, littleEndian) {
        if (littleEndian === void 0) { littleEndian = false; }
        return this.def.read(dataView, offset, littleEndian);
    };
    Component.prototype.write = function (dataView, offset, value, littleEndian) {
        if (littleEndian === void 0) { littleEndian = false; }
        this.def.write(dataView, offset, value, littleEndian);
    };
    Component.prototype.isEqual = function (a, b) {
        var aValue = a[this.name], bValue = b[this.name];
        if (this.def.type === Type_1.DataType.Array) {
            return !aValue.some(function (value, idx) { return value !== bValue[idx]; });
        }
        else {
            return aValue === bValue;
        }
    };
    return Component;
}());
exports.default = Component;
//# sourceMappingURL=Component.js.map