const {
    Drawing,
    Vector,
    CanvasVector,
    getRange,
    random,
    animate,
} = CanvasDrawing;

const drawing = new Drawing({ canvasId: "item" });

const mainAction = (config) => {
    const { w, backgroundColor, penColor, } = config;

    let height = window.innerHeight;
    let width = window.innerWidth;
    const origin = [0, height];
    const mapx = w;
    const mapy = -w;
    const bgcolor = backgroundColor;
    drawing.reinit({ height, width, origin, mapx, mapy, bgcolor });

    const nX = Math.floor(width / w) + 1;
    const nY = Math.floor(height / w) + 1;

    const context = drawing.context;
    getRange(nX).forEach((x) => {
        getRange(nY).forEach((y) => {
            if (random(2) === 0) {
                context.beginPath();
                context.fillStyle = penColor;
                context.rect(w * x, w * y, w, w);
                context.fill();
            }
        })
    })
};

const KeyManager = window.KeyManager;
const keyManager = new KeyManager({
    penColor: '#331108',
    backgroundColor: '#e0e0cc',
    w: 8,
});

keyManager
    .add('ArrowUp', () => { })
    .add('ArrowDown', () => { })
    .add('ArrowRight', (config) => config.w += 1)
    .add('ArrowLeft', (config) => { config.w -= 1; if (config.w < 4) { config.w = 4; } })
    .setAction(mainAction)
    .onResize(true)
    ;


const animationParams = {
    action: ({ value }) => keyManager._doAction({ w: value }),
    frameTime: 0.01,
};

const doLoop = () => {
    let p = Promise.resolve();
    p = p.then(() => animate({ ...animationParams, from: 6, to: 15 }));
    p = p.then(() => animate({ ...animationParams, from: 15, to: 13 }));
    p = p.then(() => animate({ ...animationParams, from: 13, to: 15 }));
    p = p.then(() => animate({ ...animationParams, from: 15, to: 6 }));
    p.then(() => doLoop());
}

keyManager.add('Space', () => doLoop());
