//@flow

import { DataTypes } from './Types'
import type { TypeDefinition } from './Types'

export default class Component {
  name: string
  def: TypeDefinition
  flag: number = 0
  byteLength: number = 0

  constructor(name: string, def: TypeDefinition) {
    this.name = name
    this.def = def
    this.byteLength = def.byteLength
  }

  read(dataView: DataView, offset: number, littleEndian: boolean = false) {
    return this.def.read(dataView, offset, littleEndian)
  }

  write(dataView: DataView, offset: number, value: number, littleEndian: boolean = false) {
    this.def.write(dataView, offset, value, littleEndian)
  }

  isEqual(a: Object, b: Object): boolean {
    const aValue = a[this.name], bValue = b[this.name]

    if (this.def.type === DataTypes.Array) {
      return !aValue.some((value, idx) => value !== bValue[idx])
    } else {
      return aValue === bValue
    }
  }
}
