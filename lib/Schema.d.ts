import Component from './Component';
interface SchemaOptions {
    diff: boolean;
}
export default class Schema {
    id: number;
    name: string;
    byteLength: number;
    headerByteLength: number;
    header: Map<string, Component>;
    components: Map<string, Component>;
    options: SchemaOptions;
    constructor(id: number, name: string, components?: Array<Component>, options?: Partial<SchemaOptions>);
    get(name: string): Component;
    getByteLength(components?: Array<Component>): number;
    getComponentsFromBitmask(bitmask: number): Array<Component>;
    getComponentsBitmask(components: Array<Component>): number;
    serialize(dataView: DataView, offset: number, components: Array<Component>, props: {
        uid: number;
    } & any): number;
    deserialize(dataView: DataView, offset: number, callback: Function): number;
    clone(item: any): any;
}
export {};
//# sourceMappingURL=Schema.d.ts.map