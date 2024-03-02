/**
 * Represents a player in the game.
 * @class
 * 
 * @param {number} cWidth - The width of the canvas.
 * @param {number} cHeight - The height of the canvas.
 * @param {number} x - The starting x-coordinate of the player.
 * @param {number} y - The starting y-coordinate of the player.
 * @param {string} id - The unique identifier for the player.
 * @param {number} [basePlayerScale=0.05] - The base scale for the player's size.
 */
export class Player {
    constructor(cWidth, cHeight, x, y, id, GameConfig, basePlayerScale = 0.05 ) {
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

        this.ready = true;

        // Missile shooting cooldown
        this.missileCooldown = 100; // 500 ms cooldown
        this.lastMissileShot = 0; // Timestamp of the last shot

        this.hasJoinedTeam = false;
    }

    loseLife() {
        this.lives -= 1;
    }

    reset() {
        this.lives = GameConfig.playerLives;
        this.score = 0;
        this.ready = false;
        this.moveSpeed = GameConfig.playerSpeed;
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