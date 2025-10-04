function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getRandomIntFromRange(a, b) {
  return getRandomInt(b - a) + a;
}

function getRandomArrayItem(array) {
  return array[getRandomIntFromRange(0, array.length)];
}

function inherit(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
}

var DisjointSet = (function () {
  function DisjointSet(size) {
    this.parent = new Array(size);
    this.rank = new Array(size);

    for (var i = 0; i < size; i++) {
      this.makeSet(i);
    }
  }

  var self = DisjointSet.prototype;

  self.makeSet = function (v) {
    this.parent[v] = v;
    this.rank[v] = 0;
  };

  self.find = function (v) {
    if (this.parent[v] !== v) {
      this.parent[v] = this.find(this.parent[v]);
    }
    return this.parent[v];
  };

  self.union = function (a, b) {
    var rootA = this.find(a);
    var rootB = this.find(b);

    if (rootA === rootB) return;

    if (this.rank[rootA] < this.rank[rootB]) {
      this.parent[rootA] = rootB;
    } else if (this.rank[rootA] > this.rank[rootB]) {
      this.parent[rootB] = rootA;
    } else {
      this.parent[rootB] = rootA;
      this.rank[rootA]++;
    }
  };

  self.connected = function (a, b) {
    return this.find(a) === this.find(b);
  };

  return DisjointSet;
})();
