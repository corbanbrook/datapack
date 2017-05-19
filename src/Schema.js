//@flow

import Component from './Component'

let idx = 0

export default class Schema {
  id: number
  name: string
  components: Map<string, Component> = new Map()
  byteLength: number = 0

  constructor(name: string, components: Array<Component> = [], options: Object = {}) {
    this.id = ++idx
    this.name = name
    components.forEach(component => {
      const { name, def } = component
      component.offset = this.byteLength
      this.byteLength += def.byteLength
      this.components.set(name, component)
    }, 0)
  }

  serialize(buffer: ArrayBuffer, props: Object): ArrayBuffer {
    //const buffer = new ArrayBuffer(this.byteLength)
    const dataView = new DataView(buffer, 0, buffer.byteLength)
    this.components.forEach(component => {
      component.write(dataView, props[component.name])
    })

    return buffer
  }

  deserialize(dataView: DataView): Object {
    const result = {}
    this.components.forEach(component => {
      result[component.name] = component.read(dataView)
    })
    return result
  }
}
