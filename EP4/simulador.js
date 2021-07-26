/*
    EP4 - Simulador de vôo - Parte II

    Autor: Daniela Gonzalez Favero
    Data: 30 de julho de 2021
*/
"use strict";

// canvas
var canvas;
var gl;

// animação
var gInterval;

// shaders
var program, program2;

// câmera
var modelViewMatrix, projectionMatrix;
var nMatrix;
var eye;

// Camera position: modelview e projection
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var radius = 400;  // posição inicial do olho: z=400
var theta = 0.8;   // theta inicial: 0.0
var phi = 1.0;     // phi inicial: 0.0
var dr = 5.0 * Math.PI/180.0;

// iluminação
var ctm;
var ambientColor, diffuseColor, specularColor;

// estruturas/buffers
var positionsArray = [];
var normalsArray = [];

// constantes
const DEBUG = true;

// Valores ASCII
const [A, C, D, I, J, K, L, O, S, W, X, Z] = [65, 67, 68, 73, 74, 75, 76, 79, 83, 87, 88, 90];

/* ==================================================================
    Função main
*/
window.onload = function main() {

    canvas = document.getElementById("glCanvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(CYAN[0], CYAN[1], CYAN[2], CYAN[3]);
    gl.enable(gl.DEPTH_TEST);

    // Criando objetos na cena
    drawOcean();
    drawIsland();
    drawPlane();

    // Inicializando shaders
    initSceneShaders();
    initPlaneShaders();

    // UI
    setInterface();

    // Desenha
    render();
};

/* ==================================================================
    Rendering
*/
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Câmera e perspectiva
    eye = vec3(
        radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), 
        radius*Math.cos(theta)
        );

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    nMatrix = normalMatrix(modelViewMatrix, true);

    // PROGAMA DA CENA
    // Usa:
    gl.useProgram(program);
    renderSceneShaders();

    // Desenha:
    var nOceanVertices = 6;
    var nIslandVertices = 6 * cena.mapa.length * cena.mapa[0].length;
    gl.drawArrays(gl.TRIANGLES, 0, nOceanVertices + nIslandVertices);

    // PROGAMA DA NAVE
    // Usa:
    gl.useProgram(program2);
    renderPlaneShaders();

    // Desenha:
    var nPlaneVertices = 6;
    gl.drawArrays(gl.TRIANGLES, nOceanVertices + nIslandVertices, nPlaneVertices);

    // Animação
    // requestAnimationFrame(render);
}

/* ==================================================================
    User Interface
*/
function setInterface() {

    // play/pause
    document.getElementById("Jogar").onclick = function(e) {
        if (e.target.value == "Jogar") { // começa o jogo
            if (DEBUG) console.log("Começou o jogo!");
    
            // html
            e.target.value = "Pausar";
    
            // animação
            gInterval = setInterval(render, 200);
    
        } else { // pausa o jogo
            if (DEBUG) console.log("Jogo pausado.");
            
            // html
            e.target.value = "Jogar";
    
            // animação
            clearInterval(gInterval);
        }
    };

    // passo
    document.getElementById("Passo").onclick = function() {
        if (DEBUG) console.log("Passo.");
        render();
    };

    document.addEventListener('keydown', e => {
        if (DEBUG) console.log("Tecla pressionada: ", e.key, ", Code:", e.keyCode);

        switch (e.keyCode) {

            // translação
            case J:
                console.log("Decrementa velocidade");
                break;

            case L:
                console.log("Incrementa velocidade");
                break;

            case K:
                console.log("Zera velocidade");
                break;

            // câmera
            case I:
                console.log("Aproxima câmera");
                break;

            case O:
                console.log("Afasta câmera");
                break;

            // rotação
            // em x
            case W:
                console.log("Incrementa rotação em x");
                break;

            case X:
                console.log("Decrementa rotação em x");
                break;

            // em y
            case A:
                console.log("Incrementa rotação em y");
                break;

            case D:
                console.log("Decrementa rotação em y");
                break;

            // em z
            case Z:
                console.log("Incrementa rotação em z");
                break;

            case C:
                console.log("Decrementa rotação em z");
                break;

            // zera
            case S:
                console.log("Zera velocidades de rotação");
        }
    });
}

/* ==================================================================
    Funções de desenho
*/
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