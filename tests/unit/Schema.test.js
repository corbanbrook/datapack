import { Schema, Component, Types } from '../../src'

test('Create schema', () => {
  const schema = new Schema('thing', [
    new Component('uid', Types.Uint16),
    new Component('loc', Types.Array(Types.Int16, 2)),
    new Component('vel', Types.Array(Types.Int16, 2)),
    new Component('rot', Types.Int16),
  ])

  expect(schema.id).toBe(1)
  expect(schema.name).toBe('thing')
  expect(schema.components.size).toBe(4)
  expect(schema.byteLength).toBe(12)
})

test('Create schema with same name should fail', () => {
  const schema = new Schema('thing', [
    new Component('uid', Types.Uint16),
    new Component('loc', Types.Array(Types.Int16, 2)),
    new Component('vel', Types.Array(Types.Int16, 2)),
    new Component('rot', Types.Int16),
  ], { dirtyMask: true })

  expect(schema.id).toBe(2)
})
