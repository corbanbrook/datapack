import { Component, Type } from '../../src'

test('Component', () => {
  const component = new Component('uid', Type.Uint16)

  expect(component.name).toBe('uid')
  expect(component.def.byteLength).toBe(2)
})
