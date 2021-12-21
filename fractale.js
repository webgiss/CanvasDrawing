const { Drawing, Vector, CanvasVector, animate, drawTimeTable, getRange } = CanvasDrawing;
const KeyManager = window.KeyManager;

const text_size = 20;
const background_color = '#e0e0cc';
const pen_color = '#331108';
const circle_color = '#ffffff';

const keyManager = new KeyManager({
    pixelscale: 5,
    depth: 6,
    size: 3,
    julia: false,
    highquality: false,
});

const drawing = new Drawing({ canvasId: 'item' });
const body = window.document.getElementsByTagName('body')[0];

body.classList.__proto__.swap = function (className) {
    if (this.contains(className)) {
        this.remove(className);
    } else {
        this.add(className);
    }
}

const config = keyManager.config;
config.clicks = config.clicks || [];
drawing.addClickListener(({ position }) => {
    console.log(JSON.stringify(position.xy));
    config.clicks.unshift(position);
    config.clicks.splice(2);
});

keyManager
    .add("ArrowUp", (config) => config.depth += 1, 'Increase depth')
    .add("ArrowDown", (config) => config.depth -= 1, 'Decrease depth')
    .add("+", (config) => config.pixelscale += 1, 'Increase scale')
    .add("-", (config) => config.pixelscale -= 1, 'Decrease scale')
    .add("*", (config) => config.size += 0.1, 'Increase size')
    .add("/", (config) => config.size -= 0.1, 'Decrease size')
    .add("j", (config) => { config.julia = !config.julia; if (config.julia) { config.juliaPoint = config.clicks[0] || new Vector([0.4974874371859297, 0.5540201005025126]); } }, 'Toogle Julia')
    .add("h", (config) => config.highquality = !config.highquality, 'Toogle HighQuality')
    .add('x', (config) => body.classList.swap('maxwidth'), 'Toogle maxwidth')
    .add('y', (config) => body.classList.swap('maxheight'), 'Toogle maxheight')
    .add('z', (config) => {
        if (config.clicks.length >= 2) {
            config.corners = config.clicks.slice(0, 2);
        }
    }, 'Zoom on the last two clicked points')
    .add('u', (config) => config.corners = undefined, 'Unzoom')
    .setAction(async (config, keyManager, { shouldContinue }) => {
        let [width, height] = [window.innerWidth, window.innerHeight];
        if (config.highquality) {
            width=4060*2;
            height=2900*2;
        }
        
        console.log('start of render', JSON.stringify({ ...config, width, height }));
        let startAction = new Date();
        let minDim = Math.min(width, height);
        if (config.corners) {
            drawing.reinit({ height, width, corners: config.corners, background_color: 'black' });
        } else {
            drawing.reinit({ height, width, origin: [width / 2, height / 2], mapx: minDim / (config.size), mapy: -minDim / (config.size), background_color: 'black' });
        }

        const formula = config.formula || ((u, v) => u.mul(u).sub(v.mul(v)).add(u.mul([0.9999, 0])));

        let incr = 2 ** config.pixelscale;
        if (incr < 1) {
            incr = 1;
        }
        const itermax = 2 ** config.depth;;
        let colorCoef = 1;
        if (config.depth < 6) {
            colorCoef = 2 ** (6 - config.depth);
        } else if (config.depth > 6) {
            colorCoef = 1 / (2 ** (config.depth - 6));
        }
        colors = getRange(100).map(x => colorsys.hsl_to_hex(x, 90, 60));

        let v = config.juliaPoint || new Vector([0.4974874371859297, 0.5540201005025126]);
        const computForPoint = (x, y, incr) => {
            let cv = new CanvasVector(x, y);
            let cv2 = new CanvasVector(x + incr, y + incr);
            let u = drawing.getCoordFromContextCoord(cv);

            if (!config.julia) {
                v = u;
                // u = new Vector(0,0);
            }
            let diverge = false;
            let complexity = 0;
            for (let t = 0; t < itermax; t++) {
                u = formula(u, v);
                let [xx, yy] = u.xy;
                complexity++;
                if (xx * xx + yy * yy > 4) {
                    let color = colors[t % colors.length];
                    drawing.rectangle({ point0: cv, point1: cv2, fill: color });
                    diverge = true;
                    break;
                }
            }
            if (!diverge) {
                drawing.rectangle({ point0: cv, point1: cv2, fill: '#000000' });
            }
        };
        let first_iteration = true;
        while (incr>=1) {
            for (let x = 0; x < drawing.width; x += incr) {
                if (!await shouldContinue()) {
                    return;
                }
                for (let y = 0; y < drawing.height; y += incr) {
                    if (first_iteration || (((x / incr) % 2 !== 0) || ((y / incr) % 2 !== 0))) {
                        computForPoint(x, y, incr);
                }
                };
            };
            first_iteration = false;
            incr /= 2;
            if (!config.highquality) {
                drawing.addText({ text: JSON.stringify(config, undefined, 2), space: 5, point: new CanvasVector(0, 0), position: '3' })
            }
        }
        // for (let x = 0; x < drawing.width; x += incr * 2) {
        //     if (!await shouldContinue()) {
        //         return;
        //     }
        //     for (let y = 0; y < drawing.height; y += incr * 2) {
        //         computForPoint(x, y, incr * 2);
        //     };
        // };
        // for (let x = 0; x < drawing.width; x += incr) {
        //     if (!await shouldContinue()) {
        //         return;
        //     }
        //     for (let y = 0; y < drawing.height; y += incr) {
        //         if (((x / incr) % 2 !== 0) || ((y / incr) % 2 !== 0)) {
        //             computForPoint(x, y, incr);
        //         }
        //     };
        // };
        console.log('stop of render', JSON.stringify({ ...config, width, height }));
    })
    ;
