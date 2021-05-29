/*
    EP2 de MAC0420/MAC5744 - Paredão

    Autor: Daniela Gonzalez Favero
    Data: 15 de junho de 2021
    Comentários: essa solução foi baseada em ...
*/

// Constantes
// Cores
const BG_COLOR     = [0.0, 0.3, 0.0, 1.0];
const BRICK_COLOR  = [1.0, 0.0, 1.0, 1.0];
const BALL_COLOR   = [1.0, 1.0, 0.0, 1.0];
const RACKET_COLOR = [0.0, 0.5, 1.0, 1.0];

// Dimensão da raquete
const RACKET_X = 0.45;
const RACKET_Y = 0.10;
const RACKET_H = 0.01;

// Variáveis globais
var canvas, gl
var gWidth, gHeight;
var gProgram;
var gVao;

// Sliders
var gBallSpeed = 5;
var gRacketSize = 0.235;

// Botões
var gPaused = false;
var gDebugging = false;

// Estruturas
var racket;

/*
=====================================================================
    MAIN
=====================================================================
*/

window.onload = main;

function main() {
    // Cria canvas
    canvas = document.getElementById("glCanvas");
    gWidth = canvas.width;
    gHeight = canvas.height;

    if (gDebugging) console.log(`Canvas tem tamanho ${gWidth} x ${gHeight}`);

    // Cria o contexto do WebGL
    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    // Carrega o programa com os Shaders
    gProgram = makeProgram(gl, vertexShaderSrc, fragmentShaderSrc);
    gl.useProgram(gProgram);

    // Gera raquete
    racket = generateRacket();

    // Cria o gVao e diz para usar os dados do buffer
    gVao = gl.createVertexArray();
    gl.bindVertexArray(gVao);

    // Cria o buffer para mandar os dados para a GPU
    var bufferPosicoes = gl.createBuffer();
    var jsaPosition  = gl.getAttribLocation(gProgram, "aPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosicoes );
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(racket), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(jsaPosition);
    gl.vertexAttribPointer(jsaPosition, 2, gl.FLOAT, false, 0, 0);

    // Viewport, tamanho da janela e cor de fundo
    var jsuResolution = gl.getUniformLocation(gProgram, "uResolution");
    gl.viewport(0, 0, gWidth, gHeight);
    gl.uniform2f(jsuResolution, gWidth, gHeight);
    gl.clearColor(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2], BG_COLOR[3]);
    var jsuRacketColor = gl.getUniformLocation(gProgram, "uRacketColor");
    gl.uniform4fv(jsuRacketColor, RACKET_COLOR);

    // Botões
    document.getElementById("play").onclick = playOrPauseButton;
    document.getElementById("debug").onclick = debugOrPlayButton;
    document.getElementById("clear").onclick= clearButton;

    // Sliders
    document.getElementById("ballSpeed").onchange = updateBallSpeed;
    document.getElementById("racketSize").onchange = updateRacketSize;

    // Animação
    // setInterval(render, 50);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, racket.length/2);
}

// Função de renderização da animação
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(gVao);

    // Roda o pacman
    // ang += delta;
    // gRotation = [ Math.sin(ang), Math.cos(ang) ];
    // gl.uniform2fv(guRotation, gRotation);

    gl.drawArrays(gl.TRIANGLES, 0, racket.length/2);
}

/*
=================================================================
    Callbacks
    Funções para tratamento dos eventos de interação
=================================================================
*/
// Slider: chama render quando modificado
function updateBallSpeed(e) {
    gBallSpeed = e.target.value;
    if (gDebugging) console.log("Velocidade da bola: ", gBallSpeed);
    // Set the translation.
    // gl.uniform2fv(guTranslation, gTranslation);
    // render(); desnecessário devido a animação
}

function updateRacketSize(e) {
    gRacketSize = e.target.value;
    if (gDebugging) console.log("Tamanho da raquete: ", gRacketSize);
    // Set the translation.
    // gl.uniform2fv(guTranslation, gTranslation);
    // render(); 
}
// Botões: 
function playOrPauseButton(e) {
    var playPauseText = e.target.innerHTML;
    
    if (playPauseText == "Jogar") {
        e.target.innerHTML = "Pausar";
        gPaused = true;
    } else {
        e.target.innerHTML = "Jogar";
        gPaused = false;
    }
    if (gDebugging) console.log("Jogo pausado? ", gPaused);
}

function debugOrPlayButton(e) {
    var debugText = e.target.innerHTML;

    if (debugText == "Depurar") {
        e.target.innerHTML = "Jogar";
        gDebugging = true;
    } else {
        e.target.innerHTML = "Depurar";
        gDebugging = false;
    }
    if (gDebugging) console.log("MODO DEBUG");
}

function clearButton(e) {
    if (gDebugging) console.log("Limpando...");
}

// ---------------------------------------------------
// ---------------------------------------------------
// Shaders
// ---------------------------------------------------
// vertex shader
var vertexShaderSrc = `#version 300 es

in vec2 aPosition;
uniform vec2 uResolution;

void main() {
    vec2 normalized = aPosition * 2.0 - 1.0;
    gl_Position = vec4(normalized, 0, 1);
}
`;

// fragment shader
var fragmentShaderSrc = `#version 300 es
precision highp float;

out vec4 outColor;
uniform vec4 uRacketColor;

void main() {
    outColor = uRacketColor;
}
`;

// ---------------------------------------------------

/*
*/
function generateRacket() {
// vai retornar um Float32Array pra usar no buffer
    var topLeft     = [RACKET_X,               RACKET_Y];
    var topRight    = [RACKET_X + gRacketSize, RACKET_Y];
    var bottomLeft  = [RACKET_X,               RACKET_Y + RACKET_H];
    var bottomRight = [RACKET_X + gRacketSize, RACKET_Y + RACKET_H];

    var racketPoints = [
        topLeft[0],     topLeft[1],
        topRight[0],    topRight[1],
        bottomLeft[0],  bottomLeft[1],

        bottomRight[0], bottomRight[1],
        topRight[0],    topRight[1],
        bottomLeft[0],  bottomLeft[1]
    ];
    return racketPoints;
}
