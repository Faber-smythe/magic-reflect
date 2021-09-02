import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import { Position2D } from "@/types/Miscellaneous";

const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;

export default class BabylonController {
  canvas!: HTMLCanvasElement;
  engine!: BABYLON.Engine;
  scene!: BABYLON.Scene;
  camera!: BABYLON.ArcRotateCamera;
  light!: BABYLON.Light;
  GUI!: GUI.AdvancedDynamicTexture;
  SM!: BABYLON.SpriteManager;
  AM!: BABYLON.AssetsManager;

  settings = {
    sphereDiameter: 4096, //! MUST FIT THE COORDINATES DIMENSIONS !\\
    debugLayer: true, // Enable for Babylon scene explorer and inspector
    freeCam: false, // Enable for easier navigation
    fov: 1, // field of view
    hotspotSize: 1.5,
    brightness: 5,
    sensitivity: 1, // the bigger, the more sensitive
    inertia: 0.7, // 0 is no inertia, 1 has no slowing down
  };

  /**
   * @param {number} canvas canvas used to render the BabylonScene
   * @param {number} loadScreen the custom loading screen element
   */
  constructor(canvas: HTMLCanvasElement, _loadScreen?: HTMLElement) {
    // Setting up
    this.canvas = canvas;
    this.engine = new BABYLON.Engine(canvas, true);
    this.engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
    this.scene = new BABYLON.Scene(this.engine);

    // Set up basic environment
    this.camera = new BABYLON.ArcRotateCamera(
      "camera1",
      -1.56,
      1,
      10,
      new BABYLON.Vector3(0, 0, 0),
      this.scene
    );
    this.camera.attachControl(this.canvas);
    this.camera.wheelPrecision = 10
    this.light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );

    // set the canvas background to transparent
    this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

    // Initialize Babylon asset manager
    this.AM = new BABYLON.AssetsManager(this.scene);

    // Initialize Babylon GUI
    this.GUI = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      "UI",
      true,
      this.scene
    );

    // Enable debuglayer if asked
    if (this.settings.debugLayer) {
      const canvasHolder = document.getElementById(
        "canvasHolder"
      ) as HTMLElement;
      if (canvasHolder) canvasHolder.style.width = "100%";
      this.scene.debugLayer.show();
    }
  }

  /**
   * Generic method used to link attach callBacks to certain events
   * @param {Function} meshCallback callBack to fire on picked meshes
   * @param {Function} spriteCallback callBack to fire on picked sprites
   * @param {Function} outsideCallback callBack to fire on nothing picked
   */
  handleImmersivePicking(
    meshCallback?: (arg?: BABYLON.AbstractMesh) => void,
    spriteCallback?: (arg?: BABYLON.Sprite) => void,
    outsideCallback?: () => void
  ): void {
    this.scene.onPointerDown = (_event, pickResult) => {
      /** CHECK FOR MESHES **/
      if (pickResult && pickResult.pickedMesh) {
        if (meshCallback) {
          meshCallback(pickResult.pickedMesh);
        } else {
          console.log("picked a mesh :", pickResult.pickedMesh.name);
        }
      }
      /** CHECK FOR SPRITES **/
      const search = this.scene.pickSprite(
        this.scene.pointerX,
        this.scene.pointerY
      );
      if (search && search.hit && search.pickedSprite) {
        if (spriteCallback) {
          spriteCallback(search.pickedSprite);
        } else {
          console.log("picked a sprite :", search.pickedSprite.name);
        }
      }
      if (!(search && search.hit) || (pickResult && pickResult.pickedMesh)) {
        if (outsideCallback) outsideCallback();
      }
    };
  }

  /**
   * Generates X and Y screen coordinates (top left corner is 0;0) from Babylon 3D positions
   * @param {BABYLON.Vector3} coordinates Scene 3D position
   * @return {BABYLON.Vector2} Screen 2D position
   */
  worldToScreenCoordinates(coordinates: BABYLON.Vector3): BABYLON.Vector2 {
    const camera = this.scene.cameras[0];
    const projection = BABYLON.Vector3.Project(
      coordinates,
      BABYLON.Matrix.Identity(),
      this.scene.getTransformMatrix(),
      camera.viewport.toGlobal(
        this.canvas.clientWidth,
        this.canvas.clientHeight
      )
    );
    return new BABYLON.Vector2(projection.x, projection.y);
  }

  /**
   * Computes a geometric angle in degrees between two vectors in space
   * @param {BABYLON.Vector3} vec1 First 3D vector
   * @param {BABYLON.Vector3} vec2 Second 3D vector
   * @return {number} 2D angle (between 0 and 180 degrees)
   */
  angleBetweenTwoVectors(vec1: BABYLON.Vector3, vec2: BABYLON.Vector3): number {
    const normalized1 = BABYLON.Vector3.Normalize(vec1);
    const normalized2 = BABYLON.Vector3.Normalize(vec2);

    const dotVec = BABYLON.Vector3.Dot(normalized2, normalized1);

    /** arcCos of dot vector **/
    const angleRadians = Math.acos(dotVec); // radians
    const angleDeegres = this.radiansToDegrees(angleRadians); // deegre

    return angleDeegres;
  }

  /**
   * Return the hotspot's 3D position based on its 2D pixel coordinates, using Mercator projection.
   * - compute polar coordinates
   * - compute cartesian coordinates
   * - return 3D vector
   * @param {Position2D} hotspotPosition
   * @param {Number} sphereRadius
   * @return {BABYLON.Vector3} the generated 3D position
   */
  generate3DPosition(
    hotspotPosition: Position2D,
    sphereRadius: number
  ): BABYLON.Vector3 {
    /** ------------------------------------------------------------------
     * Generate polar coordinates according to 2D cartesian coordinates of the specific hotspot
     * ------------------------------------------------------------------ */

    const longitude = RAD2DEG * (hotspotPosition.x / sphereRadius);
    const latitude =
      RAD2DEG *
      (2 * Math.atan(Math.exp(hotspotPosition.y / sphereRadius)) - Math.PI / 2);

    /** ------------------------------------------------------------------
     * Generate 3D cartesian coordinates according to polar coordinates (latitude and longitude)
     * ------------------------------------------------------------------ */

    // First send the point from the origin onto the sphere's wall.
    // Then we'll rotate the vector from the origin with two angles
    const origin = new BABYLON.Vector3(0, 0, sphereRadius);

    // Converting to radians and computing the rotation on both planes
    const phi = latitude * DEG2RAD;
    const theta = (270 - longitude) * DEG2RAD;

    // BABYLON can't rotate a Vector3 with Euler, it needs Quaternion.
    const vecNull = BABYLON.Vector3.Zero(); // Quaternion needs a reference to compute
    const quat = BABYLON.Quaternion.FromEulerAngles(phi, theta, 0); // conversion
    const cartesianCoordinates = origin.rotateByQuaternionToRef(quat, vecNull);

    return cartesianCoordinates;
  }

  /**
   * Tool method
   * @param {number} radians Angle value in radians
   * @return {number} Angle value in degrees
   */
  radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Tool method
   * @param {number} degrees Angle value in degrees
   * @return {number} Angle value in radians
   */
  degreesToRadians(degrees: number): number {
    return degrees / (180 / Math.PI);
  }
}
