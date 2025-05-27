"use strict";

import {draw} from './bin/draw.js';
import {Map} from './bin/Map.js';
import {Player} from './bin/Player.js';
import {Block} from './bin/Block.js';
import {Tile} from './bin/Tile.js';
import {Sand} from './bin/Sand.js';
import {Spawn} from './bin/Spawn.js';

var perspectiveExample = function(){
var canvas;
var gl;

var numPositions  = 36;

var program;
var flag = true;
var positionsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var texture;

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

// uniform locs
var modelViewMatrixLoc;
var projectionMatrixLoc;

// game
var player;
var map;

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


var near = 0.2;
var far = 30.0;
var radius = 4.0;

var  fovy = 100.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var eye;

function quad(a, b, c, d) {
     positionsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);

     positionsArray.push(vertices[b]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[1]);

     positionsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);

     positionsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);

     positionsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);

     positionsArray.push(vertices[d]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[3]);
}


function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl.viewport(0, 0, canvas.width, canvas.height);

    aspect =  canvas.width/canvas.height;
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available" );

    resize();

    window.addEventListener("resize", resize);

    gl.clearColor(0.984313725490196, 0.803921568627451, 0.803921568627451, 1.0);

    gl.enable(gl.DEPTH_TEST);

    ///////////
    // MOUSE //
    ///////////

    canvas.addEventListener("click", async () => {
        try {
            await canvas.requestPointerLock({
                unadjustedMovement: true,
            });
        } catch (error) {
            // I don't care
        }
    })

    /////////
    // MAP //
    /////////

    map = new Map();

    for (var x = 27; x <= 33; x++) {
        for (var z = 27; z <= 33; z++) {
            let ceiling = 12;
            map.set(x, 5, z, new Tile());
            map.set(x, ceiling, z, new Tile());
            if ((x == 27 && z == 27)
                || (z == 33 && x == 33)
                || (z == 27 && x == 33)
                || (z == 33 && x == 27)) {
                for (var y = 6; y < ceiling; y++) {
                    map.set(x, y, z, new Tile());
                }
            }
        }
    }

    map.set(30, 5, 30, new Spawn());

    map.set(30, 6, 35, new Tile());
    for (var z = 36; z < 42; z++) {
        map.set(30, 6, z, new Sand());
    }
    map.set(30, 6, 42, new Spawn());
    for (var x = 31; x < 38; x++) {
        map.set(x, 6, 42, new Sand());
    }
    for (var z = 36; z < 43; z++) {
        map.set(38, 6, z, new Sand());
    }

    map.set(38, 6, 33, new Spawn());

    for (var i = 1; i <= 6; i ++) {
        map.set(38 + i * 2, 6 + i, 33, new Sand());
    }
    for (var i = 1; i <= 6; i ++) {
        map.set(50, 12 + i, 33 + i * 2, new Sand());
    }

    map.set(50, 6, 45, new Spawn());
    map.set(53, 7, 48, new Tile());
    map.set(57, 7, 48, new Tile());
    map.set(60, 7, 48, new Sand());
    map.set(60, 7, 51, new Sand());
    map.set(64, 8, 53, new Sand());
    map.set(68, 9, 53, new Sand());
    map.set(68, 4, 57, new Sand());
    map.set(70, 4, 60, new Spawn());


    ////////////
    // PLAYER //
    ////////////

    player = new Player(map, 30.0, 6.0, 30.0);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
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

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

    // handle events
    document.addEventListener('keydown', function(event) {
        if (document.pointerLockElement !== canvas) {return;}
        player.keyDown(event.keyCode)
    });
    document.addEventListener('keyup', function(event) {
        if (document.pointerLockElement !== canvas) {return;}
        player.keyUp(event.keyCode);
    });

    document.addEventListener('mousemove', function(event) {
        if (document.pointerLockElement !== canvas) {return;}
        var move = {
            x: event.movementX,
            y: event.movementY
        };

        player.handleMouseMovement(move);
    })
    
    draw.init(gl, program, modelViewMatrixLoc);

    // image stuff
    draw.setTexture(draw.tex);

    render();
}

function update() {
    player.update();

    map.update(0, 0, 0, 100, 100, 100);
}

var render = function() {
    update();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let up = vec3(player.up[0], player.up[1], player.up[2]);
    var viewMatrix = lookAt(player.eye(), add(player.eye(), player.look), up);
    
    var projectionMatrix = perspective(fovy, aspect, near, far);
    
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    map.draw(viewMatrix, 0, 0, 0, 100, 100, 100);

    requestAnimationFrame(render);
}

}
perspectiveExample();
