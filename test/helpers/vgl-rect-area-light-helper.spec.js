import Vue from 'vue/dist/vue';
import { RectAreaLightHelper, RectAreaLight } from 'three';
import { VglRectAreaLightHelper, VglObject3d, VglNamespace } from '../../src';

describe('VglRectAreaLightHelper:', () => {
  let inject;
  beforeEach(() => {
    const { vglNamespace } = new Vue({ parent: new Vue(VglNamespace), inject: ['vglNamespace'] });
    vglNamespace.object3ds.testLight = new RectAreaLight(0xe2f3b4);
    vglNamespace.object3ds.testLight.position.set(3.8, 2, 0.5);
    inject = { vglNamespace: { default: vglNamespace } };
  });
  test('the inst property should be an instance of RectAreaLightelper', () => {
    const vm = new (Vue.extend(VglRectAreaLightHelper))({ inject, propsData: { light: 'testLight' } });
    vm.vglNamespace.beforeRender[0]();
    expect(vm.inst.children[0]).toBeInstanceOf(RectAreaLightHelper);
  });
  test('the component should have common props with VglObject3d', () => {
    const { $props } = new (Vue.extend(VglObject3d))({ inject });
    expect(Object.keys(new (Vue.extend(VglRectAreaLightHelper))({ inject, propsData: { light: 'testLight' } }).$props))
      .toEqual(expect.arrayContaining(Object.keys($props)));
  });
  describe('the state of the inst object should be specified by props', () => {
    test('in case with default values', () => {
      const vm = new (Vue.extend(VglRectAreaLightHelper))({ inject, propsData: { light: 'testLight' } });
      vm.vglNamespace.beforeRender[0]();
      const expectedLight = new RectAreaLight(0xe2f3b4);
      expectedLight.position.set(3.8, 2.1, 0.5);
      const expected = new RectAreaLightHelper(expectedLight);
      expect(vm.inst.children[0].geometry.getAttribute('position'))
        .toEqual(expected.geometry.getAttribute('position'));
      expect(vm.inst.children[0].material)
        .toHaveProperty('color', expected.material.color);
    });
    test('in case props given', () => {
      const vm = new (Vue.extend(VglRectAreaLightHelper))({
        inject,
        propsData: {
          light: 'testLight',
          color: '#ddf2ee',
        },
      });
      vm.vglNamespace.beforeRender[0]();
      const expectedLight = new RectAreaLight(0xe2f3b4);
      expectedLight.position.set(3.8, 2.1, 0.5);
      const expected = new RectAreaLightHelper(expectedLight, 0xddf2ee);
      expect(vm.inst.children[0].geometry.getAttribute('position'))
        .toEqual(expected.geometry.getAttribute('position'));
      expect(vm.inst.children[0].material)
        .toHaveProperty('color', expected.material.color);
    });
    test('in case color changes', () => {
      const vm = new (Vue.extend(VglRectAreaLightHelper))({ inject, propsData: { light: 'testLight' } });
      vm.vglNamespace.beforeRender[0]();
      vm.color = '#ddf2ee';
      vm.vglNamespace.beforeRender[0]();
      const expectedLight = new RectAreaLight(0xe2f3b4);
      expectedLight.position.set(3.8, 2.1, 0.5);
      const expected = new RectAreaLightHelper(expectedLight, 0xddf2ee);
      expect(vm.inst.children[0].material)
        .toHaveProperty('color', expected.material.color);
    });
  });
});
