/*
    EP4 - Simulador de vôo - Parte II

    Autor: Daniela Gonzalez Favero
    Data: 30 de julho de 2021
*/

// estruturas
var planePos;
var planeRot;
var planeTransSpeed;

// iluminação
var ambientProduct;
var diffuseProduct;
var specularProduct;

// câmera
var modelViewMatrixLocPlane, projectionMatrixLocPlane;
var nMatrixLocPlane;
var planeInstanceMatrix;
var eye = vec3(0.0, 2.0, 150);

// constantes
const DELTA_TRANS = 1; // passo da translação
const DELTA_CAM = vec3(0.0, 0.2, 0.4); // passo do afastamento da câmera

// posição da nave em relação à origem
const VA = vec4( 0.0, 0.0, -6.0, 1.0);
const VB = vec4(-2.0, 0.0,  0.0, 1.0);
const VC = vec4( 0.0, 0.0, -1.5, 1.0);
const VD = vec4( 2.0, 0.0,  0.0, 1.0);

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
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program2, "aNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);
}

function renderPlaneShaders() {
    // Varyings e uniformes
    var positionLoc = gl.getAttribLocation(program2, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLocPlane = gl.getUniformLocation(program2, "uModelViewMatrix");
    projectionMatrixLocPlane = gl.getUniformLocation(program2, "uProjectionMatrix");
    nMatrixLocPlane = gl.getUniformLocation(program2, "uNormalMatrix");

    updatePlane();

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
function drawPlane(i) {
    planePos = vec3(cena.nave[i][0], cena.nave[i][1], cena.nave[i][2]);
    planeRot = [cena.nave[i][3], cena.nave[i][4], cena.nave[i][5]];
    planeTransSpeed = cena.nave[i][6];

    triangle(VA, VB, VC);
    triangle(VA, VC, VD);

    if (DEBUG) console.log("Nave criada com os vértices: ",
                            [VA, VB, VC, VD] );
}

/* ==================================================================
    Funções de animação
*/
// atualiza posição da nave segundo os comandos do teclado
function updatePlane() {
    if (!paused) {
        planePos[2] -= planeTransSpeed; // velocidade em z

        eye[2] -= planeTransSpeed;
    }

    planeInstanceMatrix = mat4();
    // planeInstanceMatrix = mult(rotateX(theta[xAxis]), planeInstanceMatrix);
    // planeInstanceMatrix = mult(rotateY(theta[yAxis]), planeInstanceMatrix);
    // planeInstanceMatrix = mult(rotateZ(theta[zAxis]), planeInstanceMatrix);
    
    planeInstanceMatrix = mult(
        translate(planePos[0], planePos[1], planePos[2]),
        planeInstanceMatrix
        );

    gl.uniformMatrix4fv(
        gl.getUniformLocation(program2, "uInstanceMatrix"),
        false,
        flatten(planeInstanceMatrix)
        );
}

/* ==================================================================
    Shaders nave
*/
var vertexShaderSource2 = `#version 300 es

in vec4 aPosition;
in vec4 aNormal;
out vec3 N, L, E;

uniform mat4 uInstanceMatrix;
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
    gl_Position = uProjectionMatrix * uModelViewMatrix * uInstanceMatrix * aPosition;
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