import { Player } from './Player.js';
import { GameMap } from './Map.js';
import { Camera } from './Camera.js';

class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    player: Player;
    map: GameMap;
    camera: Camera;
    keys: Set<string>;
    isRunning: boolean = false;
    lastTime: number = 0;
    debugCollision: boolean = false;
    
    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        
        // Initialize map (50x40 tiles = 1600x1280 pixels)
        this.map = new GameMap(50, 40);
        
        // Initialize player in center of map
        // Map is 1600x1280, so center is at 800x640
        // Player position is top-left corner, so subtract half player size to center
        this.player = new Player(800 - 16, 640 - 16);
        
        // Initialize camera
        this.camera = new Camera(
            this.canvas.width,
            this.canvas.height,
            50 * 32, // map width in pixels
            40 * 32  // map height in pixels
        );
        
        this.keys = new Set();
        
        this.setupControls();
        this.setupUI();
    }
    
    setupControls(): void {
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
                e.preventDefault();
                this.keys.add(e.key);
            }
            
            // Toggle debug collision visualization with 'c' key
            if (e.key === 'c') {
                this.debugCollision = !this.debugCollision;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
        });
    }
    
    setupUI(): void {
        const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
        const restartBtn = document.getElementById('restartBtn') as HTMLButtonElement;
        
        startBtn.addEventListener('click', () => {
            this.start();
            startBtn.style.display = 'none';
            restartBtn.style.display = 'inline-block';
        });
        
        restartBtn.addEventListener('click', () => {
            this.restart();
        });
    }
    
    start(): void {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            this.gameLoop(this.lastTime);
        }
    }
    
    restart(): void {
        // Reset player position to center of map
        // Map is 1600x1280, so center is at 800x640
        // Player position is top-left corner, so subtract half player size to center
        this.player = new Player(800 - 16, 640 - 16);
        this.keys.clear();
        
        if (!this.isRunning) {
            this.start();
        }
    }
    
    gameLoop(currentTime: number): void {
        if (!this.isRunning) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update
        this.update();
        
        // Render
        this.render();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(): void {
        this.player.update(this.keys, this.map.collisionMap);
        this.camera.follow(this.player);
    }
    
    render(): void {
        // Clear screen
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw map
        this.map.draw(this.ctx, this.camera.x, this.camera.y, this.canvas.width, this.canvas.height);
        
        // Draw player with optional collision debug
        this.player.draw(this.ctx, this.camera.x, this.camera.y, this.debugCollision);
        
        // Draw UI overlay
        this.drawUI();
    }
    
    drawUI(): void {
        const tile = this.player.getCurrentTile();
        const center = this.player.getCenterPosition();
        const currentTile = this.map.getTileAt(center.x, center.y);
        
        // Draw position debug info
        this.ctx.fillStyle = 'rgba(121, 14, 203, 0.8)';
        this.ctx.fillRect(10, 10, 220, 120);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px "Courier New"';
        this.ctx.fillText(`Pos: ${Math.floor(this.player.position.x)}, ${Math.floor(this.player.position.y)}`, 20, 30);
        this.ctx.fillText(`Center: ${Math.floor(center.x)}, ${Math.floor(center.y)}`, 20, 50);
        this.ctx.fillText(`Tile: ${tile.tileX}, ${tile.tileY}`, 20, 70);
        this.ctx.fillText(`Type: ${currentTile?.type || 'none'}`, 20, 90);
        this.ctx.fillText(`Speed: ${Math.floor(Math.sqrt(this.player.velocity.x ** 2 + this.player.velocity.y ** 2) * 10) / 10}`, 20, 110);
        
        // Show debug hint
        if (this.debugCollision) {
            this.ctx.fillText(`[C] Debug: ON`, 20, 130);
        }
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
