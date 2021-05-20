"use strict";

/*
   MAC0420/MAC5744 - Computação Gráfica
 
   hilbert.js
 
   Programa para desenhar curvas de Hilbert, usando WebGL
*/

// ---------------------------------------------------
// Constantes
const DIREITA  = 0;
const ESQUERDA = 1;
const CIMA     = 2;
const BAIXO    = 3;

const COR_FUNDO = [1.0, 1.0, 1.0, 1.0];
const COR_CURVA = [0.5, 0.0, 0.4, 1.0];


// ---------------------------------------------------
var gl;
var valor_k = 3;
var bufferPosicoes;
var bufferCores;
var jsaPosition;
var jsaCor;

window.onload = function main() {

    // slider 
    document.getElementById('slider').onchange = function() {
        valor_k = event.target.value;
        hilbert( valor_k );
        console.log("valor_k = ", valor_k);
        render();
    };

    var canvas = document.getElementById("glCanvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );

    // Agora botar o WebGL pra funcionar

    // Criar o programa com os shaders
    var program = makeProgram(gl, vertexShaderSrc, fragmentShaderSrc);
    gl.useProgram(program);

    // associar as variaveis do shader 
    jsaPosition = gl.getAttribLocation(program, "aPosition");
    jsaCor      = gl.getAttribLocation(program, "aCor");
    var jsuResolucao = gl.getUniformLocation(program, 'uResolucao');

    // Criar o buffer para mandar os dados para a GPU
    bufferPosicoes = gl.createBuffer();
    bufferCores = gl.createBuffer();

    // cria o VAO e diga para usar os dados do buffer
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    // Diga como tirar os dados
    var size = 2;          // 2 de cada vez
    var type = gl.FLOAT;   // tipo = float de 32 bits
    var normalize = false; // não normalize os dados
    var stride = 0;        // 0 = quanto deve avançar a cada iteração para o próximo
    var offset = 0;        // começa do início do buffer
    
    // Áreas, cores, tamanhos
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(jsuResolucao, canvas.width, canvas.height);
    gl.clearColor( COR_FUNDO[0], COR_FUNDO[1], COR_FUNDO[2], COR_FUNDO[3] );

    hilbert( valor_k );
    render();
    // setInterval( render, 50 );
}

var cont = 0;

function render() {
    // Gera os vértices
    var maxlen = posicoes.length;

    var animPos = posicoes.slice(0, cont%maxlen);
    var animCor = gCores.slice(0, cont%maxlen);

    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosicoes );
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(animPos), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(jsaPosition);
    gl.vertexAttribPointer(
        jsaPosition, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCores );
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(animCor), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(jsaCor);    
    gl.vertexAttribPointer(
        jsaCor, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.LINE_STRIP, 0, animPos.length / 2);
    console.log( cont++ );

    requestAnimationFrame( render );
    // render();
}

// ---------------------------------------------------
// ---------------------------------------------------
// Shaders
// ---------------------------------------------------
// vertex shader
var vertexShaderSrc = `#version 300 es
 
// atributo é uma entrada (in) para o VS
// receberá dados de um buffer
in vec2 aPosition;

// uma cor por vertice usando varying
in vec4 aCor;
out vec4 vCor;

uniform vec2 uResolucao;

// shaders tem uma função main
void main() {
  // gl_Position é uma variável reservada que deve ser 
  // especificada pelo VS
  vec2 escala1 = aPosition / uResolucao; // entre 0 e 1
  vec2 escala2 = escala1 * 2.0;
  vec2 clipSpace = escala2 - 1.0;
  gl_Position = vec4(clipSpace, 0, 1);
  gl_PointSize = 5.0;

  vCor = aCor;
}
`;

// fragment shader
var fragmentShaderSrc = `#version 300 es
 
// Vc deve definir a precisão do FS.
// Use highp ("high precision") para desktops e mediump para mobiles.
precision highp float;
 
// declare uma saida (out) para o FS
out vec4 outColor;
in vec4 vCor;

// uniform vec4 uCorObjeto; 
void main() {
  // escolha uma cor inicial usando RGBA -- como cinza
  // outColor = uCorObjeto;
  // outColor = vCor;
  outColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;

// ---------------------------------------------------
// ---------------------------------------------------
// Vértices da curva de Hilbert
// ---------------------------------------------------
// Variáveis Globais
var x = 0;  // ponto (x, y)
var y = 0;
var posicoes = [];  // lista dos cantos
var gCores   = [];  // lista de cores

function setGeo(x, y) {
    posicoes.push( x );
    posicoes.push( y );

};

function setCor() {
    var r = Math.random();
    var g = Math.random();
    var b = Math.random();
    gCores.push(r);
    gCores.push(g);
    gCores.push(b);
    gCores.push(1.0); // opacidade
};



function hilbert(k){
    /* (int) -> vertices
    Recebe um inteiro k e retorna um array de vertices
    que descrevem a curva de Hilbert H_k 
    */
    posicoes = [];
    gCores = [];
    var largura = gl.canvas.width;
    var deslocamento = 0;
    for (var i = 0; i<k; i++)  {
        deslocamento += Math.floor(largura / 2); 
        largura = Math.floor(largura / 2); 
    }
    x = deslocamento; // posição inicial
    y = deslocamento;

    setGeo(x, y);
    setCor();

    desenhe_a(k, largura);
}
  
// ---------------------------------------------------------
function desenhe_a(k, comprimento) {
    /* (int, int) -> None

    Recebe um inteiro k, um pincel em uma determinada
    posição da janela e um inteiro comprimento. A função
    desenha a curva A_k a partir da posição do pincel. O
    valor comprimento é a medida dos segmentos da curva.

    */
    if (k > 0) {
        desenhe_d(k-1, comprimento)
        mova(ESQUERDA, comprimento)
        desenhe_a(k-1, comprimento)
        mova(BAIXO   , comprimento)
        desenhe_a(k-1, comprimento)
        mova(DIREITA , comprimento)
        desenhe_b(k-1, comprimento)
    }
}
// ---------------------------------------------------------
function desenhe_b(k, comprimento) {
    /*(int, Turtle, int) -> None

    Recebe um inteiro k, um pincel em uma determinada
    posição da janela e um inteiro comprimento. A função
    desenha a curva B_k a partir da posição do pincel. O
    valor comprimento é a medida dos segmentos da curva.
    */
    if (k > 0) {
 
        desenhe_c(k-1, comprimento)
        mova(CIMA   , comprimento)
        desenhe_b(k-1, comprimento)
        mova(DIREITA, comprimento)
        desenhe_b(k-1, comprimento)
        mova(BAIXO  , comprimento)
        desenhe_a(k-1, comprimento)
    }
}
// ---------------------------------------------------------
function desenhe_c(k, comprimento) {
    /*(int, Turtle, int) -> None

    Recebe um inteiro k, um pincel em uma determinada
    posição da janela e um inteiro comprimento. A função
    desenha a curva C_k a partir da posição do pincel. O
    valor comprimento é a medida dos segmentos da curva.
    */
    if (k > 0) {

        desenhe_b(k-1, comprimento)
        mova(DIREITA, comprimento)
        desenhe_c(k-1, comprimento)
        mova(CIMA    , comprimento)
        desenhe_c(k-1, comprimento)
        mova(ESQUERDA, comprimento)
        desenhe_d(k-1, comprimento)
    }
}
// ---------------------------------------------------------        
function desenhe_d(k, comprimento){
    /*(int, Turtle, int) -> None

    Recebe um inteiro k, um pincel em uma determinada
    posição da janela e um inteiro comprimento. A função
    desenha a curva C_k a partir da posição do pincel. O
    valor comprimento é a medida dos segmentos da curva.
    */
    if (k > 0) {
 
        desenhe_a(k-1, comprimento)
        mova(BAIXO   , comprimento)
        desenhe_d(k-1, comprimento)
        mova(ESQUERDA, comprimento)
        desenhe_d(k-1, comprimento)
        mova(CIMA    , comprimento)
        desenhe_c(k-1, comprimento)
    }
}
// -----------------------------------------------------
function mova(direcao, comprimento) {
    /*(int, int) -> None
 
    Recebe uma direcao e um valor comprimento e atualiza
    a posição (x, y), inserindo esse vertice no array
    posicoes.
    */

    // x, y são variáveis globais que são atualizadas
    switch (direcao) {

        case DIREITA:
            x = x + comprimento;
            break;
        case ESQUERDA:
            x = x - comprimento;
            break;
        case CIMA:
            y = y + comprimento;
            break;
        default:
            // case BAIXO:
            y = y - comprimento;
    }
    setGeo(x,y);
    setCor();
}
// -----------------------------------------------------
