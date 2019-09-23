const {
    Drawing,
    Vector,
    CanvasVector,
    getRange,
} = CanvasDrawing;

const {
    POS_CENTER,
    POS_TOPLEFT,
    POS_TOPRIGHT,
    POS_BOTTOMRIGHT,
    POS_BOTTOMLEFT,
} = CanvasDrawing;

const {
    getCf, getRatio, reduceFraction, partialCf, partialCfs
} = ContinuedFraction;

const KeyManager = window.KeyManager;
const keyManager = new KeyManager({
    penColor: '#331108',
    backgroundColor: '#e0e0cc',
    ratio: 0.05,
    z: 12,
    r: 0.1,
    ratiochanger: 0.00001,
    n: 500,
    hasCf: false,
    hasRatio: true,
    hasCount: true,
});
const drawing = new Drawing({ canvasId: "item" });

const mainAction = (config) => {
    const height = window.innerHeight;
    const width = window.innerWidth;
    const origin = [width / 2, height / 2];
    let minDim = Math.min(width, height);
    const mapx = minDim / (2 * config.z);
    const mapy = -minDim / (2 * config.z);
    const bgcolor = config.backgroundColor;
    drawing.reinit({ height, width, origin, mapx, mapy, bgcolor });

    drawing.circle({
        center: new Vector(0, 0),
        length: 1,
        color: config.penColor
    });

    getRange(config.n).map(i =>
        drawing.circle({
            center: new Vector(
                1 +
                config.r +
                i *
                config.ratio *
                2 *
                config.r *
                ((config.z - 1) /
                    (config.n * config.ratio * 2 * config.r)),
                i * 2 * Math.PI * config.ratio,
                true
            ),
            length: config.r,
            color: config.penColor
        })
    );

    config.fc = getCf(config.ratio);
    config.partial_fc = partialCfs([...config.fc]);

    let text = JSON.stringify(config.fc) + "\n";
    text =
        text +
        config.partial_fc
            .map(
                elem =>
                    `${elem.term} : ${elem.fraction[0]}/${elem.fraction[1]} (~ ${elem.value})`
            )
            .join("\n");

    if (config.hasRatio) {
        drawing.addText({
            text: `${config.ratio}`,
            point: new CanvasVector(0, window.innerHeight),
            position: POS_TOPRIGHT
        });
    }

    if (config.hasCf) {
        drawing.addText({
            text: text,
            point: new CanvasVector(0, 0),
            position: POS_BOTTOMRIGHT,
            fontSize: "18px"
        });
    }

    if (config.hasCount) {
        drawing.addText({
            text: `n = ${config.n}`,
            point: new CanvasVector(window.innerWidth, window.innerHeight),
            position: POS_TOPLEFT
        });
    }
};


keyManager
    .add('ArrowUp', (config) => config.ratio += config.ratiochanger)
    .add('ArrowDown', (config) => config.ratio -= config.ratiochanger)
    .add('ArrowLeft', (config) => config.ratiochanger *= 10)
    .add('ArrowRight', (config) => config.ratiochanger /= 10)
    .add('+', (config) => config.n = Math.floor(config.n * 1.08) + 1)
    .add('-', (config) => config.n = Math.floor(config.n / 1.08))
    .add('KeyR', (config) => config.hasRatio = !(config.hasRatio))
    .add('KeyC', (config) => config.hasCf = !(config.hasCf))
    .add('shift+KeyC', (config) => config.hasCount = !(config.hasCount))
    .add('KeyP', (config) => config.ratio = Math.PI)
    .add('Shift+KeyP', (config) => config.ratio = (1 + Math.sqrt(5)) / 2)
    .add('Ctrl+Alt+KeyP', (config) => config.ratio = 0.05)
    .setAction(mainAction)
    .onResize(true)
    ;

const cr = (xratio) => {
    if (xratio !== undefined) {
        if (xratio.length !== undefined) {
            config.ratio = getRatio(xratio);
        } else {
            config.ratio = xratio;
        }
    }
    action(config);
}

