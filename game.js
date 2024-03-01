/**
 * Represents the game state and logic.
 * @class
 * 
 * @param {number} cWidth - The width of the canvas.
 * @param {number} cHeight - The height of the canvas.
 * @param {string} serverRoomName - The name of the server room.
 * @param {Object} gameConfig - Configuration settings for the game.
 * @param {CanvasRenderingContext2D} context - The canvas context for rendering.
 */
export class Game {
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
        this.connections = {};
        this.conn = null;
        this.ctx = context;
    }

    /**
     * Broadcasts a message to all connected clients except the sender.
     * Assumes `connections` is a collection of client connections.
     * 
     * @param {Object|string} message - The message to broadcast.
     */
    broadcast(message) {
        Object.values(this.connections).forEach(conn => {
            conn.send(message);
        });
    }

    /**
     * Broadcasts a message to all connected clients (not including the sender).
     * Starts the rendering of the Hosts's game.
     */
    start() {
        this.broadcast({ type: 'gameStarted!' })
        // for (const conn of this.connections) {
        //     conn.send({ type: 'gameStarted!' });
        // }
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

    /**
     * broadcast to all connected clients the current game state (players, enemies, coins, missile, paused).
     * stops the local rendering of the game.
     */
    stop() {
        this.broadcast({ type: 'gameState', players: this.players, enemies: this.enemies, coins: this.coins, missile: this.missile, paused: this.paused });
        // for (const conn of this.connections) {
        //     conn.send({ type: 'gameState', players: this.players, enemies: this.enemies, coins: this.coins, missile: this.missile, paused: this.paused });
        // }
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    /**
     * For each player, reset their lives, score, and set ready status to false
     * Clears enemies, coins
     * sets paused and gameOver to false
     */
    restart() {
        // reset players
        Object.values(this.players).forEach(player => {
            // player reset not a function, do it here?
            player.lives = gameConfig.playerLives;
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
        this.lastEnemySpawn += gameConfig.spawnProtectionDurration; // add two secconds?. spawn protection
        this.lastCoinSpawn = Date.now();
        this.lastCoinSpawn += gameConfig.spawnProtectionDurration; // add two secconds?. spawn protection
        this.start();

    }

    // never used

    // addPlayer(id, x, y, playerNumber, playerName, basePlayerScale = 0.05) {
    //     const player = new Player(this.cWidth, this.cHeight, x, y, id, basePlayerScale);
    //     player.playerNumber = playerNumber;
    //     player.name = playerName;
    //     player.color = this.colors[playerNumber - 1];
    //     this.players[id] = player;
    // }

    updatePlayer(player){

        if (!GameConfig.allowGhosts) {
            if (player.lives <= 0) {
                player.dx = 0;
                player.dy = 0;
                return;
            }
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
        if (Date.now() - this.lastEnemySpawn > gameConfig.enemySpawnRate) {
            this.enemies.push(new Enemy(this.cWidth, this.cHeight, gameConfig));
            this.lastEnemySpawn = Date.now();
        }
    }

    spawnCoin() {
        if (Date.now() - this.lastCoinSpawn > gameConfig.coinSpawnRate) {
            const newCoin = new Coin(this.cWidth, this.cHeight, gameConfig);
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
        this.broadcast({ type: 'gameState', players: this.players, enemies: this.enemies, coins: this.coins, missile: this.missile, paused: this.paused });
        // for (const conn of this.connections) {
        //     conn.send({ type: 'gameState', players: this.players, enemies: this.enemies, coins: this.coins, missile: this.missile, paused: this.paused });
        // }
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
        } else if (numPlayers === 1){
            gameShouldEnd = false; // single player game
        } else if (alivePlayers.length === 1 && deadPlayers.every(deadPlayer => alivePlayers[0].score > deadPlayer.score)) {
            // Only one player is alive and has a higher score than all dead players, end the game
            gameShouldEnd = true;
        } 

        if (gameShouldEnd) {
            this.gameOver = true;
            console.log("game over");
            
            this.broadcast({ type: 'gameOver', players: this.players });
            // for (const conn of this.connections) {
            //     conn.send({ type: 'gameOver', players: this.players });
            // }
            
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

/**
 * Renders the game state to the canvas. Draws players, enemies, coins,
 * and other game elements based on the current state.
 * 
 * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
 * @param {Object[]} players - An array of player objects.
 * @param {Object[]} enemies - An array of enemy objects.
 * @param {Object[]} coins - An array of coin objects.
 * @param {Object[]} missile - An array of missile objects.
 * @param {boolean} paused - Indicates if the game is currently paused.
 */
export function renderGame(ctx, players, enemies, coins, missile, paused) {
    //if no players, continue
    if (Object.keys(players).length === 0) {
        return;
    }
    document.getElementById('game_modal_start_button').innerText = paused ? 'Start' : 'Pause';
    //document.getElementById('pauseButton').innerText = paused ? 'Start' : 'Pause';
    ctx.clearRect(0, 0, AppConfig.canvasWidth, AppConfig.canvasHeight);

    playerInfoContainer.innerHTML = '';
    // Sort players by score in descending order
    const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);
    
    sortedPlayers.forEach((player, index) => {
        ctx.fillStyle = player.color;
        if (player.lives <= 0) {
            ctx.fillStyle = 'darkgrey';
        }
        ctx.fillRect(player.x, player.y, player.width, player.height);
    
        // update the UI scoreboard
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-info';
        // Set the background color of playerDiv to the player's color
        playerDiv.style.backgroundColor = player.color;
        playerDiv.innerHTML = `
            <p style="margin: 0; color: white;">${player.name}</p>
            <p style="margin: 0; color: white;">Score: ${player.score}</p>
            <p style="margin: 0; color: white;">Lives: ${player.lives}</p>
        `;
        playerInfoContainer.appendChild(playerDiv);
    });
    

    //playerInfoContainer.innerHTML = '';
    // Object.values(players).forEach((player, index) => {
    //     ctx.fillStyle = player.color;
    //     if (player.lives <= 0) {
    //         ctx.fillStyle = 'darkgrey';
    //     }
    //     ctx.fillRect(player.x, player.y, player.width, player.height);

    //     // update the UI scoreboard
    //     const playerDiv = document.createElement('div');
    //     playerDiv.className = 'player-info';
    //     playerDiv.innerHTML = `
    //         <p>${player.name}</p>
    //         <p>Score: ${player.score}</p>
    //         <p>Lives: ${player.lives}</p>
    //     `;
    //     playerInfoContainer.appendChild(playerDiv);

    // });
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