/*
    EP4 - Simulador de vôo - Parte II

    Autor: Daniela Gonzalez Favero
    Data: 30 de julho de 2021
*/

/* ==================================================================
    Funções de criação dos elementos da cena
*/
// desenha o oceano com as coordenadas disponíveis no arquivo config.js
function drawOcean() {
    var [xmin, ymin, xmax, ymax] = cena.oceano;
    var a = vec4(xmin, ymax, 0.0, 1.0);
    var b = vec4(xmin, ymin, 0.0, 1.0);
    var c = vec4(xmax, ymin, 0.0, 1.0);
    var d = vec4(xmax, ymax, 0.0, 1.0);

    rect(a, b, c, d);
    if (DEBUG) console.log("Oceano criado dentro dos limites: ", 
                            [xmin, ymin, xmax, ymax] );
}

// desenha a ilha com as coordenadas disponíveis no arquivo config.js
function drawIsland() {
    var [xmin, ymin, xmax, ymax] = cena.ilha;

    for (var x = xmin; x < xmax-1; x++) {
        for (var y = ymin; y < ymax-1; y++) {
            var [i, j] = [x + 50, y + 50];

            var a = vec4(  x, y+1,   cena.mapa[i][j+1], 1.0);
            var b = vec4(  x,   y,     cena.mapa[i][j], 1.0);
            var c = vec4(x+1,   y,   cena.mapa[i+1][j], 1.0);
            var d = vec4(x+1, y+1, cena.mapa[i+1][j+1], 1.0);

            rect(a, b, c, d);
        }
    }
    if (DEBUG) console.log("Ilha criada dentro dos limites: ", 
                            [xmin, ymin, xmax, ymax] );
}


/* ==================================================================
    Shaders cena
*/
var vertexShaderSource = `#version 300 es

in vec4 aPosition;
in vec4 aNormal;
out vec3 N, L, E;
flat out int matIndex;

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

    // define cor de cada material
    int i;
    float materials[6] = float[6](5.0, 10.0, 20.0, 30.0, 40.0, 100.0);
    for (i = 0; i < 6; i++) {
        if (aPosition.z < materials[i]) {
            break;
        }
    }
    matIndex = i;
}
`

var fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec4 uAmbientProduct[6];
uniform vec4 uDiffuseProduct[6];
uniform vec4 uSpecularProduct[6];
uniform float uShininess[6];

in vec3 N, L, E;
flat in int matIndex;
out vec4 fColor;

void main() {

    vec3 H = normalize(L + E);
    vec4 ambient = uAmbientProduct[matIndex];

    float Kd = max(dot(L, N), 0.0);
    vec4 diffuse = Kd * uDiffuseProduct[matIndex];

    float Ks = pow(max(dot(N, H), 0.0), uShininess[matIndex]);
    vec4 specular =  Ks * uSpecularProduct[matIndex];

    if (dot(L, N) < 0.0) {
        specular = vec4(0.0, 0.0, 0.0, 1.0);
    }

    fColor = ambient + diffuse + specular;
    fColor.a = 1.0;
}
`