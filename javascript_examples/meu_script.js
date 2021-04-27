main();

function main() {

    const canvas = document.querySelector('#meucanvas');
    const ctx = canvas.getContext('2d');

    const w = canvas.width;
    const h = canvas.height;

    console.log('w = ', w, ', h = ', h)
    
    // desenhando no canvas
    texto(ctx);
    retangulos(ctx);
    poligono(ctx, w, h);
    com_lista(ctx, 200, 150);

    // interatividade
    let isDrawing = false; // botão apertado
    let x = 0; // coordenadas do cursor
    let y = 0;

    canvas.addEventListener('mousedown', e => {
        x = e.offsetX;
        y = e.offsetY;
        isDrawing = true;
    });

    canvas.addEventListener('mouseup', e => {
        if (isDrawing) {
            drawLine(ctx, x, y, e.offsetX, e.offsetY);
            x = 0;
            y = 0;
            isDrawing = false;
        }
    });

    canvas.addEventListener('mousemove', e => {
        if (isDrawing) {
            drawLine(ctx, x, y, e.offsetX, e.offsetY);
            x = e.offsetX;
            y = e.offsetY;
        }
    });
}

function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.strokeStyle = 'magenta';
    ctx.lineWidth = 3;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

function poligono(ctx, w, h) {
    ctx.fillStyle = 'black';
    mw = w/2;
    mh = h/2;

    ctx.beginPath();
    ctx.moveTo(mw, mh);
    ctx.lineTo(mw+mw/2, mh-mh/2);
    ctx.lineTo(mw+mw/2, mh+mh/2);
    
    ctx.closePath();
    // ctx.fill();
    ctx.stroke();

}

function retangulos(ctx) {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(20, 50, 150, 300);
    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
    ctx.fillRect(80, 30, 300, 200);
}

function texto(ctx) {
    ctx.fillStyle = 'rgb(50, 50, 190)';
    ctx.font = '48px serif';
    ctx.fillText('olá mundo!', 100, 200);
}

function com_lista(ctx, dx, dy) {
    pt = [ [50, 150], [250, 155], [100, 275], [150, 75], [200, 275] ];
    ctx.fillStyle = 'lightgreen';

    ctx.beginPath();
    ctx.moveTo( pt[0][0] + dx, pt[0][1] + dy );

    for (let i = 1; i < 5; i++) {
        ctx.lineTo( pt[i][0] + dx, pt[i][1] + dy);
    }

    ctx.fill(); // com fill, nem precisa dar closePath()
}