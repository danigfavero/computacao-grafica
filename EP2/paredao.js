/*
    EP2 de MAC0420/MAC5744 - Paredão

    Autor: Daniela Gonzalez Favero
    Data: 15 de junho de 2021
    Comentários: essa solução foi baseada em ...
*/

// Valores ASCII
const A = 65;
const D = 68;
const J = 74;
const K = 75;
const L = 76;
const S = 83;

// Cores
const BG_COLOR     = [0.0, 0.3, 0.0, 1.0];
const BRICK_COLOR  = [1.0, 0.0, 1.0, 1.0];
const BALL_COLOR   = [1.0, 1.0, 0.0, 1.0];

// Raquete
const RACKET_SPEED = 0.02;
const RACKET_SIZE = 0.235;

// Animação
const ANIMATION_STEP = 1.0;

// Variáveis globais
var canvas, gl
var gWidth, gHeight;
var gProgram;
var gVao;

// Sliders
var gBallSpeed = 0.05;
var gRacketSize = 0.235;

// Botões
var gPaused = false;
var gDebugging = true;

// Estruturas
var gStructures = [];
var gRacket;


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

    // Viewport, tamanho da janela e cor de fundo
    gl.viewport(0, 0, gWidth, gHeight);
    gl.clearColor(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2], BG_COLOR[3]);

    // Gera raquete
    generateRacket();

    // Botões
    document.getElementById("play").onclick = playOrPauseButton;
    document.getElementById("debug").onclick = debugOrPlayButton;
    document.getElementById("clear").onclick= clearButton;

    // Sliders
    document.getElementById("ballSpeed").onchange = updateBallSpeed;
    document.getElementById("racketSize").onchange = updateRacketSize;

    // Controle da raquete
    document.addEventListener('keydown', e => keyDown(e));

    // Desenha
    render();
    // setInterval(render, 50);
}

// Função de renderização da animação
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    updateRacketPosition();

    gl.useProgram(gProgram);

    gTranslation = [gRacket.vx, 0];
    gl.uniform2fv(gRacket.trans, gTranslation);

    gl.uniform4f(gRacket.color, gRacket.rgba[0],
        gRacket.rgba[1], gRacket.rgba[2], gRacket.rgba[3]);
    gl.drawArrays(gl.TRIANGLES, 0, gRacket.length/2);
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
    let newW = parseFloat(e.target.value);
    generateRacket(newW);
    render();
    if (gDebugging) console.log("Novo tamanho da raquete:", gRacket.w);
}

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

// Controle da Raquete
function keyDown(e) {
    if (gDebugging) console.log("Tecla pressionada: ", e.key);

    if (e.keyCode == A || e.keyCode == J) { // esquerda
        gRacket.vx = - RACKET_SPEED;
    } else if (e.keyCode == S || e.keyCode == K) { // para
        gRacket.vx = 0.0;
    } else if (e.keyCode == D || e.keyCode == L) { // direita
        gRacket.vx = RACKET_SPEED;
    }
    if (gDebugging) console.log("Velocidade da raquete: ", gRacket.vx);
}

// ---------------------------------------------------
// ---------------------------------------------------
// Shaders
// ---------------------------------------------------
// vertex shader
var vertexShaderSrc = `#version 300 es

in vec2 aPosition;

uniform vec2 uTranslation;

void main() {
    vec2 normalized = aPosition * 2.0 - 1.0;
    vec2 translated = normalized + uTranslation;
    gl_Position = vec4(translated, 0, 1);
}
`;

// fragment shader
var fragmentShaderSrc = `#version 300 es
precision highp float;

out vec4 outColor;
uniform vec4 uColor;

void main() {
    outColor = uColor;
}
`;

// ---------------------------------------------------

/*
*/
function Racket(w) {
    this.x = 0.45;
    this.y = 0.10;
    this.h = 0.01;
    this.w = w;

    this.rgba = [0.0, 0.5, 1.0, 1.0];


    // velocidade
    this.vx = 0.0;

    // this.vao será criado no initRacket
}

// inicializa rect com VAO e Uniforms
function initRacket(racket) {

    var positions = rectGeometry(racket);

    // Cria o vao e diz para usar os dados do buffer
    racket.vao = gl.createVertexArray();
    gl.bindVertexArray(racket.vao);

    // Cria o buffer para mandar os dados para a GPU
    var bufferPositions = gl.createBuffer();
    var aPosition  = gl.getAttribLocation(gProgram, "aPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPositions);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    racket.color     = gl.getUniformLocation(gProgram, "uColor");
    racket.trans     = gl.getUniformLocation(gProgram, "uTranslation");
}

// Geometria do retângulo
// função obtida do material de aula
function rectGeometry(rect) {
    var pos = [];

    var l = rect.x;
    var b = rect.y;
    var w = rect.w;
    var h = rect.h;
    var r = l + w;
    var t = b + h;

    // triangulo inferior
    pos.push(l);
    pos.push(b);
    pos.push(r);
    pos.push(b);
    pos.push(r);
    pos.push(t);
    // triangulo superior
    pos.push(l);
    pos.push(b);
    pos.push(l);
    pos.push(t);
    pos.push(r);
    pos.push(t);
    
    rect.length = pos.length;
    return pos;
}

function generateRacket(w=RACKET_SIZE) {
    gRacket = new Racket(w);
    if (gDebugging) console.log("Raquete criada: ", gRacket);
    initRacket(gRacket);
}

// atualize a posição da raquete
function updateRacketPosition() {
    gRacket.x += gRacket.vx * ANIMATION_STEP;
    if (gRacket.x < 0 || gRacket.x + gRacket.w > 1) {
        gRacket.vx *= -1;
    }

    //if (gDebugging) console.log("Atualize raquete: ", gRacket.x);
}
