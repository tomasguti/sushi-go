<template>
  <div class="players-round">
    <div v-for="player in players" :key="player.username">
      <h1 class="player-username">{{ player.username }}</h1>
      <div class="player" >
        <CardShow
          v-for="(cardInfo, cardIndex) in player.playedCards"
          :key="cardIndex"
          :cardInfo="cardInfo"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CardShow from './CardShow.vue';

export default {
  components: { CardShow },
  name: 'PlayersRound',
  props: {
    players: Array,
  },
  created() {
    console.log(this.players);
  },
}
</script>

<style scoped>
.players-round {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: center;
}

.player {
  padding: 16px;
  margin: 8px;
  background-color: #4d9aff;
  border: 0px;
  border-radius: 15px;
  height: 200px;
  width: 400px;
  min-width: 300px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
}
</style>
