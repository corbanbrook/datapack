"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataPack = /** @class */ (function () {
    function DataPack(schemas, options) {
        if (schemas === void 0) { schemas = []; }
        if (options === void 0) { options = {}; }
        this.schemas = new Map();
        this.schemasById = new Map();
        this.cache = new Map();
        this.metrics = {
            serializeDuration: 0,
            serializeNumItems: 0,
            serializeByteLength: 0,
            deserializeDuration: 0,
            deserializeNumItems: 0
        };
        schemas.forEach(this.addSchema.bind(this));
    }
    DataPack.prototype.addSchema = function (schema) {
        if (this.schemas.has(schema.name)) {
            throw new Error("DataPack:addSchema - schema with the name " + schema.name + " already registered.");
        }
        else if (this.schemasById.has(schema.id)) {
            throw new Error("DataPack:addSchema - schema with the id " + schema.id + " already registered.");
        }
        else {
            this.schemas.set(schema.name, schema);
            this.schemasById.set(schema.id, schema);
        }
    };
    DataPack.prototype.removeSchema = function (key) {
        var schema = this.getSchema(key);
        this.schemas.delete(schema.name);
        this.schemasById.delete(schema.id);
        return schema;
    };
    DataPack.prototype.getSchema = function (key) {
        var schema;
        if (typeof key === 'string') {
            schema = this.schemas.get(key);
        }
        else if (typeof key === 'number') {
            schema = this.schemasById.get(key);
        }
        if (!schema) {
            throw new Error("DataPack:getSchema - could not find schema by " + key);
        }
        return schema;
    };
    DataPack.prototype.getDiffComponents = function (item, cachedItem) {
        var schema = this.getSchema(item.schemaId);
        var components = Array.from(schema.components.values()).filter(function (component) {
            return !component.isEqual(item, cachedItem);
        });
        return components;
    };
    DataPack.prototype.serialize = function (clientId, items, maxPacketSize) {
        if (maxPacketSize === void 0) { maxPacketSize = Infinity; }
        var startedAt = Date.now();
        var idx = 0;
        var totalByteLength = 0;
        var includedItemCount = 0;
        var selected = new Array(items.length);
        var selectedOffset = 0;
        if (!this.cache.has(clientId)) {
            this.cache.set(clientId, new Map());
        }
        var cache = this.cache.get(clientId);
        if (!cache) {
            throw new Error('DataPack:createPacket - cache could not be created');
        }
        for (var idx_1 = 0, len = items.length; idx_1 < len; idx_1++) {
            var item = items[idx_1];
            var schema = this.getSchema(item.schemaId);
            var components = void 0, cachedItem = void 0;
            if (schema.options.diff && (cachedItem = cache.get(item.uid))) {
                // Cache hit - get the changed components
                components = this.getDiffComponents(item, cachedItem);
            }
            else {
                // No cache - get all components from schema
                components = Array.from(schema.components.values());
            }
            if (components.length === 0) {
                continue;
            }
            var byteLength = schema.getByteLength(components);
            if (totalByteLength + byteLength <= maxPacketSize) {
                totalByteLength += byteLength;
                includedItemCount++;
                // Save this included item in the cache
                if (schema.options.diff) {
                    cache.set(item.uid, schema.clone(item));
                }
                selected[selectedOffset++] = { props: item, schema: schema, components: components };
            }
            else {
                break;
            }
        }
        var buffer = new ArrayBuffer(totalByteLength);
        var dataView = new DataView(buffer, 0, buffer.byteLength);
        var offset = 0;
        for (var idx_2 = 0; idx_2 < selectedOffset; idx_2++) {
            var data = selected[idx_2];
            offset += data.schema.serialize(dataView, offset, data.components, data.props);
        }
        this.metrics.serializeDuration = Date.now() - startedAt;
        this.metrics.serializeNumItems = includedItemCount;
        this.metrics.serializeByteLength = totalByteLength;
        return buffer;
    };
    DataPack.prototype.deserialize = function (buffer) {
        var startedAt = Date.now();
        var dataView = new DataView(buffer, 0, buffer.byteLength);
        var results = [];
        var offset = 0;
        var numItems = 0;
        while (offset < buffer.byteLength) {
            var schemaId = dataView.getUint16(offset);
            var schema = this.getSchema(schemaId);
            var byteLength = schema.deserialize(dataView, offset, function (result) {
                results.push(result);
            });
            offset += byteLength;
            numItems++;
        }
        this.metrics.deserializeDuration = Date.now() - startedAt;
        this.metrics.deserializeNumItems = numItems;
        return results;
    };
    return DataPack;
}());
exports.default = DataPack;
//# sourceMappingURL=DataPack.js.map