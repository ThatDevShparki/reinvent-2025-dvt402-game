export interface Vector2 {
    x: number;
    y: number;
}

export interface Tile {
    type: 'grass' | 'tree' | 'ground' | 'path';
    solid: boolean;
}

export enum Direction {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right'
}
