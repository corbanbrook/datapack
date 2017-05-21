//@flow

type TypeDefinition = {
  type: string,
  byteLength: number,
  read: Function,
  write: Function
}

export const DataTypes: { [key: string]: string } = {
  Int8:    'Int8',
  Uint8:   'Uint8',
  Int16:   'Int16',
  Uint16:  'Uint16',
  Int32:   'Int32',
  Uint32:  'Uint32',
  Float32: 'Float32',
  Float64: 'Float64',
  Array:   'Array',
  Map:     'Map'
}

type DataTypeKeys = $Keys<typeof DataTypes>

const Types: { [key: DataTypeKeys]: TypeDefinition | Function } = {
  [DataTypes.Int8]:     { type: DataTypes.Int8,     byteLength: 1 },
  [DataTypes.Uint8]:    { type: DataTypes.Uint8,    byteLength: 1 },
  [DataTypes.Int16]:    { type: DataTypes.Int16,    byteLength: 2 },
  [DataTypes.Uint16]:   { type: DataTypes.Uint16,   byteLength: 2 },
  [DataTypes.Int32]:    { type: DataTypes.Int32,    byteLength: 4 },
  [DataTypes.Uint32]:   { type: DataTypes.Uint32,   byteLength: 4 },
  [DataTypes.Float32]:  { type: DataTypes.Float32,  byteLength: 4 },
  [DataTypes.Float64]:  { type: DataTypes.Float64,  byteLength: 4 },

  [DataTypes.Array]: (def: Object, length: number): TypeDefinition => {
    const byteLength = def.byteLength * length
    const read = (dataView: DataView, offset: number, littleEndian: boolean = false): Array<*> => {
      const result = []
      for (let i = 0; i < length; i++) {
        const value = def.read(dataView, offset + i * def.byteLength, littleEndian)
        result.push(value)
      }
      return result
    }
    const write = (dataView: DataView, offset: number, value: any, littleEndian: boolean = false) => {
      for (let i = 0; i < length; i++) {
        def.write(dataView, offset + i * def.byteLength, value[i], littleEndian)
      }
    }
    return { type: DataTypes.Array, def, length, byteLength, read, write }
  }
}

const createReader = (fn: Function): Function =>
  (dataView: any, byteOffset: number, littleEndian: boolean = false) =>
    fn.call(dataView, byteOffset, littleEndian)

const createWriter = (fn: Function): Function =>
  (dataView: any, byteOffset: number, value: any, littleEndian: boolean = false) =>
    fn.call(dataView, byteOffset, value, littleEndian)

// Cache read and write methods for each type
Object.keys(Types).forEach(key => {
  const def = Types[key]
  if (key !== DataTypes.Array) {
    // $FlowFixMe: flow does not allow access to computed property on DataView
    def.read = createReader(DataView.prototype[`get${def.type}`])
    // $FlowFixMe: flow does not allow access to computed property on DataView
    def.write = createWriter(DataView.prototype[`set${def.type}`])
  }
})

// Aliases
Types['Byte']           = Types[DataTypes.Uint8]
Types['Short']          = Types[DataTypes.Int16]
Types['UnsignedShort']  = Types[DataTypes.Uint16]
Types['Long']           = Types[DataTypes.Int32]
Types['UnsignedLong']   = Types[DataTypes.Uint32]
Types['Float']          = Types[DataTypes.Float32]
Types['Double']         = Types[DataTypes.Float64]

export default Types
