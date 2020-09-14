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

const drawing = new Drawing({ canvasId: "item" });

const mainAction = (config) => {
    const { z, r, ratio, n, backgroundColor, penColor, hasRatio, hasCount, hasCf } = config;

    const height = window.innerHeight;
    const width = window.innerWidth;
    const origin = [width / 2, height / 2];
    let minDim = Math.min(width, height);
    const mapx = minDim / (2 * z);
    const mapy = -minDim / (2 * z);
    const bgcolor = backgroundColor;
    drawing.reinit({ height, width, origin, mapx, mapy, bgcolor });

    drawing.circle({
        center: new Vector(0, 0),
        length: 1,
        color: penColor
    });
    drawing.circle({
        center: new Vector(0, 0),
        length: z,
        color: penColor
    });

    getRange(n).map((i) =>
        drawing.circle({
            center: new Vector(
                1 + r + (n-i-1) * ((z - 1 - 2*r) / (n - 1)),
                i * 2 * Math.PI * ratio,
                true
            ),
            length: r,
            color: penColor
        })
    );

    const fc = getCf(ratio);

    const formatElement = (elem) => `${elem.term} : ${elem.fraction[0]}/${elem.fraction[1]} (~ ${elem.value})`;
    let textPartialCf = JSON.stringify(fc) + "\n";
    textPartialCf = textPartialCf + partialCfs([...fc]).map(formatElement).join("\n");

    if (hasRatio) {
        drawing.addText({
            text: `${ratio}`,
            point: new CanvasVector(0, height),
            position: POS_TOPRIGHT,
        });
    }

    if (hasCf) {
        drawing.addText({
            text: textPartialCf,
            point: new CanvasVector(0, 0),
            position: POS_BOTTOMRIGHT,
            fontSize: "18px",
        });
    }

    if (hasCount) {
        drawing.addText({
            text: `n = ${n}`,
            point: new CanvasVector(width, height),
            position: POS_TOPLEFT,
        });
    }
};

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

