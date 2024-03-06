import { Player } from './game/player.js';
import { Game } from './game/game.js';
import { renderGame } from './game/game.js';
import { AppConfig, GameConfig } from './game/config.js';

document.addEventListener("DOMContentLoaded", () => {
    // Initially disable join/create buttons
    // Wait untill connected 
    document.getElementById('create_lobby_button').disabled = true;    
    document.getElementById('join_lobby_button').disabled = true;

    // Function to update the status message with an animation
    const updateLoadingMessage = () => {
        const statusMessage = document.getElementById('statusMessage');
        let loadingText = statusMessage.innerText;
        const dots = loadingText.substring(23); // Get the dots part of the message
        if(dots.length < 3) {
            statusMessage.innerText = 'Loading peer connection' + '.'.repeat(dots.length + 1);
        } else {
            statusMessage.innerText = 'Loading peer connection';
        }
    };

    // Start animating the loading message
    let loadingMessageInterval;
    loadingMessageInterval = setInterval(updateLoadingMessage, 500);

    const peer = new Peer();
    let name = '';
    let peerId = null;
    
    peer.on('error', function(err) {
        if (err.type === 'peer-unavailable') {
            alert('The lobby code you entered is invalid or the host has left the game');
            go_to_lobby();
        }
        else {
            console.error(err);
        }
    });

    peer.on('open', function(id) {
        peerId = id;

        // Stop the loading message animation
        clearInterval(loadingMessageInterval);

        // Update the status message to indicate the connection is established
        const statusMessage = document.getElementById('statusMessage');
        statusMessage.innerText = 'Peer connection established';

        // Enable buttons
        document.getElementById('create_lobby_button').disabled = false;    
        document.getElementById('join_lobby_button').disabled = false;
    });    

    // Query DOM
    // initial page
    const initial_page = document.getElementById('initial_page');
    const name_input = document.getElementById('nickname');
    const go_button = document.getElementById('go_button');

    go_button.onclick = function() {
        // limmit name to 20 characters and remove any '>' or '<' characters
        // Get the value from the input
        let inputName = name_input.value;
        
        // Limit name to 20 characters
        inputName = inputName.substring(0, 19);
        
        // Remove '>' and '<' characters
        inputName = inputName.replace(/[<>]/g, '');

        // Dont allow blank names
        if (inputName === '') {
            inputName = 'Anonymous';
        }

        name = inputName;
        if (name === null || name === undefined) {
            name = 'Anonymous';
            console.log("name is null or undefined");
        }
        go_to_lobby();
    }

    function go_to_lobby() {
        initial_page.style.display = "none";
        lobby.style.display = "flex";
        game.style.display = "none";
    }

    // Then, in your page load listener
    window.addEventListener('load', function() {
        if (localStorage.getItem('reloadForFunction') === 'true') {
            // Call your function here
            name = localStorage.getItem('userName');
            go_to_lobby();
            // Remember to clear the flag so it doesn't run again on subsequent loads
            localStorage.removeItem('reloadForFunction');
            localStorage.removeItem('userName');
        }
    });

    // lobby page ====================================================================================
    const lobby = document.getElementById('lobby');
    
    const create_lobby_button = document.getElementById('create_lobby_button');
    const join_lobby_button = document.getElementById('join_lobby_button');
    
    const lobby_modal = document.getElementById('lobby_modal');
    const lobby_modal_title = document.getElementById('lobby_modal_title');

    const lobby_modal_input = document.getElementById('lobby_modal_input');
    const lobby_modal_button = document.getElementById('lobby_modal_button');

    const lobby_modal_coppy_button = document.getElementById('lobby_modal_coppy_button');
    const lobby_modal_code = document.getElementById('lobby_modal_code');

    function copyLobbyCode() {
        // Copy the text inside the text field
        navigator.clipboard.writeText(lobby_modal_code.value)
            .then(() => {
                // Optionally, show a message to indicate that the code was copied
                //alert('Copied the lobby code: ' + lobby_modal_code.value);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
    }

    // Set up the click event listener for the copy button
    lobby_modal_coppy_button.onclick = copyLobbyCode;

    create_lobby_button.onclick = function() {
        // Set the lobby code to the input's value
        lobby_modal_code.style.display = "block";
        lobby_modal_coppy_button.style.display = "block";
        lobby_modal_code.value = peerId; // Assuming peerId is your lobby code

        // Show the modal
        lobby_modal.style.display = "block";
        lobby_modal_title.innerText = "Lobby Code";

        // Automatically select the lobby code text for easy copying (optional)
        lobby_modal_code.select();
        lobby_modal_code.setSelectionRange(0, 99999); // For mobile devices

        lobby_modal_input.style.display = "none"; // Hide input

        lobby_modal.style.display = "block";
        lobby_modal_title.innerText = "Lobby Code";


        lobby_modal_button.onclick = function() {
            startGame();
        }
    }


    join_lobby_button.onclick = function() {
        // lobby_modal_text.style.display = "none"; // Hide text
        lobby_modal_code.style.display = "none"; // Hide text
        lobby_modal_coppy_button.style.display = "none"; // Hide button

        lobby_modal.style.display = "block";
        lobby_modal_title.innerText = "Enter Lobby Code";
        lobby_modal_input.style.display = "block"; // Show input
        lobby_modal_input.placeholder = 'Enter Lobby Code...';

        lobby_modal_button.onclick = joinGame;
        
        
    }
    // end lobby page ====================================================================================

    // Game Page =========================================================================================
    const canvas = document.getElementById('game_canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = AppConfig.canvasWidth;
    canvas.height = AppConfig.canvasHeight;
    let isHost = false;
    let hostGameInstance = null;
    let conn; // client connection to host, used for sending wasd commands
    let sendUserInputs = false;
    
    let red_team = [];
    let spectators = [];
    let blue_team = [];
    let playerColor = '';
    const game_modal_lobby_code = document.getElementById('game_modal_lobby_code');

    let justPressed = false;
    function userInput(obj) {
        document.addEventListener('keydown', function(e) {
            if (e.key === "ArrowLeft" || e.key === "a") {
                if (!obj.left) {
                    justPressed = true;
                }
                obj.left = true;
            }
            if (e.key === "ArrowUp" || e.key === "w") {
                if (!obj.up) {
                    justPressed = true;
                }
                obj.up = true;
            }
            if (e.key === "ArrowRight" || e.key === "d") {
                if (!obj.right) {
                    justPressed = true;
                }
                obj.right = true;
            }
            if (e.key === "ArrowDown" || e.key === "s") {
                if (!obj.down) {
                    justPressed = true;
                }
                obj.down = true;
            }
            if (e.key === " ") {
                if (!obj.action) {
                    justPressed = true;
                }
                obj.action = true;
            }
            if (justPressed) {
                emitUserCommands(obj, conn);
                justPressed = false;
            }
        });
    
        document.addEventListener('keyup', function(e) {
            if (e.key === "ArrowLeft" || e.key === "a") {
                obj.left = false;
            }
            if (e.key === "ArrowUp" || e.key === "w") {
                obj.up = false;
            }
            if (e.key === "ArrowRight" || e.key === "d") {
                obj.right = false;
            }
            if (e.key === "ArrowDown" || e.key === "s") {
                obj.down = false;
            }
            if (e.key === " ") {
                obj.action = false;
            }
            // Emit user commands on key up to ensure the server is updated with the new state
            emitUserCommands(obj, conn);
        });
    }
    function emitUserCommands(obj, conn){
        if (conn === undefined) {
            return;
        }
        if (conn === null) {
            return;
        }
        if (conn._open === false) {
            return;
        }
        if (isHost) {
            return; // Double check
        }
        if (!sendUserInputs) {
            return
        }
        let userCommands = {
            left: obj.left,
            up: obj.up,
            right: obj.right,
            down: obj.down,
            action: obj.action
        }
        conn.send({ type: 'userInput', id: peerId, commands: userCommands });
    }


    /**
     * Starts a game instance and setups up this user as the game host
     */
    function startGame() {
        ctx.clearRect(0, 0, AppConfig.canvasWidth, AppConfig.canvasHeight);
        red_team = [];
        spectators = [];
        blue_team = [];
        playerColor = '';
        updatePlayerList('red', red_team);
        updatePlayerList('spectators', spectators);
        updatePlayerList('blue', blue_team);
        isHost = true;
        sendUserInputs = false;

        
        let gameInstance = new Game(AppConfig.canvasWidth, AppConfig.canvasHeight, peerId, GameConfig, AppConfig, ctx);
        hostGameInstance = gameInstance;

        let myPlayer = new Player(AppConfig.canvasWidth, AppConfig.canvasHeight, 100, 100, peerId, GameConfig, 0.05);
        myPlayer.name = name;
        userInput(myPlayer);

        // HOST LOCAL HTML/CSS SETUP ======================================
        // Add game settings to the modal
        const game_settings = document.getElementById('game_settings_container');
        const game_settings_button = document.getElementById('game_modal_host_settings_button');
        game_settings_button.style.display = 'inline-block';
        game_settings_button.onclick = function() {
            if (game_settings.style.display === 'block') {
                game_settings.style.display = 'none';
            } else {
                game_settings.style.display = 'block';
            }
        }


        // Function to update a specific GameConfig setting with correction for division by 1000 where needed
        function updateConfigSetting(settingName, value, isCheckbox = false) {
            GameConfig[settingName] = isCheckbox ? value.checked : parseInt(value, 10);
            gameInstance.gameConfig = GameConfig;
        }

        // Since inputs like textboxes, number inputs, and checkboxes are changed, not clicked, we use 'onchange' for them
        document.getElementById('enemySpawnRate').value = (1/GameConfig.enemySpawnRate) * 1000;
        document.getElementById('enemySpawnRate').onchange = function() {
            updateConfigSetting('enemySpawnRate', (1/this.value) * 1000);
        };
        document.getElementById('enemySpeed').value = GameConfig.enemySpeed;
        document.getElementById('enemySpeed').onchange = function() {
            updateConfigSetting('enemySpeed', this.value);
        };
        document.getElementById('coinSpawnRate').value = (1/GameConfig.coinSpawnRate) * 1000;
        document.getElementById('coinSpawnRate').onchange = function() {
            updateConfigSetting('coinSpawnRate', (1/this.value) * 1000);
        };
        document.getElementById('coinLifespan').value = GameConfig.coinLifespan / 1000;
        document.getElementById('coinLifespan').onchange = function() {
            updateConfigSetting('coinLifespan', this.value * 1000);
        };
        document.getElementById('playerLives').value = GameConfig.playerLives;
        document.getElementById('playerLives').onchange = function() {
            updateConfigSetting('playerLives', this.value);
        };
        document.getElementById('playerSpeed').value = GameConfig.playerSpeed;
        document.getElementById('playerSpeed').onchange = function() {
            updateConfigSetting('playerSpeed', this.value);
        };
        document.getElementById('spawnProtectionDuration').value = GameConfig.spawnProtectionDurration / 1000;
        document.getElementById('spawnProtectionDuration').onchange = function() {
            updateConfigSetting('spawnProtectionDurration', this.value * 1000); // Correcting for misspelling in your original object
        };
        document.getElementById('allowGhosts').checked = GameConfig.allowGhosts;
        document.getElementById('allowGhosts').onchange = function() {
            updateConfigSetting('allowGhosts', this, true);
        };

        // Color Selection Setup
        let player_color = document.getElementById('player_color');
        let selectedColor;
        function initColors() {
            // 1 - Get all the color options from game config, and add them to the select
            Object.values(GameConfig.playerColors).forEach(color => {
                const color_option = document.createElement('option');
                color_option.value = color;
                color_option.innerText = color;
                player_color.appendChild(color_option);
            });
            // 2 - Init the selected color to the first option
            selectedColor = player_color.value;
            // 3 - Add an event listener to update the selected color when the user changes it
            player_color.onchange = function() {
                selectedColor = player_color.value;
            }
        }
        initColors();
    
        // Leave Button Setup
        document.getElementById('game_modal_leave_button').onclick = function() {
            // 1 - Set a flag that the host left
            localStorage.setItem('reloadForFunction', 'true');
            // 2 - Store the hosts username (we later check for the flag, and retrieve the name)
            localStorage.setItem('userName', myPlayer.name);
            // 3 - Reload the page (creates a new peerID, so the old lobby is destroyed)
            location.reload(true);
        }

        // Restart Button Setup
        document.getElementById('game_modal_restart_button').style.display = 'inline-block';
        document.getElementById('game_modal_restart_button').onclick = function() {
            if (gameInstance.paused) { // dont send 'start' if gameWorker is already running
                gameWorker.postMessage({ command: 'start', fps: 60 });
            }
            gameInstance.restart();
            broadcast({ type: 'gameRestarting' });
        }

        // Pause Button Setup
        const startButton = document.getElementById('game_modal_start_button');
        startButton.onclick = function() {  
            if (Object.keys(gameInstance.players).length === 0) {
                alert('You need at least one player to start the game');
                return;
            }
            gameInstance.paused = !gameInstance.paused;
            startButton.innerText = gameInstance.paused ? 'Start' : 'Pause';
            if (gameInstance.paused) {
                gameInstance.stop(); // Stop the game local rendering
                gameWorker.postMessage({ command: 'stop' }); // Stop the game loop
            }
            else {
                gameInstance.start(); // Renders the game locally
                gameWorker.postMessage({ command: 'start', fps: 60 }); // Start the game loop
                //hide modal
                showGame();
            }
        }

        // Join Team Buttons Setup
        document.querySelectorAll('.game_modal_join_button').forEach(button => {
            button.onclick = function() {
                const team = this.classList.contains('red') ? 'Red Team' :
                            this.classList.contains('blue') ? 'Blue Team' : 'Spectators';
                joinTeam(team);
            }
        });
        // Function to handle joining a team
        function joinTeam(team) {
            if (!myPlayer){
                console.log("server error: myPlayer not defined inside joinTeam function");
            }
            if (myPlayer.hasJoinedTeam) {
                return;
            }
            // remove from existing team
            red_team = red_team.filter(player => player.peerId !== peerId);
            blue_team = blue_team.filter(player => player.peerId !== peerId);
            spectators = spectators.filter(player => player.peerId !== peerId);
            
            // get what is in player_color selector
            myPlayer.color = selectedColor;
            // remove this color optoin
            player_color.remove(player_color.selectedIndex);
            // Broadcast the change
            broadcast({ type: 'color used', color: selectedColor, index: player_color.selectedIndex });
            // Remove the color selector, and show the color label
            player_color.style.display = 'none';
            document.getElementById('color_selector_label').style.display = 'none';
            document.getElementById('selected_color_label').innerText = `Color: ${selectedColor}`;

            if (team === 'Red Team') {
                red_team.push({ name, peerId });
                gameInstance.players[peerId] = myPlayer;
            } else if (team === 'Blue Team') {
                blue_team.push({ name, peerId });
                gameInstance.players[peerId] = myPlayer;
            } else {
                spectators.push({ name, peerId });
                delete gameInstance.players[peerId];
            }
            updatePlayerList('Red', red_team);
            updatePlayerList('Blue', blue_team);
            updatePlayerList('spectators', spectators);
            // Send the updated team lists to the clients
            broadcast({ type: 'team_update', red_team, blue_team, spectators });
            myPlayer.hasJoinedTeam = true;
        }

        showGame();
        showGameModal();
        game_modal_lobby_code.innerText = `Lobby Code: ${peerId}`;

        // PEER SECTION ==================================================
        let connectedClients = {};
        function broadcast(message) {
            Object.values(connectedClients).forEach(client => {
                client.send(message);
            }); 
        }

        let gameWorker;
        if (window.Worker) {
            gameWorker = new Worker('game/webworker.js');
            gameWorker.onmessage = function(e) {
                if (e.data.status === 'tick') {
                    // Handle the tick - Update game logic, etc.
                    gameInstance.gameTick();

                    if (gameInstance.gameOver) {

                        // 1 - Stop sending ticks
                        gameWorker.postMessage({ command: 'stop' });
                        // 2 - Set every player to not ready
                        for (const player of Object.values(gameInstance.players)) {
                            player.ready = false;
                        }
                        // Not needed, but usefull if players can switch teams live
                        if (Object.keys(gameInstance.players).length === 0) {
                            showGameModal();
                            Object.values(gameInstance.connections).forEach(con => {
                                con.send({ type: 'showGameModal'});
                            });
                        }
                        
                        else {
                            // 3 - Show the game over modal
                            showGameEndModal(myPlayer, gameInstance.players);
                            // 4 - Setup the hosts' ready button
                            const readyButton = document.getElementById('ready_up_button');
                            readyButton.onclick = function() {
                                // A - Update the local UI
                                document.getElementById(myPlayer.id).innerText = `${myPlayer.name}: ${myPlayer.score}`;
                                myPlayer.ready = !myPlayer.ready;
                                if (myPlayer.ready) {
                                    document.getElementById(myPlayer.id).innerText += ' - Ready';
                                }
                                // B - tell all connected clients about the ready state of the host
                                Object.values(gameInstance.connections).forEach(con => {
                                    con.send({ type: 'playerReady', player: myPlayer });
                                });
                                // C - check if all players are ready
                                let everyPlayerReady = Object.values(gameInstance.players).every(player => player.ready);
                                if (everyPlayerReady) {
                                    gameInstance.restart();
                                    gameWorker.postMessage({ command: 'start', fps: 60 });
                                    showGame();
                                }
                            }
                        }
                        
                    }
                }
            };

            


        } else {
            console.log('Your browser does not support Web Workers.');
            alert('Your browser does not support Web Workers. You cannot host a game, but you can join one');
            go_to_lobby();
        }

        // When someone connects to this host
        peer.on('connection', function(conn) {
            gameInstance.connections[conn.peer] = conn;
            connectedClients[conn.peer] = conn;

            // Listen for data from the clients
            conn.on('data', function(data) {
                if (data.type === 'initial_data_request') {
                    // 1 - Collect all the available colors
                    const allColors = [];
                    for (let i = 0; i < player_color.options.length; i++) {
                        allColors.push(player_color.options[i].value);
                    }
                    // 2 - Send the initial data to the client
                    conn.send({ type: 'initial_data', red_team: red_team, blue_team: blue_team, spectators: spectators, isPaused: gameInstance.paused, availableColors: allColors});
                }
                if (data.type === 'pause clicked') {
                    if (Object.keys(gameInstance.players).length === 0) {
                        conn.send({ type: 'start game with 0 players'});
                        return;
                    }
                    const startButton = document.getElementById('game_modal_start_button');
                    gameInstance.paused = !gameInstance.paused;
                    startButton.innerText = gameInstance.paused ? 'Start' : 'Pause';
                    if (gameInstance.paused) {
                        gameInstance.stop();
                        gameWorker.postMessage({ command: 'stop' });
                        showGameModal();
                    }
                    else {
                        gameInstance.start();
                        gameWorker.postMessage({ command: 'start', fps: 60 });
                        showGame();
                    }
                    broadcast({ type: 'gameState', players: gameInstance.players, enemies: gameInstance.enemies, coins: gameInstance.coins, missile: gameInstance.missile, paused: gameInstance.paused });
                }
                if (data.type === 'team_update') {
                    red_team = data.red_team;
                    blue_team = data.blue_team;
                    spectators = data.spectators;
                    updatePlayerList('Red', red_team);
                    updatePlayerList('Blue', blue_team);
                    updatePlayerList('Spectators', spectators);
                    broadcast({ type: 'team_update', red_team, blue_team, spectators });
                }
                if (data.type === 'set_gameInstance_player') {
                    gameInstance.players[data.player.id] = data.player;
                }
                if (data.type === 'remove_gameInstance_player') {
                    delete gameInstance.players[data.player.id];
                }
                if (data.type === 'client used color') {
                    // remove this color from the list
                    player_color.remove(data.index);
                    // tell everybody else to remove this color from their list
                    broadcast({ type: 'color used', color: data.color, index: data.selectedIndex });
                    // update the selected color for the host
                    selectedColor = player_color.value;
                }
                if (data.type === 'userInput') {
                    // Listen for user inputs from the clients (wasd)
                    // Store the inputs in the game instance, so the game can calculate where to move them
                    gameInstance.players[data.id].left = data.commands.left;
                    gameInstance.players[data.id].up = data.commands.up;
                    gameInstance.players[data.id].right = data.commands.right;
                    gameInstance.players[data.id].down = data.commands.down;
                    gameInstance.players[data.id].action = data.commands.action;
                }
                if (data.type === 'playerReady') {
                    // Ready/Unready the player that sent this
                    gameInstance.players[data.player.id].ready = !gameInstance.players[data.player.id].ready;
                    // Tell all the clients about the ready state of this player (so they can update the UI)
                    broadcast({ type: 'playerReady', player: gameInstance.players[data.player.id] })
                    // Update the host UI
                    document.getElementById(data.player.id).innerText = `${data.player.name}: ${data.player.score}`;
                    if (gameInstance.players[data.player.id].ready) {
                        document.getElementById(data.player.id).innerText += ' - Ready';
                    }
                    // Check if all players are ready, if so restart the game
                    let allPlayersReady = Object.values(gameInstance.players).every(player => player.ready);
                    if (allPlayersReady) {
                        broadcast({ type: 'gameRestarting' });
                        gameInstance.restart();
                        gameWorker.postMessage({ command: 'start', fps: 60 });
                        showGame();
                    }                
                }
            });

            // When a client disconects
            conn.on('close', () => {
                // 1 - get the color of the disconected player, so it can be used again
                let disconected_player_color;
                if (gameInstance.players[conn.peer]) {
                    disconected_player_color = gameInstance.players[conn.peer].color;
                }

                // 2 - remove the connection from the list
                delete connectedClients[conn.peer];
                delete gameInstance.connections[conn.peer];
                // 3 - remove the player from the game instance
                if (gameInstance.players[conn.peer]) {
                    delete gameInstance.players[conn.peer];
                }
                if (gameInstance.spectators[conn.peer]) {
                    delete gameInstance.spectators[conn.peer];
                }
                // 4 - Tell all the clients that this player left
                broadcast({ type: 'player left', player: { id: conn.peer } });
                // 5 - remove player from the UI
                const playerUI = document.getElementById(conn.peer);
                if (playerUI) {
                    playerUI.remove();
                }
                // 6 - remove them from the team
                red_team = red_team.filter(player => player.peerId !== conn.peer);
                blue_team = blue_team.filter(player => player.peerId !== conn.peer);
                spectators = spectators.filter(player => player.peerId !== conn.peer);
                updatePlayerList('Red', red_team);
                updatePlayerList('Blue', blue_team);
                updatePlayerList('Spectators', spectators);
                // 7 - Send the updated team lists to the clients
                broadcast({ type: 'team_update', red_team, blue_team, spectators });

                // 8 - add their color back as an option
                if (disconected_player_color === undefined) {
                    return;
                }
                const color_option = document.createElement('option');
                color_option.value = disconected_player_color;
                color_option.innerText = disconected_player_color;
                player_color.appendChild(color_option);
                // TODO: tell the clients to add this color back to their list
            });
        });
    }


    /**
     * Client function. Connects to a host game instance using the provided lobby code.
     * Some document elements changed to work from a client's perspective.
     * Event listeners and data handlers handled here.
     * 
     */
    function joinGame() {
        isHost = false;
        const lobby_code = lobby_modal_input.value;
        game_modal_lobby_code.innerText = `Lobby Code: ${lobby_code}`;

        let myPlayer = new Player(AppConfig.canvasWidth, AppConfig.canvasHeight, 100, 100, peerId, GameConfig, 0.05);
        myPlayer.name = name;

        // Hide the game settings for clients
        const game_settings = document.getElementById('game_settings_container');
        game_settings.style.display = 'none';
        
        const game_settings_button = document.getElementById('game_modal_host_settings_button');
        game_settings_button.style.display = 'none';

        conn = peer.connect(lobby_code);
        let isPaused;

        const player_color = document.getElementById('player_color');
        let selectedColor;

        document.getElementById('game_modal_leave_button').onclick = function() {
            // 1 - Set a flag that the host left
            localStorage.setItem('reloadForFunction', 'true');
            // 2 - Store the hosts username (we later check for the flag, and retrieve the name)
            localStorage.setItem('userName', myPlayer.name);
            // 3 - Reload the page (creates a new peerID, so the old lobby is destroyed)
            location.reload(true);
        }

        document.querySelectorAll('.game_modal_join_button').forEach(button => {
            button.onclick = function() {
                const team = this.classList.contains('red') ? 'Red Team' :
                            this.classList.contains('blue') ? 'Blue Team' : 'Spectators';
                joinTeamClient(team);
            }
        });
    
        // Function to handle joining a team
        function joinTeamClient(team) {
            if (!myPlayer){
                console.log("client error: myPlayer not defined inside joinTeam function");
            }
            if (myPlayer.hasJoinedTeam) {
                return;
            }
            // remove from existing team
            red_team = red_team.filter(player => player.peerId !== peerId);
            blue_team = blue_team.filter(player => player.peerId !== peerId);
            spectators = spectators.filter(player => player.peerId !== peerId);

            // get what is in player_color selector
            myPlayer.color = selectedColor;
            // remove this color optoin
            player_color.remove(player_color.selectedIndex);
            // Broadcast the change
            conn.send({ type: 'client used color', color: selectedColor, index: player_color.selectedIndex });
            // Remove the color selector, and show the color label
            player_color.style.display = 'none';
            document.getElementById('color_selector_label').style.display = 'none';
            document.getElementById('selected_color_label').innerText = `Color: ${selectedColor}`;

            if (team === 'Red Team') {
                red_team.push({ name, peerId });
                //myPlayer.color = 'green';
                conn.send({ type: 'set_gameInstance_player', player: myPlayer });
                sendUserInputs = true;
            } else if (team === 'Blue Team') {
                blue_team.push({ name, peerId });
                //myPlayer.color = 'blue';
                conn.send({ type: 'set_gameInstance_player', player: myPlayer });
                sendUserInputs = true;
            } else {
                spectators.push({ name, peerId });
                //myPlayer.color = 'grey';
                conn.send({ type: 'remove_gameInstance_player', player: myPlayer });
                sendUserInputs = false;
            }

            
            updatePlayerList('Red', red_team);
            updatePlayerList('Blue', blue_team);
            updatePlayerList('spectators', spectators);
            
            // tell the server to update team lists
            conn.send({ type: 'team_update', red_team, blue_team, spectators });
            myPlayer.hasJoinedTeam = true;
        }

        showGame();
        showGameModal();

        conn.on('open', () => {
            userInput(myPlayer, conn);
            conn.send({ type: 'initial_data_request' });
        });
        conn.on('error', (err) => {
            console.log('Connection error: ', err);
            alert('error ' + err); // Notify the user
            go_to_lobby();
        });
        conn.on('data', function(data) {
            if (data.type === 'initial_data') {
                red_team = data.red_team;
                blue_team = data.blue_team;
                spectators = data.spectators;
                updatePlayerList('Red', red_team);
                updatePlayerList('Blue', blue_team);
                updatePlayerList('Spectators', spectators);
                isPaused = data.isPaused;
                // setup the  start / pause button
                const startButton = document.getElementById('game_modal_start_button');
                startButton.innerText = isPaused ? 'Start' : 'Pause';
                startButton.onclick = function() {
                    conn.send({ type: 'pause clicked' });
                }
                Object.values(data.availableColors).forEach(color => {
                    const color_option = document.createElement('option');
                    color_option.value = color;
                    color_option.innerText = color;
                    player_color.appendChild(color_option);
                });

                selectedColor = player_color.value;
                // Add an event listener to handle changes
                player_color.onchange = function() {
                    selectedColor = player_color.value;
                    //myPlayer.color = selectedColor;
                }
            }
            if (data.type === 'start game with 0 players') {
                alert('You need at least one player to start the game');
            }
            if (data.type === 'team_update') {
                red_team = data.red_team;
                blue_team = data.blue_team;
                spectators = data.spectators;
                updatePlayerList('Red', red_team);
                updatePlayerList('Blue', blue_team);
                updatePlayerList('Spectators', spectators);
            }

            if (data.type === 'color used') {
                player_color.remove(data.index);
            }
            
            if (data.type === 'gameState') {
                renderGame(ctx, data.players, data.enemies, data.coins, data.missile, data.paused, AppConfig);
                if (data.paused) {
                    showGameModal();
                } 
            }
            if (data.type === 'gameStarted!') {
                showGame();
            }
            if (data.type === 'gameOver') {
                
                let isPlaying = false;
                if (data.players[peerId]){
                    myPlayer = data.players[peerId];
                    isPlaying = true;
                }
                // if (data.spectators[peerId]) {
                //     myPlayer = data.spectators[peerId];
                // }
                // Handle game over event
                if (isPlaying) {
                    const readyButton = document.getElementById('ready_up_button');
                    readyButton.onclick = function() {
                        conn.send({ type: 'playerReady', player: myPlayer });
                    }
                }
                showGameEndModal(myPlayer, data.players);
            }
            if (data.type === 'gameRestarting') {
                showGame();
            }
            if (data.type === 'playerReady') {
                // update the UI
                const playerUI = document.getElementById(data.player.id);
                if (playerUI === null) {
                    console.log('playerUI is null for' + data.player.id);
                    return;
                }
                playerUI.innerText = `${data.player.name}: ${data.player.score}`;
                if (data.player.ready) {
                    document.getElementById(data.player.id).innerText += ' - Ready';
                }
            }
            if (data.type === 'showGameModal') {
                showGameModal();
            }
            if (data.type === 'player left') {
                // remove player from the UI
                const playerUI = document.getElementById(data.player.id);
                if (playerUI) {
                    playerUI.remove();
                }
            }

        });

        conn.on('close', () => {
            alert('Connection to host lost');

            localStorage.setItem('reloadForFunction', 'true');
            // 2 - Store the hosts username (we later check for the flag, and retrieve the name)
            localStorage.setItem('userName', myPlayer.name);
            // 3 - Reload the page (creates a new peerID, so the old lobby is destroyed)
            location.reload(true);
        });

    }

    

    const game = document.getElementById('game');

    function showGame() {
        // Show ONLY the game
        lobby_modal.style.display = "none";
        lobby.style.display = "none";
        game.style.display = "grid";
        const gameModal = document.getElementById('game_modal');
        gameModal.style.display = 'none';
        const gameEndModal = document.getElementById('game_end_modal');
        gameEndModal.style.display = 'none';
        //showGameModal();
    }

    function showGameModal() {
        const gameModal = document.getElementById('game_modal');
        gameModal.style.display = 'flex';
        const gameEndModal = document.getElementById('game_end_modal');
        gameEndModal.style.display = 'none';
        
    }

    function showGameEndModal(myPlayer, allPlayers) {
        // Determine myPlayer's outcome by comparing scores
        let winCount = 0;
        let loseCount = 0;
        let tieCount = 0;
        // Sort players by score in descending order
        const sortedPlayers = Object.values(allPlayers).sort((a, b) => b.score - a.score);
        Object.values(allPlayers).forEach(player => {
            if (myPlayer && player.id !== myPlayer.id) { // Ensure not to compare myPlayer to themselves
                if (myPlayer.score > player.score) {
                    winCount++;
                } else if (myPlayer.score < player.score) {
                    loseCount++;
                } else {
                    tieCount++;
                }
            }
        });
        let result = '';
        // Determine the status based on comparison
        if (loseCount === 0 && tieCount === 0) {
            result = "Victory!";
        } else if (winCount > 0 && loseCount === 0) {
            result = "Victory!"; // Win with ties
        } else if (winCount === 0 && tieCount > 0 && loseCount === 0) {
            result = "Tie!";
        } else {
            result = "Defeat!";
        }

        const gameModal = document.getElementById('game_modal');
        const gameEndModal = document.getElementById('game_end_modal');
        const statusElement = document.getElementById('game_end_status');
        const all_players_scores = document.getElementById('all_players_scores');

        gameModal.style.display = 'none';
        statusElement.innerText = result;

        // Clear previous list and populate with sorted scores
        all_players_scores.innerHTML = '';
        sortedPlayers.forEach(player => {
            const playerScoreElement = document.createElement('p');
            playerScoreElement.textContent = `${player.name}: ${player.score}`;
            playerScoreElement.id = player.id; // Add an id so we can later display Ready Status
            all_players_scores.appendChild(playerScoreElement);
        });

        gameEndModal.style.display = 'flex';
    }
    
    // Function to hide the game modal
    function hideGameModal() {
        const gameModal = document.getElementById('game_modal');
        gameModal.style.display = 'none';
    }

    // Function to update the player list in the modal
    function updatePlayerList(team, players) {
        const teamClass = `${team.toLowerCase()}_team`; // This will create 'red_team', 'spectators', or 'blue_team'
        const playerListDiv = document.querySelector(`.${teamClass}`);
        playerListDiv.innerHTML = ''; // Clear existing list
    
        players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.classList.add('player'); // Add class for styling if necessary
            playerDiv.textContent = player.name; // Assuming 'player' is an object with a 'name' property
            playerListDiv.appendChild(playerDiv);
        });
    }

    document.getElementById('settingsButton').addEventListener('click', function() {
        showGameModal();
    });

    const gameModal = document.getElementById('game_modal');
    window.onclick = function(event) {
        if (event.target == gameModal) {
            hideGameModal();
        }
        if (event.target == lobby_modal) {
            lobby_modal.style.display = "none";
        }
    }
});
  
  
