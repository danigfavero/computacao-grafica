/*
    EP4 - Simulador de vôo - Parte II

    Autor: Daniela Gonzalez Favero
    Data: 30 de julho de 2021
*/

// estruturas/buffers
var positionsArrayPlane = [];
var normalsArrayPlane = [];
var ambientProduct;
var diffuseProduct;
var specularProduct;

// câmera
var modelViewMatrixLocPlane, projectionMatrixLocPlane; 
var nMatrixLocPlane;

/* ==================================================================
    Função de inicialização dos shaders
*/
function initPlaneShaders() {
    // Pré-calcula alguns produtos
    ambientProduct = mult(lightAmbient, naveAmbient);
    diffuseProduct = mult(lightDiffuse, naveDiffuse);
    specularProduct = mult(lightSpecular, naveSpecular);

    // Inicializa os shaders
    program2 = makeProgram(gl, vertexShaderSource2, fragmentShaderSource2);

    // Seta buffers
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArrayPlane), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program2, "aNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArrayPlane), gl.STATIC_DRAW);
}

function renderPlaneShaders() {
    // Varyings e uniformes
    var positionLoc = gl.getAttribLocation(program2, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLocPlane = gl.getUniformLocation(program2, "uModelViewMatrix");
    projectionMatrixLocPlane = gl.getUniformLocation(program2, "uProjectionMatrix");
    nMatrixLocPlane = gl.getUniformLocation(program2, "uNormalMatrix");

    gl.uniform4fv(
        gl.getUniformLocation(program2,"uAmbientProduct"),
        flatten(ambientProduct)
        );
    gl.uniform4fv(
        gl.getUniformLocation(program2, "uDiffuseProduct"),
        flatten(diffuseProduct)
        );
    gl.uniform4fv(
        gl.getUniformLocation(program2, "uSpecularProduct"),
        flatten(specularProduct)
        );
    gl.uniform4fv(
        gl.getUniformLocation(program2, "uLightPosition"),
        flatten(lightPosition)
        );
    gl.uniform1f( 
        gl.getUniformLocation(program2, "uShininess"),
        naveShininess
        );
    
    gl.uniformMatrix4fv(modelViewMatrixLocPlane, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLocPlane, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(nMatrixLocPlane, false, flatten(nMatrix));
}


/* ==================================================================
    Funções de desenho
*/
// desenha o avião com as coordenadas disponíveis no arquivo config.js
function drawPlane() {
    const VA = vec4( 0.0, 0.0,  0.0, 1.0);
    const VB = vec4(-2.0, 0.0, -6.0, 1.0);
    const VC = vec4( 0.0, 0.0, -4.5, 1.0);
    const VD = vec4( 2.0, 0.0, -6.0, 1.0);

    trianglePlane(VA, VB, VC);
    trianglePlane(VA, VC, VD);

    if (DEBUG) console.log("Nave criada com os vértices: ",
                            [VA, VB, VC, VD] );
}

// desenha triângulo:
// recebe 3 vértices de um triângulo
// monta o triângulo voltado para "fora"
function trianglePlane(a, b, c) {
    var t1 = subtract(b, a);
    var t2 = subtract(c, a);
    var normal = normalize(cross(t2, t1));
    normal = vec4(normal[0], normal[1], normal[2], 0.0);

    normalsArrayPlane.push(normal);
    normalsArrayPlane.push(normal);
    normalsArrayPlane.push(normal);

    positionsArrayPlane.push(a);
    positionsArrayPlane.push(b);
    positionsArrayPlane.push(c);
}


/* ==================================================================
    Shaders nave
*/
var vertexShaderSource2 = `#version 300 es

in vec4 aPosition;
in vec4 aNormal;
out vec3 N, L, E;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec4 uLightPosition;
uniform mat3 uNormalMatrix;

void main() {

    // ajustes da câmera e iluminação
    vec3 light;
    vec3 pos = (uModelViewMatrix * aPosition).xyz;

    L = - normalize(uLightPosition.xyz);
    E = normalize(pos);
    N = normalize(uNormalMatrix * aNormal.xyz);
    gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
}
`

var fragmentShaderSource2 = `#version 300 es

precision mediump float;

uniform vec4 uAmbientProduct;
uniform vec4 uDiffuseProduct;
uniform vec4 uSpecularProduct;
uniform float uShininess;

in vec3 N, L, E;
out vec4 fColor;

void main() {

    vec3 H = normalize(L + E);
    vec4 ambient = uAmbientProduct;

    float Kd = max(dot(L, N), 0.0);
    vec4 diffuse = Kd * uDiffuseProduct;

    float Ks = pow(max(dot(N, H), 0.0), uShininess);
    vec4 specular =  Ks * uSpecularProduct;

    if (dot(L, N) < 0.0) {
        specular = vec4(0.0, 0.0, 0.0, 1.0);
    }

    fColor = ambient + diffuse + specular;
    fColor.a = 1.0;
}
`