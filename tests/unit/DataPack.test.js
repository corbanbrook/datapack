import { DataPack, Schema, Component, Types } from '../../src'

const clientId = 1

const initialItems = [
  { schemaId: 1, uid: 1, loc: [10, 10], vel: [10, 10], acc: [10, 10], rot: 10 },
  { schemaId: 1, uid: 2, loc: [20, 20], vel: [20, 20], acc: [20, 20], rot: 20 },
  { schemaId: 1, uid: 3, loc: [30, 30], vel: [30, 30], acc: [30, 30], rot: 30 }
]

const updatedItems = [
  { schemaId: 1, uid: 1, loc: [11, 11], vel: [11, 11], acc: [10, 10], rot: 10 }, // loc and vel changed
  { schemaId: 1, uid: 2, loc: [20, 20], vel: [20, 20], acc: [20, 20], rot: 21 }, // rot changed
  { schemaId: 1, uid: 3, loc: [30, 30], vel: [30, 30], acc: [30, 30], rot: 30 }  // no change
]

const testset = [
  { schemaId: 1, uid: 1, loc: [0, 0], vel: [0, 0], acc: [0, 0], rot: 0 }
]

let _idx = 1
const createItem = () => {
  return {
    schemaId: 1,
    uid: _idx++,
    loc: [Math.random() * 1000, Math.random() * 1000],
    vel: [Math.random() * 1000, Math.random() * 1000],
    acc: [Math.random() * 1000, Math.random() * 1000],
    rot: Math.random() * 360
  }
}

const NUM_ITEMS = 50000
const itemSet = new Array(NUM_ITEMS)
for(let i = 0; i < NUM_ITEMS; i++) {
  itemSet[i] = createItem()
}

const mangle = (items) => {
  items.forEach(item => {
    item.loc[0] = Math.random() * 1000
    item.loc[1] = Math.random() * 1000
    item.vel[0] = Math.random() * 1000
    item.vel[1] = Math.random() * 1000
    item.acc[0] = Math.random() * 1000
    item.acc[1] = Math.random() * 1000
    item.rot = Math.random() * 1000
  })
}

const schema = new Schema(1, 'boid', [
  new Component('loc', Types.Array(Types.Float32, 2)),
  new Component('vel', Types.Array(Types.Float32, 2)),
  new Component('acc', Types.Array(Types.Float32, 2)),
  new Component('rot', Types.Float32),
], { diff: true })

const schemaNoDiff = new Schema(1, 'boid', [
  new Component('loc', Types.Array(Types.Float32, 2)),
  new Component('vel', Types.Array(Types.Float32, 2)),
  new Component('acc', Types.Array(Types.Float32, 2)),
  new Component('rot', Types.Float32),
], { diff: false })

describe('DataPack:schemas', () => {
  const datapack = new DataPack()

  test('addSchema', () => {
    datapack.addSchema(schema)
    expect(datapack.schemas.size).toBe(1)
  })

  test('addSchema again should throw error', () => {
    expect(() => datapack.addSchema(schema)).toThrow()
  })

  test('getSchema by name', () => {
    expect(datapack.getSchema('boid')).toBe(schema)
  })

  test('getSchema by id', () => {
    expect(datapack.getSchema(1)).toBe(schema)
  })

  test('removeSchema', () => {
    datapack.removeSchema('boid')
    expect(datapack.schemas.size).toBe(0)
  })
})

describe('DataPack:createPacket', () => {
  const datapack = new DataPack([schema])
  const maxPacketSize = 1024

  test('create a packet of certain size', () => {
    const buffer = datapack.serialize(clientId, initialItems, maxPacketSize)
    expect(buffer.byteLength).toBe(schema.byteLength * 3)
  })

  test('create another packet', () => {
    const buffer = datapack.serialize(clientId, updatedItems, maxPacketSize)
    expect(buffer.byteLength).toBe(32)
  })
})

describe('DataPack:readPacket', () => {
  const datapack = new DataPack([schema])
  const maxPacketSize = 1024

  test('create a packet and read it back', () => {
    const buffer = datapack.serialize(clientId, initialItems, maxPacketSize)
    const items = datapack.deserialize(buffer)
    expect(items.length).toBe(3)
  })

  test('create another packet and read it back', () => {
    const buffer = datapack.serialize(clientId, updatedItems, maxPacketSize)
    const items = datapack.deserialize(buffer)
    expect(items.length).toBe(2)
  })

  test('create a packet and read it back again', () => {
    const buffer = datapack.serialize(clientId, updatedItems, maxPacketSize)
    const items = datapack.deserialize(buffer)
    expect(items.length).toBe(0)
  })

  test('create a packet and read it back again', () => {
    const buffer = datapack.serialize(clientId, initialItems, maxPacketSize)
    const items = datapack.deserialize(buffer)
    expect(items.length).toBe(2)
  })
})

describe('DataPack:createPacket', () => {
  const datapack = new DataPack([schema])
  const maxPacketSize = schema.byteLength * 3 - 1

  test('a small packet', () => {
    const buffer = datapack.serialize(clientId, initialItems, maxPacketSize)
    expect(buffer.byteLength).toBe(schema.byteLength * 2)
  })
})

describe('DataPack:readPacket', () => {
  const datapack = new DataPack([schemaNoDiff])
  const maxPacketSize = 1024

  test('create a packet and read it back', () => {
    const buffer = datapack.serialize(clientId, initialItems, maxPacketSize)
    expect(buffer.byteLength).toBe(96)
    const items = datapack.deserialize(buffer)
    expect(items.length).toBe(3)
  })

  test('create another packet and read it back', () => {
    const buffer = datapack.serialize(clientId, updatedItems, maxPacketSize)
    expect(buffer.byteLength).toBe(96)
    const items = datapack.deserialize(buffer)
    expect(items.length).toBe(3)
  })

  test('create another packet and read it back again', () => {
    const buffer = datapack.serialize(clientId, updatedItems, maxPacketSize)
    expect(buffer.byteLength).toBe(96)
    const items = datapack.deserialize(buffer)
    expect(items.length).toBe(3)
  })
})

describe('DataPack:readPacket', () => {
  const datapack = new DataPack([schema])
  const maxPacketSize = 1024

  test('create a packet and read it back', () => {
    const buffer = datapack.serialize(2, testset, maxPacketSize)
    const items = datapack.deserialize(buffer)
    expect(items.length).toBe(1)
  })


  test('create another packet and read it back', () => {
    testset[0].loc[0] = 1

    const buffer = datapack.serialize(2, testset, maxPacketSize)
    const items = datapack.deserialize(buffer)
    expect(items.length).toBe(1)
  })


  test('create a packet and read it back again', () => {
    testset[0].loc[0] = 2

    const buffer = datapack.serialize(2, testset, maxPacketSize)
    const items = datapack.deserialize(buffer)
    expect(items.length).toBe(1)
  })


  test('create a packet and read it back again', () => {
    testset[0].loc[0] = 3

    const buffer = datapack.serialize(2, testset, maxPacketSize)
    const items = datapack.deserialize(buffer)
    expect(items.length).toBe(1)
  })
})

describe('DataPack:lots of items', () => {
  const datapack = new DataPack([schemaNoDiff])
  const maxPacketSize = NUM_ITEMS * schemaNoDiff.byteLength

  test('create a packet and read it back', () => {
    const buffer = datapack.serialize(3, itemSet, maxPacketSize)
    expect(buffer.byteLength).toBe(maxPacketSize)
    const items = datapack.deserialize(buffer)
    expect(items.length).toBe(NUM_ITEMS)
  })

  test('create a packet and read it back again', () => {
    const buffer = datapack.serialize(3, itemSet, maxPacketSize)
    expect(buffer.byteLength).toBe(maxPacketSize)
    const items = datapack.deserialize(buffer)
    expect(items.length).toBe(NUM_ITEMS)
  })
})

describe('DataPack:lots of items', () => {
  const datapack = new DataPack([schema])
  const maxPacketSize = NUM_ITEMS * schema.byteLength

  test('create a packet and read it back', () => {
    const buffer = datapack.serialize(4, itemSet, maxPacketSize)
    expect(buffer.byteLength).toBe(maxPacketSize)
    expect(datapack.metrics.serializeDuration).toBeLessThan(500)
    const items = datapack.deserialize(buffer)
    expect(items.length).toBe(NUM_ITEMS)
  })

  test('create a packet and read it back again', () => {
    mangle(itemSet)
    const buffer = datapack.serialize(4, itemSet, maxPacketSize)
    expect(buffer.byteLength).toBe(maxPacketSize)
    expect(datapack.metrics.serializeDuration).toBeLessThan(700)
    console.log(datapack.metrics.serializeDuration)
    const items = datapack.deserialize(buffer)
    expect(items.length).toBe(NUM_ITEMS)
  })
})
