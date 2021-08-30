<template>
  <div id="bottomNotes">
    <p>
      <a href="https://github.com/Thomas-Jld/augmented-mirror" target="_blank">
        Mirror App by Thomas JULDO
      </a>
    </p>
    <p>
      <a href="" target="_blank"> 3D skeleton by Johann "Faber" IMBERT </a>
    </p>
  </div>
  <div id="canvasHolder">
    <canvas id="renderCanvas" ref="renderCanvas"></canvas>
  </div>
</template>

<script lang="ts">
// import libs
import { Options, Vue } from "vue-class-component";
// import components
// import types
// import miscellaneous
import BabylonController from "@/utils/BabylonController";

@Options({
  props: {
    msg: String,
  },
})
export default class HelloWorld extends Vue {
  msg!: string;
  BC!: BabylonController;

  mounted(): void {
    console.log("hey");
    const canvas = this.$refs.renderCanvas as HTMLCanvasElement;
    if (canvas) {
      this.BC = new BabylonController(canvas);
    } else {
      throw "no canvas found";
    }
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
  background: rgba(0, 0, 0, 0.5);
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
