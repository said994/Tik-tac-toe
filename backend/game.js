module.exports = {
  initGame,
  checkWinner,
};

const WINNING_POSIBILITY = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function initGame() {
  const state = createGameState();
  return state;
}

function createGameState() {
  return {
    players: [
      {
        id: "1",
        class: "X", // this is for demonstration only
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

function checkWinner(player) {
  let winner = false;
  WINNING_POSIBILITY.forEach((pos) => {
    let count = 0;
    for (let i = 0; i < player.length; i++) {
      if (pos.includes(player[i])) count++;
    }
    if (count === 3) winner = true;
  });
  return winner;
}
