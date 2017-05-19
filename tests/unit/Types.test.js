import { Types, DataTypes } from '../../src'

test('Array', () => {
  const type = Types.Array(Types.Int16, 2)

  expect(type.type).toBe(DataTypes.Array)
})

test('Byte alias', () => {
  const byteArray = Types.Array(Types.Byte, 2)

  expect(Types.Byte).toBe(Types.Uint8)
  expect(byteArray.def.type).toBe(DataTypes.Uint8)
})
