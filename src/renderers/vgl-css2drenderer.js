import { CSS2DRenderer } from 'three';
import VglNamespace from '../core/vgl-namespace';
import { boolean, string } from '../validators';
import { cameraPropRequiredMessage, scenePropRequiredMessage, cameraTypeUnknownMessage } from '../messages';

/**
 * This component creates a canvas that have WebGL context.
 * Options are corresponding [THREE.WebGLRenderer](https://threejs.org/docs/index.html#api/core/Object3D).
 *
 * Properties of [VglNamespace](vgl-namespace) are also available as mixin.
 */
 
export default {
  mixins: [VglNamespace],
  props: {
    /** Name of the using camera. */
    camera: string,
    /** Name of the target scene. */
    scene: string,
  },
  computed: {
    inst() {
      const inst = new CSS2DRenderer();
      return inst;
    },
    cameraInst() {
      if (this.camera !== undefined)
        return this.vglNamespace.cameras[this.camera];
      let camera;
      // eslint-disable-next-line guard-for-in, no-restricted-syntax
      for (const key in this.vglNamespace.cameras) {
        if (camera) throw new ReferenceError(cameraPropRequiredMessage);
        camera = this.vglNamespace.cameras[key];
      }
      return camera;
    },
    sceneInst() {
      if (this.scene !== undefined) return this.vglNamespace.scenes[this.scene];
      let scene;
      // eslint-disable-next-line guard-for-in, no-restricted-syntax
      for (const key in this.vglNamespace.scenes) {
        if (scene) throw new ReferenceError(scenePropRequiredMessage);
        scene = this.vglNamespace.scenes[key];
      }
      return scene;
    }
  },
  methods: {
    render() {
      const { inst, cameraInst, sceneInst } = this;
      if (cameraInst && sceneInst) {
        if (cameraInst.isPerspectiveCamera) {
          const aspect = this.$el.clientWidth / this.$el.clientHeight;
          if (cameraInst.aspect !== aspect) {
            cameraInst.aspect = aspect;
            cameraInst.updateProjectionMatrix();
          }
        } else if (cameraInst.isOrthographicCamera) {
          const width = this.$el.clientWidth / 2;
          const height = this.$el.clientHeight / 2;
          if (cameraInst.right !== width || cameraInst.top !== height) {
            cameraInst.left = -width;
            cameraInst.right = width;
            cameraInst.top = height;
            cameraInst.bottom = -height;
            cameraInst.updateProjectionMatrix();
          }
        } else {
          throw new TypeError(cameraTypeUnknownMessage);
        }
        inst.render(sceneInst, cameraInst);
      }
    }
  },
  watch: {
    inst(inst, oldInst) {
      if (this.$el) {
        inst.setSize(this.$el.clientWidth, this.$el.clientHeight);
        this.$el.replaceChild(inst.domElement, oldInst.domElement);
        this.vglNamespace.update();
      }
      oldInst.dispose();
    }
  },
  created() {
    this.vglNamespace.renderers.push(this);
  },
  mounted() {
    this.inst.setSize(this.$el.clientWidth, this.$el.clientHeight);
    this.$el.appendChild(this.inst.domElement);
    this.vglNamespace.update();
  },
  beforeDestroy() {
    this.vglNamespace.renderers.splice(
      this.vglNamespace.renderers.indexOf(this),
      1
    );
    this.inst.dispose();
  },
  render(h) {
    return h("div", [
      h(
        "iframe",
        {
          style: {
            visibility: "hidden",
            width: "100%",
            height: "100%",
            marginRight: "-100%",
            border: "none"
          },
          on: {
            load: event => {
              event.target.contentWindow.addEventListener(
                "resize",
                () => {
                  this.inst.setSize(
                    this.$el.clientWidth,
                    this.$el.clientHeight
                  );
                  this.vglNamespace.update();
                },
                false
              );
            }
          }
        },
        this.$slots.default
      )
    ]);
  }
};