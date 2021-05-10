/* ==================================================
    fractais.js

    Nome: Daniela Gonzalez Favero
    NUSP: 10277443

    Ao preencher esse cabeçalho com o meu nome e o meu número USP,
    declaro que todas as partes originais desse exercício programa (EP)
    foram desenvolvidas e implementadas por mim e que portanto não 
    constituem desonestidade acadêmica ou plágio.
    Declaro também que sou responsável por todas as cópias desse
    programa e que não distribui ou facilitei a sua distribuição.
    Estou ciente que os casos de plágio e desonestidade acadêmica
    serão tratados segundo os critérios divulgados na página da 
    disciplina.
    Entendo que EPs sem assinatura devem receber nota zero e, ainda
    assim, poderão ser punidos por desonestidade acadêmica.

    Abaixo descreva qualquer ajuda que você recebeu para fazer este
    EP.  Inclua qualquer ajuda recebida por pessoas (inclusive
    monitores e colegas). Com exceção de material da disciplina, caso
    você tenha utilizado alguma informação, trecho de código,...
    indique esse fato abaixo para que o seu programa não seja
    considerado plágio ou irregular.

    Exemplo:

        A minha função quicksort() foi baseada na descrição encontrada na 
        página https://www.ime.usp.br/~pf/algoritmos/aulas/quick.html.

    Descrição de ajuda ou indicação de fonte:



================================================== */

// Você pode usar essas constantes se desejar

const DEBUG = true;
const ITERATIONS = 100;
const DELTA = 4;
const SHIFT = 16;  // código ASCII da tecla
const R = 82;

// Condições iniciais de Julia e Mandelbrot
const CX = -0.62, CY = -0.44;

const JULIA_L = -1.5;
const JULIA_B = -1.5;
const JULIA_R =  1.5;
const JULIA_T =  1.5;

const MANDEL_L = -2.2;
const MANDEL_B = -1.5;
const MANDEL_R =  0.8;
const MANDEL_T =  1.5;

// Veja uma lista de cores em: 
// https://www.w3schools.com/tags/ref_colornames.asp
const CORES = [
    'black', 'magenta', 'red',  
    'orange', 'yellow', 'yellowgreen', 
    'green', 'blue', 'purple'
];

const NCORES = CORES.length;

// Variáveis globais
var gCanvas, gWidth, gHeight, gCtx;

// outra variáveis se desejar
var reseted = true;

/*
    função main
*/
function main() {
    
    gCanvas = document.querySelector('#fractais_canvas');
    gWidth = gCanvas.width;
    gHeight = gCanvas.height/2;
    gCtx = gCanvas.getContext('2d');

    msg = `Canvas tem tamanho ${gWidth} x ${2*gHeight}`;
    console.log( msg );

    // RESTO DA SUA FUNÇÃO MAIN
    mandelbrotWindow(0, gWidth, 0, gHeight);
    juliaFatouWindow(0, gWidth, gHeight, gHeight*2);

    document.addEventListener('keydown', e => keyDown(e));
    gCanvas.addEventListener('mousedown', e => mouseDown(e));
    gCanvas.addEventListener('mouseup', e => mouseUp(e));
}

// outras funções

// auxiliares
function map(number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function isInMandelbrotWindow (x, y) {
    return x >= 0 && x < 400 && y >= 0 & y < 400;
}

// pixel-wise
function juliaFatouPixel(a, b, cx=CX, cy=CY) {
    let iteration = 0;

    while (a*a + b*b < DELTA && iteration < ITERATIONS) {
        let real = a*a - b*b;
        let imaginary = 2*a*b;
        a = real + cx;
        b = imaginary + cy;

        iteration++;
    }

    if (iteration === ITERATIONS) {
        return CORES[1];
    } else {
        return CORES[0];
    }
}

function mandelbrotPixel(a, b) {
    let iteration = 0;

    let a0 = a;
    let b0 = b;

    while (a*a + b*b < DELTA && iteration < ITERATIONS) {
        let real = a*a - b*b;
        let imaginary = 2*a*b;
        a = real + a0;
        b = imaginary + b0;

        iteration++;
    }

    if (iteration === ITERATIONS) {
        iteration = 0;
    }
    return CORES[iteration % NCORES];
}

// gerador de fractais
function juliaFatouWindow(x0, xn, y0, yn, cx=CX, cy=CY) {
    if (DEBUG) { 
        console.log("juliaFatouWindow(", x0, xn, y0, yn, cx, cy, ")");
    }

    for (let x = x0; x < xn; x++) {
        for (let y = y0; y < yn*2; y++) {
            let a = map(x, x0, xn, JULIA_L, JULIA_R);
            let b = map(y, y0, yn, JULIA_B, JULIA_T);

            gCtx.fillStyle = juliaFatouPixel(a, b, cx, cy);
            gCtx.fillRect(x, y, x, y);
        }
    }
}

function mandelbrotWindow(x0, xn, y0, yn) {
    if (DEBUG) { 
        console.log("mandelbrotWindow(", x0, xn, y0, yn, ")");
    }

    for (let x = x0; x < xn; x++) {
        for (let y = y0; y < yn*2; y++) {
            let a = map(x, x0, xn, MANDEL_L, MANDEL_R);
            let b = map(y, y0, yn, MANDEL_T, MANDEL_B);

            gCtx.fillStyle = mandelbrotPixel(a, b);
            gCtx.fillRect(x, y, x, y);
        }
    }
}

// UI
function keyDown(e) {
    if (e.keyCode == R && !reseted) { // reset
        mandelbrotWindow(0, gWidth, 0, gHeight);
        juliaFatouWindow(0, gWidth, gHeight, gHeight*2);
        reseted = true;
    }
}

function mouseDown(e) {
    let [x, y] = [e.offsetX, e.offsetY];
    if (!isInMandelbrotWindow(x, y)) return;

    if (e.shiftKey) {
        if (DEBUG) {
            console.log("down", x, y);
        }
    } else {
        if (DEBUG) {
            console.log("ponto", x, y);
        }

        let cx = map(x, 0, gWidth, MANDEL_L, MANDEL_R);
        let cy = map(y, 0, gHeight, MANDEL_B, MANDEL_T);
        juliaFatouWindow(0, gWidth, gHeight, gHeight*2, cx, cy);
        reseted = false;
    }
}

function mouseUp(e) {
    let [x, y] = [e.offsetX, e.offsetY];
    if (!isInMandelbrotWindow(x, y)) return;

    if (e.shiftKey) {
        if (DEBUG) {
            console.log("up", x, y);
        }
        // cria janela
        reseted = false;
    }
}

/*
        FIM 
*/
main();
