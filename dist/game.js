import { Player } from './Player.js';
import { GameMap } from './Map.js';
import { Camera } from './Camera.js';
class Game {
    constructor() {
        this.isRunning = false;
        this.lastTime = 0;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        // Initialize map (50x40 tiles = 1600x1280 pixels)
        this.map = new GameMap(50, 40);
        // Initialize player in center of map
        this.player = new Player(800, 640);
        // Initialize camera
        this.camera = new Camera(this.canvas.width, this.canvas.height, 50 * 32, // map width in pixels
        40 * 32 // map height in pixels
        );
        this.keys = new Set();
        this.setupControls();
        this.setupUI();
    }
    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
                e.preventDefault();
                this.keys.add(e.key);
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
        });
    }
    setupUI() {
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');
        startBtn.addEventListener('click', () => {
            this.start();
            startBtn.style.display = 'none';
            restartBtn.style.display = 'inline-block';
        });
        restartBtn.addEventListener('click', () => {
            this.restart();
        });
    }
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            this.gameLoop(this.lastTime);
        }
    }
    restart() {
        // Reset player position
        this.player = new Player(800, 640);
        this.keys.clear();
        if (!this.isRunning) {
            this.start();
        }
    }
    gameLoop(currentTime) {
        if (!this.isRunning)
            return;
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        // Update
        this.update();
        // Render
        this.render();
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    update() {
        this.player.update(this.keys, this.map.collisionMap);
        this.camera.follow(this.player);
    }
    render() {
        // Clear screen
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw map
        this.map.draw(this.ctx, this.camera.x, this.camera.y, this.canvas.width, this.canvas.height);
        // Draw player
        this.player.draw(this.ctx, this.camera.x, this.camera.y);
        // Draw UI overlay
        this.drawUI();
    }
    drawUI() {
        // Draw position debug info
        this.ctx.fillStyle = 'rgba(121, 14, 203, 0.8)';
        this.ctx.fillRect(10, 10, 200, 60);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px "Courier New"';
        this.ctx.fillText(`X: ${Math.floor(this.player.position.x)}`, 20, 30);
        this.ctx.fillText(`Y: ${Math.floor(this.player.position.y)}`, 20, 50);
        this.ctx.fillText(`Speed: ${Math.floor(Math.sqrt(this.player.velocity.x ** 2 + this.player.velocity.y ** 2) * 10) / 10}`, 20, 70);
    }
}
// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
