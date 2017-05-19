//@flow

export default class Component {
  offset: number = 0
  name: string
  def: Object

  constructor(name: string, def: Object) {
    this.name = name
    this.def = def
  }

  read(dataView: DataView, littleEndian: boolean = false) {
    return this.def.read(dataView, this.offset, littleEndian)
  }

  write(dataView: DataView, value: any, littleEndian: boolean = false) {
    this.def.write(dataView, this.offset, value, littleEndian)
  }
}
