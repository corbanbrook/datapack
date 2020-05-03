"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Component_1 = __importDefault(require("./Component"));
var Type_1 = __importStar(require("./Type"));
var helpers_1 = require("./helpers");
var Schema = /** @class */ (function () {
    function Schema(id, name, components, options) {
        var _this = this;
        if (components === void 0) { components = []; }
        if (options === void 0) { options = {}; }
        this.byteLength = 0;
        this.headerByteLength = 0;
        this.header = new Map();
        this.components = new Map();
        this.options = {
            diff: false
        };
        this.id = id;
        this.name = name;
        Object.assign(this.options, options);
        this.header.set('schemaId', new Component_1.default('schemaId', Type_1.default.Uint16));
        this.header.set('uid', new Component_1.default('uid', Type_1.default.Uint16));
        if (this.options.diff) {
            this.header.set('bitmask', new Component_1.default('bitmask', Type_1.default.Uint16));
        }
        this.header.forEach(function (component) { return (_this.headerByteLength += component.byteLength); });
        this.byteLength = this.headerByteLength;
        components.forEach(function (component, componentIdx) {
            component.flag = 1 << componentIdx;
            _this.byteLength += component.byteLength;
            _this.components.set(component.name, component);
        }, 0);
    }
    Schema.prototype.get = function (name) {
        if (this.components.has(name)) {
            return this.components.get(name);
        }
        throw new Error('Could not get component.');
    };
    Schema.prototype.getByteLength = function (components) {
        if (components && components.length) {
            return components.reduce(function (acc, c) {
                acc += c.byteLength;
                return acc;
            }, this.headerByteLength);
        }
        else {
            return this.byteLength;
        }
    };
    Schema.prototype.getComponentsFromBitmask = function (bitmask) {
        return Array.from(this.components.values()).filter(function (component) {
            return helpers_1.hasFlag(bitmask, component.flag);
        });
    };
    Schema.prototype.getComponentsBitmask = function (components) {
        var bitmask = 0;
        components.forEach(function (component) {
            bitmask = bitmask | component.flag;
        });
        return bitmask;
    };
    Schema.prototype.serialize = function (dataView, offset, components, props) {
        var byteLength = 0;
        var headerProps = {
            schemaId: this.id,
            uid: props.uid,
            bitmask: 0
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
    };
    Schema.prototype.deserialize = function (dataView, offset, callback) {
        var result = {};
        var byteLength = 0;
        this.header.forEach(function (component) {
            result[component.name] = component.read(dataView, offset + byteLength);
            byteLength += component.byteLength;
        });
        var components = this.options.diff
            ? this.getComponentsFromBitmask(result.bitmask)
            : this.components;
        components.forEach(function (component) {
            result[component.name] = component.read(dataView, offset + byteLength);
            byteLength += component.byteLength;
        });
        callback(result);
        return byteLength;
    };
    Schema.prototype.clone = function (item) {
        var result = {};
        this.components.forEach(function (component) {
            var name = component.name, def = component.def;
            var value = item[name];
            if (def.type === Type_1.DataType.Array) {
                result[name] = [];
                for (var idx = 0, len = def.length; idx < len; idx++) {
                    result[name][idx] = value[idx];
                }
            }
            else {
                result[name] = value;
            }
        });
        return result;
    };
    return Schema;
}());
exports.default = Schema;
//# sourceMappingURL=Schema.js.map