/**
 * Represents a missile shot by a player.
 * @class
 * 
 * @param {number} x - The starting x-coordinate of the missile.
 * @param {number} y - The starting y-coordinate of the missile.
 * @param {string} direction - The direction of the missile ('up', 'down', 'left', 'right').
 * @param {string} ownerId - The ID of the player who shot the missile.
 */
export class Missile {
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