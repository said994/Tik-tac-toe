const http = require("http");
const express = require("express");
const helmet = require("helmet");
const socketio = require("socket.io");
const { initGame, checkWinner } = require("./game");
const cors = require("cors");

const app = express();
app.use(helmet());
app.use(cors());
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

let state = {};
const playerRooms = {}; //this to map the socket id of player theroom

io.on("connection", (socket) => {
  socket.on("clickGrid", handleClick);
  socket.on("newGame", handleNewGame);
  socket.on("joinGame", handleJoinGame);

  function handleJoinGame(roomName, restart) {
    if (!restart) {
      //this for escaping roomSize checking for the restart game
      const room = io.sockets.adapter.rooms.get(roomName);
      let roomSize = 0;
      if (room) roomSize = room.size;
      if (roomSize === 0) {
        socket.emit("unknownRoom");
        return;
      } else if (roomSize > 1) {
        socket.emit("fullRoom");
        return;
      }
      playerRooms[socket.id] = roomName;
      state[roomName].players[1].id = socket.id;
    }

    socket.join(roomName);
    socket.emit("init", 2);
    socket.emit("gameStart");
  }

  function handleNewGame(roomName) {
    state[roomName] = initGame();
    playerRooms[socket.id] = roomName;
    state[roomName].players[0].id = socket.id;
    socket.join(roomName);
    socket.emit("init", 1);
    socket.emit("gameStart");
  }

  function handleClick(index, playerNumber) {
    const roomName = playerRooms[socket.id];
    const room = io.sockets.adapter.rooms.get(roomName);
    let roomSize;

    if (room) roomSize = room.size;
    if (!roomName) return;

    if (!state[roomName]) return;

    if (roomSize === 1) {
      io.sockets.in(roomName).emit("waitForPlayer");
      return;
    }

    const playerOne = state[roomName].players[0];
    const playerTwo = state[roomName].players[1];
    const currentPlayer = state[roomName].players[playerNumber - 1];
    const otherPlayer = state[roomName].players[playerNumber > 1 ? 0 : 1];

    if (currentPlayer.turn) {
      currentPlayer.positions.push(index);
      io.sockets
        .in(roomName)
        .emit("render", playerOne.positions, playerTwo.positions);
      checkWinDraw(roomName);
      currentPlayer.turn = false;
      otherPlayer.turn = true;
    } else io.sockets.in(roomName).emit("waitForYourTurnMessage", playerNumber);
  }

  function checkWinDraw(roomName) {
    const playerOne = state[roomName].players[0].positions;
    const playerTwo = state[roomName].players[1].positions;

    if (playerTwo.length + playerOne.length === 9) {
      emitGameDraw(roomName, "Draw!");
      restGame(roomName);
      return;
    }

    if (checkWinner(playerOne)) {
      emitGameWinner(roomName, 1);
      restGame(roomName);
      return;
    }
    if (checkWinner(playerTwo)) {
      emitGameWinner(roomName, 2);
      restGame(roomName);
      return;
    }
  }

  socket.on("disconnect", () => {
    const roomName = playerRooms[socket.id];
    if (!state[roomName]) {
      playerRooms[socket.id] = null;
      return;
    }

    if (state[roomName]) {
      const leftPlayerIndex = state[roomName].players.findIndex((player) => {
        return player.id === socket.id;
      });
      const winnerNumber = leftPlayerIndex === 0 ? 2 : 1;
      emitGameWinner(roomName, winnerNumber);

      if (leftPlayerIndex < 0) {
        restGame(roomName);
        return;
      }
      state[roomName].players[leftPlayerIndex].positions = [];
      restGame(roomName);
    }
  });
});

function emitGameWinner(room, winner) {
  io.sockets.in(room).emit("gameState", winner);
}
function emitGameDraw(room, draw) {
  io.sockets.in(room).emit("gameDraw", draw);
}
function restGame(roomName) {
  state[roomName] = null;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
