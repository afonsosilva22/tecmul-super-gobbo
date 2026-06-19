const animationDefinitions = [
    { key: 'idle', texture: 'idle', start: 0, end: 3, frameRate: 5, repeat: -1 },
    { key: 'walk', texture: 'walk', start: 0, end: 5, frameRate: 10, repeat: -1 },
    { key: 'sprint', texture: 'sprint', start: 0, end: 5, frameRate: 15, repeat: -1 },
    { key: 'jump', texture: 'jump', start: 0, end: 7, frameRate: 10, repeat: -1 },
    { key: 'climb', texture: 'climb', start: 0, end: 3, frameRate: 8, repeat: -1 },
    { key: 'push',  texture: 'push',  start: 0, end: 5, frameRate: 8, repeat: -1 },
    { key: 'attack1', texture: 'attack1', start: 0, end: 5, frameRate: 14, repeat: 0 },
    { key: 'attack2', texture: 'attack2', start: 0, end: 5, frameRate: 14, repeat: 0 },
    { key: 'enemy1_walk',    texture: 'enemy1_walk',    start: 0, end: 8, frameRate: 10, repeat: -1 },
    { key: 'enemy1_attack1', texture: 'enemy1_attack1', start: 0, end: 5, frameRate: 10, repeat: 0  },
    { key: 'enemy1_idle',    texture: 'enemy1_idle',    start: 0, end: 4, frameRate: 6,  repeat: -1 },
    { key: 'enemy1_hurt',    texture: 'enemy1_hurt',    start: 0, end: 2, frameRate: 12, repeat: 0  },
    { key: 'enemy1_dead',    texture: 'enemy1_dead',    start: 0, end: 1, frameRate: 8,  repeat: 0  }
];

export const createGameAnimations = (scene) => {
    animationDefinitions.forEach(({ key, texture, start, end, frameRate, repeat }) => {
        if (scene.anims.exists(key)) return;

        scene.anims.create({
            key,
            frames: scene.anims.generateFrameNumbers(texture, { start, end }),
            frameRate,
            repeat
        });
    });
}
