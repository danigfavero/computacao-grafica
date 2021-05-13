"use strict"; // https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Strict_mode

// GLSL - linguagem usada para definir os shaders
// vertex shader
var vertexShaderSrc = `#version 300 es
 
// atributo é uma entrada (in) para o VS
// receberá dados de um buffer
in vec2 aPosition;
uniform vec2 uResolucao;

// shaders tem uma função main
void main() {
  // gl_Position é uma variável reservada que deve ser 
  // especificada pelo VS
  vec2 escala1 = aPosition / uResolucao; // entre 0 e 1
  vec2 escala2 = escala1 * 2.0;
  vec2 clipSpace = escala2 - 1.0;
  gl_Position = vec4(clipSpace, 0, 1);
}
`;

// fragment shader
var fragmentShaderSrc = `#version 300 es
 
// Vc deve definir a precisão do FS.
// Use highp ("high precision") para desktops e mediump para mobiles.
precision highp float;
 
// declare uma saida (out) para o FS
out vec4 outColor;
uniform vec4 uCorObjeto; 
void main() {
  // escolha uma cor inicial usando RGBA -- como cinza
  //outColor = vec4(1.0, 0.5, 0.0, 1.0);
  outColor = uCorObjeto;
}
`;

// Compile shaders
function compile (gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var deuCerto = gl.getShaderParameter(shader, gl.COMPILE_STATUS); 
    if (deuCerto) {
        return shader;
    }
    // mostra o erro
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader); // cleanup

};

// Link Shaders
function link (gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    var deuCerto = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (deuCerto) {
        return program;
    }

    console.log(gl.ProgramInfoLog(program));
    gl.deleteProgram(program);
};

function main() {
    
    var canvas = document.getElementById( 'my_canvas' );
    var gl = canvas.getContext( 'webgl2' );
    if (!gl) {
        console.log('O navegador provavelmente não suporta webgl2');
    }

    // Compilar e linkar os shaders
    var vertexShader = compile(gl, gl.VERTEX_SHADER, vertexShaderSrc);
    var fragmentShader = compile(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
    var program = link(gl, vertexShader, fragmentShader);

    // pega referências para atributos e uniformes
    var aPosition = gl.getAttribLocation(program, 'aPosition');
    var uResolucao = gl.getUniformLocation(program, 'uResolucao');
    var uCorObjeto = gl.getUniformLocation(program, 'uCorObjeto');

    // criar um buffer para passar dados para a GPU
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // cria o VAO e diga para usar os dados do buffer
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(aPosition);

    // Diga como tirar os dados
    var size = 2;          // 2 de cada vez
    var type = gl.FLOAT;   // tipo = float de 32 bits
    var normalize = false; // não normalize os dados
    var stride = 0;        // 0 = quanto deve avançar a cada iteração para o próximo
    var offset = 0;        // começa do início do buffer
    gl.vertexAttribPointer(
        aPosition, size, type, normalize, stride, offset);

    // Definia onde como converter do volume de recorte para a janela
    gl.viewport(0, 0, canvas.width, canvas.height);

    // cor para definir a cor de fundo do canvas
    gl.clearColor(0.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Define o programa a ser usado
    gl.useProgram(program);

    // buffer a ser usado e como usar
    gl.bindVertexArray(vao);

    gl.uniform2f(uResolucao, canvas.width, canvas.height);
    gl.uniform4f(uCorObjeto, 1.0, 0.0, 1.0, 1.0);

    // vamos definir 2 triangulos
    var positions = [
        100, 100,
        100, 180,
        250, 100,
        100, 180,
        250, 100,
        250, 180
    ];

    // WebGL é fortemente tipada. Use Float32Array
    // gl.bufferData copia os vértices para a GPU. 
    // STATIC implica que esses dados não devem ser mudados com freq.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);

}



