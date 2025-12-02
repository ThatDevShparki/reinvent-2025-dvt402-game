import { Direction } from './types.js';
export class Player {
    constructor(x, y) {
        this.size = 32;
        // Physics constants
        this.acceleration = 0.5;
        this.friction = 0.85;
        this.maxSpeed = 3;
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.direction = Direction.DOWN;
    }
    update(keys, collisionMap) {
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
        if (Math.abs(this.velocity.x) < 0.01)
            this.velocity.x = 0;
        if (Math.abs(this.velocity.y) < 0.01)
            this.velocity.y = 0;
        // Check collision and move
        this.moveWithCollision(collisionMap);
    }
    moveWithCollision(collisionMap) {
        const tileSize = 32;
        // Try X movement
        const newX = this.position.x + this.velocity.x;
        if (!this.checkCollision(newX, this.position.y, collisionMap, tileSize)) {
            this.position.x = newX;
        }
        else {
            this.velocity.x = 0;
        }
        // Try Y movement
        const newY = this.position.y + this.velocity.y;
        if (!this.checkCollision(this.position.x, newY, collisionMap, tileSize)) {
            this.position.y = newY;
        }
        else {
            this.velocity.y = 0;
        }
    }
    checkCollision(x, y, collisionMap, tileSize) {
        const margin = 8; // Collision box smaller than sprite
        const corners = [
            { x: x + margin, y: y + margin },
            { x: x + this.size - margin, y: y + margin },
            { x: x + margin, y: y + this.size - margin },
            { x: x + this.size - margin, y: y + this.size - margin }
        ];
        for (const corner of corners) {
            const tileX = Math.floor(corner.x / tileSize);
            const tileY = Math.floor(corner.y / tileSize);
            if (tileY >= 0 && tileY < collisionMap.length &&
                tileX >= 0 && tileX < collisionMap[0].length) {
                if (collisionMap[tileY][tileX]) {
                    return true;
                }
            }
        }
        return false;
    }
    draw(ctx, cameraX, cameraY) {
        const screenX = this.position.x - cameraX;
        const screenY = this.position.y - cameraY;
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
