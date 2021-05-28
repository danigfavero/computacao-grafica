/*
    EP2 de MAC0420/MAC5744 - Paredão

    Autor: Daniela Gonzalez Favero
    Data: 15 de junho de 2021
    Comentários: essa solução foi baseada em ...
*/

// Constantes
const BG_COLOR = [0.0, 0.3, 0.0, 1.0];
const BRICK_COLOR = [1.0, 0.0, 1.0, 1.0];
const BALL_COLOR = [1.0, 1.0, 0.0, 1.0];
const RACKET_COLOR = [0.0, 0.5, 1.0, 1.0];

// Variáveis globais
var canvas, gl
var gWidth, gHeight;
var gProgram;
var gVao;

var gBallSpeed = 5;
var gRacketSize = 5;

var gPaused = false;
var gDebugging = false;

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

    // Botões
    document.getElementById("play").onclick = playOrPauseButton;
    document.getElementById("debug").onclick = debugOrPlayButton;
    document.getElementById("clear").onclick= clearButton;

    // Sliders
    document.getElementById("ballSpeed").onchange = updateBallSpeed;
    document.getElementById("racketSize").onchange = updateRacketSize;

    // Animação
    setInterval(render, 50);
}

// Função de renderização da animação
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(gVao);

    // Roda o pacman
    // ang += delta;
    // gRotation = [ Math.sin(ang), Math.cos(ang) ];
    // gl.uniform2fv(guRotation, gRotation);

    // gl.drawArrays(gl.TRIANGLES, 0, pacman.length/2 );
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
// atributos
in vec2 aPosition;
// Uniformes
uniform vec2 uResolucao;

// Vetor de Translacao;
uniform vec2 uTranslation;

// Parametros de rotacao
uniform vec2 uRotation;

// Parametros de escala
uniform vec2 uScale;

void main() {
    vec2 scaled = aPosition * uScale;

    vec2 rotated = vec2(
        scaled.x * uRotation.y + scaled.y * uRotation.x,
        scaled.y * uRotation.y - scaled.x * uRotation.x);

    vec2 position = rotated + uTranslation;

    // converte pixel para [-1.0,+1.0]
    vec2 zeroToOne = position / uResolucao;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

// fragment shader
var fragmentShaderSrc = `#version 300 es
//
precision highp float;

out vec4 outColor;
uniform vec4 uColor;

void main() {
  outColor = uColor;
}
`;

// ---------------------------------------------------
/*
    Gera Pacman
    centro: (cx, cy)
    r -> raio
    n -> numero de pontos
*/

function geraPacman(raio, n) {
    var pontos = [];
    const cx = 0;
    const cy = 0;
    var delta = 2*Math.PI / n;

    var a = delta;
    var px = Math.floor(Math.cos(a)*raio + cx);
    var py = Math.floor(Math.sin(a)*raio + cy);
    
    for (var i=1; i<n-1; ++i) {
        pontos.push(cx);
        pontos.push(cy);
        pontos.push(px);
        pontos.push(py);
        a += delta;
        px = Math.floor(Math.cos(a)*raio + cx);
        py = Math.floor(Math.sin(a)*raio + cy);
        pontos.push(px);
        pontos.push(py);
        //console.log(i, a, Math.cos(a), Math.sin(a))
    };
    return pontos ;
};
