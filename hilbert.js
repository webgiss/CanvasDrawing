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
    ALIGN_CENTER,
} = CanvasDrawing;

const KeyManager = window.KeyManager;
const keyManager = new KeyManager({
    penColor: '#331108',
    backgroundColor: '#e0e0cc',
    mode_2_to_1: false,
    mode_bin: false,
    n: 4,
});
const drawing = new Drawing({ canvasId: "item" });

const Md = [
    [1, 0, 0, 3],
    [0, 1, 1, 2],
    [3, 2, 2, 1],
    [2, 3, 3, 0]
]
const M12 = [
    [0, 1, 3, 2],
    [0, 2, 3, 1],
    [3, 2, 0, 1],
    [3, 1, 0, 2]
]
const M21 = [
    [0, 1, 3, 2],
    [0, 3, 1, 2],
    [2, 3, 1, 0],
    [2, 1, 3, 0]
]

/**
 * Convert an index into coordinate of the Hilbert-n curve.
 * @param {number} n The order of the hilbert curve
 * @param {number} i The index (compris between 0 and (2**(2n))-1)
 * @returns {number[]} The result comprise between 0 and (2**n)-1
 */
const hilbert1To2 = (n, i) => {
    let d = 0;
    let p = 2 ** (n - 1);
    let x = 0;
    let y = 0;
    while (p > 0) {
        let ic = (Math.floor(i / (p * p))) % (4);
        let zc = M12[d][ic];
        let xc = Math.floor(zc / 2);
        let yc = zc % 2;
        d = Md[d][ic];
        x = x + xc * p;
        y = y + yc * p;
        p = Math.floor(p / 2);
    }
    return [x, y];
}

/**
 * Convert a couple of coordinate of the Hilbert-n curve into an index.
 * @param {number} n The order of the hilbert curve
 * @param {number} x The index (compris between 0 and (2**n)-1)
 * @param {number} y The index (compris between 0 and (2**n)-1)
 * @returns {number} The result comprise between 0 and (2**(2n))-1
 */
const hilbert2To1 = (n, x, y) => {
    let d = 0;
    let p = 2 ** (n - 1);
    let i = 0;
    while (p > 0) {
        let xc = (Math.floor(x / p)) % (2);
        let yc = (Math.floor(y / p)) % (2);
        let zc = 2 * xc + yc;
        let ic = M21[d][zc];
        d = Md[d][ic];
        i = i + ic * p * p;
        p = Math.floor(p / 2);
    }
    return i;
}

const mainAction = (config) => {
    const { n, mode_bin, mode_2_to_1, backgroundColor, penColor, } = config;

    let height = window.innerHeight;
    let width = window.innerWidth;
    let minDim = Math.min(width, height);
    width = minDim;
    height = minDim;
    const origin = [0, height];
    const mapx = minDim / 2 ** n;
    const mapy = -minDim / 2 ** n;
    const bgcolor = backgroundColor;
    drawing.reinit({ height, width, origin, mapx, mapy, bgcolor });

    if (mode_2_to_1) {
        const max = 2 ** n;
        getRange(max).forEach((x) => {
            getRange(max).forEach((y) => {
                const i = hilbert2To1(n, x, y);
                drawing.addText({
                    text: mode_bin ? `${i.toString(2).padStart(2 * n, '0')}` : `${i}`,
                    position: POS_CENTER,
                    point: new Vector(x, y).add(0.5, 0.5),
                    textAlign: ALIGN_CENTER,
                    color: penColor,
                });
            })
        })
    } else {
        const N = 2 ** (2 * n);
        const curve = getRange(N).map(i => hilbert1To2(n, i));
        getRange(N).forEach((i) => {
            if (i > 0) {
                let p0 = curve[i - 1];
                let p1 = curve[i];
                drawing.line({
                    point0: new Vector(p0).add(0.5, 0.5),
                    point1: new Vector(p1).add(0.5, 0.5),
                    color: penColor,
                });
            }
        })
    }
};

keyManager
    .add('ArrowUp', () => { })
    .add('ArrowDown', () => { })
    .add('ArrowLeft', (config) => config.n -= 1)
    .add('ArrowRight', (config) => config.n += 1)
    .add('x', (config) => config.mode_2_to_1 = !(config.mode_2_to_1))
    .add('d', (config) => config.mode_bin = !(config.mode_bin))
    .add('b', (config) => config.mode_bin = !(config.mode_bin))
    .setAction(mainAction)
    .onResize(true)
    ;

