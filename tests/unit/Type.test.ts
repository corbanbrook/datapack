import { Type, DataType } from '../../src'

test('Array', () => {
  const int16Array = Type.Array(Type.Int16, 2)
  expect(int16Array.type).toBe(DataType.Array)
  expect(int16Array.byteLength).toBe(4)

  const float32Array = Type.Array(Type.Float32, 3)
  expect(float32Array.byteLength).toBe(12)
})

test('Byte alias', () => {
  const byteArray = Type.Array(Type.Byte, 2)
  expect(Type.Byte).toBe(Type.Uint8)
  expect(byteArray.def.type).toBe(DataType.Uint8)
  expect(byteArray.byteLength).toBe(2)
})
