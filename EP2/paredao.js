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
const KEYS = [A, D, J, K, L, S];

// Cores
const BG_COLOR     = [0.0, 0.3, 0.0, 1.0];
const BRICK_COLOR  = [1.0, 0.0, 1.0, 1.0];
const BALL_COLOR   = [1.0, 1.0, 0.0, 1.0];
const RACKET_COLOR = [0.0, 0.5, 1.0, 1.0];

// Raquete
const RACKET_X        = 0.45;
const RACKET_Y        = 0.10;
const RACKET_H        = 0.01;
const RACKET_SIZE     = 0.235;
const RACKET_MIN_SIZE = 0.03;
const RACKET_SPEED    = 0.02;

// Bolinha
const BALL_X         = RACKET_X + RACKET_MIN_SIZE*2;
const BALL_Y         = RACKET_Y + RACKET_H;
const BALL_SIDE      = 0.02;
const BALL_MIN_SPEED = 0.01;
const BALL_SPEED     = 0.05;
var gBallSpeed     = BALL_SPEED;

// Tijolos
const BRICK_W   = 0.098;
const BRICK_H   = 0.048;
const N_ROWS    = 5;
const N_COLS    = 10;

// Animação
const ANIMATION_STEP = 1.0;

// Variáveis globais
var canvas, gl;
var gProgram;
var gInterval;

// Botões
var gPaused = true;
var gDebugging = false;

// Estruturas
var gStructures = [];
var gRacket;
var gBall;
var gBricks = [];


/*
=====================================================================
    MAIN
=====================================================================
*/

window.onload = main;

function main() {
    // Canvas, webGL
    canvas = document.getElementById("glCanvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    // Carrega o programa com os Shaders
    gProgram = makeProgram(gl, vertexShaderSrc, fragmentShaderSrc);
    gl.useProgram(gProgram);

    // Viewport, tamanho da janela e cor de fundo
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2], BG_COLOR[3]);

    // Gera estruturas do jogo
    generateRacket();
    generateBall();
    generateBricks();

    // Botões
    document.getElementById("play").onclick = playOrPauseButton;
    document.getElementById("debug").onclick = debugOrPlayButton;
    document.getElementById("clear").onclick = clearButton;

    // Sliders
    document.getElementById("ballSpeed").onchange = updateBallSpeed;
    document.getElementById("racketSize").onchange = updateRacketSize;

    // Controle da raquete
    document.addEventListener('keydown', e => keyDown(e));

    // Desenha
    render();
}

// Função de renderização da animação
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    updateRacketPosition();
    updateBallPosition();
    updateBricks();

    gl.useProgram(gProgram);

    // Renderiza raquete
    gl.bindVertexArray(gRacket.vao);
    var translation = [gRacket.x - RACKET_X, 0];
    gl.uniform2fv(gRacket.trans, translation);

    gl.uniform4f(
        gRacket.color,
        gRacket.rgba[0],
        gRacket.rgba[1],
        gRacket.rgba[2],
        gRacket.rgba[3]
    );
    gl.drawArrays(gl.TRIANGLES, 0, gRacket.length/2);

    // Renderiza bolinha
    gl.bindVertexArray(gBall.vao);
    translation = [gBall.x - BALL_X, gBall.y - BALL_Y];
    gl.uniform2fv(gBall.trans, translation);

    gl.uniform4f(
        gBall.color,
        gBall.rgba[0],
        gBall.rgba[1],
        gBall.rgba[2],
        gBall.rgba[3]
    );
    gl.drawArrays(gl.TRIANGLES, 0, gBall.length/2);

    // Renderiza tijolos
    var n = gBricks.length;
    if (gDebugging) console.log("gBricks[0]", gBricks[0].x, gBricks[0].y);
    for (var i = 0; i < n; i++) {
        // para cada tijolo
        gl.bindVertexArray(gBricks[i].vao);
        translation = [0, 0];
        gl.uniform2fv(gBricks[i].trans, translation);

        gl.uniform4f(
            gBricks[i].color,
            gBricks[i].rgba[0],
            gBricks[i].rgba[1],
            gBricks[i].rgba[2],
            gBricks[i].rgba[3]
        );
        gl.drawArrays(gl.TRIANGLES, 0, gBricks[i].length/2);
    }
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
}

function updateRacketSize(e) {
    var newW = parseFloat(e.target.value);
    generateRacket(newW);
    if (gDebugging) console.log("Novo tamanho da raquete:", gRacket.w);
}

function playOrPauseButton(e) {
    var playPauseText = e.target.innerHTML;

    if (playPauseText == "Jogar") { // começa o jogo
        e.target.innerHTML = "Pausar";
        gPaused = false;

        gBall.vx = gBallSpeed;
        gBall.vy = gBallSpeed;
        gInterval = setInterval(render, 200);

        if (gDebugging) console.log("Jogo pausado? ", gPaused);

    } else if (playPauseText == "Pausar") { // pausa o jogo
        e.target.innerHTML = "Jogar";
        gPaused = true;

        gBall.vx = 0;
        gBall.vy = 0;
        clearInterval(gInterval);

        if (gDebugging) console.log("Jogo pausado? ", gPaused);

    } else { // dá um passo
        render();

        if (gDebugging) console.log("PASSO");
    }
}

function debugOrPlayButton(e) {
    var debugText = e.target.innerHTML;

    if (debugText == "Depurar") { // começa a depurar
        e.target.innerHTML = "Jogar";
        document.getElementById('play').innerHTML = "Passo";

        gPaused = false;
        gDebugging = true;

        console.log("MODO DEBUG");

    } else { // vai para o estado de pausa
        e.target.innerHTML = "Depurar";
        document.getElementById('play').innerHTML = "Jogar";

        gPaused = true;
        gDebugging = false;
    }
}

function clearButton(e) {
    if (gDebugging) console.log("Limpando...");

    generateRacket();
    generateBall();
    generateBricks();

    gPaused = true;
    gDebugging = false;

    document.getElementById('ballSpeed').value = BALL_SPEED;
    document.getElementById('racketSize').value = RACKET_SIZE;
    document.getElementById('play').innerHTML = "Jogar";
    document.getElementById('debug').innerHTML = "Depurar";
}

// Controle da Raquete
function keyDown(e) {
    var key = e.keyCode;
    if (!KEYS.includes(key) || gPaused) return;


    if (key == A || key == J) { // esquerda
        gRacket.vx = - RACKET_SPEED;
    } else if (key == S || key == K) { // para
        gRacket.vx = 0.0;
    } else if (key == D || key == L) { // direita
        gRacket.vx = RACKET_SPEED;
    }

    if (gDebugging) {
        console.log("Tecla pressionada: ", e.key);
        console.log("Velocidade da raquete: ", gRacket.vx);
    }
}


/*
=================================================================
    Shaders
    Funções obtidas do material de aula
=================================================================
*/
// vertex shader
var vertexShaderSrc = `#version 300 es

in vec2 aPosition;

uniform vec2 uTranslation;

void main() {
    vec2 translated = aPosition + uTranslation;
    vec2 normalized = 2.0 * translated - 1.0;
    gl_Position = vec4(normalized, 0, 1);
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

/*
=================================================================
    Retângulo: definição da geometria e bindings para o shader
    Funções obtidas do material de aula
=================================================================
*/

// inicializa rect com VAO e Uniforms
function initRect(rect) {

    var positions = rectGeometry(rect);

    // Cria o vao e diz para usar os dados do buffer
    rect.vao = gl.createVertexArray();
    gl.bindVertexArray(rect.vao);

    // Cria o buffer para mandar os dados para a GPU
    var bufferPositions = gl.createBuffer();
    var aPosition  = gl.getAttribLocation(gProgram, "aPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPositions);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    rect.color     = gl.getUniformLocation(gProgram, "uColor");
    rect.trans     = gl.getUniformLocation(gProgram, "uTranslation");
}

// Geometria do retângulo
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

/*
=================================================================
    Raquete
=================================================================
*/

// classe Raquete
function Racket(w) {
    this.x = RACKET_X;
    this.y = RACKET_Y;
    this.h = RACKET_H;
    this.w = w;

    this.rgba = RACKET_COLOR;
    this.vx = 0.0;
}

// cria raquete
function generateRacket(w=RACKET_SIZE) {
    gRacket = new Racket(w);
    if (gDebugging) console.log("Raquete criada: ", gRacket);
    initRect(gRacket);
}

// atualize a posição da raquete
function updateRacketPosition() {
    gRacket.x += gRacket.vx;
    if (gRacket.x < 0 || gRacket.x + gRacket.w > 1) {
        gRacket.vx = 0;

        if (gDebugging) console.log("Raquete na parede: ", gRacket.x, gRacket.y, gRacket.w, gRacket.h);
    }
}

/*
=================================================================
    Bolinha
=================================================================
*/

// classe Bolinha
function Ball() {
    this.x = BALL_X;
    this.y = BALL_Y;
    this.h = BALL_SIDE;
    this.w = BALL_SIDE;

    this.rgba = BALL_COLOR;
    this.vx = 0.0;
    this.vy = 0.0;
}

// cria bolinha
function generateBall() {
    gBall = new Ball();
    if (gDebugging) console.log("Bolinha criada: ", gBall);
    initRect(gBall);
}

// atualize a posição da bolinha
function updateBallPosition() {
    gBall.x += gBall.vx * ANIMATION_STEP;
    if (gBall.x < 0 || gBall.x + gBall.w > 1) {
        gBall.vx *= -1;
        if (gDebugging) console.log("Rebateu em y: ", gBall.x, gBall.vx);
    }

    gBall.y += gBall.vy * ANIMATION_STEP;
    if (gBall.y < 0 || gBall.y + gBall.h > 1) {
        gBall.vy *= -1;
        if (gDebugging) console.log("Rebateu em x: ", gBall.y, gBall.vy);
    }
}

/*
=================================================================
    Tijolos
=================================================================
*/

// classe Tijolo
function Brick(x, y) {
    this.x = x;
    this.y = y;
    this.h = BRICK_H;
    this.w = BRICK_W;
    this.rgba = BRICK_COLOR;
}

// cria grid de tijolos
function generateBricks() {
    var border = 0.002;
    gBricks = [];
    for (var i = 1; i <= N_ROWS; i++) {
        var leftest;
        var cols;
        if (i % 2 == 1) {
            leftest = 0;
            cols = N_COLS;
        } else { // se par, desloca a linha
            leftest = BRICK_W/2;
            cols = N_COLS - 1;
        }

        for (var j = 0; j < cols; j++) {
            var x = leftest + j * (BRICK_W + border);
            var y =  1 - i * (BRICK_H + border);

            var brick = new Brick(x, y);
            initRect(brick);
            gBricks.push(brick);
        }
    }

    if (gDebugging) console.log("Primeiro tijolo: ", gBricks[0]);
}

function updateBricks() {
    var brickDestroyed = false;
    if (brickDestroyed) {
        generateBricks();
    }
}

/*
=================================================================
    Funções auxiliares
=================================================================
*/
function xCollision(rect1, rect2) {
    var l1 = rect1.x;
    var b1 = rect1.y;
    var r1 = l1 + rect1.w;
    var t1 = b1 + rect1.h;

    var l2 = rect2.x;
    var b2 = rect2.y;
    var r2 = l2 + rect2.w;
    var t2 = b2 + rect2.h;

    // rect1 em cima de rect2
    if (b1 <= t2 && t1 >= b2 && r1 <= l2 && l1 >= r2) {
        return true;
    }

    // rect1 embaixo de rect2
    if (false) {
        return true;
    }

    return false;
}

function yCollision(rect1, rect2) {
    var l1 = rect1.x;
    var b1 = rect1.y;
    var r1 = l1 + rect1.w;
    var t1 = b1 + rect1.h;

    var l2 = rect2.x;
    var b2 = rect2.y;
    var r2 = l2 + rect2.w;
    var t2 = b2 + rect2.h;

    // rect1 à esquerda de rect2
    if (false) {
        return true;
    }

    // rect1 à direita de rect2
    if (false) {
        return true;
    }

    return false;
}