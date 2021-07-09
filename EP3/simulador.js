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
var nMatrix, nMatrixLoc;
var eye;

// iluminação
var ctm;
var ambientColor, diffuseColor, specularColor;

// estruturas/buffers
var positionsArray = [];
var normalsArray = [];
var materials = [5.0, 10.0, 20.0, 30.0, 40.0, 100.0];

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
    var program = makeProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);

    // Pré-calcula alguns produtos
    var ambientProducts = [];
    var diffuseProducts = [];
    var specularProducts = [];

    for (var i = 0; i < materials.length; i++) {
        ambientProducts.push(mult(lightAmbient, matAmbient[i]));
        diffuseProducts.push(mult(lightDiffuse, matDiffuse[i]));
        specularProducts.push(mult(lightSpecular, matSpecular[i]));
    }

    if (DEBUG) {
        console.log("PRODUTOS CRIADOS:");
        console.log(ambientProducts);
        console.log(diffuseProducts);
        console.log(specularProducts);
    }

    // Criando objetos na cena
    drawOcean();
    drawIsland();

    // Seta buffers
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    // varyings e uniformes
    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
    nMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");

    gl.uniform4fv(
        gl.getUniformLocation(program,"uAmbientProduct"),
        flatten(ambientProducts)
        );
    gl.uniform4fv(
        gl.getUniformLocation(program, "uDiffuseProduct"),
        flatten(diffuseProducts)
        );
    gl.uniform4fv(
        gl.getUniformLocation(program, "uSpecularProduct"),
        flatten(specularProducts)
        );
    gl.uniform4fv(
        gl.getUniformLocation(program, "uLightPosition"),
        flatten(lightPosition)
        );
    gl.uniform1f( 
        gl.getUniformLocation(program, "uShininess"),
        matShininess
        );

    // UI
    setInterface();

    // Desenha
    render();
};

/* ==================================================================
    Rendering
*/
function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(
        radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), 
        radius*Math.cos(theta)
        );

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    nMatrix = normalMatrix(modelViewMatrix, true)

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix));

    var nOceanVertices = 6;
    var nIslandVertices = 6 * cena.mapa.length * cena.mapa[0].length;
    gl.drawArrays(gl.TRIANGLES, 0, nOceanVertices + nIslandVertices);
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

    document.getElementById("Button6").onclick = function() {
        if (DEBUG) console.log("oops, este opcional não foi implementado");
    };

    document.getElementById("Button7").onclick = function() {
        if (DEBUG) console.log("oops, este opcional não foi implementado");
    };

    document.getElementById("Button8").onclick = function() {
        if (DEBUG) console.log("oops, este opcional não foi implementado");
    };

    document.getElementById("Button9").onclick = function() {
        if (DEBUG) console.log("oops, este opcional não foi implementado");
    };
}

/* ==================================================================
    Shaders
*/
var vertexShaderSource = `#version 300 es

in vec4 aPosition;
in vec4 aNormal;
out vec3 N, L, E;
flat out int matIndex;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec4 uLightPosition;
uniform mat3 uNormalMatrix;

void main() {

    // ajustes da câmera e iluminação
    vec3 light;
    vec3 pos = (uModelViewMatrix * aPosition).xyz;
    if (uLightPosition.a == 0.0) {
        L = - normalize(uLightPosition.xyz);
    } else {
        L = normalize(uLightPosition.xyz - pos.xyz);
    }

    E = - normalize(pos);
    N = normalize(uNormalMatrix * aNormal.xyz);
    gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;

    // define cor de cada material
    int i;
    float materials[6] = float[6](5.0, 10.0, 20.0, 30.0, 40.0, 100.0);
    for (i = 0; i < 6; i++) {
        if (aPosition.z < materials[i]) {
            break;
        }
    }
    matIndex = i;
}
`

var fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec4 uAmbientProduct[6];
uniform vec4 uDiffuseProduct[6];
uniform vec4 uSpecularProduct[6];
uniform float uShininess[6];

in vec3 N, L, E;
flat in int matIndex;
out vec4 fColor;

void main() {

    vec3 H = normalize(L + E);
    vec4 ambient = uAmbientProduct[matIndex];

    float Kd = max(dot(L, N), 0.0);
    vec4 diffuse = Kd * uDiffuseProduct[matIndex];

    float Ks = pow(max(dot(N, H), 0.0), uShininess[matIndex]);
    vec4 specular = Ks * uSpecularProduct[matIndex];

    if (dot(L, N) < 0.0) {
        specular = vec4(0.0, 0.0, 0.0, 1.0);
    }

    fColor = ambient + diffuse + specular;
    fColor.a = 1.0;
}
`

/* ==================================================================
    Funções para desenhar primitivas geométricas
*/
// desenha retângulo:
// recebe 4 vértices de uma face
// monta os dois triângulos voltados para "fora"
function rect(a, b, c, d) {
    triangle(a, b, c);
    triangle(a, c, d);
}

// desenha triângulo:
// recebe 3 vértices de um triângulo
// monta o triângulo voltado para "fora"
function triangle(a, b, c) {
    var t1 = subtract(b, a);
    var t2 = subtract(c, a);
    var normal = normalize(cross(t2, t1));
    normal = vec4(normal[0], normal[1], normal[2], 0.0);

    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);

    positionsArray.push(a);
    positionsArray.push(b);
    positionsArray.push(c);
}

/* ==================================================================
    Funções de criação dos elementos da cena
*/
// desenha o oceano com as coordenadas disponíveis no arquivo config.js
function drawOcean() {
    var [xmin, ymin, xmax, ymax] = cena.oceano;
    var a = vec4(xmin, ymax, 0.0, 1.0);
    var b = vec4(xmin, ymin, 0.0, 1.0);
    var c = vec4(xmax, ymin, 0.0, 1.0);
    var d = vec4(xmax, ymax,  0.0, 1.0);

    rect(a, b, c, d);
    if (DEBUG) console.log("Oceano criado dentro dos limites: ", 
                            [xmin, ymin, xmax, ymax] );
}

// desenha a ilha com as coordenadas disponíveis no arquivo config.js
function drawIsland() {
    var [xmin, ymin, xmax, ymax] = cena.ilha;

    for (var x = xmin; x < xmax-1; x++) {
        for (var y = ymin; y < ymax-1; y++) {
            var [i, j] = [x + 50, y + 50];

            var a = vec4(  x, y+1,   cena.mapa[i][j+1], 1.0);
            var b = vec4(  x,   y,     cena.mapa[i][j], 1.0);
            var c = vec4(x+1,   y,   cena.mapa[i+1][j], 1.0);
            var d = vec4(x+1, y+1, cena.mapa[i+1][j+1], 1.0);

            rect(a, b, c, d);
        }
    }
    if (DEBUG) console.log("Ilha criada dentro dos limites: ", 
                            [xmin, ymin, xmax, ymax] );
}
