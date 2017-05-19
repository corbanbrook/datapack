import { DataPack, Schema, Component, Types } from '../../src'

const boids = [
  { uid: 1, loc: [0, 0], vel: [0, 0], acc: [0, 0], rot: 0 },
  { uid: 2, loc: [0, 0], vel: [0, 0], acc: [0, 0], rot: 0 },
  { uid: 3, loc: [0, 0], vel: [0, 0], acc: [0, 0], rot: 0 }
]

const schema = new Schema('boid', [
  new Component('uid', Types.Uint16),
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


test('DataPack:createPacket', () => {
  const datapack = new DataPack([schema])

  expect()
})
