const chalk = require('chalk');

const { Card } = require('./card');
const { Player } = require('./player');

const { shuffleArray } = require('../utils');

class Room {
  name;

  maxPlayers = 3;
  players = [];
  allCards = [];

  currentRound = 1;

  constructor(name, maxPlayers = 2) {
    this.name = name;
    this.maxPlayers = maxPlayers;
    this.generateCards();
  }

  restart() {
    this.players.forEach((player) => {
      player.restart();
    });
    this.generateCards();
    this.startRound();
    console.log('Room restarted, waiting for the players to play...');
  }

  play(username, selectedCard) {
    const player = this.players.find((player) => player.username === username);
    if (!player) {
      throw Error(`${username} is not playing in this room`);
    }

    if (player.played) {
      throw Error(`${player.username} already played his turn`);
    }

    if (selectedCard < 0 || selectedCard >= player.availableCards.length) {
      throw Error('invalid card selected');
    }

    player.played = true;
    const playedCard = player.availableCards.splice(selectedCard, 1)[0];
    player.playedCards.push(playedCard);
    console.log(`${username} played`, playedCard);

    const allPlayed = !this.players.some((player) => !player.played);
    if (allPlayed) {
      console.log('All players played');
      this.nextPlay();
    }
  }

  nextPlay() {
    const anyCardLeft = this.players.some((player) => player.availableCards.length > 0);
    if (anyCardLeft) {
      this.rotateCards();
    } else {
      this.endRound();
    }
  }

  rotateCards() {
    const auxCards = this.players[0].availableCards;
    const lastPlayerIndex = this.players.length - 1;
    for (let i = 0; i < lastPlayerIndex; i++) {
      this.players[i].availableCards = this.players[i+1].availableCards;
    }
    this.players[lastPlayerIndex].availableCards = auxCards;

    this.players.forEach((player) => {
      player.played = false;
    });

    console.log('Cards rotated');
  }

  broadcastStatus() {
    this.players.forEach(roomPlayer => {
      const status =  {
        code: 'status',
        players: [],
        maxPlayers: this.maxPlayers,
        currentRound: this.currentRound,
      };
  
      this.players.forEach(player => {
        const playerStatus = {
          cardsLeft: player.availableCards.length,
          playedCards: player.playedCards,
          points: player.points,
          played: player.played,
        };
  
        if (player.username === roomPlayer.username) {
          status.availableCards = player.availableCards;
        }
  
        status.players.push(playerStatus);
      });

      roomPlayer.connection.send(JSON.stringify(status));
    });
  }

  joinPlayer(username, connection) {
    if (this.players.length > this.maxPlayers) {
      throw Error(`Room ${this.name} is full.`);
    }

    if (!username) {
      throw Error(`Missing username.`);
    }

    const player = this.players.find((player) => player.username === username);
    if (player) {
      throw Error(`Player ${username} already joined room ${this.name}.`);
    }

    this.players.push(new Player(username, connection));
    console.log(`User ${username} joined room ${this.name}!`);

    if (this.players.length >= this.maxPlayers) {
      this.startRound();
    }
  }

  startRound() {
    /*
      In a 2 player game, deal 10 cards to each player.
      In a 3 player game, deal 9 cards to each player.
      In a 4 player game, deal 8 cards to each player.
      In a 5 player game, deal 7 cards to each player.
    */
    console.log(`Starting round ${this.currentRound}...`);

    const cardsAmountByPlayer = {
      2: 4,
      3: 4,
      4: 8,
      5: 7,
    };

    const cardsAmount = cardsAmountByPlayer[this.players.length];
    this.players.forEach((player) => {
      player.availableCards = [];
      for (let i = 0; i < cardsAmount; i++) {
        player.availableCards.push(this.allCards.pop());
      }
      player.played = false;
      player.makiRollsPoints = 0;
    });

    console.log(`${cardsAmount} cards for ${this.players.length} players`);
  }

  endRound() {
    console.log(`Ending round ${this.currentRound}`);

    console.log('Calculating player scores...');
    this.players.forEach((player) => {
      player.calculateRoundScore();
    });

    this.calculateMakiRollsPoints();

    this.currentRound += 1;

    if (this.currentRound > 2) {
      this.calculatePuddingsPoints();
      this.sendFinalPoints();
    } else {
      // Next round
      this.startRound();
    }
  }

  calculateMakiRollsPoints() {
    console.log('Calculating maki-rolls scores...');
    const players = [ ...this.players ];
    players.sort((playerA, playerB) => playerB.makiRollsPoints - playerA.makiRollsPoints);

    const bestScore = players[0].makiRollsPoints;
    if (bestScore > 0) {
      const bestPlayers = players.filter((player) => player.makiRollsPoints === bestScore);
      bestPlayers.forEach((player) => {
        const originalPlayer = this.players.find((originalPlayer) => originalPlayer.username === player.username);
        const makiRollsPoints = 6 / bestPlayers.length;
        originalPlayer.points += makiRollsPoints;
        console.log(chalk.red(`${originalPlayer.username} won ${makiRollsPoints} for maki-rolls (first)`));
      });

      const notBestPlayers = players.filter((player) => !bestPlayers.includes(player));
      const secondBestScore = notBestPlayers.length > 0 ? notBestPlayers[0].makiRollsPoints : 0;
      if (secondBestScore > 0) {
        const secondBestPlayers = players.filter((player) => player.makiRollsPoints === secondBestScore);
        secondBestPlayers.forEach((player) => {
          const originalPlayer = this.players.find((originalPlayer) => originalPlayer.username === player.username);
          const makiRollsPoints = 3 / secondBestPlayers.length;
          originalPlayer.points += makiRollsPoints;
          console.log(chalk.red(`${originalPlayer.username} won ${makiRollsPoints} for maki-rolls (second)`));
        });
      }
    }
  }

  calculatePuddingsPoints() {
    console.log('Calculating puddings scores...');
    const players = [ ...this.players ];
    players.sort((playerA, playerB) => playerB.puddingsPoints - playerA.puddingsPoints);

    const bestScore = players[0].puddingsPoints;
    if (bestScore > 0) {
      const bestPlayers = players.filter((player) => player.puddingsPoints === bestScore);
      bestPlayers.forEach((player) => {
        const originalPlayer = this.players.find((originalPlayer) => originalPlayer.username === player.username);
        const puddingsPoints = 6 / bestPlayers.length;
        originalPlayer.points += puddingsPoints;
        console.log(chalk.magenta(`${originalPlayer.username} won ${puddingsPoints} for puddings`));
      });

      const worstScore = players[players.length - 1].puddingsPoints;
      const worstPlayers = players.filter((player) => player.puddingsPoints === worstScore);
      worstPlayers.forEach((player) => {
        const originalPlayer = this.players.find((originalPlayer) => originalPlayer.username === player.username);
        const puddingsPoints = 6 / bestPlayers.length;
        originalPlayer.points -= puddingsPoints;
        console.log(chalk.magenta(`${originalPlayer.username} lose ${puddingsPoints} for puddings`));
      });
    }
  }

  sendFinalPoints() {
    this.players.forEach((player) => {
      console.log(chalk.inverse(`${player.username} made ${player.points} points`));
    });

    console.log('Waiting 15 seconds before starting again...');
    setTimeout(() => this.restart(), 15000)
  }

  generateCards() {
    /*
      108 cards:

      14x Tempura
      14x Sashimi
      14x Dumpling
      12x 2 Maki rolls
      8x 3 Maki rolls
      6x 1 Maki roll
      10x Salmon Nigiri
      5x Squid Nigiri
      5x Egg Nigiri
      10x Pudding
      6x Wasabi
      4x Chopsticks
    */
    const cards = [];
    const types = [
      {
        type: 'tempura',
        quantity: 14,
      },
      {
        type: 'sashimi',
        quantity: 14,
      },
      {
        type: 'dumpling',
        quantity: 14,
      },
      {
        type: 'maki-roll',
        subtype: 2,
        quantity: 12,
      },
      {
        type: 'maki-roll',
        subtype: 3,
        quantity: 8,
      },
      {
        type: 'maki-roll',
        subtype: 1,
        quantity: 6,
      },
      {
        type: 'nigiri',
        subtype: 1,
        quantity: 10,
      },
      {
        type: 'nigiri',
        subtype: 2,
        quantity: 5,
      },
      {
        type: 'nigiri',
        subtype: 3,
        quantity: 5,
      },
      {
        type: 'pudding',
        quantity: 5,
      },
      {
        type: 'wasabi',
        quantity: 6,
      },
      /*{
        type: 'chopsticks',
        quantity: 4,
      }*/
    ];

    types.forEach(({ type, subtype, quantity }) => {
      for (let i = 0; i < quantity; i++) {
        cards.push(new Card(type, subtype));
      }
    });

    this.allCards = shuffleArray(cards);
  }
}

module.exports = { Room };
