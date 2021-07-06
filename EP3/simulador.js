/*
    EP3 - Simulador de vôo - Parte I

    Autor: Daniela Gonzalez Favero
    Data: 14 de julho de 2021
*/
"use strict";

// canvas
var canvas;
var gl;

// camera
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;

// estruturas/buffers
var positionsArray = [];

var colorsArray = []; // FIXME! provisório enquanto não há iluminação

// constantes
const DEBUG = true;
const BG_COLOR = [0.0, 0.0, 0.0, 1.0];

/* ==================================================================
    Função main
*/
window.onload = function main() {

    canvas = document.getElementById("glCanvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2], BG_COLOR[3]);
    gl.enable(gl.DEPTH_TEST);

    //  Inicializa os shaders e seus atributos
    //
    var program = makeProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);

    // Criando objetos na cena
    ocean();

    // Seta buffers
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

    // Anima
    setInterface();
    render();
};

/* ==================================================================
    Rendering
*/

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
    radius*Math.sin(theta)*Math.sin(phi), 
    radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}

/* ==================================================================
    User Interface
*/

function setInterface() {

    document.getElementById("Button0").onclick = function() {
        radius *= 2.0;
        if (DEBUG) console.log("radius:", radius);
    };

    document.getElementById("Button1").onclick = function() {
        radius *= 0.5;
        if (DEBUG) console.log("radius:", radius);
    };

    document.getElementById("Button2").onclick = function() {
        theta += dr;
        if (DEBUG) console.log("theta:", radius);
    };

    document.getElementById("Button3").onclick = function() {
        theta -= dr;
        if (DEBUG) console.log("theta:", radius);
    };
    
    document.getElementById("Button4").onclick = function() {
        phi += dr;
        if (DEBUG) console.log("phi:", radius);
    };
    
    document.getElementById("Button5").onclick = function() {
        phi -= dr;
        if (DEBUG) console.log("phi:", radius);
    };

}


/* ==================================================================
    Shaders
*/

var vertexShaderSource = `#version 300 es

in  vec4 aPosition;
in  vec4 aColor;
out vec4 vColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main()
{
    gl_Position = uProjectionMatrix*uModelViewMatrix*aPosition;
    vColor = aColor;
}
`

var fragmentShaderSource = `#version 300 es

precision mediump float;

in vec4 vColor;
out vec4 fColor;

void
main()
{
    fColor = vColor;
}
`

/* ==================================================================
    Funções para desenhar.
*/

// desenha retângulo:
// recebe 4 vértices de uma face
// monta os dois triângulos voltados para "fora"
function rect(a, b, c, d, color) {
    positionsArray.push(a);
    positionsArray.push(b);
    positionsArray.push(c);

    colorsArray.push(color);
    colorsArray.push(color);
    colorsArray.push(color);

    positionsArray.push(a);
    positionsArray.push(c);
    positionsArray.push(d);

    colorsArray.push(color);
    colorsArray.push(color);
    colorsArray.push(color);
}

// desenha o oceano com as coordenadas disponíveis no arquivo config.js
function ocean() {
    var [xmin, ymin, xmax, ymax] = cena.oceano;
    var a = vec4(xmin, ymax, 0.0, 1.0);
    var b = vec4(xmin, ymin, 0.0, 1.0);
    var c = vec4(xmax, ymin, 0.0, 1.0);
    var d = vec4(xmax, ymax,  0.0, 1.0);

    var color = vec4(0.0, 0.0, 1.0, 1.0); // FIXME

    rect(a, b, c, d, color);
    if (DEBUG) console.log("Oceano: ", positionsArray);
}
