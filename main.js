var GAME_FIELD_WIDTH = 40;
var GAME_FIELD_HEIGHT = 24;

var GENERATION_ITERATIONS_MAX_COUNT = 1000;

var PlayerConfig = {
  health: 20,
  attack: 4,
};

var EnemyConfig = {
  health: 10,
  attack: 3,
};

var GameConfig = {
  enemies: 10,
  healingPoutions: 10,
  swords: 2,
};

var Game = (function () {
  function Game() {
    this.player = null;
    this.map = null;
    this.dungeon = null;
    this.items = [];
    this.enemies = [];
    this.inventory = [];
    this.tilesToRerender = [];

    this.status = "notinitialized";
  }

  var self = Game.prototype;

  self.init = function (renderer) {
    this.renderer = renderer;
    this.dungeon = new Dungeon(GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT);

    this.setStatus("initialized");
  };

  self.start = function () {
    this.setup();

    this.setStatus("started");
  };

  self.setup = function () {
    this.map = null;
    this.items = [];
    this.enemies = [];
    this.inventory = [];
    this.tilesToRerender = [];
    this.dungeon = new Dungeon(GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT);

    this.generateMap();

    this.addInitItems();

    this.addPlayer();

    this.eddEnemies();

    this.renderer.renderMap(this.map);
  };

  self.generateMap = function () {
    this.map = [];

    for (var y = 0; y < this.dungeon.height; y++) {
      this.map[y] = [];
      for (var x = 0; x < this.dungeon.width; x++) {
        this.map[y][x] = new Tile(x, y);
      }
    }

    let layoutCoordinates = this.dungeon.getLayoutCoordinates();

    for (var i = 0; i < layoutCoordinates.length; i++) {
      this.map[layoutCoordinates[i].y][layoutCoordinates[i].x]
        .setType("floor")
        .setStructure(layoutCoordinates[i].structure);
    }
  };

  self.addInitItems = function () {
    var healingPoutions = new Array(GameConfig.healingPoutions)
      .fill(null)
      .map(function () {
        return new HealingPoution(20);
      });
    var swords = new Array(GameConfig.swords).fill(null).map(function () {
      return new Sword(3);
    });

    healingPoutions.forEach(this.addItemToRandomPlace, this);

    swords.forEach(this.addItemToRandomPlace, this);
  };

  self.addPlayer = function () {
    var tile = this.getRandomPlace(function (tile) {
      return tile.character === null && tile.items.length === 0;
    });

    this.player = new Player(tile.x, tile.y);

    tile.setCharacter(this.player);
  };

  self.eddEnemies = function () {
    let enemies = new Array(GameConfig.enemies)
      .fill(null)
      .map(this.addEnemyToRandomPlace, this);

    this.enemies = enemies;
  };

  self.addEnemyToRandomPlace = function () {
    var tile = this.getRandomPlace(function (tile) {
      return (
        tile.character === null &&
        tile.items.length === 0 &&
        tile.structure instanceof Room
      );
    });

    var enemy = new Enemy(tile.x, tile.y);

    tile.setCharacter(enemy);

    return enemy;
  };

  self.addItemToRandomPlace = function (item, emptyOnly) {
    var empty = emptyOnly || false;

    var tile = this.getRandomPlace(function (tile) {
      return !tile.items.some(function (tileItem) {
        var itemClass = empty ? Item : item.constructor;
        return tileItem instanceof itemClass;
      });
    });

    return tile.addItem(item);
  };

  self.getRandomPlace = function (condition) {
    var coords = this.dungeon.getRandomCoordinate();

    if (condition) {
      var iterations = 0;
      while (
        !condition(this.map[coords.y][coords.x]) &&
        iterations++ < GENERATION_ITERATIONS_MAX_COUNT
      )
        coords = this.dungeon.getRandomCoordinate();
    }

    return this.map[coords.y][coords.x];
  };

  self.executeIteration = function (event) {
    if (this.status !== "started") return;

    var turn = this.handleAndParseKeyboardInput(event);
    if (!turn) return;

    switch (turn.type) {
      case "movement":
        this.movePlayer(turn.movement.dx, turn.movement.dy);
        break;
      case "attack":
        this.handlePlayerAttack();
    }

    this.checkEnemiesLiveness();

    this.enemies.forEach(function (enemy) {
      this.enemyMove(enemy);
    }, this);

    this.renderer.updateTiles(this.tilesToRerender);
    this.tilesToRerender.length = 0;

    this.checkPlayerLiveness();
  };

  self.handleAndParseKeyboardInput = function (event) {
    var movements = {
      KeyW: { dx: 0, dy: -1 },
      KeyA: { dx: -1, dy: 0 },
      KeyS: { dx: 0, dy: 1 },
      KeyD: { dx: 1, dy: 0 },
    };

    switch (event.code) {
      case "KeyW":
      case "KeyA":
      case "KeyS":
      case "KeyD":
        event.preventDefault();
        return { type: "movement", movement: movements[event.code] };
      case "Space":
        event.preventDefault();
        return { type: "attack" };
      default:
        return null;
    }
  };

  self.movePlayer = function (dx, dy) {
    var newPosition = this.shiftCharacterTo(this.player, dx, dy);
    if (newPosition) {
      newPosition.items.forEach(function (item) {
        item.applyTo(this.player);
      }, this);
      newPosition.clearItems();
    }
  };

  self.moveCharacterTo = function (character, targetX, targetY) {
    var currentTile = this.getTile(character.x, character.y);
    var targetTile = this.getTile(targetX, targetY);

    if (targetTile && targetTile.canWalk()) {
      currentTile.clearCharacter();
      targetTile.setCharacter(character);
      character.moveTo(targetX, targetY);

      this.addTileToRerender(currentTile);
      this.addTileToRerender(targetTile);

      return targetTile;
    }

    return null;
  };

  self.shiftCharacterTo = function (character, dx, dy) {
    return this.moveCharacterTo(character, character.x + dx, character.y + dy);
  };

  self.handlePlayerAttack = function () {
    for (var y = this.player.y - 1; y < this.player.y + 2; y++) {
      for (var x = this.player.x - 1; x < this.player.x + 2; x++) {
        if (x !== this.player.x || y !== this.player.y) {
          var tile = this.getTile(x, y);
          if (tile && tile.character) {
            this.player.attack(tile.character);
            this.addTileToRerender(tile);
          }
        }
      }
    }
  };

  self.checkEnemiesLiveness = function () {
    this.enemies = this.enemies.filter(function (enemy) {
      if (enemy.isDead()) {
        var enemyTile = this.getTile(enemy.x, enemy.y);

        enemyTile.clearCharacter();

        this.addTileToRerender(enemyTile);

        return false;
      }
      return true;
    }, this);

    if (this.enemies.length === 0) this.setStatus("won");
  };

  self.checkPlayerLiveness = function () {
    if (this.player.isDead()) this.setStatus("over");
  };

  self.displayGameResult = function () {};

  self.enemyMove = function (enemy) {
    var enemyTile = this.getTile(enemy.x, enemy.y);
    var playerTile = this.getTile(this.player.x, this.player.y);

    if (enemyTile.structure === playerTile.structure) {
      if (this.checkEnemyNearToPlayer(enemy)) {
        this.enemyAttackPlayer(enemy);
      } else {
        this.enemyGoToPlayer(enemy);
      }
    } else {
      this.enemyRandomMovement(enemy);
    }
  };

  self.checkEnemyNearToPlayer = function (enemy) {
    const dx = Math.abs(this.player.x - enemy.x);
    const dy = Math.abs(this.player.y - enemy.y);

    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  };

  self.enemyGoToPlayer = function (enemy) {
    var directionVector = {
      x: this.player.x - enemy.x,
      y: this.player.y - enemy.y,
    };

    var xStep = directionVector.x / Math.abs(directionVector.x);
    var yStep = directionVector.y / Math.abs(directionVector.y);

    if (Math.random() < 0.9) {
      if (
        Math.random() <
        directionVector.x / (directionVector.x + directionVector.y)
      ) {
        this.shiftCharacterTo(enemy, xStep, 0);
      } else {
        this.shiftCharacterTo(enemy, 0, yStep);
      }
    }
  };

  self.enemyRandomMovement = function (enemy) {
    var direction = Math.random() > 0.5 ? -1 : +1;

    if (Math.random() > 0.5) {
      this.shiftCharacterTo(enemy, direction, 0);
    } else {
      this.shiftCharacterTo(enemy, 0, direction);
    }
  };

  self.enemyAttackPlayer = function (enemy) {
    enemy.attack(this.player);
    this.addTileToRerender(this.getTile(this.player.x, this.player.y));
  };

  self.getTile = function (x, y) {
    if (
      x < 0 ||
      x > this.dungeon.width - 1 ||
      y < 0 ||
      y > this.dungeon.height - 1
    )
      return null;
    return this.map[y][x];
  };

  self.addTileToRerender = function (tile) {
    for (var i = 0; i < this.tilesToRerender.length; i++)
      if (this.tilesToRerender[i] === tile) return;

    this.tilesToRerender.push(tile);
  };

  self.setStatus = function (status) {
    var body = document.querySelector("body");
    body.classList.remove(this.status);
    this.status = status;
    body.classList.add(status);
  };

  return Game;
})();

var Tile = (function () {
  function Tile(x, y, type, structure) {
    this.x = x;
    this.y = y;
    this.type = typeof type == "undefined" ? "wall" : type;
    this.character = null;
    this.items = [];
    this.structure = structure || null;
  }

  var self = Tile.prototype;

  self.canWalk = function () {
    return this.type !== "wall" && !this.character;
  };

  self.addItem = function (item) {
    this.items.push(item);

    return this;
  };

  self.deleteItem = function (targetItem) {
    this.items = this.items.filter(function (item) {
      return item !== targetItem;
    });

    return this;
  };

  self.clearItems = function () {
    this.items.length = 0;

    return this;
  };

  self.setType = function (type) {
    this.type = type;

    return this;
  };

  self.setStructure = function (structure) {
    this.structure = structure;

    return this;
  };

  self.setCharacter = function (character) {
    this.character = character;

    return this;
  };

  self.clearCharacter = function () {
    this.character = null;

    return this;
  };

  return Tile;
})();
