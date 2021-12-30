const { Drawing, Vector, CanvasVector, animate, getRange, drawTimeTable } = CanvasDrawing;
const KeyManager = window.KeyManager;

let background_color = '#e0e0cc';
let non_2_3_multiple_color = '#ccbb00';
let main_color = '#aa6644';
let text_color = '#331108';
let point = '#ccbb00';
let finalPoint = '#aa2222'
let miniPolygon = '#4466ff'
let otherPolygon = '#ff4466'

let drawing = new Drawing({ canvasId: 'item' });
const body = window.document.getElementsByTagName('body')[0]

body.classList.__proto__.swap = function (className) {
    if (this.contains(className)) {
        this.remove(className);
    } else {
        this.add(className);
    }
}

const config = {
    a: 3,
    b: 7,
    display_info: true,
    display_all_circles: true,
    display_mini_polygon: true,
    display_other_polygon: true,
    display_radius: false,
    display_inner_circle: false,
    display_outter_circle: true,
    display_hypotrocoids: true,
    dot_len: 0.005,
    alpha: 0,
    lambda: 0.84,
    time: 10,
}

const mainAction = (config, keyManager) => {
    const {
        a, b,
        display_info,
        dot_len, alpha, lambda,
        display_all_circles,
        display_radius,
        display_hypotrocoids,
        display_mini_polygon,
        display_other_polygon,
        display_inner_circle,
        display_outter_circle
    } = config;

    const ratio = a / b;

    let [width, height] = [window.innerWidth, window.innerHeight];
    let minDim = Math.min(width, height);

    const r0 = 1 - ratio;

    drawing.reinit({
        height,
        width,
        origin: [width / 2, height / 2],
        mapx: (minDim) / 2.01,
        mapy: -(minDim) / 2.01,
        bgcolor: background_color,
    });

    const Center = new Vector(0, 0)

    let MinimoonCenters = getRange(b - a).map((i) => new Vector(r0, alpha + 2 * Math.PI * i / (b - a), true))
    let Points = getRange(a).map(
        (k) => MinimoonCenters.map(
            (MinimoonCenter, i) =>
                MinimoonCenter.add(new Vector(ratio * lambda, (alpha + (2 * Math.PI * i / (b - a))) * (1 - 1 / ratio) + (2 * Math.PI * (k + i) / a), true))
        )
    )

    let lastM = null

    if (display_hypotrocoids) {
        getRange(alpha, alpha + a * 2 * Math.PI + 0.2, 0.1).forEach((alpha) => {
            const MinimoonCenter = new Vector(r0, alpha, true)
            const M = MinimoonCenter.add(new Vector(ratio * lambda, alpha * (1 - 1 / ratio), true))
            if (lastM !== null) {
                drawing.line({ point0: lastM, point1: M, color: point });
            }
            lastM = M
        })
    }

    if (display_outter_circle) {
        drawing.circle({ center: Center, length: 1, color: main_color });
        drawing.circle({ center: Center, length: dot_len, color: main_color, fill: main_color });
    }

    MinimoonCenters.forEach((MinimoonCenter, i) => {
        if (display_all_circles || ((!display_all_circles) && i === 0)) {
            if (display_inner_circle) {
                drawing.circle({ center: MinimoonCenter, length: ratio, color: main_color });
            }
            if (display_radius) {
                drawing.line({ point0: MinimoonCenter, point1: Points[0][i], color: point });
            }
            if (display_inner_circle) {
                drawing.circle({ center: MinimoonCenter, length: dot_len, color: main_color, fill: main_color });
            }
            let lastPoint = Points[Points.length - 1][i];
            Points.forEach((PointsByMinimoon) => {
                drawing.circle({ center: PointsByMinimoon[i], length: dot_len, color: finalPoint, fill: finalPoint })
                if (display_mini_polygon) {
                    drawing.line({ point0: lastPoint, point1: PointsByMinimoon[i], color: miniPolygon });
                }
                lastPoint = PointsByMinimoon[i]
            })
        }
        if (display_other_polygon) {
            getRange(a).forEach((k) => {
                if (display_all_circles || ((!display_all_circles) && k === 0)) {
                    let lastPoint = Points[k][MinimoonCenters.length - 1];
                    MinimoonCenters.forEach((MinimoonCenter, i) => {
                        drawing.line({ point0: lastPoint, point1: Points[k][i], color: otherPolygon });
                        lastPoint = Points[k][i]
                    })
                }
            })
        }
    })


    if (display_info) {
        info = Object.keys(config).map((key) => `${key}: ${config[key]}`).join('\n')
        drawing.addText({ text: info, fontFamily: 'sans-serif', fontSize: '14px', color: text_color, point: new CanvasVector([0, 0]), position: '3' });
        if (keyManager) {
            const doc = keyManager.doc;
            if (doc) {
                drawing.addText({ text: doc, fontFamily: 'sans-serif', fontSize: '14px', color: text_color, point: new CanvasVector([width, height]), position: '7' });
            }
        }
    }

};

let loopIteration = 0;

const doLoop = (n, time) => {
    const thisIteration = (++loopIteration);
    let p = Promise.resolve();
    const animationParams = {
        action: ({ value }) => {
            if (thisIteration === loopIteration) {
                keyManager._doAction({ alpha: value });
            }
        },
        frameTime: 0.01,
    };

    p = p.then(() => animate({ ...animationParams, from: 0, to: n * 2 * Math.PI, duration: time }));
}

const keyManager = new KeyManager(config);

keyManager
    .add("+", (config) => config.lambda *= 1.02, 'Increment lambda')
    .add("-", (config) => config.lambda /= 1.02, 'Decrement lambda')
    .add("ArrowLeft", (config) => config.a -= 1, 'Decrement the a value')
    .add("ArrowRight", (config) => config.a += 1, 'Increment the a value')
    .add("ArrowDown", (config) => config.b -= 1, 'Decrement the b value')
    .add("ArrowUp", (config) => config.b += 1, 'Increment the b value')
    .add("*", (config) => config.display_radius = !config.display_radius, 'Toggle display_radius')
    .add("c", (config) => config.display_inner_circle = !config.display_inner_circle, 'Toggle display_inner_circle')
    .add("C", (config) => config.display_outter_circle = !config.display_outter_circle, 'Toggle display_outter_circle')
    .add("p", (config) => config.display_mini_polygon = !config.display_mini_polygon, 'Toggle display_inner_circle')
    .add("P", (config) => config.display_other_polygon = !config.display_other_polygon, 'Toggle display_other_circle')
    .add("a", (config) => config.display_all_circles = !config.display_all_circles, 'Toggle display_all_circles')
    .add("h", (config) => config.display_hypotrocoids = !config.display_hypotrocoids, 'Toggle display_hypotrocoids')
    .add("t", (config) => {loopIteration++; config.time = config.time+1}, 'Increment total animation time (s)')
    .add("T", (config) => {loopIteration++; config.time = config.time-1}, 'Decrement total animation time (s)')

    .add('Space', (config) => doLoop(config.a, config.time), 'Start animation')
    .add('Escape', (config) => loopIteration++, 'Stop animation')
    // .add('x', (config) => body.classList.swap('maxwidth'), 'Toggle css maxwidth')
    // .add('y', (config) => body.classList.swap('maxheight'), 'Toggle css maxheight')
    .setAction(mainAction)
    .onResize(true)
    ;
