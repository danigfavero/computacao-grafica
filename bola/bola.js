"use strict";

/*
   MAC0420/MAC5744 - Computação Gráfica
 
   bola3.js
 
   Exemplo de 3 transformações básicas em 2D:
   - translação
   - rotação
   - escala

   A translação e escala são controlados por sliders
   enquanto a rotação é uma animação.
   
    USA: webglUtils.js
*/

// ---------------------------------------------------
// Constantes
const COR_FUNDO = [1.0, 1.0, 1.0, 1.0];
const COR_OBJETO = [1.0, 0.0, 0.0, 1.0];

// quanto maior esse número mais devagar será a animação
const ANIMATION_STEP = 20;  
const PACMAN_RADIUS = 30;
const PACMAN_RESOLUTION = 16;

// ---------------------------------------------------
var gl;
var canvas;

// variáveis globais dos Sliders
var gTranslation;
var gRotation;
var gScale;

// variáveis globais usados nos shaders
var guTranslation;
var guRotation;
var guScale;

var gProgram;
var gVao;

// estrutura
var pacman;


/*
=====================================================================
    MAIN
=====================================================================
*/

window.onload = main;

function main() {

    canvas = document.getElementById("glCanvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );

    gTranslation = [Math.floor(canvas.width/2), Math.floor(canvas.height/2)];
    gRotation = [0.0, 1.0];   // sem rotacao -> seno zero e cosseno um
    gScale = [1.0, 1.0];      // escala 1

    // Carrega o programa com os shaders
    gProgram = makeProgram(gl, vertexShaderSrc, fragmentShaderSrc);
    gl.useProgram(gProgram);

    // Gera os vértices
    pacman = geraPacman( PACMAN_RADIUS, PACMAN_RESOLUTION );

    // cria o gVao e diga para usar os dados do buffer
    gVao = gl.createVertexArray();
    gl.bindVertexArray(gVao);
    // Criar o buffer para mandar os dados para a GPU
    var bufferPosicoes = gl.createBuffer();
    var jsaPosition  = gl.getAttribLocation(gProgram, "aPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosicoes );
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pacman), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(jsaPosition);
    gl.vertexAttribPointer( jsaPosition, 2, gl.FLOAT, false, 0, 0);

    // Viewport, tamanho da janela e cor de fundo
    var jsuResolucao = gl.getUniformLocation(gProgram, "uResolucao");
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.uniform2f(jsuResolucao, gl.canvas.width, gl.canvas.height);
    gl.clearColor( COR_FUNDO[0], COR_FUNDO[1], COR_FUNDO[2], COR_FUNDO[3] );
    var jsuColor = gl.getUniformLocation(gProgram, "uColor");
    gl.uniform4fv(jsuColor, COR_OBJETO);

    // Transformacoes
    guTranslation = gl.getUniformLocation(gProgram, "uTranslation");
    guRotation    = gl.getUniformLocation(gProgram, "uRotation");
    guScale       = gl.getUniformLocation(gProgram, "uScale");
    gl.uniform2fv(guTranslation, gTranslation);
    gl.uniform2fv(guRotation, gRotation);
    gl.uniform2fv(guScale, gScale);

    // Sliders
    document.getElementById("translacaoX").onchange = updatePosX;
    document.getElementById("translacaoY").onchange = updatePosY;
    document.getElementById("escalaX").onchange = updateSX;
    document.getElementById("escalaY").onchange = updateSY;

    setInterval(render, 50);  // Cuida da animação    
}

var cont = 0;
var ang = 0;
var delta = Math.PI/ANIMATION_STEP;

function render() {
    // limpa a tela
    gl.clear( gl.COLOR_BUFFER_BIT );

    // Agora é só desenhar usando um VAO
    gl.bindVertexArray(gVao);

    // Roda o pacman
    ang += delta;
    gRotation = [ Math.sin(ang), Math.cos(ang) ];
    gl.uniform2fv(guRotation, gRotation);

    gl.drawArrays(gl.TRIANGLES, 0, pacman.length/2 );
}

/*
=================================================================
    Callbacks
    Funções para tratamento dos eventos de interação
=================================================================
*/
// Slider: chama render quando modificado
function updatePosX( e ){
    gTranslation[0] = e.target.value;
    console.log("Translacao x: ", gTranslation[0]);
    // Set the translation.
    gl.uniform2fv(guTranslation, gTranslation);
    // render(); desnecessário devido a animação
    };

function updatePosY( e ){
    gTranslation[1] = e.target.value;
    console.log("Translacao y: ", gTranslation[1]);
    // Set the translation.
    gl.uniform2fv(guTranslation, gTranslation);
    // render(); 
    };

function updateSX( e ){
    gScale[0] = e.target.value;
    console.log("Delta x: ", gScale[0]);
    // Set the Scale.
    gl.uniform2fv(guScale, gScale);
    // render(); 
    };

function updateSY( e ){
    gScale[1] = e.target.value;
    console.log("Escala y: ", gScale[1]);
    // Set the Scale.
    gl.uniform2fv(guScale, gScale);
    // render(); 
    };
    

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

// -----------------------------------------------------
