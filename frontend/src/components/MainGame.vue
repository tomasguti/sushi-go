<template>
  <div class="main">
    <JoinPlayer v-if="!gameData" @join="join" />
  </div>
</template>

<script>
import JoinPlayer from './JoinPlayer.vue'

export default {
  components: { JoinPlayer },
  name: 'MainGame',
  props: {
    msg: String
  },
  data: () => ({
    connection: undefined,
    gameData: undefined,
  }),
  methods: {
    connect() {
      console.log('Connecting WebSocket...');
      if (this.connection === undefined || (this.connection && this.connection.readyState === WebSocket.CLOSED)) {
        this.connection = new WebSocket('ws://localhost:3000');

        this.connection.onopen = function() {
          console.log('WebSocket connected!');
        };

        this.connection.onmessage = (event) => {
          console.log('Message:', event.data);
          const message = JSON.parse(event.data)
          if (message.code === 'status') {
            this.gameData = message;
          }

          if (message.code === 'rooms') {
            this.rooms = message.rooms;
          }
        };

        this.connection.onclose = (event) => {
          console.log('Socket is closed. Reconnecting in 5...', event.reason);
          setTimeout(() => this.connect(), 5000);
        };

        this.connection.onerror = (err) => {
          console.error('Socket encountered error: ', err.message, 'Closing socket');
          // this.connection.close();
        };
      }
    },
    join(data) {
      if (this.connection.readyState === WebSocket.OPEN) {
        data.code = 'join';
        this.connection.send(JSON.stringify(data));
      }
    },
  },
  created: function() {
    this.connect();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
main {
  padding: 32px;
}
</style>
