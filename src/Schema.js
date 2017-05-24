//@flow

import Component from './Component'
import Types from './Types'
import { hasFlag } from './helpers'

export default class Schema {
  id: number
  name: string
  components: Map<string, Component> = new Map()
  byteLength: number = 0
  headerByteLength: number = 0

  header: Map<string, Component> = new Map()

  constructor(id: number, name: string, components: Array<Component> = [], options: Object = {}) {
    this.id = id
    this.name = name

    this.header.set('schemaId', new Component('schemaId', Types.Uint16))
    this.header.set('uid', new Component('uid', Types.Uint16))
    this.header.set('bitmask', new Component('bitmask', Types.Uint16))
    this.header.forEach(component => this.headerByteLength += component.byteLength)

    this.byteLength = this.headerByteLength

    components.forEach((component, componentIdx) => {
      component.flag = 1 << componentIdx
      this.byteLength += component.byteLength
      this.components.set(component.name, component)
    }, 0)
  }

  getByteLength(components?: Array<Component>): number {
    if (components && components.length) {
      return components.reduce((acc, c) => {
        acc += c.byteLength
        return acc
      }, this.headerByteLength)
    } else {
      return this.byteLength
    }
  }

  getComponentsFromBitmask(bitmask: number): Array<Component> {
    return Array.from(this.components.values()).filter(component =>
      hasFlag(bitmask, component.flag)
    )
  }

  getComponentsBitmask(components: Array<Component>): number {
    let bitmask = 0

    components.forEach(component => {
      bitmask = bitmask | component.flag
    })

    return bitmask
  }

  serialize(dataView: DataView, offset: number, components: Array<Component>, props: Object): number {
    const bitmask = this.getComponentsBitmask(components)
    let byteLength = 0

    const headerProps = {
      schemaId: this.id,
      uid: props.uid,
      bitmask
    }

    this.header.forEach((component, idx) => {
      component.write(dataView, offset + byteLength, headerProps[component.name])
      byteLength += component.byteLength
    })

    components.forEach(component => {
      component.write(dataView, offset + byteLength, props[component.name])
      byteLength += component.byteLength
    })

    return byteLength
  }

  deserialize(dataView: DataView, offset: number, callback: Function): number {
    const result = {}
    let byteLength = 0

    this.header.forEach(component => {
      result[component.name] = component.read(dataView, offset + byteLength)
      byteLength += component.byteLength
    })

    const components = this.getComponentsFromBitmask(result.bitmask)
    components.forEach(component => {
      result[component.name] = component.read(dataView, offset + byteLength)
      byteLength += component.byteLength
    })

    callback(result)

    return byteLength
  }
}
