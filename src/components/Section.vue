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

// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import * as earcut from "earcut";

@Options({
  props: {},
})
export default class HelloWorld extends Vue {
  BC!: BabylonController;
  testFrame!: Frame;
  bodyCenter: BABYLON.Vector3 = BABYLON.Vector3.Zero();

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
    // this.loadCube();
    // this.loadWalkingFigure();
    // this.loadNodesMan();
    this.loadNodesMan2();
  }

  loadCube(): void {
    const _cube = BABYLON.MeshBuilder.CreateBox("box", {}, this.BC.scene);
  }

  loadWalkingFigure(): void {
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
    let ground = BABYLON.MeshBuilder.CreateGround(
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
      let label = new GUI.TextBlock();
      label.text = title + ": " + (isInteger ? value | 0 : value.toFixed(2));
      label.height = "30px";
      label.color = "white";
      panel.addControl(label);

      let slider = new GUI.Slider();
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

  loadNodesMan(): void {
    // Parameter
    const width = 0.03;
    const scaleFactor = 100; // TODO appropriate scaling

    // Our nodes.
    const nodes = this.testFrame.body_pose.map(
      (node) =>
        new BABYLON.Vector3(
          node[2] / scaleFactor,
          -node[3] / scaleFactor,
          (node[4] * Math.sin(this.BC.degreesToRadians(13.8))) / scaleFactor
        )
    );

    // create node meshes
    nodes.forEach((node, i) => {
      const sphere = BABYLON.MeshBuilder.CreateSphere(`node-${i}`, {
        diameter: width * 2,
      });
      sphere.position = new BABYLON.Vector3(node.x, node.y, node.z);
    });

    // Initialize body center position
    this.bodyCenter = BABYLON.Vector3.Center(
      BABYLON.Vector3.Center(nodes[11], nodes[12]),
      BABYLON.Vector3.Center(nodes[23], nodes[24])
    );

    // Built-in 'ground' shape.
    let ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 25, height: 25 },
      this.BC.scene
    );
    ground.position.y = -9.5;
    const groundMat = new BABYLON.StandardMaterial("groundMat", this.BC.scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    ground.material = groundMat;

    // pairing nodes to build our segments
    // node IDs are here (https://google.github.io/mediapipe/solutions/pose.html#pose-landmark-model-blazepose-ghum-3d)
    const chest = [
      [nodes[11], nodes[12]],
      [nodes[12], nodes[24]],
      [nodes[24], nodes[23]],
      [nodes[23], nodes[11]],
    ];
    const face = [
      [nodes[1], nodes[2]],
      [nodes[2], nodes[3]],
      [nodes[4], nodes[5]],
      [nodes[5], nodes[6]],
      [nodes[9], nodes[10]],
    ];
    const leftArm = [
      [nodes[11], nodes[13]],
      [nodes[13], nodes[15]],
      [nodes[15], nodes[17]],
      [nodes[17], nodes[19]],
      [nodes[19], nodes[15]],
      [nodes[15], nodes[21]],
    ];
    const leftFoot = [
      [nodes[23], nodes[25]],
      [nodes[25], nodes[27]],
      [nodes[27], nodes[29]],
      [nodes[29], nodes[31]],
      [nodes[31], nodes[27]],
    ];
    const rightArm = [
      [nodes[12], nodes[14]],
      [nodes[14], nodes[16]],
      [nodes[16], nodes[18]],
      [nodes[18], nodes[20]],
      [nodes[20], nodes[16]],
      [nodes[16], nodes[22]],
    ];
    const rightFoot = [
      [nodes[24], nodes[26]],
      [nodes[26], nodes[28]],
      [nodes[28], nodes[30]],
      [nodes[30], nodes[32]],
      [nodes[32], nodes[28]],
    ];
    const segments = chest
      .concat(face)
      .concat(leftArm)
      .concat(rightArm)
      .concat(leftFoot)
      .concat(rightFoot);
    // initializing our Array of tubes (segment meshes)
    const tubes: BABYLON.Mesh[] = [];

    // Delete all existing tubes
    const _disposeAll = () => {
      tubes.forEach((tube) => {
        tube.dispose();
      });
    };

    // Draw new tubes from the nodes positions
    const drawTubes = (segments: BABYLON.Vector3[][]) => {
      segments.forEach((segment) => {
        // console.log(segment);
        tubes[0] = BABYLON.MeshBuilder.CreateTube(
          "tube",
          { path: segment, radius: width },
          this.BC.scene
        );
      });
    };

    // Fill in place of the Torso
    const drawTorso = () => {
      // Create a custom mesh
      let customMesh = new BABYLON.Mesh("custom", this.BC.scene);

      // Set arrays for positions and indices
      let positions = [nodes[11], nodes[12], nodes[23], nodes[24]].flatMap(
        (node) => [node.x, node.y, node.z]
      );
      let indices = [0, 1, 2, 1, 2, 3];

      // Empty array to contain calculated values
      let normals: BABYLON.FloatArray = [];

      let vertexData = new BABYLON.VertexData();
      BABYLON.VertexData.ComputeNormals(positions, indices, normals);

      // Assign positions, indices and normals to vertexData
      vertexData.positions = positions;
      vertexData.indices = indices;
      vertexData.normals = normals;

      // Apply vertexData to custom mesh
      vertexData.applyToMesh(customMesh);

      // Set backFace material
      const mat = new BABYLON.StandardMaterial("mat", this.BC.scene);
      mat.backFaceCulling = false;
      customMesh.material = mat;
    };

    // Try kind of a head
    const drawHead = () => {
      const head = BABYLON.MeshBuilder.CreateSphere("head", {
        diameter: width * 35,
      });
      head.position = this.bodyCenter;
      head.position.y = nodes[0].y;
    };

    drawTubes(segments);
    drawTorso();
    drawHead();

    // update camera
    const updateCameraTarget = () => {
      const target = this.bodyCenter ?? BABYLON.Vector3.Zero();
      this.BC.camera.setTarget(target);
    };

    // set camera orientation
    updateCameraTarget();
  }

  loadNodesMan2(): void {
    // Emissive material
    const emissiveMat = new BABYLON.StandardMaterial(
      "emissiveMat",
      this.BC.scene
    );
    emissiveMat.emissiveColor = new BABYLON.Color3(
      255 / 255,
      68 / 255,
      224 / 255
    );

    // Parameter
    const width = 0.02;
    const scaleFactor = 100; // TODO appropriate scaling

    // Our nodes.
    const bodyNodes = this.testFrame.body_pose.map(
      (node) =>
        new BABYLON.Vector3(
          node[2] / scaleFactor,
          -node[3] / scaleFactor,
          (node[4] * Math.sin(this.BC.degreesToRadians(13.8))) / scaleFactor
        )
    );
    const faceNodes = this.testFrame.face_mesh.map(
      (node) =>
        new BABYLON.Vector3(
          node[2] / scaleFactor,
          -node[3] / scaleFactor,
          (node[4] * Math.sin(this.BC.degreesToRadians(13.8))) / scaleFactor
        )
    );
    const leftHandNodes = this.testFrame.right_hand_pose.map(
      (node) =>
        new BABYLON.Vector3(
          node[2] / scaleFactor,
          -node[3] / scaleFactor,
          (node[4] * Math.sin(this.BC.degreesToRadians(13.8))) / scaleFactor
        )
    );
    const rightHandNodes = this.testFrame.left_hand_pose.map(
      (node) =>
        new BABYLON.Vector3(
          node[2] / scaleFactor,
          -node[3] / scaleFactor,
          (node[4] * Math.sin(this.BC.degreesToRadians(13.8))) / scaleFactor
        )
    );

    // create node meshes
    const bodyMeshes: BABYLON.Mesh[] = [];
    bodyNodes.forEach((node, i) => {
      if (i > 10 && ![17, 18, 19, 20, 21, 22].includes(i)) {
        const sphere = BABYLON.MeshBuilder.CreateSphere(`bodyNode-${i}`, {
          diameter: width * 2,
        });
        sphere.position = new BABYLON.Vector3(node.x, node.y, node.z);
        bodyMeshes.push(sphere);
      }
    });

    const faceMeshes: BABYLON.Mesh[] = [];
    faceNodes.forEach((node, i) => {
      const sphere = BABYLON.MeshBuilder.CreateSphere(`faceNode-${i}`, {
        diameter: width / 2,
      });
      sphere.position = new BABYLON.Vector3(node.x, node.y, node.z);
      faceMeshes.push(sphere);
    });

    const leftHandMeshes: BABYLON.Mesh[] = [];
    leftHandNodes.forEach((node, i) => {
      const sphere = BABYLON.MeshBuilder.CreateSphere(`leftHandNode-${i}`, {
        diameter: width * 2,
      });
      sphere.position = new BABYLON.Vector3(node.x, node.y, node.z);
      leftHandMeshes.push(sphere);
    });

    const rightHandMeshes: BABYLON.Mesh[] = [];
    rightHandNodes.forEach((node, i) => {
      const sphere = BABYLON.MeshBuilder.CreateSphere(`rightHandNode-${i}`, {
        diameter: width * 2,
      });
      sphere.position = new BABYLON.Vector3(node.x, node.y, node.z);
      rightHandMeshes.push(sphere);
    });

    // Initialize body center position
    this.bodyCenter = BABYLON.Vector3.Center(
      BABYLON.Vector3.Center(bodyNodes[11], bodyNodes[12]),
      BABYLON.Vector3.Center(bodyNodes[23], bodyNodes[24])
    );

    // Built-in 'ground' shape.
    // let ground = BABYLON.MeshBuilder.CreateGround(
    //   "ground",
    //   { width: 25, height: 25 },
    //   this.BC.scene
    // );
    // ground.position.y = -9.5;
    // const groundMat = new BABYLON.StandardMaterial("groundMat", this.BC.scene);
    // groundMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    // ground.material = groundMat;

    // pairing bodyNodes to build our segments
    // node IDs are here (https://google.github.io/mediapipe/solutions/pose.html#pose-landmark-model-blazepose-ghum-3d)
    const segmentArm = (hand: BABYLON.Vector3[], side: "left" | "right") => {
      const pairing = side === "right" ? 1 : 0;
      return [
        [bodyNodes[11 + pairing], bodyNodes[13 + pairing]],
        [bodyNodes[13 + pairing], bodyNodes[15 + pairing]],
        [bodyNodes[15 + pairing], hand[0]],
        // thumb
        [hand[0], hand[1]],
        [hand[1], hand[2]],
        [hand[2], hand[3]],
        [hand[3], hand[4]],
        // palm
        [hand[0], hand[5]],
        [hand[5], hand[9]],
        [hand[9], hand[13]],
        [hand[13], hand[17]],
        [hand[17], hand[0]],
        // pointer
        [hand[5], hand[6]],
        [hand[6], hand[7]],
        [hand[7], hand[8]],
        // middle
        [hand[9], hand[10]],
        [hand[10], hand[11]],
        [hand[11], hand[12]],
        // ring
        [hand[13], hand[14]],
        [hand[14], hand[15]],
        [hand[15], hand[16]],
        // pinky
        [hand[17], hand[18]],
        [hand[18], hand[19]],
        [hand[19], hand[20]],
      ];
    };

    const getSegments = () => {
      const chest = [
        [bodyNodes[11], bodyNodes[12]],
        [bodyNodes[12], bodyNodes[24]],
        [bodyNodes[24], bodyNodes[23]],
        [bodyNodes[23], bodyNodes[11]],
      ];
      // const face = [
      //   [bodyNodes[1], bodyNodes[2]],
      //   [bodyNodes[2], bodyNodes[3]],
      //   [bodyNodes[4], bodyNodes[5]],
      //   [bodyNodes[5], bodyNodes[6]],
      //   [bodyNodes[9], bodyNodes[10]],
      // ];
      const leftArm = segmentArm(leftHandNodes, "left");
      const leftFoot = [
        [bodyNodes[23], bodyNodes[25]],
        [bodyNodes[25], bodyNodes[27]],
        [bodyNodes[27], bodyNodes[29]],
        [bodyNodes[29], bodyNodes[31]],
        [bodyNodes[31], bodyNodes[27]],
      ];
      const rightArm = segmentArm(rightHandNodes, "right");
      const rightFoot = [
        [bodyNodes[24], bodyNodes[26]],
        [bodyNodes[26], bodyNodes[28]],
        [bodyNodes[28], bodyNodes[30]],
        [bodyNodes[30], bodyNodes[32]],
        [bodyNodes[32], bodyNodes[28]],
      ];
      const segments = chest
        // .concat(face)
        .concat(leftArm)
        .concat(rightArm)
        .concat(leftFoot)
        .concat(rightFoot);
      return segments;
    };
    // initializing our Array of tubes (segment meshes)
    let tubes: BABYLON.Mesh[] = [];

    // Draw new tubes from the bodyNodes positions
    const drawTubes = (segments: BABYLON.Vector3[][]) => {
      segments.forEach((segment) => {
        // console.log(segment);
        tubes.push(
          BABYLON.MeshBuilder.CreateTube(
            "tube",
            { path: segment, radius: width },
            this.BC.scene
          )
        );
      });
    };

    // Fill in place of the Torso
    let torso: BABYLON.Mesh;
    const drawTorso = () => {
      // Create a custom mesh
      torso = new BABYLON.Mesh("custom", this.BC.scene);

      // Set arrays for positions and indices
      let positions = [
        bodyNodes[11],
        bodyNodes[12],
        bodyNodes[23],
        bodyNodes[24],
      ].flatMap((node) => [node.x, node.y, node.z]);
      let indices = [0, 1, 2, 1, 2, 3];

      // Empty array to contain calculated values
      let normals: BABYLON.FloatArray = [];

      let vertexData = new BABYLON.VertexData();
      BABYLON.VertexData.ComputeNormals(positions, indices, normals);

      // Assign positions, indices and normals to vertexData
      vertexData.positions = positions;
      vertexData.indices = indices;
      vertexData.normals = normals;

      // Apply vertexData to custom mesh
      vertexData.applyToMesh(torso);

      // Set backFace material
      const mat = new BABYLON.StandardMaterial("mat", this.BC.scene);
      mat.backFaceCulling = false;
      torso.material = mat;
    };

    // Delete all existing tubes
    const _disposeSurfaceMeshes = () => {
      tubes.forEach((tube) => {
        tube.dispose();
      });
      tubes = [];
      torso.dispose();
    };

    drawTubes(getSegments());
    drawTorso();

    // update camera
    const updateCameraTarget = () => {
      const target = this.bodyCenter ?? BABYLON.Vector3.Zero();
      this.BC.camera.setTarget(target);
    };

    // frame updates
    updateCameraTarget();

    // let i = 0;
    this.BC.scene.registerBeforeRender(() => {
      // i += 0.1;
      // _disposeSurfaceMeshes();
      // nodeMeshes.forEach((sphere) => {
      //   sphere.position.z += Math.cos(i) / 10;
      // });
      // faceMeshes.forEach((sphere) => {
      //   sphere.position.z += Math.cos(i) / 10;
      // });
      // bodyNodes.forEach((node) => {
      //   node.z += Math.cos(i) / 10;
      // });
      // this.bodyCenter = BABYLON.Vector3.Center(
      //   BABYLON.Vector3.Center(bodyNodes[11], bodyNodes[12]),
      //   BABYLON.Vector3.Center(bodyNodes[23], bodyNodes[24])
      // );
      // drawTubes(getSegments());
      // drawTorso();
    });

    // console.log(bodyNodes.flatMap((node) => [node.x, node.y, node.z]));
    console.log(this.testFrame);
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
