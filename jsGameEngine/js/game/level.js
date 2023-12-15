// Import necessary classes and resources
import Game from '../engine/game.js';
import Player from './player.js';
import Enemy from './enemy.js';
import PlayerUI from './playerUI.js';
import Platform from './platform.js';
import Collectible from './collectible.js';
import { Images } from '../engine/resources.js';
import Jumpboost from './jumpboost.js';
import Power from './power.js';

// Define a class Level that extends the Game class from the engine
class Level extends Game {
  
  // Define the constructor for this class, which takes one argument for the canvas ID
  constructor(canvasId) {
    // Call the constructor of the superclass (Game) with the canvas ID
    super(canvasId);
    
    // Create a player object and add it to the game
    const player = new Player(this.canvas.width / 2 + 100, this.canvas.height / 2 - 25);
    this.addGameObject(player);
    
    // Add the player UI object to the game
    this.addGameObject(new PlayerUI(10, 10));

    // Set the game's camera target to the player
    this.camera.target = player;

    // Create background and add it to the game
    //this.addGameObject();

    // Define the platform's width and the gap between platforms
    const platformWidth = 150;
    const gap = 120;

    // Create platforms and add them to the game
    const platforms = [
      new Platform(0, this.canvas.height - 20, platformWidth, 25),
      new Platform(platformWidth + gap, this.canvas.height - 50, platformWidth, 25),
      new Platform(2 * (platformWidth + gap), this.canvas.height - 10, platformWidth, 25),
      new Platform(3 * (platformWidth + gap), this.canvas.height - 80, platformWidth, 25),
      new Platform(4 * (platformWidth + gap), this.canvas.height - 100, platformWidth, 25),
      new Platform(0, this.canvas.height - 150, platformWidth, 25),
      new Platform(2 * (platformWidth + gap + 10), this.canvas.height - 200, platformWidth, 25),
      new Platform(platformWidth + gap + 10, this.canvas.height - 250, platformWidth, 25),
      new Platform(platformWidth + gap + 300, this.canvas.height - 390, platformWidth, 25),
    ];
    for (const platform of platforms) {
      this.addGameObject(platform);
    }

    // Create enemies and add them to the game
    this.addGameObject(new Enemy(30, this.canvas.height - 90));
    this.addGameObject(new Enemy(platformWidth + gap + 30, this.canvas.height - 90));
    this.addGameObject(new Enemy(2 * (platformWidth + gap) + 30, this.canvas.height - 90));

    // Create collectibles and add them to the game
    this.addGameObject(new Collectible(60, this.canvas.height - 80, 30, 30));
    this.addGameObject(new Collectible(630, this.canvas.height - 440, 30, 30));
    this.addGameObject(new Collectible(610, this.canvas.height - 60, 30, 30));

    this.addGameObject(new Jumpboost(620, this.canvas.height - 240, 20, 20));

    this.addGameObject(new Power(880, this.canvas.height - 120, 20, 20));

  }
  
}

// Export the Level class as the default export of this module
export default Level;
