import { Types, DataTypes } from '../../src'

test('Array', () => {
  const int16Array = Types.Array(Types.Int16, 2)
  expect(int16Array.type).toBe(DataTypes.Array)
  expect(int16Array.byteLength).toBe(4)

  const float32Array = Types.Array(Types.Float32, 3)
  expect(float32Array.byteLength).toBe(12)
})

test('Byte alias', () => {
  const byteArray = Types.Array(Types.Byte, 2)
  expect(Types.Byte).toBe(Types.Uint8)
  expect(byteArray.def.type).toBe(DataTypes.Uint8)
  expect(byteArray.byteLength).toBe(2)
})
