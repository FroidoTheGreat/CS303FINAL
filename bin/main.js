"use strict";

var perspectiveExample = function(){
var canvas;
var gl;

var numPositions  = 36;

var positionsArray = [];
var colorsArray = [];

var playerPos = vec3(0.0, 2.0, -4.0);
var playerAt = vec3(0.0, 0.0, 0.0);
var playerUp = vec3(0.0, 1.0, 0.0);
var playerDir = Math.PI / 2.0;
var playerVel = 0.0;
var playerCanJump = true;

// keys
var WPress = false;
var APress = false;
var SPress = false;
var DPress = false;
var LeftPress = false;
var RightPress = false;
var SpacePress = false;

// uniform locs
var modelViewMatrixLoc;
var projectionMatrixLoc;

// map
var map = {
    ar1: [],
    ar2: [],
    ar3: [],
    ar4: [],
    set: function(x, y, val) {
        var ar;
        if (x < 0 && y < 0) {
            ar = this.ar4;
            x = -x;
            y = -y;
        } else if (x >= 0 && y < 0) {
            ar = this.ar3;
            y = -y;
        } else if (x < 0 && y >= 0) {
            ar = this.ar2;
            x = -x;
        } else {
            ar = this.ar1;
        }

        if (ar[x] == null) {
            ar[x] = [];
        }
        ar[x][y] = val;
    },
    get: function(x, y) {
        var ar;
        if (x < 0 && y < 0) {
            ar = this.ar4;
            x = -x;
            y = -y;
        } else if (x >= 0 && y < 0) {
            ar = this.ar3;
            y = -y;
        } else if (x < 0 && y >= 0) {
            ar = this.ar2;
            x = -x;
        } else {
            ar = this.ar1;
        }
        if (ar[x] == null) {
            return 0;
        }
        if (ar[x][y] == null) {
            return 0;
        }
        return ar[x][y];
    }
};



var vertices = [
    vec4(-0.5, -0.5,  1.5, 1.0),
    vec4(-0.5,  0.5,  1.5, 1.0),
    vec4(0.5,  0.5,  1.5, 1.0),
    vec4(0.5, -0.5,  1.5, 1.0),
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5,  0.5, 0.5, 1.0),
    vec4(0.5,  0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0)
];

var vertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(1.0, 1.0, 1.0, 1.0),  // white
];


var near = 0.3;
var far = 30.0;
var radius = 4.0;

var  fovy = 80.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var eye;

function dirVec(theta) { // gets the players direction as a vector
    var x = Math.cos(playerDir + theta);
    var z = Math.sin(playerDir + theta);

    return vec3(x, 0.0, z);
}

function quad(a, b, c, d) {
     positionsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     positionsArray.push(vertices[b]);
     colorsArray.push(vertexColors[a]);
     positionsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     positionsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     positionsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     positionsArray.push(vertices[d]);
     colorsArray.push(vertexColors[a]);
}


function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available" );

    gl.viewport(0, 0, canvas.width, canvas.height);

    aspect =  canvas.width/canvas.height;

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

    document.addEventListener('keydown', function(event) {
        if (event.keyCode == 65) {
            APress = true;
        } else if (event.keyCode == 68) {
            DPress = true;
        } else if (event.keyCode == 87) {
            WPress = true;
        } else if (event.keyCode == 83) {
            SPress = true;
        } else if (event.keyCode == 37) {
            LeftPress = true;
        } else if (event.keyCode == 39) {
            RightPress = true;
        } else if (event.keyCode == 32) {
            SpacePress = true;
        };
    });
    document.addEventListener('keyup', function(event) {
        if (event.keyCode == 65) {
            APress = false;
        } else if (event.keyCode == 68) {
            DPress = false;
        } else if (event.keyCode == 87) {
            WPress = false;
        } else if (event.keyCode == 83) {
            SPress = false;
        } else if (event.keyCode == 37) {
            LeftPress = false;
        } else if (event.keyCode == 39) {
            RightPress = false;
        } else if (event.keyCode == 32) {
            SpacePress = false;
        };
    });

    render();
}

function update() {
    // gravity
    playerVel -= 0.05;
    playerPos[1] += playerVel;
    if (playerPos[1] < 2.0) {
        playerPos[1] = 2.0;
        playerVel = 0;
        playerCanJump = true
    };

    // handle player input
    var speed = 0.15
    var turnSpeed = 0.05
    if (APress) {
        playerPos = add(playerPos, mult(speed, dirVec(-Math.PI / 2)));
    };
    if (DPress) {
        playerPos = add(playerPos, mult(speed, dirVec(Math.PI / 2)));
    };
    if (WPress) {
        playerPos = add(playerPos, mult(speed, dirVec(0.0)));
    };
    if (SPress) {
        playerPos = add(playerPos, mult(speed, dirVec(Math.PI)));
    };
    if (LeftPress) {
        playerDir = playerDir - turnSpeed;
    };
    if (RightPress) {
        playerDir = playerDir + turnSpeed;
    };
    if (playerCanJump && SpacePress) {
        playerVel = 0.7;
        playerCanJump = false;
    };
}

function cube(viewMatrix, pos) {
    var transMatrix = translate(pos[0], pos[1], pos[2]);
    var modelViewMatrix = mult(viewMatrix, transMatrix);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

var render = function() {
    update();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var viewMatrix = lookAt(playerPos, add(playerPos, dirVec(0.0)), playerUp);
    var projectionMatrix = perspective(fovy, aspect, near, far);
    
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    cube(viewMatrix, vec4(1.0, 0.0, 0.0, 1.0));

    requestAnimationFrame(render);
}

}
perspectiveExample();
