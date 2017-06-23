//@flow

import Schema from './Schema'
import Component from './Component'

type Entity = {
  schemaId: number,
  uid: number
}

export default class DataPack {
  schemas: Map<string, Schema> = new Map()
  schemasById: Map<number, Schema> = new Map()
  cache: Map<number, Map<number, Entity>> = new Map()
  
  metrics: {
    serializeDuration: number,
    serializeNumItems: number,
    serializeByteLength: number,
    deserializeDuration: number,
    deserializeNumItems: number
  } = {
    serializeDuration: 0,
    serializeNumItems: 0,
    serializeByteLength: 0,
    deserializeDuration: 0,
    deserializeNumItems: 0
  }

  constructor(schemas: Array<Schema> = [], options: Object = {}) {
    schemas.forEach(this.addSchema.bind(this))
  }

  addSchema(schema: Schema) {
    if (this.schemas.has(schema.name)) {
      throw new Error(`DataPack:addSchema - schema with the name ${schema.name} already registered.`)
    } else if (this.schemasById.has(schema.id)) {
      throw new Error(`DataPack:addSchema - schema with the id ${schema.id} already registered.`)
    } else {
      this.schemas.set(schema.name, schema)
      this.schemasById.set(schema.id, schema)
    }
  }

  removeSchema(key: string | number): Schema {
    const schema = this.getSchema(key)
    this.schemas.delete(schema.name)
    this.schemasById.delete(schema.id)

    return schema
  }

  getSchema(key: string | number): Schema {
    let schema
    if (typeof key === 'string') {
      schema = this.schemas.get(key)
    } else if (typeof key === 'number') {
      schema = this.schemasById.get(key)
    }

    if (!schema) {
      throw new Error(`DataPack:getSchema - could not find schema by ${key}`)
    }

    return schema
  }

  getDiffComponents(item: Entity, cachedItem: Entity): Array<Component> {
    const schema = this.getSchema(item.schemaId)
    const components = Array.from(schema.components.values()).filter(component => {
      return !component.isEqual(item, cachedItem)
    })

    return components
  }

  serialize(clientId: number, items: Array<Entity>, maxPacketSize: number = Infinity): ArrayBuffer {
    const startedAt = Date.now()

    let idx = 0
    let totalByteLength = 0
    let includedItemCount = 0

    const selected = new Array(items.length)
    let selectedOffset = 0

    if (!this.cache.has(clientId)) {
      this.cache.set(clientId, new Map())
    }
    const cache = this.cache.get(clientId)

    if (!cache) { throw new Error('DataPack:createPacket - cache could not be created') }

    for (let idx = 0, len = items.length; idx < len; idx++) {
      let item = items[idx]
      let schema = this.getSchema(item.schemaId)

      let components, cachedItem
      if (schema.options.diff && (cachedItem = cache.get(item.uid))) {
        // Cache hit - get the changed components
        components = this.getDiffComponents(item, cachedItem)
      } else {
        // No cache - get all components from schema
        components = Array.from(schema.components.values())
      }

      if (components.length === 0) { continue }

      let byteLength = schema.getByteLength(components)

      if (totalByteLength + byteLength <= maxPacketSize) {
        totalByteLength += byteLength
        includedItemCount++

        // Save this included item in the cache
        if (schema.options.diff) {
          cache.set(item.uid, schema.clone(item))
        }

        selected[selectedOffset++] = { props: item, schema, components }
      } else {
        break
      }
    }

    const buffer = new ArrayBuffer(totalByteLength)
    const dataView = new DataView(buffer, 0, buffer.byteLength)

    let offset = 0

    for (let idx = 0; idx < selectedOffset; idx++) {
      let data = selected[idx]
      offset += data.schema.serialize(dataView, offset, data.components, data.props)
    }

    this.metrics.serializeDuration = Date.now() - startedAt
    this.metrics.serializeNumItems = includedItemCount
    this.metrics.serializeByteLength = totalByteLength

    return buffer
  }

  deserialize(buffer: ArrayBuffer): Array<Entity> {
    const startedAt = Date.now()
    const dataView = new DataView(buffer, 0, buffer.byteLength)
    const results = []

    let offset = 0
    let numItems = 0
    while (offset < buffer.byteLength) {
      const schemaId = dataView.getUint16(offset)
      const schema = this.getSchema(schemaId)
      const byteLength = schema.deserialize(dataView, offset, (result: Entity) => {
        results.push(result)
      })
      offset += byteLength
      numItems++
    }

    this.metrics.deserializeDuration = Date.now() - startedAt
    this.metrics.deserializeNumItems = numItems

    return results
  }
}
