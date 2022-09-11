<template>
  <div class="play-zone">
      <CardShow
        v-for="(cardInfo, cardIndex) in availableCards"
        :key="cardIndex"
        :cardInfo="cardInfo"
        @click="play(cardIndex)"
      />
  </div>
</template>

<script>
import CardShow from './CardShow.vue';

export default {
  components: { CardShow },
  name: 'PlayZone',
  props: {
    played: Boolean,
    availableCards: Array,
  },
  methods: {
    play(selectedCard) { //event
      if (!this.played) {
        this.$emit('play', { selectedCard });
      }
    }
  }
}
</script>

<style scoped>
.play-zone {
  padding: 32px;
  background-color: #baffc2;
  border: 0px;
  border-radius: 15px;
  max-width: 500px;
  min-height: 200px;
  bottom: 16px;
  position: absolute;
  left: 20%;
  right: 20%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: flex-start;
  align-items: flex-start;
}

.play-button {
  width: 200px;
}
</style>
