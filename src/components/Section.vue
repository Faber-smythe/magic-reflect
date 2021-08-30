<template>
  <div id="bottomNotes">
    <p>
      <a href="https://github.com/Thomas-Jld/augmented-mirror" target="_blank">
        Mirror App by Thomas JULDO
      </a>
    </p>
    <p>
      <a href="https://github.com/Faber-smythe/magic-reflect" target="_blank">
        3D skeleton by Johann "Faber" IMBERT
      </a>
    </p>
  </div>
  <div id="canvasHolder">
    <canvas id="renderCanvas" ref="renderCanvas"></canvas>
  </div>
</template>

<script lang="ts">
// import libs
import { Options, Vue } from "vue-class-component";
import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
// import components
// import types
import { Frame } from "@/types/Miscellaneous";
// import miscellaneous
import BabylonController from "@/utils/BabylonController";

@Options({
  props: {},
})
export default class HelloWorld extends Vue {
  BC!: BabylonController;
  testFrame!: Frame;

  mounted(): void {
    const canvas = this.$refs.renderCanvas as HTMLCanvasElement;
    if (canvas) {
      // load test Array
      this.testFrame = require("@/assets/testFrame.json");
      this.BC = new BabylonController(canvas);

      // watch canvas resize event to adjust the 3D scene
      const resizeWatcher = new ResizeObserver(() => {
        this.BC.engine.resize();
      });
      resizeWatcher.observe(this.$refs.renderCanvas as HTMLElement);

      // load the Babylon scene
      this.loadScene();

      // render the Babylon scene
      this.BC.engine.runRenderLoop(() => {
        this.BC.scene.render();
      });
    } else {
      throw "no canvas found";
    }
  }

  loadScene(): void {
    console.log(this.testFrame);
    // this.loadCube();
    this.loadWalkingMan();
  }

  loadCube(): void {
    const _cube = BABYLON.MeshBuilder.CreateBox("box", {}, this.BC.scene);
  }

  loadWalkingMan(): void {
    // Parameter
    const width = 0.05;

    // Our nodes.
    const pelvis = BABYLON.MeshBuilder.CreateSphere(
      "pelvis",
      { diameter: width * 2, segments: 32 },
      this.BC.scene
    );
    const leftFoot = BABYLON.MeshBuilder.CreateSphere(
      "leftFoot",
      { diameter: width * 2, segments: 32 },
      this.BC.scene
    );
    const rightFoot = BABYLON.MeshBuilder.CreateSphere(
      "rightFoot",
      { diameter: width * 2, segments: 32 },
      this.BC.scene
    );
    const neck = BABYLON.MeshBuilder.CreateSphere(
      "neck",
      { diameter: width * 2, segments: 32 },
      this.BC.scene
    );
    const head = BABYLON.MeshBuilder.CreateSphere(
      "head",
      { diameter: width * 10, segments: 32 },
      this.BC.scene
    );
    const leftHand = BABYLON.MeshBuilder.CreateSphere(
      "leftHand",
      { diameter: width * 2, segments: 32 },
      this.BC.scene
    );
    const rightHand = BABYLON.MeshBuilder.CreateSphere(
      "rightHand",
      { diameter: width * 2, segments: 32 },
      this.BC.scene
    );

    pelvis.position.y = 1;
    leftFoot.position.x = -0.5;
    rightFoot.position.x = 0.5;
    neck.position.y = 2;
    head.position.y = 2.5;
    leftHand.position.y = 1.2;
    leftHand.position.x = -0.6;
    rightHand.position.y = 1.2;
    rightHand.position.x = 0.6;

    // Built-in 'ground' shape.
    var ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 6, height: 6 },
      this.BC.scene
    );
    ground.position.y = -0.25;
    const groundMat = new BABYLON.StandardMaterial("groundMat", this.BC.scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    ground.material = groundMat;

    // initializing our Array of tubes
    const tubes: BABYLON.Mesh[] = [];

    // Delete all existing tubes
    const disposeTubes = () => {
      tubes.forEach((tube) => {
        tube.dispose();
      });
    };
    // Draw new tubes from the nodes positions
    const drawTubes = () => {
      tubes[0] = BABYLON.MeshBuilder.CreateTube(
        "tube",
        { path: [head.position, neck.position], radius: width },
        this.BC.scene
      );
      tubes[1] = BABYLON.MeshBuilder.CreateTube(
        "tube",
        { path: [neck.position, leftHand.position], radius: width },
        this.BC.scene
      );
      tubes[2] = BABYLON.MeshBuilder.CreateTube(
        "tube",
        { path: [neck.position, rightHand.position], radius: width },
        this.BC.scene
      );
      tubes[3] = BABYLON.MeshBuilder.CreateTube(
        "tube",
        { path: [neck.position, pelvis.position], radius: width },
        this.BC.scene
      );
      tubes[4] = BABYLON.MeshBuilder.CreateTube(
        "tube",
        { path: [pelvis.position, leftFoot.position], radius: width },
        this.BC.scene
      );
      tubes[5] = BABYLON.MeshBuilder.CreateTube(
        "tube",
        { path: [pelvis.position, rightFoot.position], radius: width },
        this.BC.scene
      );
    };

    let i = 0;
    let amplitudeFactor = 0.4;
    let speedFactor = 1.4;
    // Redraw the tubes on each frame
    this.BC.scene.registerBeforeRender(() => {
      i += 0.1;

      // limbs walking
      leftFoot.position.z = Math.cos(i * speedFactor) * 0.8 * amplitudeFactor;
      rightFoot.position.z = -Math.cos(i * speedFactor) * 0.8 * amplitudeFactor;
      leftHand.position.z = -Math.cos(i * speedFactor) * 0.8 * amplitudeFactor;
      rightHand.position.z = Math.cos(i * speedFactor) * 0.8 * amplitudeFactor;

      // spine forward bobbing
      head.position.z = (Math.cos(i * 2 * speedFactor) / 6) * amplitudeFactor;
      neck.position.z = (Math.cos(i * 2 * speedFactor) / 15) * amplitudeFactor;
      pelvis.position.z =
        (-Math.cos(i * 2 * speedFactor) / 20) * amplitudeFactor;

      // spine lateral bobbing
      head.position.x = (-Math.cos(i * speedFactor) / 13) * amplitudeFactor;
      neck.position.x = (-Math.cos(i * speedFactor) / 15) * amplitudeFactor;
      pelvis.position.x = (Math.cos(i * speedFactor) / 20) * amplitudeFactor;

      // delete previous skeleton
      disposeTubes();
      // draw new skeleton
      drawTubes();
    });

    /**
     * GUI SLIDER
     */

    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    let panel = new GUI.StackPanel();
    panel.width = "220px";
    panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(panel);

    const addSlider = (
      title: string,
      value: number,
      min: number,
      max: number,
      onChange: (arg?: any) => void,
      isInteger: boolean
    ) => {
      var label = new GUI.TextBlock();
      label.text = title + ": " + (isInteger ? value | 0 : value.toFixed(2));
      label.height = "30px";
      label.color = "white";
      panel.addControl(label);

      var slider = new GUI.Slider();
      slider.minimum = min;
      slider.maximum = max;
      slider.value = value;
      slider.height = "20px";
      slider.width = "200px";
      slider.onValueChangedObservable.add(function (value) {
        label.text = title + ": " + (isInteger ? value | 0 : value.toFixed(2));
        onChange(value);
      });
      panel.addControl(slider);
    };

    // amplitude slider
    addSlider(
      "amplitude",
      speedFactor,
      0,
      2.5,
      (value) => {
        amplitudeFactor = value;
      },
      false
    );

    // speed slider
    addSlider(
      "speed",
      amplitudeFactor,
      0,
      5,
      (value) => {
        speedFactor = value;
      },
      false
    );
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#canvasHolder {
  position: absolute;
  z-index: 5;
  display: flex;
  height: 100%;
  width: 50%;
}
#renderCanvas {
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
}
#renderCanvas:focus-visible {
  outline: none;
}
#bottomNotes {
  position: absolute;
  bottom: 0px;
  right: 0px;
  max-width: 50vw;
  padding: 10px;
  padding-left: 10vw;
  margin: 15px;
  border-top: 2px solid #757575;
}
#bottomNotes p {
  text-align: right;
  font-size: 0.8em;
  color: rgb(0, 183, 255);
}
</style>
