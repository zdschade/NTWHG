var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_ModelMatrix2;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' + // varying variable
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * u_ModelMatrix2 * a_Position;\n' +
  '  v_Color = a_Color;\n' +  // Pass the data to the fragment shader
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' + // Precision qualifier (See Chapter 6)
  '#endif\n' +
  'varying vec4 v_Color;\n' +    // Receive the data from the vertex shader
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // set up model matricies
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  var u_ModelMatrix2 = gl.getUniformLocation(gl.program, 'u_ModelMatrix2');
  if (!u_ModelMatrix2) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Model matricies
  var modelMatrix = new Matrix4();
  var modelMatrix2 = new Matrix4();

  currlevel = 0  // keeps track of current level

  // border that goes around the game. Never changes, colored black
  border = new Float32Array([-0.95, 0.9, 0,0,0,  -0.9, 0.9, 0,0,0,  -0.95, -0.9, 0,0,0, -0.9, -0.9, 0,0,0,
    -0.95, -0.95,  0,0,0,-0.9, -0.9, 0,0,0,  0.9, -0.95, 0,0,0,  0.9, -0.9, 0,0,0,
    0.95, -0.95,  0,0,0, 0.9, -0.9, 0,0,0,  0.95,  0.9, 0,0,0, 0.9,  0.9,0,0,0,
    0.95, 0.95, 0,0,0,  0.9,   0.9, 0,0,0, -0.95,  0.95,0,0,0, -0.95, 0.9,0,0,0]);


  // Level0-3() generates the necessary variables and lists for each level
  function level0() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    startbox = make_start_end(-0.9, 0.9)  // makes the startbox
    
    endbox = make_start_end(0.5, -0.5)  // makes the endbox
    endcoords = [0.5, -0.5]  // holds coords for endbox

    // starting coords of the player, for resetting
    playerstartx = -0.8
    playerstarty = 0.8

    player = make_player(0, 0)  // makes the player

    // Things to draw. Manually has startbox, endbox, and border
    todrawlist = [[startbox, 4], [endbox, 4], [border, 16]];

    // holds current coords of the player
    currplayerx = playerstartx
    currplayery = playerstarty

    // format of an obstacle is [posx, posy, height, width]. Auto generated
    obstacles = []

    // list of objects to draw. Will be added to todrawlist and obstacles lists
    // format of an object is [tlx, tly, brx, bry, n]
    objectsSetup = [[-0.5, 0.55, 0.9, 0.5, 4], [-0.9, -0.5, 0.5, -0.55, 4], [-0.5, 0.9, -0.45, 0.5, 4], [0.45, -0.5, 0.5, -0.9, 4]]
    
    damagers = []  // holds damager hitboxes
    damagersSetup = [[-0.1, 0.5, 0.1, -0.5, 4]] // damagers to draw
    angle = 0  // starting angle of rotating obstacle
    num_fails = 0 // number of times the player has been reset

    points = [[0.4, -0.2], [-0.45, 0.2]] // Points to be collected
    pointsInitial = [[0.4, -0.2], [-0.45, 0.2]] // for resetting
    pointCounter = 0 // holds current point value
    requiredPoints = points.length  // num of points required to complete level

    // HTML modification for scoring and labels
    document.getElementById("level_label").innerHTML = "Level 0"
    document.getElementById("fails").innerHTML = "Fails: 0"

    point_indicators = document.getElementById("point_indicators")
    dots = []

    displayPoints(requiredPoints) // displays point counter on screen

    // Generates hitboxes for damagers and obstacles
    generateObjects(objectsSetup)
    generateDamagers(damagersSetup)

    // draws points and board. Points need to be drawn first
    drawPoints(points)
    drawBoard(todrawlist)
    
    drawPlayer(); // draws the player
  }

  function level1() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    startbox = make_start_end(-0.9, 0.2)
    endbox = make_start_end(0.5, 0.2)
    endcoords = [0.5, 0.2]

    playerstartx = -0.8
    playerstarty = 0.1

    player = make_player(0, 0)

    todrawlist = [[startbox, 4], [endbox, 4], [border, 16]];

    currplayerx = playerstartx
    currplayery = playerstarty

    obstacles = []
    
    objectsSetup = [[-0.9, 0.25, -0.5, 0.2, 4], [-0.9, -0.2, -0.5, -0.25, 4], [0.5, 0.25, 0.9, 0.2, 4],
    [0.5, -0.2, 0.9, -0.25, 4]]
    
    // rotating L shape
    damagers = []
    angle = 0
    damagersSetup = [[-0.5, 0.5, -0.1, 0.1, 4], [0.1, 0.5, 0.5, -0.5, 4], [-0.5, -0.1, 0.5, -0.5, 4]]

    points = [[-0.05, 0.0], [-0.8, 0.7], [0.7, 0.7], [-0.8, -0.7], [0.7, -0.7]]
    pointsInitial = [[-0.05, 0.0], [-0.8, 0.7], [0.7, 0.7], [-0.8, -0.7], [0.7, -0.7]]
    pointCounter = 0
    requiredPoints = points.length

    dots = []
    displayPoints(requiredPoints)

    generateObjects(objectsSetup)
    drawPoints(points)
    generateDamagers(damagersSetup)
    drawBoard(todrawlist)
    drawPlayer()
  }

  function level2() {
    // Maze level
    gl.clear(gl.COLOR_BUFFER_BIT);

    startbox = make_start_end(-0.9, 0.9)
    endbox = make_start_end(0.5, -0.5)
    endcoords = [0.5, -0.5]

    playerstartx = -0.9
    playerstarty = 0.9

    player = make_player(0, 0)

    todrawlist = [[startbox, 4], [endbox, 4], [border, 16]];

    currplayerx = playerstartx
    currplayery = playerstarty

    obstacles = []

    damagers = []

    objectsSetup = []

    damagersSetup = [[-0.7, 0.9, -0.5, -0.7, 4], [-0.7, 0.9, 0.9, 0.7, 4], [-0.3, 0.5, -0.1, -0.89, 4],
                    [-0.2, 0.5, 0.7, 0.3, 4], [0.1, 0.1, 0.9, -0.1, 4], [-0.2, -0.3, 0.7, -0.5, 4], 
                    [0.5, -0.3, 0.7, -0.7, 4], [0.1, -0.7, 0.3, -0.9, 4]]

    points = [[-0.85, 0.2], [-0.85, -0.8], [-0.45, -0.8], 
              [-0.45, 0.6], [0.75, 0.6], [-0.05, 0.0], [-0.05, -0.8]]
    pointsInitial = [[-0.85, 0.2], [-0.85, -0.8], [-0.45, -0.8], 
              [-0.45, 0.6], [0.75, 0.6], [-0.05, 0.0], [-0.05, -0.8]]
    pointCounter = 0
    requiredPoints = points.length

    dots = []

    displayPoints(requiredPoints)

    generateObjects(objectsSetup)
    drawPoints(points)
    generateDamagers(damagersSetup)
    drawBoard(todrawlist)
    drawPlayer()
  }

  function level3() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    startbox = make_start_end(-0.9, 0.2)
    endbox = make_start_end(0.5, 0.2)
    endcoords = [0.5, 0.2]

    playerstartx = -0.8
    playerstarty = 0.1

    player = make_player(0, 0)

    todrawlist = [[startbox, 4], [endbox, 4], [border, 16]];

    currplayerx = playerstartx
    currplayery = playerstarty

    obstacles = []

    damagers = []

    objectsSetup = []

    damagersSetup = [[-0.5, 0.2, -0.3, 0.0, 4], [-0.3, 0.2, -0.1, 0.0, 4],
                    [-0.1, 0.2, 0.1, 0.0, 4], [0.1, 0.2, 0.3, 0.0, 4], [0.3, 0.2, 0.5, 0.0, 4]]

    blockdir = [0.1, -0.1]
    blockpos = [0.2, 0.2]

    points = [[-0.7, 0.7], [-0.05, 0.7], [0.7, 0.7], [-0.7, -0.7], [-0.05, -0.7], [0.7, -0.7]]
    pointsInitial = [[-0.7, 0.7], [-0.05, 0.7], [0.7, 0.7], [-0.7, -0.7], [-0.05, -0.7], [0.7, -0.7]]
    pointCounter = 0
    requiredPoints = points.length

    dots = []
    displayPoints(requiredPoints)

    generateObjects(objectsSetup)
    drawPoints(points)
    generateDamagers(damagersSetup)
    drawBoard(todrawlist)
    drawPlayer()
  }

  level0() // initial run of first level

  function generateObjects(objects){
    // generates hitboxes for neutral objects
    for (j=0; j<objects.length; j++) {
      currobject = objects[j]
      todrawlist.push([make_wall(currobject[0], currobject[1], currobject[2], currobject[3]), currobject[4]])

      // calculates position and height for collision function
      posx = currobject[0]
      posy = currobject[1]
      height = Math.abs(currobject[3] - currobject[1])
      width = Math.abs(currobject[2] - currobject[0])
      obstacles.push([posx, posy, height, width])
    }
  }

  function generateDamagers(objects){
    // generates hitboxes for damagers
    for (d=0; d<objects.length; d++) {
      currobject = objects[d]
      if (currlevel == 3) {
        todrawlist.push([make_damager(currobject[0], currobject[1], currobject[2], currobject[3]), currobject[4], "o3"]) // level 3
      } else if (currlevel == 1) {
        todrawlist.push([make_damager(currobject[0], currobject[1], currobject[2], currobject[3]), currobject[4], "o1"]) // level 1
      } else {
        todrawlist.push([make_damager(currobject[0], currobject[1], currobject[2], currobject[3]), currobject[4], "o"]) // level 0
      }

      // calculates position and height for collision function
      posx = currobject[0]
      posy = currobject[1]
      height = Math.abs(currobject[3] - currobject[1])
      width = Math.abs(currobject[2] - currobject[0])
      damagers.push([posx, posy, height, width])
    }
  }

  // generates hitboxes for objects and damagers
  generateObjects(objectsSetup)  
  generateDamagers(damagersSetup)

  function resetPlayer() {
    // resets player in the start area, resets points, increments fail counter
    currplayerx = playerstartx
    currplayery = playerstarty

    // increment fail counter
    num_fails += 1
    document.getElementById("fails").innerHTML = "Fails: " + String(num_fails)

    // reset point counter
    for (i=0; i<dots.length; i++) {
      dots[i].remove()
    }
    // set up points from start
    points = pointsInitial.map((x) => x)
    pointCounter = 0
    dots = []
    displayPoints(requiredPoints)

    // redraw everything
    drawPoints(points)
    drawBoard(todrawlist)
    drawPlayer(currplayerx, currplayery)

    // update playercoords
    updatecoords()
  }

  function collectPoint(pointsList, collectedPoint) {
    // collectedPoint is the index of the point 
    pointsList.splice(collectedPoint, 1)
    pointCounter += 1

    // change dot display
    console.log(dots)
    for (i=0; i<requiredPoints; i++) {
      if (dots[i].className == "dot") {
        dots[i].className = "dot_collected"
        return
      }
    }
    return
  }

  function displayPoints(requiredPoints) {
    // create empty display points for point counter
    for (i=0; i<requiredPoints; i++) {
      new_dot = document.createElement("span")
      new_dot.className = "dot"
      point_indicators.appendChild(new_dot)
      dots.push(new_dot)
    }
  }  

  function colissionloop(objects, newx, newy, point=false, l3=false) {
    // objects should be a list of lists
    // ex. [[ob1x, ob1y, ob1height, obwidth][ob2x, ob2y, ob2height, ob2width]]
    // If we are checking colission with a point, it keeps track of which point we are checking
    // and returns the point we collide with so it can be removed.
    if (!point) {  // not a point
      if (l3) {
        for (i=0; i<objects.length; i++) {
          currobject = objects[i]
          if (checkColission(currplayerx, currplayery, newx, newy, 
                              currobject[0], currobject[1], currobject[2], currobject[3], true)) {
            return true
          }
        }
      } else {
        for (i=0; i<objects.length; i++) {
          currobject = objects[i]
          if (checkColission(currplayerx, currplayery, newx, newy, 
                            currobject[0], currobject[1], currobject[2], currobject[3])) {
          return true
          }
        }
      }

      
    } else {  // is a point
      pointIndex = 0
      for (p=0; p<objects.length; p++) {
        currobject = objects[p]
        if (checkColission(currplayerx, currplayery, newx, newy, 
                            currobject[0]-0.05, currobject[1]+0.05, 0.1, 0.1)) {
          return pointIndex
        } else {
          pointIndex += 1
        }
      }
    }
    
    return false
  }

  function updatecoords() {
    // This just updates the player coords shown on screen
    // mostly for debugging
    document.getElementById('xcoord').innerHTML = currplayerx
    document.getElementById('ycoord').innerHTML = currplayery
  }

  updatecoords()

  function drawPoints(pointstd) {
    // Draws all points on screen 
    for (k=0; k<pointstd.length; k++) {
      x = pointstd[k][0]
      y = pointstd[k][1]
      //console.log(k)
      //console.log(x, y)
      var circle = initVertexBuffers(gl, getCircleVerts(x, y), 102);
      if (circle < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
      }
      draw(gl, circle, x, y, 0, modelMatrix, u_ModelMatrix, modelMatrix2, u_ModelMatrix2, "FAN")
    }
  }

  function drawBoard(todraw, angle=0, ty=0) {
    // draws the board by reading todrawlist
    for (i=0; i<todraw.length; i++) {
      var n = initVertexBuffers(gl, todraw[i][0], todraw[i][1]);
      if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
        
      }
      
      // special draws for rotating obstacles
      if (todraw[i].includes("o")) {
        draw(gl, n, 0, 0, angle, modelMatrix, u_ModelMatrix, modelMatrix2, u_ModelMatrix2)
      } else {
        draw(gl, n, 0, 0, 0, modelMatrix, u_ModelMatrix, modelMatrix2, u_ModelMatrix2)
      }
      
    }
  }

  function drawPlayer(tx=currplayerx, ty=currplayery) {
    // draws the player, stored in their own buffer
    var player1 = initVertexBuffers(gl, player, 4);
    if (player1 < 0) {
      console.log('Failed to set the positions of the vertices');
      return;
    };

    draw(gl, player1, tx, ty, 0, modelMatrix, u_ModelMatrix, modelMatrix2, u_ModelMatrix2)
  }

  // Handles player movement, runs every time an arrow key is pressed.
  function playerMovement(newx, newy) {
    // newx, newy are how much the player moves in a given direction
    // ex. -0.1, 0 would make the player move left

    // Checks colission with the border walls
    staticCheck = staticColission(currplayerx, currplayery, newx, newy)
    // Checks colission with regular black obstacles
    colissionCheck = colissionloop(obstacles, newx, newy)
    // Checks colission with damagers
    damagerColission = colissionloop(damagers, newx, newy)
    // Checks colission with points
    pointCollection = colissionloop(points, newx, newy, true)

    if (damagerColission) {  // if the player collided with a damager, restart the level
      resetPlayer()

      // if the player did not collide with a wall or obstacle
    } else if (staticCheck && !colissionCheck) {
      // clear the board
      gl.clear(gl.COLOR_BUFFER_BIT);
      // update player position
      currplayerx = roundValue(currplayerx + newx, 10)
      currplayery = roundValue(currplayery + newy, 10)
      // redraw points, board, player
      drawPoints(points)

      // redraws the moving damagers correctly
      if (currlevel == 0 || currlevel == 1) {
        drawBoard(todrawlist, angle)
      } else {
        drawBoard(todrawlist)
      }

      drawPlayer(roundValue(currplayerx, 10), roundValue(currplayery, 10)); // draw the player in their new location
      updatecoords()  // update the player coords on screen
    } 

    // if the player collides with a point
    if (pointCollection !== false) {
      console.log("COLLECTED POINT")
      //console.log(points)
      collectPoint(points, pointCollection) // updates score and removes point from board
      //console.log(points)
    }
    
    // if the player makes it into the end zone
    if (checkLevelCompletion(endcoords[0], endcoords[1], currplayerx, currplayery, pointCounter, requiredPoints)) {
      //console.log("CHECKED PROPERLY")
      // move the player to the next level
      currlevel += 1

      for (i=0; i<dots.length; i++) {
        dots[i].remove()
      }

      changelevel(currlevel)
    }
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(1, 0.5, 0, 1);  // orange

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Handles all player movement on arrowkey down. See playerMovement function for details
  document.onkeydown = function (ev) {
    switch (ev.key) {
      case "ArrowLeft": // Left
        playerMovement(-0.1, 0)  
        break;

      case "ArrowRight": //Right
        playerMovement(0.1, 0)
        break;

      case "ArrowUp": // Up
        playerMovement(0, 0.1)
        break;

      case "ArrowDown": // Down
        playerMovement(0, -0.1)
        break;
    }
  }

  // tick function for level 1
  var tick0 = function() { 
    if (currlevel !== 0) { // ensures the current level is correct
      return
    }

    drawPoints(points) // draws points (needs to be drawn first)

    // rotates the damager
    if (angle == 0) {
      drawBoard(todrawlist, 90)
      angle = 90
      damagers = [[-0.5, 0.1, 0.2, 1]]
    } else {
      drawBoard(todrawlist, 0)
      angle = 0
      damagers = [[-0.1, 0.5, 1, 0.2]]
    }

    drawPlayer()
    
    setTimeout(() => { requestAnimationFrame(tick0, canvas); }, 1000);
  } //tick0()

  // tick function for level 1
  angle = 0
  first = true
  var tick1 = function() {
    if (currlevel !== 1) {
      return
    }

    // adds all non-damagers to a temporary todrawlist
    newlist = []
    for (i=0; i<todrawlist.length; i++) {
      if (!(todrawlist[i].includes("o1"))) {
        newlist.push(todrawlist[i])
      }
    }

    drawPoints(points)  // draws points (needs to be drawn first)

    if (first == true) {
      first = false
    } else if (angle == 0) {
      angle = -90
      damagersSetup = [[0.1, 0.5, 0.5, 0.1, 4], [-0.5, 0.5, -0.1, -0.5, 4], [-0.5, -0.1, 0.5, -0.5, 4]]

    }else if (angle == -90) {
      angle = -180
      damagersSetup = [[0.1, -0.1, 0.5, -0.5, 4], [-0.5, 0.5, 0.5, 0.11, 4], [-0.5, 0.5, -0.1, -0.5, 4]]

    } else if (angle == -180) {
      angle = -270
      damagersSetup = [[-0.5, -0.1, -0.1, -0.5, 4], [-0.5, 0.5, 0.5, 0.11, 4], [0.1, 0.5, 0.5, -0.5, 4]]

    } else if (angle == -270) {
      angle = 0
      damagersSetup = [[-0.5, 0.5, -0.1, 0.1, 4], [0.1, 0.5, 0.5, -0.5, 4], [-0.5, -0.1, 0.5, -0.5, 4]]

    }
    
    // setup new todrawlist
    todrawlist = newlist
    damagers = []
    generateDamagers(damagersSetup)

    // draw remaining parts
    console.log(todrawlist)
    drawBoard(todrawlist, angle)
    drawPlayer()
    
    setTimeout(() => { requestAnimationFrame(tick1, canvas); }, 2000);
  }

  // Level 2 does not need tick

  // Tick function for level 3
  var tick3 = function() {
    if (currlevel !== 3) {  // ensures the current level is correct
      return
    }

    // adds all non-damagers to a temporary todrawlist
    newlist = []
    for (i=0; i<todrawlist.length; i++) {
      if (!(todrawlist[i].includes("o3"))) {
        newlist.push(todrawlist[i])
      }
    }

    drawPoints(points)  // draws points (needs to be drawn first)

    // This section moves the blocks location in the damagers setup list
    // This allows it to automatically calculate the new collision locations
    // blocks 0, 2, 4
    if (blockdir[0] > 0 && damagersSetup[0][1] >= 0.8) {  // Changes direciton at a wall
      blockdir[0] = -0.1
    } else if (blockdir[0] < 0 && damagersSetup[0][1] <= -0.7) {
      blockdir[0] = 0.1
    }

    for (i=0; i<5; i+=2) { // moves the blocks
      damagersSetup[i][1] = damagersSetup[i][1] + blockdir[0]
      damagersSetup[i][3] = damagersSetup[i][3] + blockdir[0]
    }

    // blocks 1, 3
    if (blockdir[1] > 0 && damagersSetup[1][1] >= 0.8) { // Changes direciton at a wall
      blockdir[1] = -0.1
    } else if (blockdir[1] < 0 && damagersSetup[1][1] <= -0.7) {
      blockdir[1] = 0.1
    }

    for (i=1; i<4; i+=2) { // moves the blocks
      damagersSetup[i][1] = damagersSetup[i][1] + blockdir[1]
      damagersSetup[i][3] = damagersSetup[i][3] + blockdir[1]
    }

    // Checks if a block will collide with the player
    if (colissionloop(damagers, 0, 0, false, true)) {
      resetPlayer()
    }

    // setup new todrawlist
    todrawlist = newlist
    damagers = []
    generateDamagers(damagersSetup)

    // draw remaining parts
    drawBoard(todrawlist)
    drawPlayer()
    
    setTimeout(() => { requestAnimationFrame(tick3, canvas); }, 50);
  } //tick3();

  // Button listerns for manual level changes. For debugging
  document.getElementById("level0").addEventListener('click',function () {
    changelevel(0)
    }); 
  document.getElementById("level1").addEventListener('click',function () {
    changelevel(1)
    }); 
  document.getElementById("level2").addEventListener('click',function () { 
    changelevel(2)
    }); 
  document.getElementById("level3").addEventListener('click',function () {
    changelevel(3)
    }); 

  // sets up a new level on level completion or manual change
  function changelevel(newlevel) {
    if (newlevel == 0) {
      currlevel = 0
      document.getElementById("level_label").innerHTML = "Level 0"
      level0()
      tick0()
    } else if (newlevel == 1) {
      currlevel = 1
      document.getElementById("level_label").innerHTML = "Level 1"
      level1()
      tick1()
    } else if (newlevel == 2) {
      document.getElementById("level_label").innerHTML = "Level 2"
      currlevel = 2
      level2()
    } else if (newlevel == 3) {
      document.getElementById("level_label").innerHTML = "Level 3"
      currlevel = 3
      level3()
      tick3()
    } else if (newlevel >= 4) {
      console.log("GAME COMPLETE!!!")
      document.getElementById("level_label").innerHTML = "Game Complete"
    }
  }

  // initial draw
  drawPoints(points)
  drawBoard(todrawlist)
  drawPlayer()

  tick0()
}

function initVertexBuffers(gl, verticesColors, n) {
  // Create a buffer object
  var vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE*5, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  // Get the storage location of a_Position, assign buffer and enable
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

  return n;
}

function draw(gl, n, xt, yt, angle, modelMatrix, u_ModelMatrix, modelMatrix2, u_ModelMatrix2, type="STRIP") {
  // Translate
  modelMatrix.setRotate(angle, 0, 0, 1)
  modelMatrix2.setTranslate(xt, yt, 0)
 
  // Pass the rotation matrix to the vertex shader
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.uniformMatrix4fv(u_ModelMatrix2, false, modelMatrix2.elements);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle or circle
  if (type == "STRIP") {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
  } else if (type == "FAN") {
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
  } else {
    console.log("That is not a valid type")
  }
}

// Round the value to requested decimal places
function roundValue(value, rounder=1) {
  return (Math.round(value*rounder)) / rounder;
}

function make_start_end(tlcx, tlcy) {
  // Draws the startbox or endbox. tlcx and tlcy are the corrds of the top left corner of the square. colored green
  start = [tlcx, tlcy,  tlcx+0.4, tlcy, tlcx, tlcy-0.4, tlcx+0.4, tlcy-0.4]
  start = inject_color(start, [0, 1, 0])
  return new Float32Array(start)
}

function make_player(tlcx, tlcy) {
  // Draws the player (a square). tlcx and tlcy are the corrds of the top left corner of the square. colred white
  player = [tlcx, tlcy,  tlcx+0.2, tlcy, tlcx, tlcy-0.2, tlcx+0.2, tlcy-0.2]
  player = inject_color(player, [1, 1, 1])
  return new Float32Array(player)
}

function make_wall(tlcx, tlcy, brcx, brcy) {
  // TLC is top left corner, BRC is bottom right corner
  // walls do not hurt the player, just stops them from moving. colored black
  wall = [tlcx, tlcy, brcx, tlcy, tlcx, brcy, brcx, brcy]
  //console.log(wall)
  wall = inject_color(wall, [0.0, 0.0, 0.0])
  return new Float32Array(wall)
}

function make_damager(tlcx, tlcy, brcx, brcy) {
  //makes arrays for obstacles that will reset the player. Colored red.
  damager = [tlcx, tlcy, brcx, tlcy, tlcx, brcy, brcx, brcy]
  damager = inject_color(damager, [1, 0, 0])
  return new Float32Array(damager)
}

function inject_color(array, color) {
  // injects color in an array before it is converted into a float32array
  // color is a list of RGB values. EX. [1, 0, 0] is red
  colorarray = []
  for (i=0; i<array.length; i++) {
    if (i == 0) {
      colorarray.push(array[i])
    } else if (i % 2 == 0){
      colorarray.push(color[0])
      colorarray.push(color[1])
      colorarray.push(color[2])
      colorarray.push(array[i])
    } else {
      colorarray.push(array[i])
    }
  }
  colorarray.push(color[0])
  colorarray.push(color[1])
  colorarray.push(color[2])
  return colorarray
}

function staticColission(xpos, ypos, newx, newy) {
  // Returns false if player is colliding, returns true if not
  // used for the borders
  tledge = 0.92  // Top left edge
  bredge = 0.75  // Bottom right edge
  if (xpos > 0 && xpos + newx >= bredge) {
    //console.log("x+")
    return false
  } else if (xpos < 0 && xpos + newx <= -1 * tledge) {
    //console.log("x-")
    return false
  } else if (ypos > 0 && ypos + newy >= tledge) {
    //console.log("y+")
    return false
  } else if (ypos < 0 && ypos + newy <= -1 * bredge) {
    //console.log("y-")
    return false
  }

  return true
}

function checkColission(playerx, playery, newx, newy, objectx, objecty, objectheight, objectwidth, l3=false) {
  if (newx > 0) { // moving right
    if (!(playery - 0.2 > objecty - 0.01 || playery < objecty - objectheight + 0.01) && (playerx + 0.15 + newx > objectx) && !(playerx > objectx + objectwidth)){
      if (playerx > objectx + objectwidth - 0.01 && playerx < objectx + objectwidth + 0.03) {
        return false
      } else {
        return true
      } 
    }
    
  } else if (newx < 0) { // moving left
    if (!(playery - 0.2 > objecty - 0.01 || playery < objecty - objectheight + 0.01) && (playerx + newx < objectx + objectwidth - 0.01) && !(playerx + 0.2 < objectx)) {
      if (objectx - .03 < playerx + 0.2 && objectx + 0.01 > playerx + 0) {
        return false
      } else {
        return true
      }
    }
    
  } else if (newy > 0) { // moving up
    if ((playery + newy > objecty - objectheight) && !(playery - 0.01 > objecty - objectheight) && !(playerx + 0.19 < objectx || playerx > objectx + objectwidth - 0.01)) {
      return true
    }
    
  } else if (newy < 0) { // moving down
    if ((playery - 0.19 + newy < objecty) && !(playerx + 0.19 < objectx || playerx > objectx + objectwidth - 0.01)) {
      if ((playery < objecty - objectheight + 0.01 && playery > objecty - objectheight - 0.03) || (playery < objecty - objectheight)) {
        return false
      } else {
        return true
      }
    }
  } else if (newx == 0 && newy == 0 && l3 == true) {  // for moving damagers
    c1 = (objecty - objectheight < playery && objecty > playery - 0.19)
    c2 = !((objectx > (playerx + 0.19)) || ((objectx + objectwidth) < playerx))
    if (c1 && c2) {
      return true
    }
  } else {  // if there is an odd input
    console.log("?????????")
  }

  return false
  
}

function getCircleVerts(xo=0, yo=0) {
  // Creates an array of vertices for a circle. Starts with 0, 0 for the origin
  vertices = [xo, yo, 0.0, 0.0, 1.0]
  n = 100
  for (i = 0; i <= n; i++) { // Using 100 points. This is about where you couldn't tell if there were more points
      cangle = 2 * Math.PI * (i/n)
      x = 0.05 * Math.cos(cangle)// Given in class
      y = 0.05 * Math.sin(cangle)

      vertices.push(x + xo, y + yo, 0, 0, 1)  // add new verts to array
  }

  //console.log("Got circle verts")
  //console.log(vertices)
  return new Float32Array(vertices)
}

function checkLevelCompletion(endx, endy, playerx, playery, pointsCollected, pointsRequired) {
  // returns true if the player is completely in the end zone
  if (playerx>=endx && playery<=endy && playerx+0.15<=endx+0.4 && playery-0.15>=endy-0.4 && pointsCollected == pointsRequired) {
    console.log("LEVEL COMPLETE!")
    return true
  } else {
    return false
  }
}
