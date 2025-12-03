import { Vector2, Direction } from './types.js';

export class Player {
    position: Vector2;
    velocity: Vector2;
    direction: Direction;
    size: number = 32;
    
    // Physics constants
    acceleration: number = 0.5;
    friction: number = 0.85;
    maxSpeed: number = 3;
    
    constructor(x: number, y: number) {
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.direction = Direction.DOWN;
    }
    
    update(keys: Set<string>, collisionMap: boolean[][]): void {
        // Apply input acceleration
        let inputX = 0;
        let inputY = 0;
        
        if (keys.has('ArrowUp') || keys.has('w')) {
            inputY = -1;
            this.direction = Direction.UP;
        }
        if (keys.has('ArrowDown') || keys.has('s')) {
            inputY = 1;
            this.direction = Direction.DOWN;
        }
        if (keys.has('ArrowLeft') || keys.has('a')) {
            inputX = -1;
            this.direction = Direction.LEFT;
        }
        if (keys.has('ArrowRight') || keys.has('d')) {
            inputX = 1;
            this.direction = Direction.RIGHT;
        }
        
        // Apply acceleration
        this.velocity.x += inputX * this.acceleration;
        this.velocity.y += inputY * this.acceleration;
        
        // Apply friction
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        
        // Clamp to max speed
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (speed > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
        }
        
        // Stop if very slow
        if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0;
        if (Math.abs(this.velocity.y) < 0.01) this.velocity.y = 0;
        
        // Check collision and move
        this.moveWithCollision(collisionMap);
    }
    
    moveWithCollision(collisionMap: boolean[][]): void {
        const tileSize = 32;
        
        // Try X movement
        const newX = this.position.x + this.velocity.x;
        if (!this.checkCollision(newX, this.position.y, collisionMap, tileSize)) {
            this.position.x = newX;
        } else {
            this.velocity.x = 0;
        }
        
        // Try Y movement
        const newY = this.position.y + this.velocity.y;
        if (!this.checkCollision(this.position.x, newY, collisionMap, tileSize)) {
            this.position.y = newY;
        } else {
            this.velocity.y = 0;
        }
    }
    
    checkCollision(x: number, y: number, collisionMap: boolean[][], tileSize: number): boolean {
        // Collision box is slightly smaller than sprite for better feel
        const margin = 4; // Reduced margin for tighter collision
        
        // Check multiple points around the player's bounding box
        const checkPoints = [
            // Four corners
            { x: x + margin, y: y + margin },
            { x: x + this.size - margin - 1, y: y + margin },
            { x: x + margin, y: y + this.size - margin - 1 },
            { x: x + this.size - margin - 1, y: y + this.size - margin - 1 },
            // Midpoints on each edge for better detection
            { x: x + this.size / 2, y: y + margin },
            { x: x + this.size / 2, y: y + this.size - margin - 1 },
            { x: x + margin, y: y + this.size / 2 },
            { x: x + this.size - margin - 1, y: y + this.size / 2 }
        ];
        
        for (const point of checkPoints) {
            const tileX = Math.floor(point.x / tileSize);
            const tileY = Math.floor(point.y / tileSize);
            
            // Check bounds
            if (tileY >= 0 && tileY < collisionMap.length && 
                tileX >= 0 && tileX < collisionMap[0].length) {
                if (collisionMap[tileY][tileX]) {
                    return true;
                }
            } else {
                // Out of bounds counts as collision
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get the center position of the player (useful for tile lookups and encounters)
     */
    getCenterPosition(): Vector2 {
        return {
            x: this.position.x + this.size / 2,
            y: this.position.y + this.size / 2
        };
    }
    
    /**
     * Get the tile coordinates the player is currently on
     */
    getCurrentTile(): { tileX: number, tileY: number } {
        const center = this.getCenterPosition();
        return {
            tileX: Math.floor(center.x / 32),
            tileY: Math.floor(center.y / 32)
        };
    }
    
    draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, debugCollision: boolean = false): void {
        const screenX = this.position.x - cameraX;
        const screenY = this.position.y - cameraY;
        
        // Draw collision box debug visualization
        if (debugCollision) {
            const margin = 4;
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                screenX + margin, 
                screenY + margin, 
                this.size - margin * 2, 
                this.size - margin * 2
            );
        }
        
        // Draw simple character (will be replaced with sprite)
        ctx.fillStyle = '#790ECB';
        ctx.fillRect(screenX, screenY, this.size, this.size);
        
        // Draw face direction indicator
        ctx.fillStyle = '#ffffff';
        const centerX = screenX + this.size / 2;
        const centerY = screenY + this.size / 2;
        
        switch (this.direction) {
            case Direction.UP:
                ctx.fillRect(centerX - 4, screenY + 8, 8, 4);
                break;
            case Direction.DOWN:
                ctx.fillRect(centerX - 4, screenY + this.size - 12, 8, 4);
                break;
            case Direction.LEFT:
                ctx.fillRect(screenX + 8, centerY - 4, 4, 8);
                break;
            case Direction.RIGHT:
                ctx.fillRect(screenX + this.size - 12, centerY - 4, 4, 8);
                break;
        }
        
        // Draw Kiro-themed hat
        ctx.fillStyle = '#790ECB';
        ctx.fillRect(screenX + 4, screenY + 2, 24, 8);
    }
}
