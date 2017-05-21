//@flow

export default class Component {
  name: string
  def: Object
  flag: number = 0
  byteLength: number

  constructor(name: string, def: Object) {
    this.name = name
    this.def = def
    this.byteLength = def.byteLength
  }

  read(dataView: DataView, offset: number, littleEndian: boolean = false) {
    return this.def.read(dataView, offset, littleEndian)
  }

  write(dataView: DataView, offset: number, value: any, littleEndian: boolean = false) {
    this.def.write(dataView, offset, value, littleEndian)
  }
}
