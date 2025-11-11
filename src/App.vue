<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  background: #1e222d;
  color: #d1d4dc;
}

#app {
  min-height: 100vh;
}
</style>
