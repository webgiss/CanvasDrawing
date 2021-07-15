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

const drawing = new Drawing({ canvasId: "item" });

const mainAction = (config) => {
    const { n, minimal, mode_contrast, mode_color, mode_bin, mode_2_to_1, backgroundColor, penColor, } = config;

    let height = window.innerHeight;
    let width = window.innerWidth;
    let minDim = Math.min(width, height);
    if (minimal) {
        minDim = 2 ** n;
    }
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
                    color: mode_color ? (mode_contrast ? hue2color_minmax(i / (max * max), 0, 0.7) : hue2color(i / (max * max))) : penColor,
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
                    color: mode_color ? (mode_contrast ? hue2color_minmax(i / N, 0, 0.7) : hue2color(i / N)) : penColor,
                });
            }
        })
    }
};

const KeyManager = window.KeyManager;
const keyManager = new KeyManager({
    penColor: '#331108',
    backgroundColor: '#ffffff',
    mode_2_to_1: false,
    mode_bin: false,
    mode_color: false,
    minimal: false,
    mode_contrast: false,
    n: 4,
});

keyManager
    .add('ArrowUp', () => { })
    .add('ArrowDown', () => { })
    .add('ArrowLeft', (config) => config.n -= 1)
    .add('ArrowRight', (config) => config.n += 1)
    .add('x', (config) => config.mode_2_to_1 = !(config.mode_2_to_1))
    .add('d', (config) => config.mode_bin = !(config.mode_bin))
    .add('b', (config) => config.mode_bin = !(config.mode_bin))
    .add('c', (config) => config.mode_color = !(config.mode_color))
    .add('m', (config) => config.minimal = !(config.minimal))
    .add('t', (config) => config.mode_contrast = !(config.mode_contrast))
    .setAction(mainAction)
    .onResize(true)
    ;

