// Importing necessary components and resources
import GameObject from '../engine/gameobject.js';
import Renderer from '../engine/renderer.js';
import Physics from '../engine/physics.js';
import Input from '../engine/input.js';
import { Images } from '../engine/resources.js';
import Enemy from './enemy.js';
import Platform from './platform.js';
import Collectible from './collectible.js';
import Jumpboost from './jumpboost.js';
import Power from './power.js';
import ParticleSystem from '../engine/particleSystem.js';

// Defining a class Player that extends GameObject
class Player extends GameObject {
  // Constructor initializes the game object and add necessary components
  constructor(x, y) {
    super(x, y); // Call parent's constructor
    this.renderer = new Renderer('blue', 50, 50, Images.player); // Add renderer
    this.addComponent(this.renderer);
    this.addComponent(new Physics({ x: 0, y: 0 }, { x: 0, y: 0 })); // Add physics
    this.addComponent(new Input()); // Add input for handling user input
    // Initialize all the player specific properties
    this.direction = 1;
    this.lives = 2;
    this.score = 0;
    this.isOnPlatform = false;
    this.isJumping = false;
    this.jumpForce = 200;
    this.jumpTime = 0.2;
    this.jumpTimer = 0;
    this.power = 0;
    this.isInvulnerable = false;
    this.isGamepadMovement = false;
    this.isGamepadJump = false;
  }

  // The update function runs every frame and contains game logic
  update(deltaTime) {
    const physics = this.getComponent(Physics); // Get physics component
    const input = this.getComponent(Input); // Get input component

    this.handleGamepadInput(input);
    
    // Handle player movement
    if (!this.isGamepadMovement && input.isKeyDown('ArrowRight')) {
      physics.velocity.x = 150;
      this.direction = 1;
    } else if (!this.isGamepadMovement && input.isKeyDown('ArrowLeft')) {
      physics.velocity.x = -150;
      this.direction = -1;
    } else if (!this.isGamepadMovement) {
      physics.velocity.x = 0;
    }

    // Handle player jumping
    if (!this.isGamepadJump && input.isKeyDown('ArrowUp') && this.isOnPlatform) {
      this.startJump();
    }

    if (this.isJumping) {
      this.updateJump(deltaTime);
    }

    // Handle collisions with collectibles
    const collectibles = this.game.gameObjects.filter((obj) => obj instanceof Collectible);
    for (const collectible of collectibles) {
      if (physics.isColliding(collectible.getComponent(Physics))) {
        this.collect(collectible);
        this.game.removeGameObject(collectible);
      }
    }

    // Handle collisions with jumpboosts
    const jumpboosts = this.game.gameObjects.filter((obj) => obj instanceof Jumpboost);
    for (const jumpboost of jumpboosts) {
      if (physics.isColliding(jumpboost.getComponent(Physics))) {
        this.collectBoost(jumpboost);
        this.game.removeGameObject(jumpboost);
      }
    }

    // Handle collisions with powers
    const powers = this.game.gameObjects.filter((obj) => obj instanceof Power);
    for (const power of powers) {
      if (physics.isColliding(power.getComponent(Physics))) {
        this.collectPower(power);
        this.game.removeGameObject(power);
      }
    }
  
    // Handle collisions with enemies
    const enemies = this.game.gameObjects.filter((obj) => obj instanceof Enemy);
    for (const enemy of enemies) {
      if (physics.isColliding(enemy.getComponent(Physics))) {
        if(this.power > 0){
          this.isInvulnerable = true;
          this.power--;
          this.emitKillParticles(enemy);
          this.game.removeGameObject(enemy);
          setTimeout(() => {
            this.isInvulnerable = false;
          }, 1000);
        }
        else{
          this.collidedWithEnemy();
        }
      }
    }
  
    // Handle collisions with platforms
    this.isOnPlatform = false;  // Reset this before checking collisions with platforms
    const platforms = this.game.gameObjects.filter((obj) => obj instanceof Platform);
    for (const platform of platforms) {
      if (physics.isColliding(platform.getComponent(Physics))) {
        if (!this.isJumping) {
          physics.velocity.y = 0;
          physics.acceleration.y = 0;
          this.y = platform.y - this.renderer.height;
          this.isOnPlatform = true;
        }
      }
    }
  
    // Check if player has fallen off the bottom of the screen
    if (this.y > this.game.canvas.height) {
      this.resetPlayerState();
    }

    // Check if player has no lives left
    if (this.lives <= 0) {
      this.resetGame();
      alert('Game Over');
      location.reload();
    }

    // Check if player has collected all collectibles
    if (this.score >= 3) {
        this.resetGame();
        alert('You win!');
        location.reload();
    }

    super.update(deltaTime);
  }

  handleGamepadInput(input){
    const gamepad = input.getGamepad(); // Get the gamepad input
    const physics = this.getComponent(Physics); // Get physics component
    if (gamepad) {
      // Reset the gamepad flags
      this.isGamepadMovement = false;
      this.isGamepadJump = false;

      // Handle movement
      const horizontalAxis = gamepad.axes[0];
      // Move right
      if (horizontalAxis > 0.1) {
        this.isGamepadMovement = true;
        physics.velocity.x = 100;
        this.direction = -1;
      } 
      // Move left
      else if (horizontalAxis < -0.1) {
        this.isGamepadMovement = true;
        physics.velocity.x = -100;
        this.direction = 1;
      } 
      // Stop
      else {
        physics.velocity.x = 0;
      }
      
      // Handle jump, using gamepad button 0 (typically the 'A' button on most gamepads)
      if (input.isGamepadButtonDown(0) && this.isOnPlatform) {
        this.isGamepadJump = true;
        this.startJump();
      }
    }
  }

  startJump() {
    // Initiate a jump if the player is on a platform
    if (this.isOnPlatform) { 
      this.isJumping = true;
      this.jumpTimer = this.jumpTime;
      this.getComponent(Physics).velocity.y = -this.jumpForce;
      this.isOnPlatform = false;
    }
  }
  
  updateJump(deltaTime) {
    // Updates the jump progress over time
    this.jumpTimer -= deltaTime;
    if (this.jumpTimer <= 0 || this.getComponent(Physics).velocity.y > 0) {
      this.isJumping = false;
    }
  }

  collidedWithEnemy() {
    // Checks collision with an enemy and reduce player's life if not invulnerable
    if (!this.isInvulnerable && this.power == 0){
      this.lives--;
      this.isInvulnerable = true;
      this.emitHitParticles();
      // Make player vulnerable again after 2 seconds
      setTimeout(() => {
        this.isInvulnerable = false;
      }, 2000);
      this.resetPlayerState();
    }
  }

  collectBoost(jumpboost) {
    this.jumpForce = 400;
    setTimeout(() => {
      this.jumpForce = 200;
    }, 5000);
    this.emitCollectBoostParticles(jumpboost);
  }

  collect(collectible) {
    // Handle collectible pickup
    this.score += collectible.value;
    console.log(`Score: ${this.score}`);
    this.emitCollectParticles(collectible);
  }

  collectPower(power) {
    // Handle power pickup
    this.power += power.value;
    console.log(`Power: ${this.power}`);
    this.emitCollectPowerParticles(power);
  }

  emitCollectParticles() {
    // Create a particle system at the player's position when a collectible is collected
    const particleSystem = new ParticleSystem(this.x, this.y, 'yellow', 30, 1, 0.5);
    this.game.addGameObject(particleSystem);
  }

  emitCollectBoostParticles(){
    // Create a particle system at the player's position when a jumpboost is collected
    const particleSystem = new ParticleSystem(this.x, this.y, 'white', 30, 1, 0.5);
    this.game.addGameObject(particleSystem);
  }

  emitCollectPowerParticles(){
    // Create a particle system at the player's position when a jumpboost is collected
    const particleSystem = new ParticleSystem(this.x, this.y, 'white', 30, 1, 0.5);
    this.game.addGameObject(particleSystem);
  }

  emitHitParticles(){
    const particleSystem = new ParticleSystem(this.x, this.y, 'red', 40, 1.5, 1);
    this.game.addGameObject(particleSystem);
  }

  emitKillParticles(){
    const particleSystem = new ParticleSystem(this.x, this.y, 'limegreen', 40, 1.5, 1);
    this.game.addGameObject(particleSystem);
  }

  resetPlayerState() {
    // Reset the player's state, repositioning it and nullifying movement
    this.x = this.game.canvas.width / 2 + 100;
    this.y = this.game.canvas.height / 2 - 25;
    this.getComponent(Physics).velocity = { x: 0, y: 0 };
    this.getComponent(Physics).acceleration = { x: 0, y: 0 };
    this.direction = 1;
    this.isOnPlatform = false;
    this.isJumping = false;
    this.jumpTimer = 0;
  }

  resetGame() {
    // Reset the game state, which includes the player's state
    this.lives = 2;
    this.score = 0;this.emitCollectParticles
    this.power = 0;
    this.resetPlayerState();
  }
}

export default Player;
