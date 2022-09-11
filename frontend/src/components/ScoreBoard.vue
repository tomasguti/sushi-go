<template>
  <div class="score-board">
    <div v-for="player in players" :key="player.username">
      <span>{{ player.points }}</span> - <span>{{ player.username }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScoreBoard',
  props: {
    players: Array
  },
}
</script>

<style scoped>
.score-board {
  color: #ffffff;
  margin: 8px;
  padding: 16px;
  background-color: #5c366f;
  border: 0px;
  border-radius: 15px;
  height: 200px;
  width: 130px;
  text-align: left;
}
</style>
