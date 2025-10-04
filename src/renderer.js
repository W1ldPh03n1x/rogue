var Renderer = (function () {
  function Renderer(containerSelector, tileSize) {
    this.container = document.querySelector(containerSelector);
    this.tileSize = tileSize;
    this.tileElementsMatrix = null;
  }

  var self = Renderer.prototype;

  self.createTileElement = function (tile) {
    var tileElement = this.setTileState(document.createElement("div"), tile);

    tileElement.setAttribute("data-x", tile.x);
    tileElement.setAttribute("data-y", tile.y);
    if (tile.structure) {
      tileElement.setAttribute(
        "data-structure",
        tile.structure.constructor.name
      );
    }

    return tileElement;
  };

  self.updateTiles = function (tiles) {
    tiles.forEach(function (tile) {
      this.tileElementsMatrix[tile.y][tile.x] = this.setTileState(
        this.tileElementsMatrix[tile.y][tile.x],
        tile
      );
    }, this);
  };

  self.setTileState = function (tileElement, tile) {
    tileElement.className = "tile";
    tileElement.replaceChildren();

    if (tile.type === "wall") tileElement.classList.add("tileW");

    tileElement.style.left = tile.x * this.tileSize + "px";
    tileElement.style.top = tile.y * this.tileSize + "px";

    if (tile.character) {
      if (tile.character instanceof Player) tileElement.classList.add("tileP");
      if (tile.character instanceof Enemy) tileElement.classList.add("tileE");

      var healthBarElement = document.createElement("div");
      healthBarElement.classList.add("health");
      (healthBarElement.style.width = tile.character.getHealthPercents() + "%"),
        tileElement.appendChild(healthBarElement);
    }

    for (var i = 0; i < tile.items.length; i++) {
      switch (tile.items[i].name) {
        case "healingPoution":
          tileElement.classList.add("tileHP");
          break;
        case "sword":
          tileElement.classList.add("tileSW");
      }
    }

    return tileElement;
  };

  self.renderMap = function (map) {
    this.height = map.length;
    this.width = map[0].length;
    this.tileElementsMatrix = [];

    var tileElementsFragment = document.createDocumentFragment();

    for (var y = 0; y < this.height; y++) {
      this.tileElementsMatrix[y] = [];
      for (var x = 0; x < this.width; x++) {
        var tileElement = this.createTileElement(map[y][x]);
        this.tileElementsMatrix[y][x] = tileElement;
        tileElementsFragment.appendChild(tileElement);
      }
    }
    this.container.replaceChildren(tileElementsFragment);
  };

  return Renderer;
})();
