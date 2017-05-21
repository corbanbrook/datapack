'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var SchemaRegistry = {
  collection: new Map(),

  get length() {
    return this.collection.size;
  },

  get: function get(identifier) {
    if (typeof identifier === 'number') {
      return this.collection.get(identifier);
    }

    if (typeof identifier === 'string') {
      return [].concat(_toConsumableArray(this.collection.values())).find(function (schema) {
        return schema.name === identifier;
      });
    }
  },
  add: function add(schema) {
    this.collection.set(schema.id, schema);
  },
  remove: function remove(id) {
    this.collection.delete(id);
  }
};

exports.default = SchemaRegistry;