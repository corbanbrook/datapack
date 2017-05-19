import { Component, Types } from '../../src'

test('Component', () => {
  const component = new Component('uid', Types.Uint16)

  expect(component.name).toBe('uid')
  expect(component.def.byteLength).toBe(2)
})
