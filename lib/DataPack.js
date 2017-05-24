'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Schema = require('./Schema');

var _Schema2 = _interopRequireDefault(_Schema);

var _Component = require('./Component');

var _Component2 = _interopRequireDefault(_Component);

var _ramda = require('ramda');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataPack = function () {
  function DataPack() {
    var schemas = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, DataPack);

    this.schemas = new Map();
    this.schemasById = new Map();
    this.cache = new Map();

    schemas.forEach(this.addSchema.bind(this));
  }

  _createClass(DataPack, [{
    key: 'addSchema',
    value: function addSchema(schema) {
      if (this.schemas.has(schema.name)) {
        throw new Error('DataPack:addSchema - schema with the name ' + schema.name + ' already registered.');
      } else if (this.schemasById.has(schema.id)) {
        throw new Error('DataPack:addSchema - schema with the id ' + schema.id + ' already registered.');
      } else {
        this.schemas.set(schema.name, schema);
        this.schemasById.set(schema.id, schema);
      }
    }
  }, {
    key: 'removeSchema',
    value: function removeSchema(key) {
      var schema = this.getSchema(key);
      this.schemas.delete(schema.name);
      this.schemasById.delete(schema.id);

      return schema;
    }
  }, {
    key: 'getSchema',
    value: function getSchema(key) {
      var schema = void 0;
      if (typeof key === 'string') {
        schema = this.schemas.get(key);
      } else if (typeof key === 'number') {
        schema = this.schemasById.get(key);
      }

      if (!schema) {
        throw new Error('DataPack:getSchema - could not find schema by ' + key);
      }

      return schema;
    }
  }, {
    key: 'getDiffComponents',
    value: function getDiffComponents(item, cachedItem) {
      var schema = this.getSchema(item.schemaId);
      var components = Array.from(schema.components.values()).filter(function (component) {
        return !(0, _ramda.equals)(item[component.name], cachedItem[component.name]);
      });

      return components;
    }
  }, {
    key: 'serialize',
    value: function serialize(clientId, items) {
      var _this = this;

      var maxPacketSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;

      var idx = 0;
      var totalByteLength = 0;
      var includedItemCount = 0;

      var selected = [];

      if (!this.cache.has(clientId)) {
        this.cache.set(clientId, new Map());
      }
      var cache = this.cache.get(clientId);

      if (!cache) {
        throw new Error('DataPack:createPacket - cache could not be created');
      }

      items.some(function (item) {
        var schema = _this.getSchema(item.schemaId);
        var cachedItem = cache.get(item.uid);

        var components = void 0;
        if (cachedItem) {
          // Cache hit - get the changed components
          components = _this.getDiffComponents(item, cachedItem);
        } else {
          // No cache - get all components from schema
          components = Array.from(schema.components.values());
        }

        if (components.length === 0) {
          return;
        }

        var byteLength = schema.getByteLength(components);

        if (byteLength && totalByteLength + byteLength <= maxPacketSize) {
          totalByteLength += byteLength;
          includedItemCount++;

          // Save this included item in the cache
          cache.set(item.uid, item);

          selected.push({ props: item, schema: schema, components: components });
        }
      });

      var buffer = new ArrayBuffer(totalByteLength);
      var dataView = new DataView(buffer, 0, buffer.byteLength);
      var byteView = new Uint8Array(buffer, 0, buffer.byteLength);
      var offset = 0;
      selected.forEach(function (data) {
        var byteLength = data.schema.serialize(dataView, offset, data.components, data.props);
        offset += byteLength;
      });

      return buffer;
    }
  }, {
    key: 'deserialize',
    value: function deserialize(buffer) {
      var dataView = new DataView(buffer, 0, buffer.byteLength);
      var results = [];

      var offset = 0;
      while (offset < buffer.byteLength) {
        var _schemaId = dataView.getUint16(offset);
        var schema = this.getSchema(_schemaId);
        var byteLength = schema.deserialize(dataView, offset, function (result) {
          results.push(result);
        });
        offset += byteLength;
      }

      return results;
    }

    // serialize(items: Array<any> = [], options: Object = {}) {
    //   const { sequenceNumber, clientState } = options
    //   let offset = 0, totalByteLength = 0
    //
    //   if (sequenceNumber != null) {
    //     totalByteLength++
    //   }
    //
    //   // Calculate size of all items
    //   for (let i = 0, len = items.length; i < len; i++) {
    //     totalByteLength += items[i].data.byteLength + 1 // 1 byte overhead per item
    //   }
    //
    //   // Create buffer to hold items
    //   const buffer = new ArrayBuffer(totalByteLength)
    //   const dataView = new DataView(buffer, 0, buffer.byteLength)
    //   const byteView = new Uint8Array(buffer, 0, buffer.byteLength)
    //
    //   // Add sequenceNumber
    //   if (sequenceNumber != null) {
    //     dataView.setUint8(offset++, options.sequenceNumber)
    //   }
    //
    //   // Update clientState to keep in sync
    //   // if (clientState != null) {
    //   //   clientState.set(item.uid, item.props)
    //   // }
    //
    //   // Add item data to buffer
    //   let item
    //   for (let i = 0, len = items.length; i < len; i++) {
    //     item = items[i]
    //     dataView.setUint8(offset++, item.gameObject.schema.id)
    //     byteView.set(new Uint8Array(item.data), offset)
    //     offset += item.data.byteLength
    //   }
    //
    //   return buffer
    // }

  }]);

  return DataPack;
}();

exports.default = DataPack;