import { Schema, Component, Types } from '../../src'

test('Create schema', () => {
  const schema = new Schema('thing', [
    new Component('loc', Types.Array(Types.Float32, 2)),
    new Component('vel', Types.Array(Types.Float32, 2)),
    new Component('rot', Types.Float32),
  ])

  expect(schema.id).toBe(1)
  expect(schema.name).toBe('thing')
  expect(schema.components.size).toBe(3)
  expect(schema.byteLength).toBe(8+8+4+6)

  expect(schema.components.get('loc').flag).toBe(1)
  expect(schema.components.get('vel').flag).toBe(2)
  expect(schema.components.get('rot').flag).toBe(4)
})
