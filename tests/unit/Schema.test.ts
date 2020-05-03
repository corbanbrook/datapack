import { Schema, Component, Type } from '../../src'

test('Create schema with diffing', () => {
  const schema = new Schema(
    1,
    'thing',
    [
      new Component('loc', Type.Array(Type.Float32, 2)),
      new Component('vel', Type.Array(Type.Float32, 2)),
      new Component('rot', Type.Float32)
    ],
    { diff: true }
  )

  expect(schema.id).toBe(1)
  expect(schema.name).toBe('thing')
  expect(schema.components.size).toBe(3)
  expect(schema.byteLength).toBe(8 + 8 + 4 + 6)

  expect(schema.get('loc').flag).toBe(1)
  expect(schema.get('vel').flag).toBe(2)
  expect(schema.get('rot').flag).toBe(4)
})

test('Create schema without diffing', () => {
  const schema = new Schema(
    1,
    'thing',
    [
      new Component('loc', Type.Array(Type.Float32, 2)),
      new Component('vel', Type.Array(Type.Float32, 2)),
      new Component('rot', Type.Float32)
    ],
    { diff: false }
  )

  expect(schema.id).toBe(1)
  expect(schema.name).toBe('thing')
  expect(schema.components.size).toBe(3)
  expect(schema.byteLength).toBe(8 + 8 + 4 + 4)

  expect(schema.get('loc').flag).toBe(1)
  expect(schema.get('vel').flag).toBe(2)
  expect(schema.get('rot').flag).toBe(4)
})
