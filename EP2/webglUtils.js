/*
    EP2 de MAC0420/MAC5744 - Paredão

    Autor: Daniela Gonzalez Favero
    Data: 15 de junho de 2021
    Comentários: essa solução foi baseada no arquivo utilizado em aula.
*/

/*
===========================================================
webglUtils.js

WebGL Utils contem funções auxiliares que devem ajudar
você a criar os shaders e programar com WebGL.

===========================================================
*/
// make program  => compile and link shaders

function makeProgram(gl, vertexShaderSrc, fragmentShaderSrc) 
{
    // Compilar e linkar os shaders
    var vertexShader = compile(gl, gl.VERTEX_SHADER, vertexShaderSrc);
    var fragmentShader = compile(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
    var program = link(gl, vertexShader, fragmentShader);
    if (program) {
        return program;
    }
    alert("ERRO: na criação do programa.");
};

// ========================================================
// Compile shaders
function compile (gl, type, source) 
{
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

// ========================================================
// Link Shaders
function link (gl, vertexShader, fragmentShader) 
{
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
