<template>
  <div class="join-player">
    <h2>username</h2>
    <input :disabled="disableJoin" v-model="username" placeholder="type your username" />
    <h2>room</h2>
    <input disabled="true" v-model="room" placeholder="type the room name" />
    <h2></h2>
    <button class="join-button" :disabled="disableJoin" @click="join">Join</button>
    <p>{{ resultText }}</p>
  </div>
</template>

<script>
export default {
  name: 'JoinPlayer',
  props: {},
  data() {
    return {
      username: '',
      room: 'room1',
      disableJoin: false,
      resultText: '',
    };
  },
  methods: {
    join() {
      if (!this.disableJoin) {
        this.disableJoin = true;
        this.$emit('join', { username: this.username, room: this.room });
      }
    }
  }
}
</script>

<style scoped>
.join-player {
  padding: 32px;
  background-color: #cbcbcb;
  border: 0px;
  border-radius: 15px;
  max-width: 250px;
}

.join-button {
  width: 200px;
}
</style>
