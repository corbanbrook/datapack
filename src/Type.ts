type Reader = (
  dataView: DataView,
  byteOffset: number,
  littleEndian?: boolean
) => number

type Writer = (
  dataView: DataView,
  byteOffset: number,
  value: number,
  littleEndian?: boolean
) => void

type ArrayReader = (
  dataView: DataView,
  byteOffset: number,
  littleEndian?: boolean
) => number[]

type ArrayWriter = (
  dataView: DataView,
  byteOffset: number,
  value: number[],
  littleEndian?: boolean
) => void

export interface TypeDefinition {
  type: DataType
  byteLength: number
  length: number
  read: any
  write: any
}

interface ArrayTypeDefinition {
  type: DataType.Array
  def: TypeDefinition
}

export enum DataType {
  Int8 = 'Int8',
  Uint8 = 'Uint8',
  Int16 = 'Int16',
  Uint16 = 'Uint16',
  Int32 = 'Int32',
  Uint32 = 'Uint32',
  Float32 = 'Float32',
  Float64 = 'Float64',
  Array = 'Array'
}

enum DataTypeAlias {
  Byte = 'Uint8',
  Short = 'Int16',
  UnsignedShort = 'Uint16',
  Long = 'Int32',
  UnsignedLong = 'Uint32',
  Float = 'Float32',
  Double = 'Float64'
}

const dataTypeConfigs = {
  [DataType.Int8]: {
    type: DataType.Int8,
    byteLength: 1,
    length: 1
  },
  [DataType.Uint8]: {
    type: DataType.Uint8,
    byteLength: 1,
    length: 1
  },
  [DataType.Int16]: {
    type: DataType.Int16,
    byteLength: 2,
    length: 1
  },
  [DataType.Uint16]: {
    type: DataType.Uint16,
    byteLength: 2,
    length: 1
  },
  [DataType.Int32]: {
    type: DataType.Int32,
    byteLength: 4,
    length: 1
  },
  [DataType.Uint32]: {
    type: DataType.Uint32,
    byteLength: 4,
    length: 1
  },
  [DataType.Float32]: {
    type: DataType.Float32,
    byteLength: 4,
    length: 1
  },
  [DataType.Float64]: {
    type: DataType.Float64,
    byteLength: 4,
    length: 1
  }
} as const

const createReader = (fn: any): Reader => (
  dataView: DataView,
  byteOffset: number,
  littleEndian: boolean = false
): number => fn.call(dataView, byteOffset, littleEndian)

const createWriter = (
  fn: (byteOffset: number, value: number, littleEndian: boolean) => void
): Writer => (
  dataView: DataView,
  byteOffset: number,
  value: number,
  littleEndian: boolean = false
): void => fn.call(dataView, byteOffset, value, littleEndian)

const dataTypeDefinitions = (Object.keys(dataTypeConfigs) as Array<
  keyof typeof dataTypeConfigs
>).reduce((acc, type) => {
  const def = dataTypeConfigs[type] as TypeDefinition
  def.read = createReader(DataView.prototype[`get${type}`])
  def.write = createWriter(DataView.prototype[`set${type}`])
  acc[type] = def
  return acc
}, {} as any) as { [key in keyof typeof dataTypeConfigs]: TypeDefinition }

const dataTypeAliasDefinitions = ((Object.keys(DataTypeAlias) as any) as Array<
  keyof typeof DataTypeAlias
>).reduce((acc, alias) => {
  const type = DataTypeAlias[alias]
  acc[alias] = dataTypeDefinitions[type]
  return acc
}, {} as any) as { [key in keyof typeof DataTypeAlias]: TypeDefinition }

const Type = {
  ...dataTypeDefinitions,
  ...dataTypeAliasDefinitions,
  [DataType.Array]: (def: TypeDefinition, length: number) => {
    const byteLength = def.byteLength * length
    const read: ArrayReader = (
      dataView,
      offset,
      littleEndian = false
    ): Array<number> => {
      const result = []
      for (let i = 0; i < length; i++) {
        const value = def.read(
          dataView,
          offset + i * def.byteLength,
          littleEndian
        )
        result.push(value)
      }
      return result
    }
    const write: ArrayWriter = (
      dataView: DataView,
      offset: number,
      value: number[] = [],
      littleEndian: boolean = false
    ): void => {
      for (let i = 0; i < length; i++) {
        def.write(dataView, offset + i * def.byteLength, value[i], littleEndian)
      }
    }
    return { type: DataType.Array, def, length, byteLength, read, write }
  }
}

Type.Uint16
Type.Byte

export default Type
