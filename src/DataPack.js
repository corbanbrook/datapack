//@flow

import Schema from './Schema'
import Component from './Component'

import { equals, clone } from 'ramda'

type Entity = {
  type: string,
  uid: number
}

export default class DataPack {
  registry: Map<string, Schema> = new Map()
  cache: Map<number, Map<number, Entity>> = new Map()

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
    this.registry.delete(schema.name)
  }

  getSchema(key: string | number): Schema {
    let schema
    if (typeof key === 'string') {
      schema = this.registry.get(key)
    } else if (typeof key === 'number') {
      schema = Array.from(this.registry.values()).find(schema => schema.id === key)
    }

    if (!schema) {
      throw new Error(`DataPack:getSchema - could not find schema by ${key}`)
    }

    return schema
  }

  getDiffComponents(item: Entity, cachedItem: Entity): Array<Component> {
    const schema = this.getSchema(item.type)
    const components = Array.from(schema.components.values()).filter(component => {
      return !equals(item[component.name], cachedItem[component.name])
    })

    return components
  }

  serialize(clientId: number, items: Array<Entity>, maxPacketSize: number = Infinity): ArrayBuffer {
    let idx = 0
    let totalByteLength = 0
    let includedItemCount = 0

    const selected = []

    if (!this.cache.has(clientId)) {
      this.cache.set(clientId, new Map())
    }
    const cache = this.cache.get(clientId)

    if (!cache) { throw new Error('DataPack:createPacket - cache could not be created') }

    items.some((item) => {
      const schema = this.getSchema(item.type)
      const cachedItem = cache.get(item.uid)

      let components
      if (cachedItem) {
        // Cache hit - get the changed components
        components = this.getDiffComponents(item, cachedItem)
      } else {
        // No cache - get all components from schema
        components = Array.from(schema.components.values())
      }

      if (components.length === 0) { return }

      const byteLength = schema.getByteLength(components)

      if (byteLength && totalByteLength + byteLength <= maxPacketSize) {
        totalByteLength += byteLength
        includedItemCount++

        // Save this included item in the cache
        cache.set(item.uid, item)

        selected.push({ props: item, schema, components })
      }
    })

    const buffer = new ArrayBuffer(totalByteLength)
    const dataView = new DataView(buffer, 0, buffer.byteLength)
    const byteView = new Uint8Array(buffer, 0, buffer.byteLength)
    let offset = 0
    selected.forEach(data => {
      const byteLength = data.schema.serialize(dataView, offset, data.components, data.props)
      offset += byteLength
    })

    return buffer
  }

  deserialize(buffer: ArrayBuffer): Array<Entity> {
    const dataView = new DataView(buffer, 0, buffer.byteLength)
    const results = []

    let offset = 0
    while (offset < buffer.byteLength) {
      const type = dataView.getUint16(offset)
      const schema = this.getSchema(type)
      const byteLength = schema.deserialize(dataView, offset, (result) => {
        results.push(result)
      })
      offset += byteLength
    }

    return results
  }

  // serialize(items: Array<any> = [], options: Object = {}) {
  //   const { sequenceNumber, clientState } = options
  //   let offset = 0, totalByteLength = 0
  //
  //   if (sequenceNumber != null) {
  //     totalByteLength++
  //   }
  //
  //   // Calculate size of all items
  //   for (let i = 0, len = items.length; i < len; i++) {
  //     totalByteLength += items[i].data.byteLength + 1 // 1 byte overhead per item
  //   }
  //
  //   // Create buffer to hold items
  //   const buffer = new ArrayBuffer(totalByteLength)
  //   const dataView = new DataView(buffer, 0, buffer.byteLength)
  //   const byteView = new Uint8Array(buffer, 0, buffer.byteLength)
  //
  //   // Add sequenceNumber
  //   if (sequenceNumber != null) {
  //     dataView.setUint8(offset++, options.sequenceNumber)
  //   }
  //
  //   // Update clientState to keep in sync
  //   // if (clientState != null) {
  //   //   clientState.set(item.uid, item.props)
  //   // }
  //
  //   // Add item data to buffer
  //   let item
  //   for (let i = 0, len = items.length; i < len; i++) {
  //     item = items[i]
  //     dataView.setUint8(offset++, item.gameObject.schema.id)
  //     byteView.set(new Uint8Array(item.data), offset)
  //     offset += item.data.byteLength
  //   }
  //
  //   return buffer
  // }
}
