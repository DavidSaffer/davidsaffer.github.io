/**
 * Represents a coin in the game.
 * @class
 * 
 * @param {number} cWidth - The width of the canvas.
 * @param {number} cHeight - The height of the canvas.
 * @param {number} [coinScale=0.015] - The scale for the coin's size.
 */
export class Coin {
    constructor(cWidth, cHeight, GameConfig, coinScale = .015) {
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
        this.lifespan = GameConfig.coinLifespan; // 5 seconds in milliseconds
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