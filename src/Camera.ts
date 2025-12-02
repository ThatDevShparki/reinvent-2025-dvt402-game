import { Vector2 } from './types.js';
import { Player } from './Player.js';

export class Camera {
    x: number = 0;
    y: number = 0;
    viewWidth: number;
    viewHeight: number;
    mapWidth: number;
    mapHeight: number;
    
    constructor(viewWidth: number, viewHeight: number, mapWidth: number, mapHeight: number) {
        this.viewWidth = viewWidth;
        this.viewHeight = viewHeight;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
    }
    
    follow(player: Player): void {
        // Center camera on player
        this.x = player.position.x + player.size / 2 - this.viewWidth / 2;
        this.y = player.position.y + player.size / 2 - this.viewHeight / 2;
        
        // Clamp camera to map bounds
        this.x = Math.max(0, Math.min(this.x, this.mapWidth - this.viewWidth));
        this.y = Math.max(0, Math.min(this.y, this.mapHeight - this.viewHeight));
    }
}
