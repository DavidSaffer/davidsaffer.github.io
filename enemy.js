/**
 * Represents an enemy in the game.
 * @class
 * 
 * @param {number} cWidth - The width of the canvas.
 * @param {number} cHeight - The height of the canvas.
 * @param {number} speed - The speed of the enemy.
 * @param {number} [enemieScale=0.03] - The scale for the enemy's size.
 */
export class Enemy {
    constructor(cWidth, cHeight, GameConfig, enemieScale = .03) {
        this.enemieScale = enemieScale;
        this.cWidth = cWidth;
        this.cHeight = cHeight;
        const size = Math.min(cWidth, cHeight);
        this.width = size * this.enemieScale; 
        this.height = size * this.enemieScale;
        this.speed = GameConfig.enemySpeed;

        this.x, this.y, this.dx, this.dy;
        const startEdge = Math.floor(Math.random() * 4);
        const isVertical = startEdge % 2 === 0;

        if (isVertical) {
            this.x = Math.random() * this.cWidth;
            this.y = startEdge === 0 ? 0 : this.cHeight;
            this.dx = 0;
            this.dy = startEdge === 0 ? this.speed : -this.speed;
        } else {
            this.x = startEdge === 1 ? this.cWidth : 0;
            this.y = Math.random() * this.cHeight;
            this.dx = startEdge === 1 ? -this.speed : this.speed;
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