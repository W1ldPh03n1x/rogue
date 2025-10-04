var Item = (function () {
  function Item(name, effect) {
    this.name = name;
    this.effect = effect;
  }

  var self = Item.prototype;

  self.applyTo = function (character) {
    this.effect(character);
  };

  return Item;
})();

var ItemsEffects = {
  heal: function (health) {
    return function (character) {
      character.takeHeal(health);
    };
  },
  increaseDamage: function (damage) {
    return function (character) {
      character.increaseDamage(damage);
    };
  },
};

var HealingPoution = (function () {
  function HealthPoution(health) {
    Item.call(this, "healingPoution", ItemsEffects.heal(health));
  }

  inherit(HealthPoution, Item);

  return HealthPoution;
})();

var Sword = (function () {
  function Sword(damage) {
    Item.call(this, "sword", ItemsEffects.increaseDamage(damage));
  }

  inherit(Sword, Item);

  return Sword;
})();
