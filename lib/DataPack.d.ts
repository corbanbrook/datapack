import Schema from './Schema';
import Component from './Component';
export declare type Entity = {
    schemaId: number;
    uid: number;
} & any;
export default class DataPack {
    schemas: Map<string, Schema>;
    schemasById: Map<number, Schema>;
    cache: Map<number, Map<number, Entity>>;
    metrics: {
        serializeDuration: number;
        serializeNumItems: number;
        serializeByteLength: number;
        deserializeDuration: number;
        deserializeNumItems: number;
    };
    constructor(schemas?: Array<Schema>, options?: Object);
    addSchema(schema: Schema): void;
    removeSchema(key: string | number): Schema;
    getSchema(key: string | number): Schema;
    getDiffComponents(item: Entity, cachedItem: Entity): Array<Component>;
    serialize(clientId: number, items: Entity[], maxPacketSize?: number): ArrayBuffer;
    deserialize(buffer: ArrayBuffer): Entity[];
}
//# sourceMappingURL=DataPack.d.ts.map