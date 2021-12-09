const MESSAGE_TIME = 1200;

const createRoomScreen = document.querySelector(".container__create-room");
const gameCodeInput = document.querySelector(".input_room");

const newGameBtn = document.querySelector(".btn-creat-room");
const joinGameBtn = document.querySelector(".btn-join-room");

const stateAnnouncement = document.querySelector(".state_announcement");
const stateText = document.querySelector(".state-text");

const gameScreen = document.querySelector(".game");
const cells = Array.from(document.querySelectorAll(".cell"));

const sectionAnnouncement = document.querySelector(".section-announcement");
const announcement = document.getElementById("announcement-text");

const btnRest = document.querySelector(".btn-reset");

const socket = io("https://pure-citadel-48014.herokuapp.com/");

socket.on("init", handleInit);
socket.on("gameStart", handleGameStart);
socket.on("render", handleRender);
socket.on("gameState", handleGameState);
socket.on("gameDraw", handleGameDraw);
socket.on("unknownRoom", handleUnkownRoom);
socket.on("fullRoom", handleFullRoom);
socket.on("waitForYourTurnMessage", handleTurnMessage);
socket.on("waitForPlayer", handleWaitForPlayer);

newGameBtn.addEventListener("click", newGame);
joinGameBtn.addEventListener("click", joinGame);

let roomHeck;

function newGame() {
  if (!handelEmptyInput()) return;

  if (roomHeck) {
    socket.emit("newGame", roomHeck);
    return;
  }
  roomHeck = gameCodeInput.value;
  socket.emit("newGame", gameCodeInput.value);
}

function joinGame() {
  if (!handelEmptyInput()) return;

  if (roomHeck) {
    socket.emit("joinGame", roomHeck, true);
    return;
  }
  roomHeck = gameCodeInput.value;
  socket.emit("joinGame", gameCodeInput.value);
}

let playerNumber;
let gameActive = false;

function handleInit(number) {
  playerNumber = number;
}

function handleGameStart() {
  createRoomScreen.classList.add("hide");
  gameScreen.classList.remove("hide");

  cells.forEach((cell) => {
    cell.addEventListener("click", clickOnGrid);
  });

  gameActive = true;
}

function handleRender(playerOne, playerTwo) {
  playerTwo.forEach((index) => {
    cells[index].classList.add("circle");
  });
  playerOne.forEach((index) => {
    cells[index].classList.add("x");
  });
}

function clickOnGrid(e) {
  socket.emit("clickGrid", cells.indexOf(e.target), playerNumber);
}

function handelEmptyInput() {
  if (!gameCodeInput.value) {
    stateAnnouncement.classList.remove("hide");
    createRoomScreen.classList.add("hide");
    stateText.innerHTML = "Create a Room or join one to play.";
    setTimeout(() => {
      stateAnnouncement.classList.add("hide");
      createRoomScreen.classList.remove("hide");
    }, MESSAGE_TIME);
    return false;
  }
  return true;
}

function handleUnkownRoom() {
  stateAnnouncement.classList.remove("hide");
  createRoomScreen.classList.add("hide");
  stateText.innerHTML = "This room does not exist!";
  setTimeout(() => {
    stateAnnouncement.classList.add("hide");
    createRoomScreen.classList.remove("hide");
  }, MESSAGE_TIME);
}

function handleWaitForPlayer() {
  stateAnnouncement.classList.remove("hide");
  gameScreen.classList.add("hide");
  sectionAnnouncement.classList.add("hide");
  stateText.innerHTML = "Wait for other player to join!";
  setTimeout(() => {
    stateAnnouncement.classList.add("hide");
    gameScreen.classList.remove("hide");
    sectionAnnouncement.classList.remove("hide");
  }, MESSAGE_TIME);
}

function handleFullRoom() {
  stateAnnouncement.classList.remove("hide");
  createRoomScreen.classList.add("hide");
  gameScreen.classList.add("hide");
  sectionAnnouncement.classList.add("hide");
  stateText.innerHTML = "The room is full of player!";
  setTimeout(() => {
    stateAnnouncement.classList.add("hide");
    createRoomScreen.classList.remove("hide");
    gameScreen.classList.remove("hide");
    sectionAnnouncement.classList.remove("hide");
  }, MESSAGE_TIME);
}

function handleGameState(winner) {
  if (!winner) {
    return;
  }
  console.log(winner, playerNumber);
  sectionAnnouncement.classList.remove("hide");
  gameScreen.classList.add("hide");
  if (winner === playerNumber) announcement.innerHTML = `You win!`;
  else announcement.innerHTML = `You lose!`;
}

function handleGameDraw(draw) {
  if (!gameActive) {
    return;
  }
  sectionAnnouncement.classList.remove("hide");
  gameScreen.classList.add("hide");
  announcement.innerHTML = draw;
}

function handleTurnMessage(number) {
  if (playerNumber === number) {
    stateAnnouncement.classList.remove("hide");
    gameScreen.classList.add("hide");
    stateText.innerHTML = "Wait for your turn!";
    setTimeout(() => {
      stateAnnouncement.classList.add("hide");
      gameScreen.classList.remove("hide");
    }, MESSAGE_TIME);
  }
}

btnRest.addEventListener("click", restGame);

function restGame(e) {
  e.preventDefault();
  sectionAnnouncement.classList.add("hide");
  clearField();
  if (playerNumber === 1) newGame();
  else if (playerNumber === 2) joinGame();
}

function clearField() {
  cells.forEach((cell) => {
    cell.classList.remove("circle");
    cell.classList.remove("x");
  });
}
