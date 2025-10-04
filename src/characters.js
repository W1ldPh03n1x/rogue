var Character = (function () {
  function Character(x, y, health, damage) {
    this.x = x;
    this.y = y;
    this.maxHealth = health;
    this.health = health;
    this.damage = damage;
  }

  var self = Character.prototype;

  self.attack = function (character) {
    character.takeDamage(this.damage);
  };

  self.takeDamage = function (damage) {
    this.health = Math.max(0, this.health - damage);
  };

  self.takeHeal = function (health) {
    this.health = Math.min(this.maxHealth, this.health + health);
  };

  self.increaseDamage = function (damage) {
    this.damage += damage;
  };

  self.getPosition = function () {
    return { x: this.x, y: this.y };
  };

  self.moveTo = function (x, y) {
    this.x = x;
    this.y = y;
  };

  self.getHealthPercents = function () {
    return Math.round((this.health / this.maxHealth) * 100);
  };

  self.isDead = function () {
    return this.health === 0;
  };

  return Character;
})();

var Player = (function Player() {
  function Player(x, y, health, attack) {
    Character.call(
      this,
      x,
      y,
      typeof health === "undefined" ? PlayerConfig.health : health,
      typeof attack === "undefined" ? PlayerConfig.attack : attack
    );
  }

  inherit(Player, Character);

  return Player;
})();

var Enemy = (function () {
  function Enemy(x, y, health, attack) {
    Character.call(
      this,
      x,
      y,
      typeof health === "undefined" ? EnemyConfig.health : health,
      typeof attack === "undefined" ? EnemyConfig.attack : attack
    );
  }

  inherit(Enemy, Character);

  return Enemy;
})();
