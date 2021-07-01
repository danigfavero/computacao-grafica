/*
    EP3 - Simulador de vôo - Parte I

    Autor: Daniela Gonzalez Favero
    Data: 14 de julho de 2021
*/
"use strict";

var canvas;
var gl;


window.onload = main;

function main() {

    canvas = document.getElementById("glCanvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

}