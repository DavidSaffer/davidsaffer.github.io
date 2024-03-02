/**
 * Configuration settings for the application's canvas.
 * @type {Object}
 */
export const AppConfig = {
    canvasWidth: 16 * 100,
    canvasHeight: 9 * 100
    // Add more configuration settings as needed
};

/**
 * Configuration settings for game mechanics.
 * @type {Object}
 */
export const GameConfig = {
    enemySpawnRate: 1000, // Spawn an enemy every second
    enemySpeed: 10,

    coinSpawnRate: 1000, // Spawn a coin every 0.5 seconds
    coinLifespan: 5000, // 5 seconds

    playerLives: 3,
    playerSpeed: 15,

    spawnProtectionDurration: 1 * 1000, // 1 second
    allowGhosts: true, // if true, players can still move after they die

    playerColors: ['Blue', 'Green', 'Purple', 'Orange', 'Pink', 'Brown', 'Black', 'White']
};