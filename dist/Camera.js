export class Camera {
    constructor(viewWidth, viewHeight, mapWidth, mapHeight) {
        this.x = 0;
        this.y = 0;
        this.viewWidth = viewWidth;
        this.viewHeight = viewHeight;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
    }
    follow(player) {
        // Center camera on player
        this.x = player.position.x + player.size / 2 - this.viewWidth / 2;
        this.y = player.position.y + player.size / 2 - this.viewHeight / 2;
        // Clamp camera to map bounds
        this.x = Math.max(0, Math.min(this.x, this.mapWidth - this.viewWidth));
        this.y = Math.max(0, Math.min(this.y, this.mapHeight - this.viewHeight));
    }
}
