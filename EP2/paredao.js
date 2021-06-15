/*
    EP2 de MAC0420/MAC5744 - Paredão

    Autor: Daniela Gonzalez Favero
    Data: 15 de junho de 2021
    Comentários: essa solução foi baseada no material de aula.
    As funções dos shaders e da geometria do retângulo foram quase que
    totalmente copiadas (com algumas modificações) do arquivo rects.js.
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

// Flags
var brickDestroyed = false;


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
    
    // atualiza objetos (variáveis globais)
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
// Slider 'velocidade da bolinha': altera módulo da velocidade em meio ao jogo,
// mas mantém a direção atual
function updateBallSpeed(e) {
    if (gDebugging) console.log("Nova velocidade da bola: ", gBallSpeed);

    gBallSpeed = e.target.value;
    if (gBall.vx != 0 && gBall.vx != 0) {
        gBall.vx = Math.sign(gBall.vx) * gBallSpeed;
        gBall.vy = Math.sign(gBall.vy) * gBallSpeed;
    }
}

// Slider 'tamanho da raquete': desenha a raquete novamente
function updateRacketSize(e) {
    if (gDebugging) console.log("Novo tamanho da raquete:", gRacket.w);

    var newW = parseFloat(e.target.value);
    generateRacket(newW);
    render();
}

function playOrPauseButton(e) {
    var playPauseText = e.target.innerHTML;

    if (playPauseText == "Jogar") { // começa o jogo
        if (gDebugging) console.log("Jogo pausado? ", gPaused);

        // html
        e.target.innerHTML = "Pausar";

        // variáveis globais
        gPaused = false;

        // animação
        if (gBall.vx == 0 && gBall.vx == 0) {
            gBall.vx = gBallSpeed;
            gBall.vy = gBallSpeed;
        }
        gInterval = setInterval(render, 200);

    } else if (playPauseText == "Pausar") { // pausa o jogo
        if (gDebugging) console.log("Jogo pausado? ", gPaused);
        
        // html
        e.target.innerHTML = "Jogar";
        
        // variáveis globais
        gPaused = true;

        // animação
        clearInterval(gInterval);

    } else { // dá um passo
        if (gDebugging) console.log("PASSO");

        // animação
        render();

    }
}

function debugOrPlayButton(e) {
    var debugText = e.target.innerHTML;

    if (debugText == "Depurar") { // começa a depurar
        console.log("MODO DEBUG");
        // html
        e.target.innerHTML = "Jogar";
        document.getElementById('play').innerHTML = "Passo";

        // variáveis globais
        gDebugging = true;

        // animação
        clearInterval(gInterval);
        if (gBall.vx == 0 && gBall.vx == 0) {
            gBall.vx = gBallSpeed;
            gBall.vy = gBallSpeed;
        }
        gPaused = false;

    } else { // vai para o estado de pausa

        // html
        e.target.innerHTML = "Depurar";
        document.getElementById('play').innerHTML = "Jogar";

        // variáveis globais
        gPaused = true;
        gDebugging = false;
    }
}

function clearButton(e) {
    clear();
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

// Função auxiliar, chamada quando:
// - o usuário aperta o botão 'Limpar'
// - o jogador perde o jogo
function clear() {
    if (gDebugging) console.log("Limpando...");

    // reset canvas
    generateRacket();
    generateBall();
    generateBricks();
    clearInterval(gInterval);

    // variáveis globais
    gPaused = true;
    gDebugging = false;
    document.getElementById('ballSpeed').value = BALL_SPEED;
    document.getElementById('racketSize').value = RACKET_SIZE;

    // html
    document.getElementById('play').innerHTML = "Jogar";
    document.getElementById('debug').innerHTML = "Depurar";

    render();
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
    var aPosition = gl.getAttribLocation(gProgram, "aPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPositions);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    rect.color = gl.getUniformLocation(gProgram, "uColor");
    rect.trans = gl.getUniformLocation(gProgram, "uTranslation");
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

// cria o objeto Raquete e faz os bindings necessários para o WebGL
function generateRacket(w=RACKET_SIZE) {
    gRacket = new Racket(w);
    if (gDebugging) console.log("Raquete criada: ", gRacket);
    initRect(gRacket);
}

// atualize a posição da raquete
function updateRacketPosition() {
    gRacket.x += gRacket.vx;

    // se chegou a alguma parede, para
    if (gRacket.x < 0 || gRacket.x + gRacket.w > 1) {
        gRacket.vx = 0;

        if (gDebugging)
            console.log("Raquete na parede: x=", gRacket.x, "vx=", gRacket.vx);
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

// cria o objeto Bolinha e faz os bindings necessários para o WebGL
function generateBall() {
    gBall = new Ball();
    if (gDebugging) console.log("Bolinha criada: ", gBall);
    initRect(gBall);
}

// atualize a posição da bolinha
function updateBallPosition() {

    // velocidade no eixo x
    gBall.x += gBall.vx * ANIMATION_STEP;
    if (gBall.x < 0 || gBall.x + gBall.w > 1 || ballXCollisions()) {
        if (gDebugging)
            console.log("Bolinha rebateu: x=", gBall.x, "vx=", gBall.vx);

        // inverte a direção
        gBall.vx *= -1;
    }

    // velocidade no eixo y
    gBall.y += gBall.vy * ANIMATION_STEP;
    if (gBall.y + gBall.h > 1 || ballYCollisions()) {
        if (gDebugging)
        console.log("Bolinha rebateu: y=", gBall.y, "vy=", gBall.vy);

        // inverte a direção
        gBall.vy *= -1;
    }
    if (gBall.y < 0) { // perdeu o jogo
        if (gDebugging) console.log("GAME OVER!");
        clear();
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

// cria o grid de objetos Tijolo e faz os bindings necessários para o WebGL
function generateBricks() {
    var border = 0.002;

    gBricks = [];
    for (var i = 1; i <= N_ROWS; i++) {
        var leftest;
        var cols;

        // determina posição dos tijolos de acordo com a paridade da linha
        if (i % 2 == 1) {
            leftest = 0;
            cols = N_COLS;
        } else { // se par, desloca a linha
            leftest = BRICK_W/2;
            cols = N_COLS - 1;
        }

        for (var j = 0; j < cols; j++) {

            // define posição no grid
            var x = leftest + j * (BRICK_W + border);
            var y =  1 - i * (BRICK_H + border);

            // cria objeto e faz os bindings
            var brick = new Brick(x, y);
            initRect(brick);
            gBricks.push(brick);
        }
    }

    if (gDebugging) console.log("Primeiro tijolo: ", gBricks[0]);
}

// verifica se sobrou algum tijolo
function updateBricks() {
    if (!gBricks.length) {
        if (gDebugging) console.log("VOCÊ VENCEU!!!!");
        clear();
    }
}

// remove tijolo destruído da lista de tijolos
function deleteBricks(bricksIndexes) {
    var n = bricksIndexes.length;
    for (var i = 0; i < n; i++) {
        gBricks.splice(bricksIndexes[i], 1);
    }

    brickDestroyed = true;

    if (gDebugging) console.log("Novo array de tijolos: ", gBricks);
}


/*
=================================================================
    Funções auxiliares
=================================================================
*/
// verifica se a bolinha colidiu com algum objeto em seu trajeto, no eixo X
// também deleta bloco se destruído
function ballXCollisions() {
    var destroyedBricks = [];
    var n = gBricks.length;
    for (var i = 0; i < n; i++) {

        if (xCollision(gBall, gBricks[i])) {
            destroyedBricks.push(i);
        }
    }

    if (destroyedBricks.length) {
        deleteBricks(destroyedBricks);
    }

    return destroyedBricks.length || xCollision(gBall, gRacket);
}

// verifica se a bolinha colidiu com algum objeto em seu trajeto, no eixo Y
// também deleta bloco se destruído
function ballYCollisions() {
    var destroyedBricks = [];
    var n = gBricks.length;
    for (var i = 0; i < n; i++) {
        if (yCollision(gBall, gBricks[i])) {
            destroyedBricks.push(i);
        }
    }

    if (destroyedBricks.length) {
        deleteBricks(destroyedBricks);
    }

    return destroyedBricks.length || yCollision(gBall, gRacket);
}

function xCollision(rect1, rect2, eps=0.001) {
    var l1 = rect1.x;
    var b1 = rect1.y;
    var r1 = l1 + rect1.w;
    var t1 = b1 + rect1.h;

    var l2 = rect2.x;
    var b2 = rect2.y;
    var r2 = l2 + rect2.w;
    var t2 = b2 + rect2.h;

    // rect1 à esquerda de rect2
    if ((b1 <= t2 + eps) && (t1 + eps >= b2) && (eq(r1, l2, eps)) && (l1 <= r2 + eps)) {
        if (gDebugging) 
            console.log("Colisão em x: r1=l2=", r1);

        return true;
    }

    // rect1 à de rect2
    if ((b2 <= t1 + eps) && (t2 + eps >= b1) && (eq(l2, r1, eps)) && (l2 <= r1 + eps)) {
        if (gDebugging) 
            console.log("Colisão em x: l2=r1=", r1);

        return true;
    }

    return false;
}

function yCollision(rect1, rect2, eps=0.001) {
    var l1 = rect1.x;
    var b1 = rect1.y;
    var r1 = l1 + rect1.w;
    var t1 = b1 + rect1.h;

    var l2 = rect2.x;
    var b2 = rect2.y;
    var r2 = l2 + rect2.w;
    var t2 = b2 + rect2.h;

    // rect1 em cima de rect2
    if ((eq(b1, t2, eps)) && (t1 + eps >= b2) && (r1 + eps>= l2) && (l1 <= r2 + eps)) {
        if (gDebugging) 
            console.log("Colisão em y: b1=t2=", b1);

        return true;
    }

    // rect1 embaixo de rect2
    if ((eq(b2, t1, eps)) && (t2 + eps >= b1) && (r2 + eps>= l1) && (l2 <= r1 + eps)) {
        if (gDebugging) 
            console.log("Colisão em y: b2=t1=", t1);

        return true;
    }
    return false;
}

function overlaps(l1, b1, r1, t1, l2, b2, r2, t2) {
    if (l1 >= r2 || l2 >= r1) {
        return false;
    }
    if (t1 >= b2 || t2 >= b1) {
        return false;
    }
    return true;
}


// verifica se dois números x,y são iguais com precisão eps
function eq(x, y, eps) { 
    return (x <= y + eps) && (y <= x + eps);
}