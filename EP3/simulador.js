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
var colorsArray = []; // FIXME! provisório enquanto não há iluminação
var materials = [5, 10, 20, 30, 40]; 

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

    // precalcula alguns produtos
    // var ambientProducts = [];
    // var diffuseProducts = [];
    // var specularProducts = [];

    // for (var i = 0; i <= materials.length; i++) {
    //     ambientProducts.push(mult(lightAmbient, matAmbient[i]));
    //     diffuseProducts.push(mult(lightDiffuse, matDiffuse[i]));
    //     specularProducts.push(mult(lightSpecular, matSpecular[i]));
    // }
    // FIXME — esse é um placeholder:
    var ambientProduct = mult(lightAmbient, matAmbient[1]);
    var diffuseProduct = mult(lightDiffuse, matDiffuse[1]);
    var specularProduct = mult(lightSpecular, matSpecular[1]);

    // Criando objetos na cena
    ocean();
    island();

    // Seta buffers
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    // FIXME: esse color buffer vai embora eventualmente
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

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

    // FIXME: são vários produtos...
    gl.uniform4fv(
        gl.getUniformLocation(program,"uAmbientProduct"),
        flatten(ambientProduct)
        );
    gl.uniform4fv(
        gl.getUniformLocation(program, "uDiffuseProduct"),
        flatten(diffuseProduct)
        );
    gl.uniform4fv(
        gl.getUniformLocation(program, "uSpecularProduct"), 
        flatten(specularProduct)
        );
    gl.uniform4fv(
        gl.getUniformLocation(program, "uLightPosition"),
        flatten(lightPosition)
        );
    // gl.uniform1f( 
    //     gl.getUniformLocation(program, "uShininess"),
    //     matShininess
    //     ); 
    // placeholder abaixo:
    gl.uniform1f( 
        gl.getUniformLocation(program, "uShininess"),
        matShininess[1]
        );

    // Anima
    setInterface();
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

    var nVertices = 60006; // FIXME escreve uma equação decente
    gl.drawArrays(gl.TRIANGLES, 0, nVertices);
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

in vec4 aPosition;
in vec4 aNormal;
out vec3 N, L, E;
in  vec4 aColor; // FIXME
out vec4 vColor; // FIXME

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec4 uLightPosition;
uniform mat3 uNormalMatrix;

void main() {
    vec3 light;
    vec3 pos = (uModelViewMatrix * aPosition).xyz;
    if (uLightPosition.a == 0.0)
        L = normalize(uLightPosition.xyz);
    else
        L = normalize(uLightPosition.xyz - pos.xyz);

    E = - normalize(pos);
    N = normalize(uNormalMatrix * aNormal.xyz);
    gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
    
    vColor = aColor; // FIXME
}
`

var fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec4 uAmbientProduct;
uniform vec4 uDiffuseProduct;
uniform vec4 uSpecularProduct;
uniform float uShininess;

in vec3 N, L, E;
out vec4 fColor;
in vec4 vColor; // FIXME

void main() {
    vec3 H = normalize(L + E);
    vec4 ambient = uAmbientProduct;

    float Kd = max(dot(L, N), 0.0);
    vec4 diffuse = Kd * uDiffuseProduct;

    float Ks = pow(max(dot(N, H), 0.0), uShininess);
    vec4 specular = Ks * uSpecularProduct;

    if(dot(L, N) < 0.0)
        specular = vec4(0.0, 0.0, 0.0, 1.0);

    // fColor = ambient + diffuse + specular;
    fColor = (ambient + diffuse + specular); // FIXME
    fColor.a = 1.0;
}
`

/* ==================================================================
    Funções para desenhar.
*/

// desenha retângulo:
// recebe 4 vértices de uma face
// monta os dois triângulos voltados para "fora"
function rect(a, b, c, d, color) {
    triangle(a, b, c, color);
    triangle(a, c, d, color);
}

// desenha triângulo:
// recebe 3 vértices de um triângulo
// monta o triângulo voltado para "fora"
function triangle(a, b, c, color) {
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

    // FIXME: deletar color
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

    var color = matAmbient[0]; // FIXME

    rect(a, b, c, d, color);
    if (DEBUG) console.log("Oceano: ", positionsArray);
}

function island() {
    var [xmin, ymin, xmax, ymax] = cena.ilha;

    for (var x = xmin; x < xmax-1; x++) {
        for (var y = ymin; y < ymax-1; y++) {
            var [i, j] = [x + 50, y + 50];

            var a = vec4(  x, y+1,   cena.mapa[i][j+1], 1.0);
            var b = vec4(  x,   y,     cena.mapa[i][j], 1.0);
            var c = vec4(x+1,   y,   cena.mapa[i+1][j], 1.0);
            var d = vec4(x+1, y+1, cena.mapa[i+1][j+1], 1.0);

            var color = matAmbient[getMaterial(cena.mapa[i][j], materials)]; // FIXME
            //TODO: talvez seja uma boa ideia passar uma cor por vertice
            rect(a, b, c, d, color);
        }
    }
}

function getMaterial(height, materials) {
    for (var i = 0; i < materials.length; i++) {
        if (height < materials[i]) {
            return i;
        }
    }
    return i;
}
