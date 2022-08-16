const express = require('express');
const bodyParser = require('body-parser')

const { Room } = require('./server/model/room');

const app = express();
const port = 3000;

const room = new Room('room1');

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

app.listen(port, () => {
  console.log(`Sushi GO! running on port ${port}`);
});
