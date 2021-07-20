/* 
    EP4 - Simulador de vôo - Parte II

    arquivo de configuração e dados.
    A câmera agora segue uma nave.
*/

// algumas cores básicas
var BLACK   = vec4(0.0, 0.0, 0.0, 1.0);  // black
var RED     = vec4(1.0, 0.0, 0.0, 1.0);  // red
var YELLOW  = vec4(1.0, 1.0, 0.0, 1.0);  // yellow
var GREEN   = vec4(0.0, 1.0, 0.0, 1.0);  // green
var BLUE    = vec4(0.0, 0.0, 1.0, 1.0);  // blue
var MAGENTA = vec4(1.0, 0.0, 1.0, 1.0);  // magenta
var CYAN    = vec4(0.0, 1.0, 1.0, 1.0);  // cyan
var WHITE   = vec4(1.0, 1.0, 1.0, 1.0);  // white

// Propriedades da fonte de luz
var lightPosition = vec4(0.0, 0.0, 1.0, 0.0);
var lightAmbient  = vec4(0.4, 0.4, 0.4, 1.0);
var lightDiffuse  = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

// Camera projection: perspective
var fovy   = 45.0;
var aspect = 1.0;
var near = 1;
var far = 2000;

/* 
  Materiais 
  depende da altura
  < 5 - águua
  < 10 - terra 1 marrom
  < 20 - terra 2 amarelo
  < 30 - verde 1
  < 40 - verde marrom
  < max - neve
*/
var matAmbient = [
  vec4( 0.0, 0.3, 0.5, 1.0 ),   // agua
  vec4( 0.2, 0.2, 0.0, 1.0 ),
  vec4( 0.3, 0.3, 0.0, 1.0 ),
  vec4( 0.2, 0.4, 0.2, 1.0 ),
  vec4( 0.3, 0.3, 0.0, 1.0 ),
  vec4( 0.5, 0.5, 0.5, 1.0 )
];
var matDiffuse = [
  vec4( 0.2, 0.4, 0.8, 1.0 ),   // agua
  vec4( 0.4, 0.3, 0.2, 1.0 ),
  vec4( 0.5, 0.5, 0.3, 1.0 ),
  vec4( 0.2, 0.6, 0.2, 1.0 ),
  vec4( 0.3, 0.3, 0.1, 1.0 ),
  vec4( 0.6, 0.6, 0.6, 1.0 )
];
var matSpecular = [
  vec4( 0.5, 0.5, 0.5, 1.0 ),  // agua
  vec4( 0.3, 0.3, 0.3, 1.0 ),
  vec4( 0.4, 0.4, 0.4, 1.0 ),
  vec4( 0.4, 0.4, 0.4, 1.0 ),
  vec4( 0.3, 0.3, 0.3, 1.0 ),
  vec4( 0.6, 0.6, 0.6, 1.0 )
];
var matShininess = [
  [100.0] ,
  [120.0] ,
  [130.0] ,
  [140.0] ,
  [150.0] ,
  [50.0 ]
];

var naveAmbient   = vec4( 0.95, 0.2, 0.1, 1.0 );
var naveDiffuse   = vec4( 0.95, 0.2, 0.1, 1.0 );
var naveSpecular  = vec4( 0.95, 0.2, 0.1, 1.0 );
var naveShininess =  [80.0] ;

/*
    Cena: leia o enunciado do EP.
    Oceano é um retângulo (xmin, ymin, xmax, ymax). As coordenadas do mundo tem:
        . eixo x apontando para leste (direit)
        . eixo y apontando para norte (frente)
        . eixo z apontando para cima (regra mão direita)
    Ilha é outro retângulo. Número de colunas NC = (xmax - xmin e número de linhas NL = (ymax-ymin)
    Mapa de elevação é uma matriz com NL linhas e NC colunas. 
        A origem corresponde ao ponto (xmin, ymin) nas coordenadas do mundo. 

    Nave: posição (x,y,z), rotação (rx, ry, rz) e velocidade inicial.
*/
cena = {
    oceano : [ -300, -300, 300, 300 ], 
    ilha  : [ -50, -50, 50, 50 ],
    nave  : [
        [ 0, 0, 150, 0, 0, 0, 0],
        [ 250,  250, 80, 95,   135,  0, 1],
        [-175,  175, 150, 90, -135, 0, 1],
        [  90,  -90, 180, 45,   45, 0, 1],
        [ 150,  150, 100, 90,  135, 0, 1],
        [-150, -150,  50, 90,  -45, 0, 1],
    ],
    mapa : [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1], [1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 8, 8, 8, 8, 8, 8, 7, 7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 1, 1], [1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 6, 6, 7, 7, 8, 9, 9, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 10, 10, 10, 10, 9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1], [1, 2, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 7, 8, 9, 9, 10, 11, 11, 11, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 12, 12, 12, 12, 11, 11, 10, 10, 9, 9, 8, 7, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 2, 2, 1], [1, 2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 7, 7, 8, 9, 10, 10, 11, 11, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 12, 12, 11, 11, 10, 10, 9, 8, 7, 7, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 2, 1], [1, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 7, 7, 8, 9, 10, 10, 11, 12, 12, 12, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 13, 13, 12, 12, 12, 11, 10, 10, 9, 8, 7, 7, 6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 3, 3, 2, 1], [1, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 8, 9, 10, 10, 11, 12, 12, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 13, 12, 12, 11, 10, 10, 9, 8, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 3, 3, 2, 1], [1, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 8, 9, 10, 10, 11, 12, 12, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 13, 12, 12, 11, 10, 10, 9, 8, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 4, 4, 3, 3, 2, 1], [1, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 7, 7, 8, 9, 10, 11, 12, 12, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 12, 12, 11, 10, 9, 8, 7, 7, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 4, 4, 3, 3, 2, 1], [1, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 7, 8, 9, 10, 11, 11, 12, 13, 13, 13, 13, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 12, 11, 11, 10, 9, 8, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 4, 4, 3, 3, 2, 1], [1, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 7, 8, 9, 10, 11, 11, 12, 13, 13, 13, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 13, 13, 13, 12, 12, 11, 10, 9, 8, 7, 7, 6, 6, 6, 6, 6, 5, 5, 5, 5, 4, 4, 4, 3, 2, 1], [1, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 16, 16, 16, 16, 16, 16, 16, 16, 16, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 13, 13, 12, 12, 11, 10, 10, 9, 8, 7, 6, 6, 6, 6, 5, 5, 5, 5, 5, 4, 4, 3, 2, 1], [1, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 7, 8, 9, 10, 10, 11, 12, 13, 13, 13, 14, 14, 14, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 18, 17, 17, 17, 17, 17, 17, 17, 17, 17, 16, 16, 16, 16, 16, 16, 16, 15, 15, 15, 15, 15, 14, 14, 14, 14, 13, 13, 13, 12, 11, 10, 10, 9, 7, 6, 6, 6, 6, 5, 5, 5, 5, 5, 4, 4, 3, 2, 1], [1, 2, 3, 3, 4, 4, 5, 5, 6, 6, 6, 6, 6, 7, 8, 9, 10, 10, 11, 12, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 17, 17, 17, 17, 17, 17, 17, 16, 16, 16, 16, 16, 16, 15, 15, 15, 15, 15, 14, 14, 14, 14, 13, 13, 12, 11, 10, 10, 8, 7, 6, 6, 6, 6, 6, 6, 5, 5, 5, 4, 3, 2, 1], [1, 2, 3, 4, 4, 4, 5, 5, 6, 6, 6, 6, 7, 8, 9, 10, 10, 11, 12, 13, 13, 14, 14, 14, 14, 15, 15, 15, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 18, 18, 18, 18, 18, 18, 18, 18, 17, 17, 17, 17, 17, 16, 16, 16, 16, 16, 15, 15, 15, 15, 15, 14, 14, 14, 13, 13, 12, 11, 10, 9, 8, 7, 6, 6, 6, 6, 6, 6, 5, 5, 4, 3, 2, 1], [1, 2, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 8, 9, 10, 10, 11, 12, 13, 13, 14, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 19, 19, 19, 19, 19, 18, 18, 18, 18, 18, 18, 17, 17, 17, 17, 17, 16, 16, 16, 16, 16, 15, 15, 15, 15, 14, 14, 14, 13, 13, 12, 11, 10, 9, 8, 7, 6, 6, 6, 6, 6, 5, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 5, 5, 5, 6, 6, 6, 7, 9, 10, 10, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 15, 16, 16, 16, 17, 17, 17, 17, 17, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 20, 20, 20, 20, 20, 19, 19, 19, 19, 19, 19, 19, 18, 18, 18, 17, 17, 17, 17, 17, 16, 16, 16, 16, 16, 15, 15, 15, 14, 14, 14, 13, 13, 12, 11, 10, 9, 8, 7, 6, 6, 6, 6, 5, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 5, 6, 6, 6, 6, 7, 8, 10, 10, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 21, 21, 21, 22, 22, 21, 21, 21, 21, 20, 20, 20, 20, 20, 19, 19, 19, 19, 19, 18, 18, 18, 17, 17, 17, 17, 17, 16, 16, 16, 16, 15, 15, 15, 14, 14, 14, 13, 13, 12, 11, 10, 9, 8, 7, 6, 6, 6, 5, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 5, 6, 6, 6, 7, 8, 9, 10, 11, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 22, 22, 22, 23, 23, 22, 22, 22, 22, 21, 21, 21, 20, 20, 20, 20, 20, 20, 19, 19, 19, 18, 18, 18, 17, 17, 17, 17, 17, 16, 16, 16, 15, 15, 15, 14, 14, 14, 13, 13, 12, 11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 5, 6, 6, 6, 7, 9, 10, 11, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 19, 19, 19, 20, 20, 20, 20, 20, 21, 21, 21, 21, 22, 22, 23, 23, 23, 24, 24, 23, 23, 23, 23, 22, 22, 22, 21, 21, 21, 21, 20, 20, 20, 20, 19, 19, 18, 18, 18, 18, 17, 17, 17, 17, 16, 16, 16, 15, 15, 15, 14, 14, 14, 13, 13, 12, 11, 10, 9, 7, 6, 6, 5, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 5, 6, 6, 7, 8, 10, 11, 12, 13, 13, 14, 14, 14, 15, 15, 16, 16, 16, 17, 17, 17, 17, 17, 18, 18, 18, 19, 19, 20, 20, 20, 21, 21, 21, 21, 21, 22, 22, 22, 23, 23, 24, 24, 24, 25, 25, 24, 24, 24, 24, 23, 23, 22, 22, 22, 21, 21, 21, 21, 21, 20, 20, 19, 19, 19, 18, 18, 18, 18, 17, 17, 17, 16, 16, 16, 15, 15, 15, 14, 14, 14, 13, 13, 12, 11, 10, 8, 7, 6, 5, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 5, 6, 7, 8, 9, 11, 12, 12, 13, 14, 14, 14, 15, 15, 15, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 20, 20, 21, 21, 21, 21, 22, 22, 22, 22, 23, 23, 24, 24, 25, 25, 25, 26, 26, 25, 25, 25, 25, 24, 24, 23, 23, 23, 22, 22, 22, 22, 21, 21, 20, 20, 20, 19, 19, 19, 18, 18, 18, 17, 17, 17, 16, 16, 16, 15, 15, 15, 14, 14, 14, 13, 12, 11, 11, 9, 8, 7, 6, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 5, 6, 7, 9, 10, 11, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 18, 18, 18, 18, 19, 19, 19, 20, 20, 21, 21, 22, 22, 22, 22, 23, 23, 23, 24, 24, 25, 25, 26, 26, 26, 27, 27, 26, 26, 26, 26, 25, 25, 24, 24, 23, 23, 23, 22, 22, 22, 21, 21, 21, 20, 20, 19, 19, 19, 18, 18, 18, 17, 17, 17, 16, 16, 16, 15, 15, 15, 14, 14, 13, 13, 12, 11, 10, 9, 7, 6, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 27, 28, 28, 27, 27, 27, 27, 26, 26, 25, 25, 24, 24, 24, 23, 23, 23, 22, 22, 21, 21, 20, 20, 20, 19, 19, 18, 18, 18, 17, 17, 17, 16, 16, 16, 15, 15, 15, 14, 14, 13, 13, 12, 11, 10, 8, 7, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 20, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 28, 29, 29, 28, 28, 28, 28, 27, 27, 26, 26, 25, 25, 24, 24, 24, 23, 23, 22, 22, 21, 21, 20, 20, 20, 19, 19, 18, 18, 18, 17, 17, 17, 16, 16, 16, 15, 15, 14, 14, 14, 13, 13, 12, 10, 9, 7, 6, 5, 3, 2, 1], [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 13, 14, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 20, 20, 21, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 29, 30, 30, 29, 29, 29, 29, 28, 28, 27, 27, 26, 26, 25, 25, 25, 24, 24, 23, 23, 22, 22, 21, 21, 20, 20, 19, 19, 18, 18, 18, 17, 17, 17, 16, 16, 15, 15, 15, 14, 14, 13, 13, 12, 11, 10, 8, 6, 5, 3, 2, 1], [1, 2, 3, 5, 6, 7, 9, 10, 12, 13, 13, 14, 14, 14, 15, 15, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 30, 30, 30, 31, 31, 30, 30, 30, 30, 29, 29, 28, 28, 27, 27, 26, 26, 25, 25, 24, 24, 23, 23, 22, 22, 21, 21, 20, 20, 19, 19, 18, 18, 18, 17, 17, 16, 16, 16, 15, 15, 15, 14, 14, 13, 13, 12, 10, 9, 7, 6, 4, 2, 1], [1, 2, 3, 5, 6, 8, 10, 11, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 18, 18, 19, 19, 20, 20, 21, 21, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 30, 30, 31, 31, 32, 32, 32, 32, 31, 31, 31, 31, 30, 30, 29, 29, 28, 28, 27, 26, 26, 25, 25, 24, 24, 23, 22, 22, 21, 21, 20, 20, 19, 19, 18, 18, 17, 17, 17, 16, 16, 16, 15, 15, 14, 14, 13, 13, 12, 11, 10, 8, 6, 4, 2, 1], [1, 2, 4, 6, 7, 9, 10, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 18, 18, 19, 19, 19, 20, 21, 21, 22, 23, 23, 24, 25, 25, 26, 26, 27, 27, 28, 29, 29, 30, 30, 31, 31, 32, 32, 33, 33, 33, 34, 33, 33, 33, 33, 32, 32, 31, 31, 30, 29, 29, 28, 27, 27, 26, 26, 25, 25, 24, 23, 23, 22, 21, 21, 20, 19, 19, 19, 18, 18, 17, 17, 17, 16, 16, 15, 15, 14, 14, 14, 13, 13, 12, 10, 9, 7, 5, 3, 1], [1, 2, 4, 6, 8, 10, 11, 12, 13, 13, 14, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 19, 19, 20, 20, 21, 22, 23, 23, 24, 25, 26, 26, 27, 27, 28, 28, 29, 30, 31, 31, 32, 32, 33, 33, 34, 34, 35, 35, 36, 35, 35, 34, 34, 34, 33, 33, 32, 32, 31, 30, 29, 29, 28, 27, 27, 26, 26, 25, 24, 23, 22, 22, 21, 20, 20, 19, 19, 18, 18, 18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 13, 13, 12, 11, 9, 7, 5, 3, 1], [1, 3, 5, 7, 9, 10, 12, 13, 13, 14, 14, 14, 15, 15, 16, 16, 17, 17, 17, 18, 18, 19, 19, 20, 20, 21, 22, 22, 23, 24, 25, 26, 27, 27, 28, 28, 29, 30, 30, 31, 32, 33, 34, 34, 35, 35, 36, 36, 37, 37, 38, 37, 37, 36, 36, 35, 35, 34, 34, 33, 32, 31, 30, 30, 29, 28, 28, 27, 27, 26, 25, 24, 23, 22, 21, 21, 20, 20, 19, 19, 18, 18, 17, 17, 16, 16, 16, 15, 15, 14, 14, 14, 13, 13, 12, 10, 8, 6, 3, 1], [1, 3, 5, 7, 9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 23, 24, 25, 26, 27, 28, 28, 29, 29, 30, 31, 32, 33, 34, 35, 36, 36, 37, 37, 38, 39, 39, 39, 40, 39, 39, 38, 38, 37, 37, 36, 36, 35, 34, 33, 32, 31, 30, 30, 29, 28, 28, 27, 26, 25, 24, 23, 22, 21, 21, 20, 20, 19, 19, 18, 17, 17, 17, 16, 16, 15, 15, 15, 14, 14, 13, 13, 12, 11, 9, 6, 4, 1], [1, 3, 6, 8, 10, 11, 12, 13, 13, 14, 14, 15, 15, 16, 16, 16, 17, 17, 18, 18, 19, 20, 20, 21, 21, 22, 23, 23, 24, 25, 26, 27, 28, 29, 30, 31, 31, 32, 33, 34, 35, 37, 38, 38, 39, 40, 40, 41, 41, 42, 42, 42, 41, 41, 40, 40, 39, 38, 38, 36, 35, 34, 33, 32, 31, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 22, 21, 21, 20, 20, 19, 18, 18, 17, 17, 16, 16, 16, 15, 15, 14, 14, 13, 13, 12, 11, 9, 7, 4, 1], [1, 3, 6, 8, 10, 12, 13, 13, 14, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 21, 21, 22, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 40, 41, 42, 43, 43, 44, 44, 44, 44, 44, 43, 43, 42, 41, 40, 40, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 22, 21, 21, 20, 19, 19, 18, 18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 13, 13, 12, 10, 7, 4, 1], [1, 4, 7, 9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 19, 19, 20, 20, 21, 22, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 38, 39, 40, 42, 43, 43, 44, 44, 44, 45, 45, 45, 45, 45, 45, 44, 44, 43, 43, 42, 40, 39, 37, 36, 35, 34, 33, 32, 31, 29, 28, 27, 26, 25, 24, 23, 23, 22, 22, 21, 20, 20, 19, 19, 18, 17, 17, 16, 16, 16, 15, 15, 14, 14, 13, 13, 12, 10, 8, 4, 1], [1, 4, 7, 10, 11, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 20, 20, 21, 21, 22, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 34, 36, 37, 38, 39, 41, 42, 43, 44, 44, 44, 44, 44, 44, 43, 43, 43, 44, 44, 44, 44, 44, 44, 43, 42, 41, 39, 38, 37, 36, 34, 33, 31, 30, 29, 28, 27, 26, 25, 24, 23, 23, 22, 21, 21, 20, 19, 19, 18, 18, 17, 17, 16, 16, 15, 15, 14, 14, 14, 13, 12, 11, 8, 5, 1], [1, 4, 7, 10, 12, 13, 13, 14, 14, 14, 15, 15, 16, 16, 17, 17, 18, 19, 19, 20, 20, 21, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34, 35, 37, 38, 40, 41, 43, 44, 45, 44, 44, 43, 41, 40, 39, 38, 38, 39, 39, 40, 41, 43, 44, 45, 45, 44, 43, 41, 40, 38, 37, 35, 34, 32, 31, 30, 28, 27, 26, 25, 24, 24, 23, 22, 22, 21, 20, 20, 19, 18, 18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 13, 13, 11, 8, 5, 1], [1, 4, 8, 10, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 17, 18, 18, 19, 19, 20, 20, 21, 22, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 33, 35, 36, 38, 40, 42, 43, 44, 45, 44, 43, 40, 38, 35, 33, 31, 30, 30, 31, 32, 33, 35, 38, 40, 43, 44, 45, 45, 43, 42, 40, 38, 36, 35, 33, 32, 30, 29, 28, 27, 26, 25, 24, 23, 22, 22, 21, 20, 20, 19, 19, 18, 17, 17, 16, 16, 16, 15, 15, 14, 14, 13, 13, 11, 8, 5, 1], [1, 4, 8, 10, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 21, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33, 34, 36, 38, 40, 42, 44, 45, 45, 44, 42, 38, 34, 30, 27, 24, 22, 21, 20, 21, 22, 24, 27, 30, 35, 39, 42, 44, 45, 45, 44, 42, 40, 38, 36, 34, 33, 31, 30, 29, 27, 26, 25, 24, 23, 23, 22, 21, 21, 20, 19, 19, 18, 18, 17, 17, 16, 16, 15, 15, 14, 14, 13, 13, 11, 9, 5, 1], [1, 5, 8, 11, 12, 13, 14, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 21, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 32, 34, 35, 37, 39, 41, 43, 45, 45, 44, 41, 37, 32, 27, 22, 18, 15, 13, 12, 12, 12, 13, 15, 18, 22, 27, 32, 37, 42, 44, 45, 45, 43, 41, 39, 37, 35, 34, 32, 31, 29, 28, 27, 26, 25, 24, 23, 22, 21, 21, 20, 19, 19, 18, 18, 17, 17, 16, 16, 15, 15, 14, 14, 13, 13, 11, 9, 5, 1], [1, 5, 8, 11, 12, 13, 14, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 20, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 35, 37, 39, 41, 43, 44, 45, 44, 42, 37, 31, 25, 19, 14, 10, 7, 6, 6, 6, 6, 6, 8, 10, 14, 19, 25, 31, 37, 42, 44, 45, 44, 43, 41, 39, 37, 35, 33, 32, 30, 29, 27, 26, 25, 24, 23, 22, 22, 21, 20, 20, 19, 18, 18, 17, 17, 16, 16, 15, 15, 14, 14, 14, 13, 11, 9, 5, 1], [1, 5, 8, 11, 13, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 18, 19, 20, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 34, 36, 38, 40, 42, 43, 45, 44, 42, 37, 31, 24, 17, 12, 7, 5, 3, 2, 2, 2, 2, 3, 3, 5, 7, 11, 17, 24, 31, 37, 42, 44, 45, 44, 42, 40, 38, 36, 34, 32, 31, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 20, 19, 18, 18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 13, 12, 9, 5, 1], [1, 5, 8, 11, 13, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 19, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33, 34, 36, 38, 40, 43, 44, 44, 43, 39, 32, 25, 17, 11, 7, 4, 2, 1, 1, 1, 1, 1, 1, 1, 2, 3, 6, 11, 17, 24, 32, 39, 43, 45, 44, 43, 41, 38, 36, 35, 33, 31, 30, 28, 27, 26, 25, 24, 23, 22, 21, 21, 20, 19, 19, 18, 17, 17, 16, 16, 16, 15, 15, 14, 14, 13, 12, 9, 5, 1], [1, 5, 9, 11, 13, 13, 14, 14, 15, 15, 16, 16, 16, 17, 18, 18, 19, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 35, 37, 39, 41, 43, 44, 44, 40, 34, 27, 19, 12, 7, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 6, 11, 18, 27, 34, 40, 44, 45, 44, 42, 39, 37, 35, 33, 32, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 19, 18, 18, 17, 17, 16, 16, 15, 15, 14, 14, 13, 12, 9, 5, 1], [1, 5, 9, 11, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 34, 35, 37, 40, 42, 44, 44, 43, 38, 30, 22, 14, 8, 4, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 7, 13, 22, 30, 38, 43, 44, 44, 42, 40, 38, 36, 34, 32, 31, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 20, 19, 18, 18, 17, 17, 16, 16, 15, 15, 14, 14, 13, 12, 9, 5, 1], [1, 5, 9, 11, 13, 14, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33, 34, 36, 38, 40, 43, 44, 44, 41, 35, 27, 18, 10, 5, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 5, 10, 18, 27, 35, 41, 44, 44, 43, 40, 38, 36, 34, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 18, 17, 17, 16, 16, 15, 15, 14, 14, 13, 12, 9, 5, 1], [1, 5, 9, 12, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 19, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33, 34, 36, 38, 41, 43, 44, 44, 40, 33, 24, 15, 8, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 8, 15, 24, 33, 40, 44, 45, 43, 41, 39, 37, 35, 33, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 19, 18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 12, 10, 6, 1], [1, 5, 9, 12, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 19, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 35, 37, 39, 41, 43, 45, 44, 39, 31, 22, 13, 6, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 6, 13, 22, 32, 39, 44, 45, 43, 41, 39, 37, 35, 33, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 21, 20, 19, 18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 12, 10, 6, 1], [1, 5, 9, 12, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 35, 37, 39, 42, 44, 45, 43, 38, 30, 21, 12, 6, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 6, 12, 21, 30, 38, 43, 44, 43, 41, 39, 37, 35, 33, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 21, 20, 19, 18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 12, 10, 6, 1], [1, 5, 9, 12, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34, 36, 38, 40, 42, 44, 45, 43, 38, 30, 20, 12, 6, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 6, 12, 20, 29, 37, 42, 43, 42, 40, 38, 36, 34, 32, 31, 29, 28, 27, 26, 25, 24, 24, 23, 23, 22, 21, 20, 19, 18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 12, 10, 6, 1], [1, 5, 9, 12, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 35, 37, 39, 42, 44, 45, 43, 38, 30, 21, 12, 6, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 6, 12, 19, 28, 35, 39, 41, 40, 38, 36, 34, 32, 30, 29, 28, 27, 26, 26, 25, 24, 24, 23, 23, 22, 21, 20, 19, 18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 12, 10, 6, 1], [1, 5, 9, 12, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 19, 20, 21, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 35, 37, 39, 41, 43, 45, 44, 39, 31, 22, 13, 6, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 7, 12, 18, 25, 31, 35, 36, 35, 34, 32, 30, 28, 27, 26, 25, 25, 25, 25, 25, 24, 24, 23, 22, 21, 20, 20, 19, 18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 12, 10, 6, 1], [1, 5, 9, 12, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 19, 20, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33, 34, 36, 38, 41, 43, 44, 44, 40, 33, 24, 15, 8, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 5, 6, 8, 12, 17, 22, 26, 29, 30, 29, 27, 26, 24, 23, 22, 21, 21, 22, 23, 24, 24, 24, 24, 23, 22, 21, 20, 19, 19, 18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 12, 10, 6, 1], [1, 5, 9, 11, 13, 14, 14, 14, 15, 15, 16, 16, 16, 17, 18, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34, 36, 38, 40, 43, 44, 44, 41, 35, 27, 18, 10, 5, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 4, 5, 6, 8, 9, 12, 14, 18, 20, 22, 22, 22, 20, 19, 18, 17, 16, 16, 17, 19, 21, 22, 23, 24, 23, 22, 22, 21, 20, 19, 19, 18, 17, 17, 16, 16, 15, 15, 14, 14, 13, 12, 9, 5, 1], [1, 5, 9, 11, 13, 13, 14, 14, 15, 15, 16, 16, 16, 17, 18, 18, 19, 20, 21, 22, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 35, 37, 40, 42, 44, 44, 43, 38, 30, 22, 14, 8, 4, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 4, 6, 8, 9, 10, 11, 12, 13, 15, 16, 16, 15, 14, 13, 12, 11, 11, 12, 13, 16, 19, 21, 23, 23, 23, 22, 21, 21, 20, 19, 18, 18, 17, 17, 16, 16, 15, 15, 14, 14, 13, 12, 9, 5, 1], [1, 5, 9, 11, 13, 13, 14, 14, 15, 15, 16, 16, 16, 17, 17, 18, 19, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33, 35, 37, 39, 41, 43, 44, 44, 40, 34, 27, 19, 12, 7, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 5, 7, 9, 10, 10, 10, 10, 10, 11, 11, 11, 11, 10, 9, 8, 8, 7, 8, 10, 14, 17, 20, 22, 23, 23, 22, 21, 20, 20, 19, 18, 18, 17, 16, 16, 16, 15, 15, 14, 14, 13, 12, 9, 5, 1], [1, 5, 8, 11, 13, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 19, 19, 20, 21, 22, 23, 23, 24, 25, 26, 27, 28, 29, 31, 32, 34, 36, 38, 40, 43, 44, 44, 43, 39, 32, 25, 17, 11, 6, 3, 2, 1, 1, 1, 1, 1, 1, 2, 3, 5, 7, 9, 10, 10, 9, 9, 9, 9, 9, 9, 8, 7, 7, 6, 5, 6, 7, 9, 12, 16, 19, 22, 23, 22, 22, 21, 20, 19, 19, 18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 13, 12, 9, 5, 1], [1, 5, 8, 11, 13, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 18, 19, 20, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 34, 36, 38, 40, 42, 43, 45, 44, 42, 37, 31, 24, 17, 12, 7, 5, 3, 2, 2, 2, 2, 3, 4, 5, 6, 8, 9, 10, 9, 9, 8, 8, 8, 8, 7, 7, 6, 5, 5, 5, 5, 6, 8, 12, 16, 19, 21, 22, 22, 21, 21, 20, 19, 18, 18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 13, 12, 9, 5, 1], [1, 5, 8, 11, 12, 13, 14, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 20, 20, 21, 22, 23, 24, 24, 25, 26, 27, 28, 30, 31, 33, 35, 37, 38, 40, 42, 44, 45, 44, 42, 37, 31, 25, 19, 14, 10, 8, 6, 6, 6, 6, 6, 7, 8, 9, 10, 10, 10, 9, 8, 8, 7, 7, 7, 7, 6, 5, 5, 5, 5, 5, 6, 8, 12, 16, 19, 21, 22, 22, 21, 20, 19, 19, 18, 18, 17, 17, 16, 16, 15, 15, 14, 14, 14, 13, 11, 9, 5, 1], [1, 5, 8, 11, 12, 13, 14, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 21, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 34, 35, 37, 39, 41, 43, 44, 45, 44, 42, 37, 32, 27, 22, 18, 15, 13, 12, 12, 12, 13, 13, 14, 14, 13, 11, 10, 9, 8, 7, 7, 7, 7, 6, 6, 5, 5, 4, 4, 5, 6, 9, 12, 15, 19, 21, 22, 21, 21, 20, 19, 19, 18, 18, 17, 17, 16, 16, 15, 15, 14, 14, 13, 13, 11, 9, 5, 1], [1, 4, 8, 10, 12, 13, 13, 14, 14, 15, 15, 16, 16, 16, 17, 18, 18, 19, 19, 20, 21, 21, 22, 23, 24, 25, 25, 26, 27, 29, 30, 31, 33, 34, 36, 38, 39, 41, 43, 45, 45, 44, 42, 39, 34, 30, 27, 24, 22, 21, 20, 21, 21, 21, 21, 19, 16, 13, 11, 9, 8, 7, 7, 6, 6, 6, 5, 5, 4, 4, 4, 5, 6, 8, 12, 15, 18, 20, 21, 21, 20, 20, 19, 19, 18, 18, 17, 16, 16, 16, 15, 15, 14, 14, 13, 13, 11, 9, 5, 1], [1, 4, 8, 10, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 19, 19, 20, 20, 21, 22, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 35, 36, 38, 40, 42, 43, 45, 45, 44, 43, 40, 38, 35, 33, 31, 30, 30, 30, 30, 30, 27, 24, 19, 15, 11, 9, 8, 7, 6, 6, 6, 5, 5, 5, 4, 4, 4, 4, 6, 8, 12, 15, 18, 20, 21, 21, 20, 20, 19, 19, 18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 13, 13, 11, 8, 5, 1], [1, 4, 7, 10, 12, 13, 13, 14, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 20, 20, 21, 22, 22, 23, 24, 25, 25, 26, 27, 28, 30, 31, 32, 34, 35, 37, 38, 40, 41, 43, 44, 45, 44, 44, 43, 41, 40, 39, 38, 38, 38, 38, 36, 33, 28, 21, 16, 11, 9, 7, 7, 6, 6, 5, 5, 5, 4, 4, 4, 4, 4, 5, 8, 11, 15, 18, 20, 21, 21, 20, 20, 19, 18, 18, 17, 17, 16, 16, 15, 15, 14, 14, 14, 13, 13, 11, 8, 5, 1], [1, 4, 7, 10, 11, 12, 13, 13, 14, 14, 15, 15, 16, 16, 16, 17, 17, 18, 19, 19, 20, 21, 21, 22, 23, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33, 34, 36, 37, 38, 39, 41, 42, 44, 44, 45, 44, 44, 44, 44, 43, 43, 43, 42, 40, 36, 30, 22, 16, 11, 8, 7, 6, 6, 5, 5, 5, 4, 4, 4, 3, 3, 4, 5, 8, 11, 15, 18, 20, 20, 20, 20, 19, 19, 18, 18, 17, 17, 16, 16, 15, 15, 14, 14, 14, 13, 12, 11, 8, 5, 1], [1, 4, 7, 9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 18, 19, 20, 20, 21, 22, 22, 23, 24, 24, 25, 26, 27, 28, 29, 31, 32, 33, 34, 35, 36, 37, 39, 40, 42, 43, 44, 44, 44, 44, 45, 45, 45, 44, 43, 41, 36, 30, 22, 15, 11, 8, 6, 6, 5, 5, 5, 4, 4, 4, 4, 3, 3, 3, 5, 7, 11, 14, 17, 19, 20, 20, 20, 19, 19, 18, 17, 17, 16, 16, 16, 15, 15, 14, 14, 13, 13, 12, 10, 8, 4, 1], [1, 3, 6, 8, 10, 12, 13, 13, 14, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 21, 21, 22, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 42, 43, 43, 43, 44, 44, 43, 42, 40, 35, 28, 21, 14, 10, 7, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 3, 3, 4, 7, 10, 14, 17, 19, 20, 20, 19, 19, 18, 18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 13, 13, 12, 10, 7, 4, 1], [1, 3, 6, 8, 10, 11, 12, 13, 14, 14, 14, 15, 15, 16, 16, 17, 17, 17, 18, 18, 19, 20, 20, 21, 21, 22, 23, 23, 24, 25, 26, 27, 28, 29, 30, 31, 31, 32, 33, 34, 35, 36, 38, 39, 39, 40, 40, 41, 41, 42, 42, 41, 40, 38, 33, 26, 19, 13, 9, 7, 5, 5, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 4, 6, 10, 14, 17, 19, 20, 20, 19, 19, 18, 17, 17, 16, 16, 16, 15, 15, 14, 14, 13, 13, 12, 11, 9, 7, 4, 1], [1, 3, 5, 7, 9, 11, 12, 13, 13, 14, 14, 15, 15, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 23, 24, 25, 26, 27, 28, 28, 29, 29, 30, 31, 32, 33, 34, 35, 36, 37, 37, 38, 38, 39, 39, 40, 40, 39, 38, 35, 31, 25, 18, 12, 8, 6, 5, 4, 4, 3, 3, 3, 3, 3, 2, 2, 2, 2, 3, 6, 10, 13, 16, 18, 19, 19, 19, 18, 18, 17, 17, 16, 16, 15, 15, 15, 14, 14, 13, 13, 12, 11, 9, 6, 4, 1], [1, 3, 5, 7, 9, 10, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 22, 22, 23, 24, 25, 26, 27, 27, 28, 28, 29, 30, 30, 31, 32, 33, 34, 35, 35, 36, 36, 37, 37, 38, 38, 37, 36, 33, 29, 23, 17, 11, 7, 5, 4, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 3, 6, 9, 13, 16, 18, 19, 19, 18, 18, 17, 17, 16, 16, 16, 15, 15, 14, 14, 14, 13, 13, 12, 10, 8, 6, 3, 1], [1, 2, 4, 6, 8, 10, 11, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 18, 18, 18, 19, 19, 20, 20, 21, 22, 23, 24, 25, 25, 26, 26, 27, 27, 28, 29, 29, 30, 31, 32, 32, 33, 33, 34, 34, 35, 35, 36, 36, 35, 34, 31, 27, 22, 16, 10, 6, 4, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 3, 6, 9, 13, 16, 18, 18, 18, 18, 17, 17, 17, 16, 16, 15, 15, 15, 14, 14, 13, 13, 12, 11, 9, 7, 5, 3, 1], [1, 2, 4, 6, 7, 9, 10, 12, 13, 13, 14, 14, 14, 15, 15, 16, 16, 17, 17, 17, 18, 18, 19, 19, 19, 20, 21, 21, 22, 23, 24, 24, 25, 25, 26, 26, 27, 28, 28, 29, 29, 30, 31, 31, 32, 32, 32, 33, 33, 34, 34, 33, 32, 30, 26, 21, 15, 10, 6, 4, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 4, 6, 9, 13, 15, 17, 18, 18, 18, 17, 17, 16, 16, 16, 15, 15, 14, 14, 14, 13, 13, 12, 10, 9, 7, 5, 3, 1], [1, 2, 3, 5, 6, 8, 10, 11, 12, 13, 14, 14, 14, 15, 15, 16, 16, 16, 17, 17, 18, 18, 18, 19, 19, 20, 20, 21, 21, 22, 23, 23, 24, 24, 25, 25, 26, 27, 27, 28, 28, 29, 29, 30, 30, 31, 31, 31, 32, 32, 32, 32, 31, 28, 25, 20, 14, 9, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 3, 4, 6, 9, 13, 15, 17, 18, 18, 17, 17, 17, 16, 16, 15, 15, 15, 14, 14, 13, 13, 12, 11, 10, 8, 6, 4, 2, 1], [1, 2, 3, 5, 6, 7, 9, 10, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 19, 20, 21, 21, 22, 22, 23, 23, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 29, 30, 30, 30, 31, 30, 30, 29, 27, 24, 19, 13, 9, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 6, 9, 13, 15, 17, 17, 17, 17, 17, 16, 16, 16, 15, 15, 14, 14, 14, 13, 13, 12, 10, 9, 7, 6, 4, 2, 1], [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 13, 14, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 19, 20, 20, 21, 21, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 28, 29, 29, 29, 30, 29, 29, 28, 26, 23, 18, 13, 8, 5, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 4, 7, 10, 13, 15, 17, 17, 17, 17, 17, 16, 16, 15, 15, 15, 14, 14, 13, 13, 12, 11, 10, 8, 6, 5, 3, 2, 1], [1, 2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 27, 28, 28, 28, 29, 28, 28, 27, 25, 22, 17, 12, 8, 4, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 5, 8, 10, 13, 15, 16, 17, 17, 17, 16, 16, 16, 15, 15, 14, 14, 14, 13, 12, 11, 10, 9, 7, 6, 5, 3, 2, 1], [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 23, 24, 24, 25, 25, 26, 26, 26, 27, 27, 27, 28, 27, 27, 26, 24, 21, 16, 11, 7, 4, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 4, 6, 9, 12, 14, 15, 16, 17, 16, 16, 16, 16, 15, 15, 15, 14, 14, 13, 13, 12, 11, 9, 8, 7, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 5, 6, 7, 9, 10, 11, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 19, 20, 20, 21, 21, 22, 22, 22, 22, 23, 23, 24, 24, 25, 25, 25, 26, 26, 26, 27, 26, 26, 25, 23, 20, 16, 11, 7, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 4, 6, 8, 11, 13, 14, 15, 16, 16, 16, 16, 16, 15, 15, 15, 14, 14, 13, 13, 12, 11, 10, 9, 7, 6, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 5, 6, 7, 8, 9, 11, 12, 12, 13, 14, 14, 14, 15, 15, 15, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 20, 20, 21, 21, 21, 22, 22, 22, 22, 23, 23, 24, 24, 24, 25, 25, 25, 26, 25, 25, 24, 22, 19, 15, 10, 6, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 4, 6, 8, 10, 13, 14, 15, 16, 16, 16, 16, 16, 15, 15, 15, 14, 14, 14, 13, 12, 12, 11, 9, 8, 7, 6, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 5, 6, 6, 7, 8, 10, 11, 12, 13, 13, 14, 14, 14, 15, 15, 16, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 20, 20, 20, 21, 21, 21, 21, 21, 22, 22, 23, 23, 23, 24, 24, 24, 25, 24, 24, 23, 21, 18, 14, 10, 6, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 4, 6, 8, 10, 12, 14, 15, 16, 16, 16, 15, 15, 15, 15, 15, 14, 14, 14, 13, 13, 12, 11, 10, 8, 7, 6, 5, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 5, 6, 6, 6, 7, 9, 10, 11, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 22, 22, 22, 23, 23, 23, 24, 23, 23, 22, 20, 17, 13, 9, 6, 3, 2, 2, 2, 2, 2, 2, 2, 3, 4, 6, 8, 10, 12, 14, 15, 16, 16, 16, 15, 15, 15, 15, 15, 14, 14, 14, 13, 13, 12, 11, 10, 9, 7, 6, 6, 5, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 5, 6, 6, 6, 7, 8, 9, 10, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 20, 21, 21, 21, 22, 22, 22, 23, 22, 22, 21, 19, 17, 13, 9, 5, 3, 2, 2, 2, 2, 2, 2, 3, 4, 6, 8, 10, 12, 14, 15, 15, 16, 16, 16, 15, 15, 15, 14, 14, 14, 14, 13, 13, 12, 11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 5, 6, 6, 6, 6, 7, 8, 9, 10, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 21, 21, 21, 22, 21, 21, 20, 19, 16, 13, 9, 5, 3, 2, 2, 2, 2, 3, 3, 4, 6, 8, 10, 12, 14, 15, 15, 16, 16, 15, 15, 15, 15, 14, 14, 14, 14, 13, 13, 12, 11, 11, 9, 8, 7, 6, 6, 6, 5, 5, 4, 3, 2, 1], [1, 2, 3, 4, 5, 5, 5, 5, 6, 6, 6, 7, 8, 10, 10, 11, 12, 13, 13, 14, 14, 14, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 21, 20, 20, 19, 18, 15, 12, 8, 5, 3, 2, 2, 2, 2, 3, 4, 6, 8, 10, 12, 13, 15, 15, 16, 15, 15, 15, 15, 15, 15, 14, 14, 14, 13, 13, 12, 11, 11, 10, 8, 7, 6, 6, 6, 6, 5, 5, 4, 3, 2, 1], [1, 2, 3, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 9, 10, 10, 11, 12, 13, 13, 14, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 20, 19, 19, 19, 17, 15, 12, 8, 5, 3, 2, 2, 2, 3, 4, 6, 8, 10, 12, 13, 14, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 13, 13, 12, 11, 11, 10, 9, 7, 6, 6, 6, 6, 6, 5, 5, 4, 3, 2, 1], [1, 2, 3, 4, 4, 4, 5, 5, 6, 6, 6, 6, 7, 8, 9, 10, 10, 11, 12, 13, 13, 14, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 18, 17, 15, 11, 8, 5, 3, 2, 2, 3, 4, 6, 8, 10, 12, 13, 14, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 13, 13, 12, 11, 10, 10, 9, 8, 7, 6, 6, 6, 5, 5, 5, 5, 4, 3, 2, 1], [1, 2, 3, 3, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 8, 9, 10, 10, 11, 12, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 17, 16, 14, 11, 8, 5, 3, 2, 3, 4, 6, 8, 10, 11, 13, 14, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 13, 13, 12, 11, 10, 10, 9, 8, 7, 6, 6, 6, 6, 5, 5, 5, 4, 4, 3, 2, 1], [1, 2, 3, 3, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 8, 9, 10, 10, 11, 12, 13, 13, 13, 14, 14, 14, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 16, 14, 11, 8, 5, 3, 3, 4, 5, 7, 9, 11, 13, 14, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 13, 13, 13, 12, 11, 10, 10, 9, 8, 7, 6, 6, 6, 6, 6, 5, 5, 4, 4, 4, 3, 2, 1], [1, 2, 3, 3, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 17, 17, 16, 15, 13, 10, 8, 5, 4, 4, 5, 7, 9, 11, 13, 14, 14, 15, 15, 15, 14, 14, 14, 14, 14, 14, 13, 13, 12, 12, 11, 10, 9, 8, 7, 7, 6, 6, 6, 5, 5, 5, 5, 5, 4, 4, 3, 3, 2, 1], [1, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 13, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 15, 13, 10, 8, 6, 5, 5, 7, 9, 11, 12, 13, 14, 14, 15, 14, 14, 14, 14, 14, 14, 13, 13, 13, 12, 12, 11, 10, 9, 8, 7, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 4, 4, 3, 3, 2, 1], [1, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 7, 8, 9, 10, 11, 11, 12, 12, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 15, 14, 13, 10, 8, 7, 6, 7, 9, 10, 12, 13, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 12, 11, 11, 10, 9, 8, 7, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 4, 4, 3, 3, 2, 1], [1, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 7, 7, 8, 9, 10, 11, 11, 12, 12, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 13, 11, 9, 8, 8, 9, 10, 12, 13, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 12, 12, 11, 10, 9, 8, 7, 7, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 4, 4, 3, 3, 2, 1], [1, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 8, 9, 9, 10, 11, 11, 12, 12, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 13, 11, 10, 9, 10, 11, 12, 13, 14, 14, 14, 14, 14, 13, 13, 13, 13, 13, 12, 12, 11, 10, 10, 9, 8, 7, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 3, 3, 2, 1], [1, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 7, 7, 8, 9, 9, 10, 11, 12, 12, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 14, 14, 13, 12, 11, 11, 11, 12, 13, 13, 14, 14, 14, 13, 13, 13, 13, 13, 12, 12, 11, 10, 10, 9, 8, 7, 7, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 3, 3, 2, 1], [1, 2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 7, 7, 8, 9, 9, 10, 11, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 12, 12, 12, 11, 10, 10, 9, 8, 7, 7, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 2, 1], [1, 2, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 7, 8, 9, 9, 10, 11, 11, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 13, 13, 13, 13, 12, 12, 12, 12, 12, 13, 13, 13, 12, 12, 12, 11, 11, 10, 9, 9, 8, 7, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 2, 2, 1], [1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 6, 6, 7, 7, 8, 9, 9, 10, 10, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 10, 9, 9, 8, 7, 7, 6, 6, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1], [1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 9, 9, 9, 9, 9, 9, 9, 9, 8, 8, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 1, 1], [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],    
    
    };