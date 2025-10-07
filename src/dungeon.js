var Dungeon = (function () {
  function Dungeon(width, height) {
    this.width = width;
    this.height = height;
    this.rooms = [];
    this.corridors = [];
    this.layoutCoordinates = null;

    var roomsCount = getRandomIntFromRange(5, 11);

    this.generateRooms(roomsCount);

    this.generateCorridors();
  }

  var self = Dungeon.prototype;

  self.generateRooms = function (count) {
    var iterations = 0;

    generateRoomsLoop: while (this.rooms.length !== count) {
      var roomWidth = getRandomIntFromRange(3, 8 + 1);
      var roomHeigth = getRandomIntFromRange(3, 8 + 1);
      var x = getRandomIntFromRange(1, this.width - roomWidth - 1);
      var y = getRandomIntFromRange(1, this.height - roomHeigth - 1);

      var roomCandidate = new Room(x, y, roomWidth, roomHeigth);

      if (iterations == GENERATION_ITERATIONS_MAX_COUNT) {
        break generateRoomsLoop;
      }

      for (var i = 0; i < this.rooms.length; i++) {
        if (roomCandidate.isIntersects(this.rooms[i])) {
          iterations++;

          continue generateRoomsLoop;
        }
      }

      this.rooms.push(roomCandidate);

      iterations = 0;
    }
  };

  self.generateCorridors = function (count) {
    var verticals = 0;
    var horizontals = 0;

    for (var i = 0; i < this.rooms.length; i++) {
      var room = this.rooms[i];

      var corridorCandidate = null;

      if (room.corridors.length === 1) {
        if (room.corridors[0].type === "vertical") {
          if (verticals >= 5) continue;
          corridorCandidate = this.generateHorizontalCorridor(
            room.y,
            room.y + room.height
          );
        } else {
          if (horizontals >= 5) continue;
          corridorCandidate = this.generateVerticalCorridor(
            room.x,
            room.x + room.width
          );
        }
      } else if (room.corridors.length == 0) {
        if (
          Math.random() >
          (5 - verticals) / (5 - horizontals + 5 - verticals)
        ) {
          corridorCandidate = this.generateVerticalCorridor(
            room.x,
            room.x + room.width
          );
        } else {
          corridorCandidate = this.generateHorizontalCorridor(
            room.y,
            room.y + room.height
          );
        }
      }

      if (!corridorCandidate) continue;

      if (corridorCandidate.type === "vertical") {
        verticals++;
      } else {
        horizontals++;
      }

      this.addCorridorToRooms(corridorCandidate);

      this.corridors.push(corridorCandidate);
    }

    while (verticals < 3) {
      var extraCorridor = this.generateVerticalCorridor(0, this.width);
      this.addCorridorToRooms(extraCorridor);
      this.corridors.push(extraCorridor);
      verticals++;
    }

    while (horizontals < 3) {
      var extraCorridor = this.generateHorizontalCorridor(0, this.height);
      this.addCorridorToRooms(extraCorridor);
      this.corridors.push(extraCorridor);
      horizontals++;
    }
  };

  self.addCorridorToRooms = function (corridor) {
    this.rooms.forEach(function (room) {
      if (
        corridor.type === "vertical" &&
        room.x <= corridor.x &&
        room.x + room.width >= corridor.x
      ) {
        room.addCorridor(corridor);
        corridor.addRoom(room);
      } else if (
        corridor.type === "horizontal" &&
        room.y <= corridor.y &&
        room.y + room.height >= corridor.y
      ) {
        room.addCorridor(corridor);
        corridor.addRoom(room);
      }
    });
  };

  self.generateRoomCorridor = function (room) {
    if (Math.random() > 0.5) {
      return this.generateVerticalCorridor(room.x, room.x + room.width);
    } else {
      return this.generateHorizontalCorridor(room.y, room.y + room.height);
    }
  };

  self.generateRandomCorridor = function () {
    if (Math.random() > 0.5) {
      return this.generateVerticalCorridor(0, this.width);
    } else {
      return this.generateHorizontalCorridor(0, this.height);
    }
  };

  self.generateVerticalCorridor = function (x1, x2) {
    var x = getRandomIntFromRange(x1, x2);

    var xCandidate = x;

    while (
      this.corridors.some(function (corridor) {
        return (
          corridor.type === "vertical" && Math.abs(corridor.x - xCandidate) <= 1
        );
      }) ||
      this.rooms.some(function (room) {
        return room.x - 1 === xCandidate || room.x + room.width === xCandidate;
      })
    ) {
      xCandidate++;

      if (xCandidate === x2) {
        xCandidate = x1;
      }
      if (xCandidate === x) {
        break;
      }
    }

    x = xCandidate;

    var y = 0;

    return new Corridor(x, y, "vertical", this.height);
  };

  self.generateHorizontalCorridor = function (y1, y2) {
    var y = getRandomIntFromRange(y1, y2);
    var yCandidate = y;

    while (
      this.corridors.some(function (corridor) {
        return (
          corridor.type === "horizontal" &&
          Math.abs(corridor.y - yCandidate) <= 1
        );
      }) ||
      this.rooms.some(function (room) {
        return room.y - 1 === yCandidate || room.y + room.height === yCandidate;
      })
    ) {
      yCandidate++;

      if (yCandidate === y2) {
        yCandidate = y1;
      }

      if (yCandidate === y) {
        break;
      }
    }

    y = yCandidate;

    var x = 0;

    return new Corridor(x, y, "horizontal", this.width);
  };

  self.getLayoutCoordinates = function () {
    if (this.layoutCoordinates) return this.layoutCoordinates;

    this.layoutCoordinates = this.rooms.reduce(function (acc, room) {
      return acc.concat(room.getLayoutCoordinates());
    }, []);

    this.layoutCoordinates = this.corridors.reduce(function (acc, room) {
      return acc.concat(room.getLayoutCoordinates());
    }, this.layoutCoordinates);

    return this.layoutCoordinates;
  };

  self.getRandomCoordinate = function (roomsOnly) {
    var roomsOnly = roomsOnly || false;

    var availableStructures = this.rooms;

    if (!roomsOnly) {
      availableStructures = availableStructures.concat(this.corridors);
    }

    return getRandomArrayItem(availableStructures).getRandomCoordinate();
  };

  return Dungeon;
})();

var Room = (function () {
  function Room(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.coordinates = null;
    this.corridors = [];
  }

  var self = Room.prototype;

  Room.linkRooms = function (roomA, roomB, corridor) {
    roomA.addLink(roomB, corridor);
    roomB.addLink(roomA, corridor);
  };

  self.isIntersects = function (room) {
    return (
      this.x - 1 < room.x + room.width &&
      this.x + this.width + 1 > room.x &&
      this.y - 1 < room.y + room.height &&
      this.y + this.height + 1 > room.y
    );
  };

  self.containPosition = function (x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width - 1 &&
      y >= this.y &&
      y <= this.y + this.height - 1
    );
  };

  self.getLayoutCoordinates = function () {
    if (this.coordinates) return this.coordinates;
    this.coordinates = [];

    for (var x = this.x; x < this.x + this.width; x++) {
      for (var y = this.y; y < this.y + this.height; y++) {
        this.coordinates.push({ x: x, y: y, structure: this });
      }
    }

    return this.coordinates;
  };

  self.getPosition = function () {
    return { x: this.x, y: this.y };
  };

  self.setPosition = function (x, y) {
    this.x = x;
    this.y = y;
  };

  self.getRandomCoordinate = function () {
    return {
      x: getRandomIntFromRange(this.x, this.x + this.width),
      y: getRandomIntFromRange(this.y, this.y + this.height),
    };
  };

  self.addCorridor = function (corridor) {
    this.corridors.push(corridor);
  };

  return Room;
})();

var Corridor = (function () {
  function Corridor(x, y, type, length) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.length = length;
    this.coordinates = null;
    this.rooms = [];
  }

  var self = Corridor.prototype;

  self.getLayoutCoordinates = function () {
    if (this.coordinates) return this.coordinates;
    var coordinates = [];

    var isVertical = this.type == "vertical";

    var start = isVertical ? this.y : this.x;
    var end = start + this.length;

    for (var i = start; i < end; i++) {
      var coords = {
        x: isVertical ? this.x : i,
        y: isVertical ? i : this.y,
        structure: this,
      };
      coordinates.push(coords);
    }

    this.coordinates = coordinates.filter(function (coords) {
      for (var i = 0; i < this.rooms.length; i++) {
        if (this.rooms[i].containPosition(coords.x, coords.y)) return false;
      }
      return true;
    }, this);

    return this.coordinates;
  };

  self.getRandomCoordinate = function () {
    return getRandomArrayItem(this.getLayoutCoordinates());
  };

  self.addRoom = function (room) {
    this.rooms.push(room);
  };
  return Corridor;
})();
