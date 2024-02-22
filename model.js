const socket = new WebSocket('ws://localhost:6789');

socket.onopen = function(e) {
  console.log("[open] Connection established");
  socket.send("Hello, Server!"); // Send data to server
};

socket.onmessage = function(event) {
  console.log(`[message] Data received from server: ${event.data}`);
  // Here, you can handle messages from the server, such as game state updates

};

socket.onmessage = function(event) {
    console.log("event.data", event.data);
    const action = JSON.parse(event.data);
    console.log(`[message] Action received from server: ${action}`);
    // Here, apply the received action to your game, e.g., move a player
    applyActionToGame(action);
};

function sendGameState(gameState) {
    socket.send(JSON.stringify(gameState));
}

socket.onclose = function(event) {
  if (event.wasClean) {
    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    // e.g. server process killed or network down
    console.log('[close] Connection died');
  }
};

socket.onerror = function(error) {
  console.log(`[error] ${error.message}`);
};