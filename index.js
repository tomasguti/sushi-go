const express = require('express');
const http = require('http')
var { server: WebSocketServer } = require('websocket');
const bodyParser = require('body-parser')
const cors = require('cors')

const { Room } = require('./server/model/room');

const app = express();
const port = 3000;

const rooms = [new Room('room1')];

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/create', (req, res) => {
  // TODO: complete
});

app.post('/join', (req, res) => {
  const username = req.body.username;
  room.joinPlayer(username);
  res.end(`${username} joined`);
});

app.post('/play', (req, res) => {
  const username = req.body.username;
  const selectedCard = req.body.selectedCard;
  room.play(username, selectedCard);
  res.end(`${username} played`);
});

app.get('/status/:username', (req, res) => {
  const username = req.params.username;
  const statusResponse = room.getPlayerStatus(username);
  res.json(statusResponse);
});

app.use((err, req, res, next) => {
  console.error(err)
  res.status(400).end(err.message);
});

const server = http.createServer(app);

// WEBSOCKET

const clients = [];

ws = new WebSocketServer({
  httpServer: server,
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

ws.on('request', function(request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }
  
  const connection = request.accept(null, request.origin);
  console.log((new Date()) + ' Connection accepted.');

  const broadcastRooms = function() {
    connection.send(JSON.stringify({
      code: 'rooms',
      rooms: rooms.map(room => ({
        name: room.name,
        playersCount: room.players.length,
        maxPlayers: room.maxPlayers,
      })),
    }));
  };

  broadcastRooms();

  connection.on('message', function(message) {
    console.log(message)
    if (message.type === 'utf8') {
      const userData = JSON.parse(message.utf8Data);

      if (userData.code === 'join') {
        const room = rooms.find(room => room.name === userData.room);
        // TODO: check if room exists
        const player = room.players.find(player => player.username === userData.username);
  
        // Player already found in room, refresh connection reference
        if (player) {
          player.connection = connection;
          console.log(`${new Date()} ${player.username} rejoined.`);
        } else {
          room.joinPlayer(userData.username, connection);
          broadcastRooms();
        }

        connection.room = room.name;
        connection.username = userData.username;
        
        room.broadcastStatus();
      }

      if (userData.code === 'play') {
        const room = rooms.find(room => room.name === userData.room);
        room.play(userData.username, userData.selectedCard);        
        room.broadcastStatus();
      }
    }
  });

  connection.on('close', function(reasonCode, description) {
      const room = rooms.find(room => room.name === connection.room);
      // TODO: remove player
      const player = room.players.find(player => player.username === connection.username);
      console.log(`${new Date()} Peer ${player.username || 'guest'} ${connection.remoteAddress} disconnected.`);
  });

  clients.push(connection);
});

server.listen(port, () => {
  console.log(`Sushi GO! running on port ${port}`);
});
