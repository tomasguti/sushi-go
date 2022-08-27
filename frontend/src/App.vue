<template>
  <MainGame />
</template>

<script>
import MainGame from './components/MainGame.vue'

export default {
  name: 'App',
  components: {
    MainGame
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

input, button {
  font-size: 20px;
  border: none;
  padding: 8px;
  border-radius: 5px;
}
</style>
