/*
    EP4 - Simulador de vôo - Parte II

    Autor: Daniela Gonzalez Favero
    Data: 30 de julho de 2021
*/

// vértices da nave
const VA = vec4( 0.0, 0.0,  0.0, 1.0);
const VB = vec4(-2.0, 0.0, -6.0, 1.0);
const VC = vec4( 0.0, 0.0, -4.5, 1.0);
const VD = vec4( 2.0, 0.0, -6.0, 1.0);

/* ==================================================================
    Funções de criação dos elementos da cena
*/
// desenha o avião com as coordenadas disponíveis no arquivo config.js
function drawPlane() {
    triangle(VA, VB, VC);
    triangle(VA, VC, VD);

    if (DEBUG) console.log("Nave criada com os vértices: ", 
                            [VA, VB, VC, VD] );
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