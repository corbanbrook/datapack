//@flow

import Schema from './Schema'

export default class DataPack {
  registry: Map<string, Schema> = new Map()

  constructor(schemas: Array<Schema> = [], options: Object = {}) {
    schemas.forEach(this.addSchema.bind(this))
  }

  addSchema(schema: Schema) {
    if (this.registry.has(schema.name)) {
      throw new Error(`DataPack:addSchema - schema already registered as ${schema.name}`)
    } else {
      this.registry.set(schema.name, schema)
    }
  }

  removeSchema(key: string | number) {
    const schema = this.getSchema(key)

    if (schema) {
      this.registry.delete(schema.name)
    }
  }

  getSchema(key: string | number): ?Schema {
    if (typeof key === 'string') {
      return this.registry.get(key)
    } else if (typeof key === 'number') {
      return [...this.registry.values()].find(schema => schema.id === key)
    } else {
      throw new Error(`DataPack:getSchema - could not find schema by ${key}`)
    }
  }

  serialize(items: Array<any> = [], options: Object = {}) {
    const { sequenceNumber, clientState } = options
    let offset = 0, totalByteLength = 0

    if (sequenceNumber != null) {
      totalByteLength++
    }

    // Calculate size of all items
    for (let i = 0, len = items.length; i < len; i++) {
      totalByteLength += items[i].data.byteLength + 1 // 1 byte overhead per item
    }

    // Create buffer to hold items
    const buffer = new ArrayBuffer(totalByteLength)
    const dataView = new DataView(buffer, 0, buffer.byteLength)
    const byteView = new Uint8Array(buffer, 0, buffer.byteLength)

    // Add sequenceNumber
    if (sequenceNumber != null) {
      dataView.setUint8(offset++, options.sequenceNumber)
    }

    // Update clientState to keep in sync
    // if (clientState != null) {
    //   clientState.set(item.uid, item.props)
    // }

    // Add item data to buffer
    let item
    for (let i = 0, len = items.length; i < len; i++) {
      item = items[i]
      dataView.setUint8(offset++, item.gameObject.schema.id)
      byteView.set(new Uint8Array(item.data), offset)
      offset += item.data.byteLength
    }

    return buffer
  }
}
