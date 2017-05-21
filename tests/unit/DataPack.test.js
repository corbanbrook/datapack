import { DataPack, Schema, Component, Types } from '../../src'

const clientId = 1

const initialItems = [
  { type: 'boid', uid: 1, loc: [10, 10], vel: [10, 10], acc: [10, 10], rot: 10 },
  { type: 'boid', uid: 2, loc: [20, 20], vel: [20, 20], acc: [20, 20], rot: 20 },
  { type: 'boid', uid: 3, loc: [30, 30], vel: [30, 30], acc: [30, 30], rot: 30 }
]

const updatedItems = [
  { type: 'boid', uid: 1, loc: [11, 11], vel: [11, 11], acc: [10, 10], rot: 10 }, // loc and vel changed
  { type: 'boid', uid: 2, loc: [20, 20], vel: [20, 20], acc: [20, 20], rot: 21 }, // rot changed
  { type: 'boid', uid: 3, loc: [30, 30], vel: [30, 30], acc: [30, 30], rot: 30 }  // no change
]

const set1 = [
  { type: 'boid', uid: 1, loc: [10, 10], vel: [10, 10], acc: [10, 10], rot: 10 }
]

const set2 = [
  { type: 'boid', uid: 1, loc: [10, 10], vel: [10, 10], acc: [10, 10], rot: 20 }
]

const schema = new Schema('boid', [
  new Component('loc', Types.Array(Types.Float32, 2)),
  new Component('vel', Types.Array(Types.Float32, 2)),
  new Component('acc', Types.Array(Types.Float32, 2)),
  new Component('rot', Types.Float32),
])

describe('DataPack:registry', () => {
  const datapack = new DataPack()

  test('addSchema', () => {
    datapack.addSchema(schema)
    expect(datapack.registry.size).toBe(1)
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
    expect(datapack.registry.size).toBe(0)
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
})

describe('DataPack:createPacket', () => {
  const datapack = new DataPack([schema])
  const maxPacketSize = schema.byteLength * 3 - 1

  test('a small packet', () => {
    const buffer = datapack.serialize(clientId, initialItems, maxPacketSize)
    expect(buffer.byteLength).toBe(schema.byteLength * 2)
  })
})
