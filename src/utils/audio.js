import { gameState } from '../state.js';
import { assetPath } from './assets.js';

export const loadGameAudio = (scene) => {
    scene.load.audio('background', assetPath('assets/audio/background.mp3'));
    scene.load.audio('walkSound', assetPath('assets/audio/walkSound.wav'));
    scene.load.audio('sprintSound', assetPath('assets/audio/runSound.flac'));
    scene.load.audio('jumpFX', assetPath('assets/audio/jumpFX.wav'));
    scene.load.audio('swordFX', assetPath('assets/audio/swordFX.wav'));
}

export const playBackgroundMusic = (scene) => {
    if (!gameState.backgroundMusic) {
        gameState.backgroundMusic = scene.sound.add('background', { loop: true, volume: gameState.musicVolume });
    }

    gameState.backgroundMusic.setVolume(gameState.musicVolume);

    if (!gameState.backgroundMusic.isPlaying) {
        gameState.backgroundMusic.play();
    }
}

export const setMusicVolume = (volume) => {
    gameState.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    gameState.backgroundMusic?.setVolume(gameState.musicVolume);
}

export const setEffectsVolume = (volume) => {
    gameState.effectsVolume = Phaser.Math.Clamp(volume, 0, 1);
    gameState.walkSound?.setVolume(gameState.effectsVolume);
    gameState.sprintSound?.setVolume(gameState.effectsVolume);
    gameState.jumpFX?.setVolume(gameState.effectsVolume);
    gameState.swordFX?.setVolume(gameState.effectsVolume);
}

export const stopMovementSounds = () => {
    gameState.walkSound?.stop();
    gameState.sprintSound?.stop();
}
