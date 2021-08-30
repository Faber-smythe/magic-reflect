<template>
  <Section />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Section from "./components/Section.vue";
require("@/assets/css/reset.css");

@Options({
  components: {
    Section,
  },
})
export default class App extends Vue {}
</script>

<style>
html,
body {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgb(240, 240, 241);
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
  width: 100%;
  display: flex;
}
</style>
