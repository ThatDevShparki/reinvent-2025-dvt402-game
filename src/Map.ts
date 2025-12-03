import { Tile } from './types.js';

export class GameMap {
    width: number;
    height: number;
    tileSize: number = 32;
    tiles: Tile[][];
    collisionMap: boolean[][];
    
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.tiles = [];
        this.collisionMap = [];
        this.generateMap();
    }
    
    generateMap(): void {
        // Create a medium-sized town map (50x40 tiles = 1600x1280 pixels)
        const mapWidth = 50;
        const mapHeight = 40;
        
        for (let y = 0; y < mapHeight; y++) {
            const row: Tile[] = [];
            const collisionRow: boolean[] = [];
            
            for (let x = 0; x < mapWidth; x++) {
                let tile: Tile;
                
                // Border trees
                if (x === 0 || x === mapWidth - 1 || y === 0 || y === mapHeight - 1) {
                    tile = { type: 'tree', solid: true };
                }
                // Create maze-like tree areas
                else if (this.isMazeTree(x, y, mapWidth, mapHeight)) {
                    tile = { type: 'tree', solid: true };
                }
                // Random grass patches
                else if (Math.random() < 0.15) {
                    tile = { type: 'grass', solid: false };
                }
                // Path areas
                else if (this.isPath(x, y, mapWidth, mapHeight)) {
                    tile = { type: 'path', solid: false };
                }
                // Default ground
                else {
                    tile = { type: 'ground', solid: false };
                }
                
                row.push(tile);
                collisionRow.push(tile.solid);
            }
            
            this.tiles.push(row);
            this.collisionMap.push(collisionRow);
        }
    }
    
    isMazeTree(x: number, y: number, mapWidth: number, mapHeight: number): boolean {
        // Create tree clusters in specific areas
        // Top-right maze area
        if (x > mapWidth * 0.6 && y < mapHeight * 0.4) {
            return (x % 3 === 0 && y % 2 === 0) || (x % 4 === 2 && y % 3 === 1);
        }
        
        // Bottom-left maze area
        if (x < mapWidth * 0.3 && y > mapHeight * 0.6) {
            return (x % 2 === 0 && y % 3 === 0) || (x % 3 === 1 && y % 2 === 1);
        }
        
        // Scattered trees in middle
        if (x > mapWidth * 0.3 && x < mapWidth * 0.7 && 
            y > mapHeight * 0.3 && y < mapHeight * 0.7) {
            return Math.random() < 0.08;
        }
        
        return false;
    }
    
    isPath(x: number, y: number, mapWidth: number, mapHeight: number): boolean {
        // Horizontal path through middle
        if (Math.abs(y - mapHeight / 2) < 2) {
            return true;
        }
        
        // Vertical path through middle
        if (Math.abs(x - mapWidth / 2) < 2) {
            return true;
        }
        
        return false;
    }
    
    draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, viewWidth: number, viewHeight: number): void {
        const startTileX = Math.floor(cameraX / this.tileSize);
        const startTileY = Math.floor(cameraY / this.tileSize);
        const endTileX = Math.ceil((cameraX + viewWidth) / this.tileSize);
        const endTileY = Math.ceil((cameraY + viewHeight) / this.tileSize);
        
        for (let y = Math.max(0, startTileY); y < Math.min(this.tiles.length, endTileY); y++) {
            for (let x = Math.max(0, startTileX); x < Math.min(this.tiles[0].length, endTileX); x++) {
                const tile = this.tiles[y][x];
                const screenX = x * this.tileSize - cameraX;
                const screenY = y * this.tileSize - cameraY;
                
                this.drawTile(ctx, tile, screenX, screenY);
            }
        }
    }
    
    drawTile(ctx: CanvasRenderingContext2D, tile: Tile, x: number, y: number): void {
        switch (tile.type) {
            case 'grass':
                ctx.fillStyle = '#2d5016';
                ctx.fillRect(x, y, this.tileSize, this.tileSize);
                // Grass details
                ctx.fillStyle = '#3d6826';
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(x + 8 + i * 8, y + 12, 4, 8);
                }
                break;
                
            case 'tree':
                ctx.fillStyle = '#1a3a0f';
                ctx.fillRect(x, y, this.tileSize, this.tileSize);
                // Tree trunk
                ctx.fillStyle = '#4a2511';
                ctx.fillRect(x + 12, y + 16, 8, 12);
                // Tree top with purple tint
                ctx.fillStyle = '#2d5016';
                ctx.fillRect(x + 4, y + 4, 24, 16);
                ctx.fillStyle = 'rgba(121, 14, 203, 0.2)';
                ctx.fillRect(x + 4, y + 4, 24, 16);
                break;
                
            case 'path':
                ctx.fillStyle = '#6b5d54';
                ctx.fillRect(x, y, this.tileSize, this.tileSize);
                // Path texture
                ctx.fillStyle = '#7b6d64';
                ctx.fillRect(x + 4, y + 4, 8, 8);
                ctx.fillRect(x + 20, y + 16, 8, 8);
                break;
                
            case 'ground':
            default:
                ctx.fillStyle = '#3a5a2a';
                ctx.fillRect(x, y, this.tileSize, this.tileSize);
                // Ground texture
                ctx.fillStyle = '#4a6a3a';
                ctx.fillRect(x + 8, y + 8, 4, 4);
                ctx.fillRect(x + 20, y + 20, 4, 4);
                break;
        }
    }
    
    /**
     * Get the tile type at a specific world position
     */
    getTileAt(x: number, y: number): Tile | null {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        if (tileY >= 0 && tileY < this.tiles.length && 
            tileX >= 0 && tileX < this.tiles[0].length) {
            return this.tiles[tileY][tileX];
        }
        
        return null;
    }
}
