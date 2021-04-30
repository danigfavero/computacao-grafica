main();

function main() {

    const canvas = document.querySelector('#desenho_canvas');
    const ctx = canvas.getContext('2d');

    const w = canvas.width;
    const h = canvas.height;

    console.log('w = ', w, 'X h = ', h)

    retangulo_verde(ctx, w, h);
    losango_amarelo(ctx, w, h);
    retangulo_azul(ctx, w, h);

}

function retangulo_verde(ctx, w, h) {
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, w, h);
}

function retangulo_azul(ctx, w, h) {
    ctx.fillStyle = 'blue';
    ctx.fillRect(w/2 - w/8, h/2 - h/8, w/4 , h/4);
}

function losango_amarelo(ctx, w, h) {
    pt = [ [w/8, h/2], [w/2, h/8], [w - w/8, h/2], [w/2, h-h/8] ];
    ctx.fillStyle = 'yellow';

    ctx.beginPath();
    ctx.moveTo(pt[0][0], pt[0][1]);

    for (let i = 1; i < 4; i++) {
        ctx.lineTo(pt[i][0], pt[i][1]);
    }

    ctx.fill();
}