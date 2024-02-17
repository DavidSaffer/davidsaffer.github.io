const AppConfig = {
    canvasWidth: 16 * 100,
    canvasHeight: 9 * 100
    // Add more configuration settings as needed
};

const GameConfig = {
    enemySpawnRate: 1000, // Spawn an enemy every second
    enemySpeed: 2,
    coinSpawnRate: 200, // Spawn a coin every 0.5 seconds
    coinLifespan: 5000, // 5 seconds
    playerLives: 1,
    playerSpeed: 15


};

class Player {
    constructor(cWidth, cHeight, x, y, id, basePlayerScale = 0.05 ) {
        this.cWidth = cWidth;
        this.cHeight = cHeight;

        this.x = x;
        this.y = y;
        this.id = id;

        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.action = false;

        this.score = 0;
        this.lives = GameConfig.playerLives;
        this.name = '...';

        this.moveSpeed = GameConfig.playerSpeed;

        this.dx = 0;
        this.dy = 0;

        this.basePlayerScale = basePlayerScale;
        this.playerScale = basePlayerScale;
        const size = Math.min(cWidth, cHeight);
        this.width = size * basePlayerScale; // Example: 5% of canvas width
        this.height = size * basePlayerScale; // Same for height, adjust percentage as needed

        this.ready = false;

        // Missile shooting cooldown
        this.missileCooldown = 100; // 500 ms cooldown
        this.lastMissileShot = 0; // Timestamp of the last shot
    }

    loseLife() {
        this.lives -= 1;
    }

    reset() {
        this.lives = GameConfig.playerLives;
        this.score = 0;
        this.ready = false;
    }

    draw(ctx) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    shootMissiles(missilesArray) {
        const directions = ['up', 'down', 'left', 'right'];
        directions.forEach(direction => {
            missilesArray.push(new Missile(this.x, this.y, direction, this.id));
        });
        this.lastMissileShot = Date.now(); // Update the timestamp of the last shot
    }

    update(){
        if (this.lives <= 0) {
            this.dx = 0;
            this.dy = 0;
            return;
        }

        this.dx = 0;
        this.dy = 0;
        

        if (this.left) {
            this.dx += -this.moveSpeed;
        }
        if (this.right) {
            this.dx += this.moveSpeed;
        }
        if (this.up) {
            this.dy += -this.moveSpeed;
        }
        if (this.down) {
            this.dy += this.moveSpeed;
        }
        // Shooting missiles
        // if (this.action && Date.now() - this.lastMissileShot > this.missileCooldown) {
        //     this.shootMissiles(misslesArray);
        // }

        this.x += this.dx;
        this.y += this.dy;
        

        // Handle boundaries
        this.x = Math.max(0, Math.min(this.x, this.cWidth - this.width));
        this.y = Math.max(0, Math.min(this.y, this.cHeight - this.height));

    }
}

class Enemy {
    constructor(cWidth, cHeight, speed, enemieScale = .03) {
        this.enemieScale = enemieScale;
        this.cWidth = cWidth;
        this.cHeight = cHeight;
        const size = Math.min(cWidth, cHeight);
        this.width = size * this.enemieScale; 
        this.height = size * this.enemieScale;
        this.speed = speed;

        this.x, this.y, this.dx, this.dy;
        const startEdge = Math.floor(Math.random() * 4);
        const isVertical = startEdge % 2 === 0;

        if (isVertical) {
            this.x = Math.random() * this.cWidth;
            this.y = startEdge === 0 ? 0 : this.cHeight;
            this.dx = 0;
            this.dy = startEdge === 0 ? speed : -speed;
        } else {
            this.x = startEdge === 1 ? this.cWidth : 0;
            this.y = Math.random() * this.cHeight;
            this.dx = startEdge === 1 ? -speed : speed;
            this.dy = 0;
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {

        this.x += this.dx;
        this.y += this.dy;

        // Remove the enemy if it goes off screen
        if (this.x < -this.width || this.x > this.cWidth ||
            this.y < -this.height || this.y > this.cHeight) {
            return false;
        }
        return true;
    }
}

class Coin {
    constructor(cWidth, cHeight, coinScale = .015) {
        this.coinScale = coinScale;
        const size = Math.min(cWidth, cHeight);
        this.originalWidth = size * this.coinScale; 
        this.originalHeight = size * this.coinScale;
        //this.originalWidth = 20; // Original size of the coin
        //this.originalHeight = 20;
        this.width = this.originalWidth;
        this.height = this.originalHeight;

        this.x = Math.random() * (cWidth - this.width); // Random position
        this.y = Math.random() * (cHeight - this.height);

        this.spawnTime = Date.now(); // Store the spawn time
        this.lastShrinkTime = Date.now();
        this.shrinkInterval = 1000; // Interval between shrinks in milliseconds
        this.lifespan = 5000; // 5 seconds in milliseconds
    }

    draw(ctx) {
        ctx.fillStyle = 'yellow'; // Color of the coin
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    update(settings) {
        const now = Date.now();
        if (settings.coinDespawn) {
            if (settings.cointTick){
                if (now - this.lastShrinkTime > this.shrinkInterval) {
                    const elapsed = now - this.spawnTime;
                    const remainingLife = Math.max(this.lifespan - elapsed, 0);
                    const shrinkFactor = remainingLife / this.lifespan;
                    this.width = this.originalWidth * shrinkFactor;
                    this.height = this.originalHeight * shrinkFactor;
                    this.lastShrinkTime = now;
                }
            }
            else {
                const elapsed = now - this.spawnTime;
                const remainingLife = Math.max(this.lifespan - elapsed, 0);
                const shrinkFactor = remainingLife / this.lifespan;
                this.width = this.originalWidth * shrinkFactor;
                this.height = this.originalHeight * shrinkFactor;
            }
        }
    }
}

class Missile {
    constructor(x, y, direction, ownerId) {
        this.x = x;
        this.y = y;
        this.direction = direction; // 'up', 'down', 'left', 'right'
        this.speed = 40; // Adjust as needed
        this.ownerId = ownerId;
    }

    update() {
        // Update missile position based on its direction
        switch(this.direction) {
            case 'up':
                this.y -= this.speed;
                break;
            case 'down':
                this.y += this.speed;
                break;
            case 'left':
                this.x -= this.speed;
                break;
            case 'right':
                this.x += this.speed;
                break;
        }
    }
}

class Game {
    constructor(cWidth, cHeight, serverRoomName, gameConfig, context) {
        this.cWidth = cWidth;
        this.cHeight = cHeight;
        this.players = {};
        this.spectators = {};
        this.enemies = [];
        this.coins = [];
        this.missile = [];
        this.paused = true;
        this.gameOver = false;
        this.enemySpawnRate = gameConfig.enemySpawnRate; // Spawn an enemy every second
        this.coinSpawnRate = gameConfig.coinSpawnRate; // Spawn a coin every 0.5 seconds
        this.lastEnemySpawn = Date.now();
        this.lastCoinSpawn = Date.now();
        this.settings = { coinDespawn: true, coinTick: true };
        this.colors = ['blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white'];
        this.interval = null;
        this.roomName = serverRoomName;
        this.connections = [];
        this.conn = null;
        this.ctx = context;
    }

    // Method to start the game loop
    start() {
        for (const conn of this.connections) {
            conn.send({ type: 'gameStarted!' });
        }
        this.paused = false;
        new Promise((resolve, reject) => {
            // Check periodically if there are 2 players
            let checkInterval = setInterval(() => {
                if (Object.keys(this.players).length >= 1) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 1000); // Check every second
        })
        .then(() => {
            // Start the game interval when the promise resolves
            this.interval = setInterval(() => {
                //this.gameTick();
                // Broadcast the updated game state to the room
                renderGame(this.ctx, this.players, this.enemies, this.coins, this.missile, this.paused);
                // for (const conn of this.connections) {
                //     conn.send({ type: 'gameState', players: this.players, enemies: this.enemies, coins: this.coins, missile: this.missile, paused: this.paused });
                // }
                // if (this.conn !== null) {
                //     this.conn.send({ type: 'gameState', players: this.players, enemies: this.enemies, coins: this.coins, missile: this.missile, paused: this.paused });
                // }
            }, 1000 / 60);
        });
    }

    stop() {
        for (const conn of this.connections) {
            conn.send({ type: 'gameState', players: this.players, enemies: this.enemies, coins: this.coins, missile: this.missile, paused: this.paused });
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
    }


    restart() {
        // reset players
        Object.values(this.players).forEach(player => {
            // player reset not a function, do it here?
            player.lives = GameConfig.playerLives;
            player.score = 0;
            player.ready = false;
            //console.log(player);
            //player.reset();
        });
        this.enemies = [];
        this.coins = [];
        this.paused = false;
        this.gameOver = false;
        this.lastEnemySpawn = Date.now();
        this.lastCoinSpawn = Date.now();
        this.start();

    }

    addPlayer(id, x, y, playerNumber, playerName, basePlayerScale = 0.05) {
        const player = new Player(this.cWidth, this.cHeight, x, y, id, basePlayerScale);
        player.playerNumber = playerNumber;
        player.name = playerName;
        player.color = this.colors[playerNumber - 1];
        this.players[id] = player;
    }

    updatePlayer(player){
        if (player.lives <= 0) {
            player.dx = 0;
            player.dy = 0;
            return;
        }

        player.dx = 0;
        player.dy = 0;
        

        if (player.left) {
            player.dx += -player.moveSpeed;
        }
        if (player.right) {
            player.dx += player.moveSpeed;
        }
        if (player.up) {
            player.dy += -player.moveSpeed;
        }
        if (player.down) {
            player.dy += player.moveSpeed;
        }
        // Shooting missiles
        // if (this.action && Date.now() - this.lastMissileShot > this.missileCooldown) {
        //     this.shootMissiles(misslesArray);
        // }

        player.x += player.dx;
        player.y += player.dy;
        

        // Handle boundaries
        player.x = Math.max(0, Math.min(player.x, AppConfig.canvasWidth - player.width));
        player.y = Math.max(0, Math.min(player.y, AppConfig.canvasHeight - player.height));

    }

    spawnEnemy() {
        if (Date.now() - this.lastEnemySpawn > this.enemySpawnRate) {
            this.enemies.push(new Enemy(this.cWidth, this.cHeight, 10));
            this.lastEnemySpawn = Date.now();
        }
    }

    spawnCoin() {
        if (Date.now() - this.lastCoinSpawn > this.coinSpawnRate) {
            const newCoin = new Coin(this.cWidth, this.cHeight);
            this.coins.push(newCoin);
            this.lastCoinSpawn = Date.now();
        }
    }

    handleMissiles() {
        const missilesToRemove = [];
        this.missile.forEach((missile, missileIndex) => {
            // Update missile position
            missile.update();
    
            // Check if the missile is outside the game area and mark it for removal if it is
            if (missile.x < 0 || missile.x > this.cWidth || missile.y < 0 || missile.y > this.cHeight) {
                missilesToRemove.push(missileIndex);
                return; // Skip further checks for this missile
            }
    
            // Check for collisions with players
            Object.values(this.players).forEach(player => {
                // Avoid self-inflicted hits
                if (missile.ownerId === player.id) return;
    
                const hit = missile.x < player.x + player.width &&
                            missile.x + 5 > player.x && // Assuming missile width is 5
                            missile.y < player.y + player.height &&
                            missile.y + 5 > player.y; // Assuming missile height is 5
    
                if (hit) {
                    // Player hit by missile, deduct a life
                    player.loseLife();
    
                    // Emit an update to all clients about the hit
                    io.to(this.roomName).emit('playerHit', { playerId: player.id, newLives: player.lives });
    
                    // Mark missile for removal
                    missilesToRemove.push(missileIndex);
                }
            });
        });
    
        // Remove missiles that are out of bounds or have hit a player
        // Looping in reverse to avoid indexing issues while splicing
        for (let i = missilesToRemove.length - 1; i >= 0; i--) {
            this.missile.splice(missilesToRemove[i], 1);
        }
    }
    

    checkCollisions() {
        // Coin collisions
        Object.values(this.players).forEach(player => {
            if (player.lives <= 0) return; // Dead players cant collect coins
            this.coins.forEach((coin, index) => {
                if (player.x < coin.x + coin.width && player.x + player.width > coin.x &&
                    player.y < coin.y + coin.height && player.y + player.height > coin.y) {
                    player.score += 1;
                    this.coins.splice(index, 1); // Remove coin after collection
                }
            });
        });

        // Enemy collisions
        Object.values(this.players).forEach(player => {
            if (player.lives <= 0) return; // Dead players cant die more
            this.enemies.forEach((enemy, index) => {
                if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x &&
                    player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {
                    player.lives -= 1;
                    this.enemies.splice(index, 1); // Remove enemy after collision
                }
            });
        });
    }


    gameTick() {
        for (const conn of this.connections) {
            conn.send({ type: 'gameState', players: this.players, enemies: this.enemies, coins: this.coins, missile: this.missile, paused: this.paused });
        }
        if (this.paused || this.gameOver) return;
        this.spawnEnemy();
        this.spawnCoin();
        this.checkCollisions();
        //this.handleMissiles();
        this.updateEntities();

        
        
        
        const alivePlayers = Object.values(this.players).filter(player => player.lives > 0);
        const deadPlayers = Object.values(this.players).filter(player => player.lives <= 0);
        const numPlayers = Object.values(this.players).length;
        // Check if game should continue based on alive and dead players' scores
        let gameShouldEnd = false;
        if (alivePlayers.length === 0) {
            gameShouldEnd = true; // All players are dead, end the game
        } else if (numPlayers === 1) {
            gameShouldEnd = false; // sing player game
        } else if (alivePlayers.length === 1 && deadPlayers.every(deadPlayer => alivePlayers[0].score > deadPlayer.score)) {
            // Only one player is alive and has a higher score than all dead players, end the game
            gameShouldEnd = true;
        }

        if (gameShouldEnd) {
            this.gameOver = true;
            console.log("game over");
            
            for (const conn of this.connections) {
                conn.send({ type: 'gameOver', players: this.players });
            }
            
            //io.to(this.roomName).emit('gameOver', this.players); // Assume roomNumber is tracked per game instance
            this.stop(); // Stop the game loop
        }
    }

    updateEntities() {
        // Update coins
        const currentTime = Date.now();
        this.coins.forEach(coin => coin.update(this.settings));
        this.coins = this.coins.filter(coin => {
            const coinAge = currentTime - coin.spawnTime;
            return !(coinAge > 3000); // Keep the coin if age is less than 3 seconds
        });

        // Update enemies
        this.enemies = this.enemies.filter(enemy => enemy.update());

        // Update players
        //Object.values(this.players).forEach(player => console.log(player));
        Object.values(this.players).forEach(player => this.updatePlayer(player));

        // Handle game over condition
        const alivePlayers = Object.values(this.players).filter(player => player.lives > 0);
        if (alivePlayers.length === 0) {
            this.gameOver = true;
            // Emit gameOver event or handle it accordingly
        }
    }
}

function renderGame(ctx, players, enemies, coins, missile, paused) {
    //if no players, continue
    if (Object.keys(players).length === 0) {
        return;
    }
    document.getElementById('game_modal_start_button').innerText = paused ? 'Start' : 'Pause';
    //document.getElementById('pauseButton').innerText = paused ? 'Start' : 'Pause';
    ctx.clearRect(0, 0, AppConfig.canvasWidth, AppConfig.canvasHeight);

    playerInfoContainer.innerHTML = '';
    Object.values(players).forEach((player, index) => {
        ctx.fillStyle = player.color;
        if (player.lives <= 0) {
            ctx.fillStyle = 'darkgrey';
        }
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // update the UI scoreboard
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-info';
        playerDiv.innerHTML = `
            <p>${player.name}</p>
            <p>Score: ${player.score}</p>
            <p>Lives: ${player.lives}</p>
        `;
        playerInfoContainer.appendChild(playerDiv);

    });
    enemies.forEach(enemy => {
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
    coins.forEach(coin => {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
        ctx.fill();
    });
    missile.forEach(missile => {
        ctx.fillStyle = 'orange'; // Or any color you like
        ctx.fillRect(missile.x, missile.y, 5, 5); // Adjust size as needed
    });
}

document.addEventListener("DOMContentLoaded", () => {


    const peer = new Peer();
      
    let name = '';
    let peerId = null;


    peer.on('open', function(id) {
        console.log('My peer ID is: ' + id);
        peerId = id;
    });

    // peer.on('data', function(data) {
    //     console.log('Received', data);
    // });
    

    // Query DOM
    // initial page
    const initial_page = document.getElementById('initial_page');
    const name_input = document.getElementById('nickname');
    const go_button = document.getElementById('go_button');

    go_button.onclick = function() {
        name = name_input.value;
        go_to_lobby();
    }

    function go_to_lobby() {
        initial_page.style.display = "none";
        lobby.style.display = "flex";
        game.style.display = "none";
    }

    // lobby page ====================================================================================
    const lobby = document.getElementById('lobby');
    
    const create_lobby_button = document.getElementById('create_lobby_button');
    const join_lobby_button = document.getElementById('join_lobby_button');
    
    const lobby_modal = document.getElementById('lobby_modal');
    const lobby_modal_title = document.getElementById('lobby_modal_title');
    // const lobby_modal_text = document.getElementById('lobby_modal_text');
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

        // lobby_modal_text.style.display = "block"; // Show text
        // lobby_modal_text.innerText = peerId;

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
    
    // Use values from the AppConfig object
    canvas.width = AppConfig.canvasWidth;
    canvas.height = AppConfig.canvasHeight;

    let isHost = false;
    let hostGameInstance = null;

    let conn; // client connection to host, used for sending wasd commands
    let sendUserInputs = false;
    let clientPlayer = null;
    
    let red_team = [];
    let spectators = [];
    let blue_team = [];
    let playerColor = '';
    const game_modal_lobby_code = document.getElementById('game_modal_lobby_code');

    let userCommands = {
        left: false,
        up: false,
        right: false,
        down: false,
        action: false
    }
    let justPressed = false;
    function userInput(obj, connection) {
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

    function startGame() {
        console.log('Starting game');
        isHost = true;
        conn = null;
        sendUserInputs = false;
        // Main JavaScript file
        
        // Create a new game instance
        const gameInstance = new Game(AppConfig.canvasWidth, AppConfig.canvasHeight, peerId, GameConfig);
        hostGameInstance = gameInstance;
        gameInstance.ctx = ctx;
        let myPlayer = new Player(AppConfig.canvasWidth, AppConfig.canvasHeight, 100, 100, peerId, 0.05);
        myPlayer.name = name;
        userInput(myPlayer);
        clientPlayer = myPlayer;
        //gameInstance.players[peerId] = myPlayer;

        let gameWorker;
        if (window.Worker) {
            gameWorker = new Worker('webworker.js');
            gameWorker.onmessage = function(e) {
                if (e.data.status === 'tick') {
                    // Handle the tick - Update game logic, etc.
                    gameInstance.gameTick();
                    // Check if the game ended
                    if (gameInstance.gameOver) {
                        // if 0 players in gameInstance.players
                        if (Object.keys(gameInstance.players).length === 0) {
                            showGameModal();
                            for (const con of gameInstance.connections) {
                                con.send({ type: 'showGameModal'});
                            }
                        }
                        else {
                            showGameEndModal(myPlayer, gameInstance.players);
                            gameWorker.postMessage({ command: 'stop' });
                            const readyButton = document.getElementById('ready_up_button');
                            readyButton.onclick = function() {
                                document.getElementById(myPlayer.id).innerText = `${myPlayer.name}: ${myPlayer.score}`;
                                myPlayer.ready = !myPlayer.ready;
                                if (myPlayer.ready) {
                                    document.getElementById(myPlayer.id).innerText += ' - Ready';
                                }
                                for (const con of gameInstance.connections) {
                                    con.send({ type: 'playerReady', player: myPlayer });
                                }
                                
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

        let connectedClients = {};
        // When someone connects to this host
        peer.on('connection', function(connection) {
            console.log("connected ");
            conn = connection;
            gameInstance.connections.push(conn);
            connectedClients[connection.id] = connection;
            // Listen for data from the clients
            conn.on('data', function(data) {
                if (data.type === 'initial_data_request') {
                    conn.send({ type: 'initial_data', red_team: red_team, blue_team: blue_team, spectators: spectators, isPaused: gameInstance.paused});
                }
                if (data.type === 'pause clicked') {
                    // Locally update the pause/start button state
                    const startButton = document.getElementById('game_modal_start_button');
                    // Update the game instance
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
                    // Tell everybody else about pause state
                    conn.send({ type: 'gameState', players: gameInstance.players, enemies: gameInstance.enemies, coins: gameInstance.coins, missile: gameInstance.missile, paused: gameInstance.paused });
                }
                if (data.type === 'team_update') {
                    red_team = data.red_team;
                    blue_team = data.blue_team;
                    spectators = data.spectators;
                    updatePlayerList('Red', red_team);
                    updatePlayerList('Blue', blue_team);
                    updatePlayerList('Spectators', spectators);
                }
                
                if (data.type === 'set_gameInstance_player') {
                    gameInstance.players[data.player.id] = data.player;
                }
                if (data.type === 'remove_gameInstance_player') {
                    delete gameInstance.players[data.player.id];
                }

                if (data.type === 'userInput') {
                    gameInstance.players[data.id].left = data.commands.left;
                    gameInstance.players[data.id].up = data.commands.up;
                    gameInstance.players[data.id].right = data.commands.right;
                    gameInstance.players[data.id].down = data.commands.down;
                    gameInstance.players[data.id].action = data.commands.action;
                }
                if (data.type === 'playerReady') {
                    gameInstance.players[data.player.id].ready = data.player.ready;
                    //update the UI
                    document.getElementById(data.player.id).innerText = `${data.player.name}: ${data.player.score}`;
                    if (data.player.ready) {
                        document.getElementById(data.player.id).innerText += ' - Ready';
                    }

                    let allPlayersReady = Object.values(gameInstance.players).every(player => player.ready);
                    if (allPlayersReady) {
                        conn.send({ type: 'gameRestarting' });
                        gameInstance.restart();
                        gameWorker.postMessage({ command: 'start', fps: 60 });
                        showGame();
                    }                
                }
            });

        });

        // Handle when host clicks start / pause button
        const startButton = document.getElementById('game_modal_start_button');
        startButton.onclick = function() {  
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

        document.querySelectorAll('.game_modal_join_button').forEach(button => {
            button.onclick = function() {
                const team = this.classList.contains('red') ? 'Red Team' :
                            this.classList.contains('blue') ? 'Blue Team' : 'Spectators';
                joinTeam(team);
            }
        });
    
        // Function to handle joining a team
        function joinTeam(team) {
            console.log('Joining', team);
            // remove from existing team
            red_team = red_team.filter(player => player.peerId !== peerId);
            blue_team = blue_team.filter(player => player.peerId !== peerId);
            spectators = spectators.filter(player => player.peerId !== peerId);
            if (team === 'Red Team') {
                red_team.push({ name, peerId });
                myPlayer.color = 'green';
                gameInstance.players[peerId] = myPlayer;
            } else if (team === 'Blue Team') {
                blue_team.push({ name, peerId });
                myPlayer.color = 'blue';
                gameInstance.players[peerId] = myPlayer;
            } else {
                spectators.push({ name, peerId });
                myPlayer.color = 'grey';
                delete gameInstance.players[peerId];
            }

            
            updatePlayerList('Red', red_team);
            updatePlayerList('Blue', blue_team);
            updatePlayerList('spectators', spectators);
            // Send the updated team lists to the clients
            Object.values(connectedClients).forEach(conn => {
                conn.send({ type: 'team_update', red_team, blue_team, spectators });
            });
            
        }

        showGame();
        showGameModal();
        game_modal_lobby_code.innerText = `Lobby Code: ${peerId}`;
    }

    function joinGame() {
        isHost = false;
        const lobby_code = lobby_modal_input.value;
        game_modal_lobby_code.innerText = `Lobby Code: ${lobby_code}`;

        let myPlayer = new Player(AppConfig.canvasWidth, AppConfig.canvasHeight, 100, 100, peerId, 0.05);
        myPlayer.name = name;
        

        conn = peer.connect(lobby_code);
        console.log("conn: ", conn);

        
        conn.on('open', () => {
            userInput(myPlayer, conn);
            console.log('Connected to: ', conn.peer);
            //conn.send({ type: 'playerConnect', myPlayer }); // TODO: need better solution (spectator?)
            conn.send({ type: 'initial_data_request' });

        });

        conn.on('close', () => {
            console.log('Connection closed.');
            conn.send({ type: 'player_disconnected', conn });
            alert('Connection to host lost');
            go_to_lobby();

        });


        conn.on('error', (err) => {
            console.log('Connection error: ', err);
            alert('error ' + err); // Notify the user
            go_to_lobby();
        });

        showGame();
        showGameModal();
            // Listen for data from the connection
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
            }


            if (data.type === 'team_update') {
                red_team = data.red_team;
                blue_team = data.blue_team;
                spectators = data.spectators;
                updatePlayerList('Red', red_team);
                updatePlayerList('Blue', blue_team);
                updatePlayerList('Spectators', spectators);
            }
            
            if (data.type === 'gameState') {
                renderGame(ctx, data.players, data.enemies, data.coins, data.missile, data.paused);
                if (data.paused) {
                    showGameModal();
                } 
            }
            if (data.type === 'gameStarted!') {
                showGame();
            }
            if (data.type === 'gameOver') {
                
                myPlayer = data.players[peerId];
                // Handle game over event
                showGameEndModal(myPlayer, data.players);
                const readyButton = document.getElementById('ready_up_button');
                readyButton.onclick = function() {
                    document.getElementById(myPlayer.id).innerText = `${myPlayer.name}: ${myPlayer.score}`;
                    myPlayer.ready = !myPlayer.ready;
                    if (myPlayer.ready) {
                        document.getElementById(myPlayer.id).innerText += ' - Ready';
                    }
                    conn.send({ type: 'playerReady', player: myPlayer });
                    // let everyPlayerReady = Object.values(gameInstance.players).every(player => player.ready);
                    // if (everyPlayerReady) {
                    //     conn.send({ type: 'restartGame' });
                    // }
                }
            }
            if (data.type === 'gameRestarting') {
                showGame();
            }
            if (data.type === 'playerReady') {
                // update the UI
                const playerUI = document.getElementById(data.player.id);
                if (playerUI === null) {
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
        });

        document.querySelectorAll('.game_modal_join_button').forEach(button => {
            button.onclick = function() {
                const team = this.classList.contains('red') ? 'Red Team' :
                            this.classList.contains('blue') ? 'Blue Team' : 'Spectators';
                joinTeamClient(team);
            }
        });
    
        // Function to handle joining a team
        function joinTeamClient(team) {
            console.log('Joining', team);
            // remove from existing team
            red_team = red_team.filter(player => player.peerId !== peerId);
            blue_team = blue_team.filter(player => player.peerId !== peerId);
            spectators = spectators.filter(player => player.peerId !== peerId);
            if (team === 'Red Team') {
                red_team.push({ name, peerId });
                myPlayer.color = 'green';
                conn.send({ type: 'set_gameInstance_player', player: myPlayer });
                sendUserInputs = true;
            } else if (team === 'Blue Team') {
                blue_team.push({ name, peerId });
                myPlayer.color = 'blue';
                conn.send({ type: 'set_gameInstance_player', player: myPlayer });
                sendUserInputs = true;
            } else {
                spectators.push({ name, peerId });
                myPlayer.color = 'grey';
                conn.send({ type: 'remove_gameInstance_player', player: myPlayer });
                sendUserInputs = false;
            }

            
            updatePlayerList('Red', red_team);
            updatePlayerList('Blue', blue_team);
            updatePlayerList('spectators', spectators);
            
            // tell the server to update team lists
            conn.send({ type: 'team_update', red_team, blue_team, spectators });
        }

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
            if (player.id !== myPlayer.id) { // Ensure not to compare myPlayer to themselves
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
        gameModal.style.display = 'none';

        const gameEndModal = document.getElementById('game_end_modal');
        
        const statusElement = document.getElementById('game_end_status');
        statusElement.innerText = result;
        const all_players_scores = document.getElementById('all_players_scores');

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

    // Event listeners for the team join buttons
    

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
        

    // Event listener for the leave button
    document.getElementById('game_modal_leave_button').addEventListener('click', function() {
        hideGameModal();
        go_to_lobby();
        // Here you would add the logic to leave the team or game
    });

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

    // Call to show the game modal (for testing purposes)
    // In your application, you would call this when it's time to show the team selection
    //showGameModal();
    });
