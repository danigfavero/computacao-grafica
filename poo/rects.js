"use strict";

/*
   MAC0420/MAC5744 - Computação Gráfica
 
   rects.js

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
var gPosicoes = [];


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

    // Carrega o programa com os shaders
    gProgram = makeProgram(gl, vertexShaderSrc, fragmentShaderSrc);
    gl.useProgram(gProgram);

    // Gera os vértices
    var rects = crieRects(1, [1.0, 1.0, 0.0, 1.0]);
    desenheTudo(rects, gPosicoes);

    // cria o gVao e diga para usar os dados do buffer
    gVao = gl.createVertexArray();
    gl.bindVertexArray(gVao);
    // Criar o buffer para mandar os dados para a GPU
    var bufferPosicoes = gl.createBuffer();
    var jsaPosition  = gl.getAttribLocation(gProgram, "aPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosicoes );
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gPosicoes), gl.STATIC_DRAW);
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

    gTranslation = [-1.0, -1.0];
    gRotation    = [0.0, 1.0];   // sem rotacao -> seno zero e cosseno um
    gScale       = [2.0, 2.0];

    gl.uniform2fv(guTranslation, gTranslation);
    gl.uniform2fv(guRotation, gRotation);
    gl.uniform2fv(guScale, gScale);

    gl.drawArrays(gl.TRIANGLES, 0, gPosicoes.length/2 );
    // setInterval(render, 50);  // Cuida da animação    
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
uniform vec2 uTranslation;
uniform vec2 uRotation;
uniform vec2 uScale;

void main() {
    vec2 scaled = aPosition * uScale;

    vec2 rotated = vec2(
        scaled.x * uRotation.y + scaled.y * uRotation.x,
        scaled.y * uRotation.y - scaled.x * uRotation.x);

    vec2 position = rotated + uTranslation;
    gl_Position = vec4(position * vec2(1, -1), 0, 1);
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
    Gera Retângulo
    centro: (cx, cy)
    r -> raio
    n -> numero de pontos    
*/

function Rect(x, y, w, h, cor) {

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.cor = cor;

    this.desenhe = function(posicoes) {
        var [l, b] = [this.x, this.y];
        var [w, h] = [this.w, this.h];
        var [t, r] = [x+w, y+h];

        // triângulo inferior
        posicoes.push(l);
        posicoes.push(b);
        posicoes.push(r);
        posicoes.push(b);
        posicoes.push(r);
        posicoes.push(t);

        // triângulo superior
        posicoes.push(l);
        posicoes.push(b);
        posicoes.push(l);
        posicoes.push(t);
        posicoes.push(r);
        posicoes.push(t);
    }
}

var gWeight = 0.2;
var gHeight = 0.1;
function crieRects(n, cor) {
    var posicoes = [];
    for (var i= 0; i < n; i++) {
        var x = Math.random();
        var y = Math.random();
        var r = new Rect(x, y, gWeight, gHeight, cor);
        posicoes.push(r);
    }
    return posicoes;
}

function desenheTudo(rects, posicoes) {
    var n = rects.length;
    for (var i = 0; i < n; i++) {
        rects[i].desenhe(posicoes);
    }
}

// -----------------------------------------------------
