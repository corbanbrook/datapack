import Component from './Component'
import Type, { DataType } from './Type'
import { hasFlag } from './helpers'

interface SchemaOptions {
  diff: boolean
}

export default class Schema {
  id: number
  name: string
  byteLength: number = 0
  headerByteLength: number = 0
  header: Map<string, Component> = new Map()
  components: Map<string, Component> = new Map()
  options: SchemaOptions = {
    diff: false
  }

  constructor(
    id: number,
    name: string,
    components: Array<Component> = [],
    options: Partial<SchemaOptions> = {}
  ) {
    this.id = id
    this.name = name
    Object.assign(this.options, options)

    this.header.set('schemaId', new Component('schemaId', Type.Uint16))
    this.header.set('uid', new Component('uid', Type.Uint16))

    if (this.options.diff) {
      this.header.set('bitmask', new Component('bitmask', Type.Uint16))
    }

    this.header.forEach(
      (component) => (this.headerByteLength += component.byteLength)
    )

    this.byteLength = this.headerByteLength

    components.forEach((component, componentIdx) => {
      component.flag = 1 << componentIdx
      this.byteLength += component.byteLength
      this.components.set(component.name, component)
    }, 0)
  }

  get(name: string) {
    if (this.components.has(name)) {
      return this.components.get(name)!
    }

    throw new Error('Could not get component.')
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
    return Array.from(this.components.values()).filter((component) =>
      hasFlag(bitmask, component.flag)
    )
  }

  getComponentsBitmask(components: Array<Component>): number {
    let bitmask = 0

    components.forEach((component) => {
      bitmask = bitmask | component.flag
    })

    return bitmask
  }

  serialize(
    dataView: DataView,
    offset: number,
    components: Array<Component>,
    props: { uid: number } & any
  ): number {
    let byteLength = 0

    const headerProps: any = {
      schemaId: this.id,
      uid: props.uid,
      bitmask: 0
    }

    if (this.options.diff) {
      headerProps.bitmask = this.getComponentsBitmask(components)
    }

    this.header.forEach((component, idx) => {
      component.write(
        dataView,
        offset + byteLength,
        headerProps[component.name]
      )
      byteLength += component.byteLength
    })

    components.forEach((component) => {
      component.write(dataView, offset + byteLength, props[component.name])
      byteLength += component.byteLength
    })

    return byteLength
  }

  deserialize(dataView: DataView, offset: number, callback: Function): number {
    const result = {} as any
    let byteLength = 0

    this.header.forEach((component) => {
      result[component.name] = component.read(dataView, offset + byteLength)
      byteLength += component.byteLength
    })

    const components = this.options.diff
      ? this.getComponentsFromBitmask(result.bitmask)
      : this.components
    components.forEach((component: Component) => {
      result[component.name] = component.read(dataView, offset + byteLength)
      byteLength += component.byteLength
    })

    callback(result)

    return byteLength
  }

  clone(item: any) {
    const result = {} as any

    this.components.forEach((component) => {
      const { name, def } = component
      const value = item[name]
      if (def.type === DataType.Array) {
        result[name] = []
        for (let idx = 0, len = def.length; idx < len; idx++) {
          result[name][idx] = value[idx]
        }
      } else {
        result[name] = value
      }
    })

    return result
  }
}
