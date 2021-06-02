"use strict";

/*
    MAC0420/MAC5744 - Computação Gráfica

    rects.js
    USA: webglUtils.js

    ---------------------------------------------------

    Escreva um programa em JavaScript que desenhe vários retângulos de tamanhos
    e cores distintas, cada um se movendo com velocidades distintas. Ao bater
    em uma parede, o retângulo deve refletir e continuar se movendo.

    Você pode modificar o código visto na última aula para:

    - crie uma classe Rect que cria um retângulo na origem (cor e tamanho
      arbitrários)

    Inicialização:
    - crie um array de Rects
    - inicialize o VAO para cada Rect
    - inicialize os uniforms
    - crie propriedades no Rect para armazenar o VAO e os uniforms
    
    Renderização:
    - Limpa a tela
    - Para cada Rect:
        - gl.useProgram
        - gl.bindVertexArray
        - gl.uniform...
*/

// ---------------------------------------------------
// Constantes
const COR_FUNDO = [0.5, 0.0, 0.5, 1.0];
const ANIMATION_STEP = 1.0;  

// ---------------------------------------------------
var gl;
var canvas;
var gProgram;
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

    // Viewport, tamanho da janela e cor de fundo
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor( COR_FUNDO[0], COR_FUNDO[1], COR_FUNDO[2], COR_FUNDO[3] );

    // Gera os retangulos
    crieRects( 10 );

    render();
    setInterval(render, 200);  // Cuida da animação    
}

var gRect = [];

function render() {
    // limpa a tela
    gl.clear( gl.COLOR_BUFFER_BIT );

    atualizeRects();

    gl.useProgram(gProgram);

    var n = gRect.length;
    console.log("gRect[0]", gRect[0].x, gRect[0].y);
    for (var i=0; i<n; i++ ) {
        // para cada rect
        // Agora é só desenhar usando um VAO
        gl.bindVertexArray( gRect[i].vao );

        var gTranslation = [2.0*gRect[i].x-1.0, 2.0*gRect[i].y-1.0];
        gl.uniform2fv(gRect[i].trans, gTranslation);
        var gRotation = [0.0, 1.0];
        gl.uniform2fv(gRect[i].rotation, gRotation);
        var gScale = [2.0, 2.0];
        gl.uniform2fv(gRect[i].scale, gScale);

        gl.uniform4f(gRect[i].color, gRect[i].cr, gRect[i].cg, gRect[i].cb, 1.0 );
        gl.drawArrays(gl.TRIANGLES, 0, gRect[i].length/2 );
    }
}

//function crieVao( rect ) {
// inicializa rect com VAO e Uniforms
function initRect( rect ) {

    var posicoes = geometriaRect(rect)

    // cria o vao e diga para usar os dados do buffer
    rect.vao = gl.createVertexArray();
    gl.bindVertexArray(rect.vao);
    
    // Criar o buffer para mandar os dados para a GPU
    var bufferPosicoes = gl.createBuffer();
    var aPosition  = gl.getAttribLocation(gProgram, "aPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPosicoes );
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( posicoes ), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, rect.false, 0, 0);

    rect.color     = gl.getUniformLocation(gProgram, "uColor");
    rect.trans     = gl.getUniformLocation(gProgram, "uTranslation");
    rect.rotation  = gl.getUniformLocation(gProgram, "uRotation");
    rect.scale     = gl.getUniformLocation(gProgram, "uScale");
}

// ---------------------------------------------------// Shaders
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
    Classe retângulo
*/

function Rect() {
    this.x = 0.0;
    this.y = 0.0;
    // tamanho aleatório
    this.w = Math.random() / 10;
    if (this.w < 0.01) this.w += 0.01; 
    this.h = Math.random() / 10;
    if (this.h < 0.01) this.h += 0.01; 

    // cor aleatória
    this.cr = Math.random();
    this.cg = Math.random();
    this.cb = Math.random();

    // velocidade aleatória
    this.vx = Math.random() /10;
    this.vy = Math.random() /10;
}

function geometriaRect(rect) {
    var pos = [];

    var l = rect.x;
    var b = rect.y;
    var w = rect.w;
    var h = rect.h;
    var r = l+w;
    var t = b+h;

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
};

function crieRects( n ) {
    gRect = [];
    for (var i=0; i<n; i++) {
        var r = new Rect ();
        initRect(r);
        gRect.push( r );
    }  
};

// atualize a posição de cada retângulo
function atualizeRects( ) {
    var n = gRect.length;
    for (var i=0; i<n; i++ ) {
        var rect = gRect[i];

        rect.x += rect.vx * ANIMATION_STEP;
        if (rect.x < 0 || rect.x + rect.w > 1) rect.vx *= -1;
        
        rect.y += rect.vy * ANIMATION_STEP;
        if (rect.y < 0 || rect.y + rect.h > 1) rect.vy *= -1;

        console.log("Atualize: ", i, rect.x, rect.y)
    }
}

// -----------------------------------------------------
