<script setup lang="ts">
import { onMounted, ref } from 'vue';

  const text =ref('hello world')

  onMounted(()=>{
    setTimeout(()=>{
       text.value = `hello world ${Date.now()}`
    },3000)
  })
</script>

<template>
  <div>
    <div>{{ text }}</div>
    <div>adsagsd</div>
    <p>biubiu <span style="color: red">hahahah</span></p>
  </div>
</template>

<style scoped>

</style>
