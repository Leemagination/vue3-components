<template>
  <div>
    <LeeButton loading>
      Demo
    </LeeButton>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {LeeButton} from '../dist/index';

export default defineComponent({
  name: 'App',
  components: {
    LeeButton
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
