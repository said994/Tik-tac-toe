module.exports = {
  initGame,
  gameLoop,
  getUpdatePositions,
};

function initGame() {
  const state = createGameState();
  return state;
}

function createGameState() {
  return {
    players: [
      {
        id: "1",
        class: "X",
        turn: true,
        positions: [],
      },
      {
        id: "2",
        class: "CIRCLE",
        turn: false,
        positions: [],
      },
    ],
  };
}

function gameLoop(state) {
  if (!state) {
    return;
  }

  const playerOne = state.players[0];
  const playerTwo = state.players[1];

  //add winner and retrun the number of the winner
  return 1;
}

const positionArray = [];

function getUpdatePositions(position) {
  positionArray.push(position);
  return positionArray;
}
