declare type ArrayReader = (dataView: DataView, byteOffset: number, littleEndian?: boolean) => number[];
declare type ArrayWriter = (dataView: DataView, byteOffset: number, value: number[], littleEndian?: boolean) => void;
export interface TypeDefinition {
    type: DataType;
    byteLength: number;
    length: number;
    read: any;
    write: any;
}
export declare enum DataType {
    Int8 = "Int8",
    Uint8 = "Uint8",
    Int16 = "Int16",
    Uint16 = "Uint16",
    Int32 = "Int32",
    Uint32 = "Uint32",
    Float32 = "Float32",
    Float64 = "Float64",
    Array = "Array"
}
declare const Type: {
    Array: (def: TypeDefinition, length: number) => {
        type: DataType;
        def: TypeDefinition;
        length: number;
        byteLength: number;
        read: ArrayReader;
        write: ArrayWriter;
    };
    Byte: TypeDefinition;
    Short: TypeDefinition;
    UnsignedShort: TypeDefinition;
    Long: TypeDefinition;
    UnsignedLong: TypeDefinition;
    Float: TypeDefinition;
    Double: TypeDefinition;
    Int8: TypeDefinition;
    Uint8: TypeDefinition;
    Int16: TypeDefinition;
    Uint16: TypeDefinition;
    Int32: TypeDefinition;
    Uint32: TypeDefinition;
    Float32: TypeDefinition;
    Float64: TypeDefinition;
};
export default Type;
//# sourceMappingURL=Type.d.ts.map