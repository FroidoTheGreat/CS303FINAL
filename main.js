"use strict";

import {Player} from './bin/Player.js';

var perspectiveExample = function(){
var canvas;
var gl;

var numPositions  = 36;

var positionsArray = [];
var colorsArray = [];

var player = new Player(0.0, 2.0, -4.0);

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
    grid: [],
    set: function(x, y, z, val) {
        if (x < 0 || y < 0 || z < 0) {
            return;
        }

        if (this.grid[x] == null) {
            this.grid[x] = [];
        }
        if (this.grid[x][y] == null) {
            this.grid[x][y] = [];
        }
        this.grid[x][y][z] = val;
    },
    get: function(x, y, z) {
        if (x < 0 || y < 0 || z < 0
            || this.grid[x] == null
            || this.grid[x][y] == null
            || this.grid[x][y][z] == null) {
            return 0;
        }
        return this.grid[x][y][z]
    },
    draw: function(VM, cx, cy, cz, w, h, d) {
        for (var x = cx; x < cx + w; x++) {
            for (var y = cy; y < cy + h; y++) {
                for (var z = cz; z < cz + d; z++) {
                    var val = this.get(x, y, z)
                    if (val != null && val != 0) {
                        cube(VM, x + 0.5, y + 0.5, z + 0.5);
                    }
                }
            }
        }
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

    /////////
    // MAP //
    /////////

    map.set(0, 0, 0, 1);
    map.set(1, 0, 0, 1);
    map.set(3, 0, 0, 1);


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
        player.keyDown(event.keyCode)
    });
    document.addEventListener('keyup', function(event) {
        player.keyUp(event.keyCode);
    });

    render();
}

function update() {
    player.update();
}

function cube(viewMatrix, x, y, z) {
    var transMatrix = translate(x, y, z);
    var modelViewMatrix = mult(viewMatrix, transMatrix);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

var render = function() {
    update();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var viewMatrix = lookAt(player.pos, add(player.pos, player.dirVec(0.0)), player.up);
    var projectionMatrix = perspective(fovy, aspect, near, far);
    
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    map.draw(viewMatrix, 0, 0, 0, 10, 10, 10);

    requestAnimationFrame(render);
}

}
perspectiveExample();
