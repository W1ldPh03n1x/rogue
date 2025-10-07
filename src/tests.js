function testGenerationDungeonReachability(iterations) {
  let passedTests = 0;
  let failedTests = 0;

  for (let i = 0; i < iterations; i++) {
    try {
      const dungeon = new Dungeon(GAME_FIELD_WIDTH, GAME_FIELD_HEIGHT);

      // Базовые проверки
      if (!testBasicRequirements(dungeon)) {
        continue;
      }

      if (!testDungeonReachability(dungeon)) {
        failedTests++;
        continue;
      }

      passedTests++;
    } catch (error) {
      failedTests++;
      console.warn(`Iteration ${i}: Error - ${error.message}`);
    }
  }

  console.log(`=== DUNGEON REACHABILITY TEST ===`);
  console.log(`Iterations: ${iterations}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(
    `Success rate: ${((passedTests / iterations) * 100).toFixed(2)}%`
  );

  return passedTests === iterations;
}

function testBasicRequirements(dungeon) {
  if (dungeon.rooms.length < 5) {
    console.warn(`Only ${dungeon.rooms.length} rooms generated`);
    return false;
  }

  for (let i = 0; i < dungeon.rooms.length; i++) {
    for (let j = i + 1; j < dungeon.rooms.length; j++) {
      if (dungeon.rooms[i].isIntersects(dungeon.rooms[j])) {
        console.warn(`Rooms ${i} and ${j} intersect`);
        return false;
      }
    }
  }

  return true;
}

function testDungeonReachability(dungeon) {
  const hasVertical = dungeon.corridors.some((c) => c.type === "vertical");
  const hasHorizontal = dungeon.corridors.some((c) => c.type === "horizontal");

  if (!hasVertical) {
    console.warn("No vertical corridors");
    return false;
  }

  if (!hasHorizontal) {
    console.warn("No horizontal corridors");
    return false;
  }

  const unconnectedRooms = dungeon.rooms.filter(
    (room) => room.corridors.length === 0
  );
  if (unconnectedRooms.length > 0) {
    console.warn(`${unconnectedRooms.length} rooms have no corridors`);
    return false;
  }

  return true;
}

function quickDungeonTest() {
  console.log("Running quick dungeon test...");
  const dungeon = new Dungeon(50, 50);

  const tests = [
    {
      name: "Room count (4+)",
      test: () => dungeon.rooms.length >= 4,
    },
    {
      name: "Has vertical corridor",
      test: () => dungeon.corridors.some((c) => c.type === "vertical"),
    },
    {
      name: "Has horizontal corridor",
      test: () => dungeon.corridors.some((c) => c.type === "horizontal"),
    },
    {
      name: "All rooms connected",
      test: () => dungeon.rooms.every((room) => room.corridors.length > 0),
    },
  ];

  let allPassed = true;
  tests.forEach((test) => {
    const passed = test.test();
    console.log(`${test.name}: ${passed ? "PASS" : "FAIL"}`);
    if (!passed) allPassed = false;
  });

  console.log(
    `Rooms: ${dungeon.rooms.length}, Corridors: ${dungeon.corridors.length}`
  );
  console.log(
    `Vertical: ${dungeon.corridors.filter((c) => c.type === "vertical").length}`
  );
  console.log(
    `Horizontal: ${
      dungeon.corridors.filter((c) => c.type === "horizontal").length
    }`
  );

  return allPassed;
}

function debugDungeonGeneration() {
  console.log("=== DEBUG DUNGEON GENERATION ===");
  const dungeon = new Dungeon(50, 50);

  console.log(`Rooms: ${dungeon.rooms.length}`);
  console.log(`Corridors: ${dungeon.corridors.length}`);
  console.log(
    `Vertical corridors: ${
      dungeon.corridors.filter((c) => c.type === "vertical").length
    }`
  );
  console.log(
    `Horizontal corridors: ${
      dungeon.corridors.filter((c) => c.type === "horizontal").length
    }`
  );

  const connectionStats = {};
  dungeon.rooms.forEach((room, index) => {
    const count = room.corridors.length;
    connectionStats[count] = (connectionStats[count] || 0) + 1;
  });

  console.log("Room connections:", connectionStats);

  const corridorsWithoutRooms = dungeon.corridors.filter(
    (c) => c.rooms.length === 0
  );
  console.log(`Corridors without rooms: ${corridorsWithoutRooms.length}`);

  return testDungeonReachability(dungeon);
}
