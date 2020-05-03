import type { TypeDefinition } from './Type';
import { Entity } from './DataPack';
export default class Component {
    name: string;
    def: TypeDefinition;
    flag: number;
    byteLength: number;
    constructor(name: string, def: TypeDefinition);
    read(dataView: DataView, offset: number, littleEndian?: boolean): any;
    write(dataView: DataView, offset: number, value: number, littleEndian?: boolean): void;
    isEqual(a: Entity, b: Entity): boolean;
}
//# sourceMappingURL=Component.d.ts.map