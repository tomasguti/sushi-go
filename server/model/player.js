const chalk = require('chalk');

class Player {
  username;
  connection; // websocket reference
  
  availableCards = [];
  playedCards = [];
  played = false;

  points = 0;
  makiRollsPoints = 0;
  puddingsPoints = 0;

  constructor(username, connection) {
    this.username = username;
    this.connection = connection;
  }

  restart() {
    this.availableCards = [];
    this.playedCards = [];
    this.played = false;
    this.points = 0;
    this.makiRollsPoints = 0;
    this.puddingsPoints = 0;
  }

  calculateRoundScore() {
    const tempuras = this.playedCards.filter((card) => card.type === 'tempura');
    const tempurasPoints = Math.floor( tempuras.length / 2 ) * 5;
    this.points += tempurasPoints;
    console.log(chalk.cyan(`player ${this.username} scored ${tempurasPoints} for ${tempuras.length} tempuras`));

    const sashimis = this.playedCards.filter((card) => card.type === 'sashimi');
    const sashimisPoints = Math.floor( sashimis.length / 3 ) * 10;
    this.points += sashimisPoints;
    console.log(chalk.green(`player ${this.username} scored ${sashimisPoints} for ${sashimis.length} sashimis`));

    const dumplings = this.playedCards.filter((card) => card.type === 'dumpling');
    const dumplingsMap = {
      0: 0,
      1: 1,
      2: 3,
      3: 6,
      4: 10,
      5: 15,
    };
    const dumplingsPoints = dumplings.length > 5 ? 15 : dumplingsMap[dumplings.length];
    this.points += dumplingsPoints;
    console.log(chalk.blue(`player ${this.username} scored ${dumplingsPoints} for ${dumplings.length} dumplings`));

    const makiRolls = this.playedCards.filter((card) => card.type === 'maki-roll');
    makiRolls.forEach((makiRoll) => {
      this.makiRollsPoints += makiRoll.subtype;
    });
    console.log(chalk.red(`player ${this.username} added ${this.makiRollsPoints} for maki-rolls competition`));

    const wasabis = this.playedCards.filter((card) => card.type === 'wasabi');
    const nigiris = this.playedCards.filter((card) => card.type === 'nigiri');
    let nigirisPoints = 0;
    nigiris.forEach((nigiri) => {
      const multiplier = wasabis.length > 0 ? wasabis.pop() : false;
      nigirisPoints += nigiri.subtype * (multiplier ? 2 : 1);
    });
    this.points += nigirisPoints;
    console.log(chalk.yellow(`player ${this.username} scored ${nigirisPoints} for ${wasabis.length} wasabis and ${nigiris.length} nigiris`));

    const puddings = this.playedCards.filter((card) => card.type === 'pudding');
    this.puddingsPoints += puddings.length;
    console.log(chalk.magenta(`player ${this.username} has ${this.puddingsPoints} puddings`));

    this.playedCards = [];
  }
}

module.exports = { Player };
