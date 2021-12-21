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


const drawing = new Drawing({ canvasId: "item" });

const backgroundColor = '#e0e0cc';
// let penColor = '#aa6644';
let penColor = '#000';
let highlightColor = '#600';

const sigmoid = (z) => 2 / (1 + Math.exp(-z)) - 1;
const cmultscal = (z, s) => [z[0] * s, z[1] * s]
const cadd = (z1, z2) => [z1[0] + z2[0], z1[1] + z2[1]]
const csub = (z1, z2) => [z1[0] - z2[0], z1[1] - z2[1]]
const cmult = (z1, z2) => [z1[0] * z2[0] - z1[1] * z2[1], z1[0] * z2[1] + z1[1] * z2[0]]
const cdiv = (z1, z2) => {
    if (z2[0] === 0 || z2[1] === 0) {
        return null;
    }
    const denom = z2[0] * z2[0] + z2[1] * z2[1];
    return [(z1[0] * z2[0] + z1[1] * z2[1]) / denom, (z1[1] * z2[0] - z1[0] * z2[1]) / denom]
}
const cexp = (z, n) => {
    if (n === 0) {
        return [1, 0]
    }
    if (n === 1) {
        return z
    }
    return cmult(z, cexp(z, n - 1))
}
const padd = (p1, p2) => p1.map((z, i) => cadd(z, p2[i]))
const psub = (p1, p2) => p1.map((z, i) => csub(z, p2[i]))
const pmultroot = (p1, z) => {
    const p1x = [[0, 0], ...p1]
    const mz = [-z[0], -z[1]]
    const p1mz = [...p1.map((z) => cmult(z, mz)), [0, 0]]
    return padd(p1x, p1mz)
}
const pmonomroot = (roots) => {
    return roots.reduce((prev, curr) => pmultroot(prev, curr), [[1, 0]])
}
const pderiv = (p) => {
    return p.map((z, i) => cmultscal(z, i)).slice(1)
}
const peval = (p, z) => {
    return p.map((z1, i) => cmult(z1, cexp(z, i))).reduce((prev, curr) => cadd(prev, curr))
}
const pformat = (p) => {
    let result = "";
    p.forEach((z, i) => {
        let monom = ''
        if (z[0] !== 0 || z[1] !== 0) {
            if (z[1] === 0) {
                monom = `(${z[0]})`
            } else if (z[1] > 0) {
                monom = `(${z[0]}+${z[1]}i)`
            } else {
                monom = `(${z[0]}${z[1]}i)`
            }
            if (i !== 0) {
                if (i !== 1) {
                    monom = `${monom} x^${i}`
                } else {
                    monom = `${monom} x`
                }
            }
            if (result === '') {
                result = monom
            } else {
                result = `${monom}+${result}`
            }
        }
    })
    return result;
}
const pformats = (polynoms) => polynoms.map((polynom) => pformat(polynom)).join('\n')

const distsquare = (z1, z2) => {
    const [x, y] = csub(z1, z2)
    return x * x + y * y
}
const indexMin = (z, roots) => {
    const distsquares = roots.map((root) => distsquare(z, root))
    return distsquares.map((d, i) => [d, i]).reduce(([d1, i1], [d2, i2]) => d1 < d2 ? [d1, i1] : [d2, i2])
}

const initdata = {
    penColor,
    backgroundColor,
    rindex: 0,
    // roots: [[-1, 1], [2, 1], [-1, -1], [1, -1], [0, 0], [2,2], [2,-2]],
    // roots: [[-1, 1], [2, 1], [-1, -1], [1, -1], [0, 0]],
    roots: [[-1, 1], [2, 1], [-1, -1]],
    size: 10,
    res: 10,
    iter: 1,
    colorCoef: 1,
    showAxis: false,
    showRoots: true,
    showPoly: false,
    colorShift: 0.09,
    showInfo: true,
    modeHighRes: true,
};

const mainAction = async (config, keyManager, { shouldContinue }) => {
    let {
        penColor,
        backgroundColor,
        rindex,
        roots,
        size,
        res,
        iter,
        showAxis,
        showRoots,
        showPoly,
        colorCoef,
        colorShift,
        showInfo,
        modeHighRes,
    } = config;

    const nroots = roots.length;
    rindex = rindex % nroots;

    let highResK = modeHighRes ? 2 : 1;
    let height = highResK * window.innerHeight;
    let width = highResK * window.innerWidth;
    let minDim = Math.min(width, height);
    const origin = [width / 2, height / 2];
    const mapx = minDim / (2 * size);
    const mapy = -minDim / (2 * size);
    const bgcolor = backgroundColor;
    drawing.reinit({ height, width, origin, mapx, mapy, bgcolor });

    polynom = pmonomroot(roots)
    polynomd = pderiv(polynom)
    polynomx = psub([[0, 0], ...polynomd], polynom)
    // console.log(polynom)
    // console.log(polynomd)
    // console.log(peval(polynom, [1, 1]))

    let y = 0;
    let x = 0;
    const colors = getRange(nroots).map((i) => {
        const h = (i / nroots) + colorShift
        return [
            rgbToColor(hcwbToRgb([h, 1, 0, 0]))
            ,
            getRange(10).map((k) => rgbToColor(hcwbToRgb([h, 1 - (0.2 + k / 20), 0.2 + k / 20, 0])))
            ,
            getRange(10).map((k) => rgbToColor(hcwbToRgb([h, 1 - (0.2 + k / 20), 0, 0.2 + k / 20])))
        ]
    })

    // [
    //   ["#ff0000",["#ff8080","#ff8c8c","#ff9999","#ffa6a6","#ffb3b3","#ffbfbf","#ffcccc","#ffd9d9","#ffe6e6","#fff2f2"],["#800000","#730000","#660000","#590000","#4d0000","#400000","#330000","#260000","#190000","#0d0000"]],
    //   ["#ccff00",["#e6ff80","#e8ff8c","#ebff99","#edffa6","#f0ffb3","#f2ffbf","#f5ffcc","#f7ffd9","#faffe6","#fcfff2"],["#668000","#5c7300","#526600","#475900","#3d4d00","#334000","#293300","#1f2600","#141900","#0a0d00"]],
    //   ["#00ff66",["#80ffb2","#8cffba","#99ffc2","#a6ffc9","#b3ffd1","#bfffd9","#ccffe0","#d9ffe8","#e6fff0","#f2fff7"],["#008033","#00732e","#006629","#005924","#004d1f","#004019","#003314","#00260f","#00190a","#000d05"]],
    //   ["#0066ff",["#80b2ff","#8cbaff","#99c2ff","#a6c9ff","#b3d1ff","#bfd9ff","#cce0ff","#d9e8ff","#e6f0ff","#f2f7ff"],["#003380","#002e73","#002966","#002459","#001f4d","#001940","#001433","#000f26","#000a19","#00050d"]],
    //   ["#cc00ff",["#e680ff","#e88cff","#eb99ff","#eda6ff","#f0b3ff","#f2bfff","#f5ccff","#f7d9ff","#fae6ff","#fcf2ff"],["#660080","#5c0073","#520066","#470059","#3d004d","#330040","#290033","#1f0026","#140019","#0a000d"]]
    // ]

    const actualRes = res * highResK;
    while (actualRes * y <= height) {
        x = 0;
        if (!await shouldContinue()) {
            return;
        }
        while (actualRes * x <= width) {
            let z = drawing.getCoordFromContextCoord(new CanvasVector(actualRes * x + actualRes / 2, actualRes * y + actualRes / 2)).xy;
            let n = iter
            let lastz = z
            while (n > 0 && z !== null) {
                z = cdiv(peval(polynomx, z), peval(polynomd, z))
                n -= 1
            }
            let color;
            if (z !== null) {
                const [d, i] = indexMin(z, roots)
                color = colors[i][1][Math.floor(sigmoid(d * colorCoef) * 9)];
            } else {
                const [d, i] = indexMin(lastz, roots)
                color = colors[i][2][Math.floor(sigmoid(d * colorCoef) * 9)];
            }

            drawing.rectangle({
                point0: new CanvasVector(actualRes * x, actualRes * y),
                point1: new CanvasVector(actualRes * x + actualRes, actualRes * y + actualRes),
                color,
                fill: color
            })
            x += 1;
        }
        y += 1;
    }

    if (showPoly) {
        drawing.addText({
            text: pformats([polynom, polynomd, polynomx]),
            point: new CanvasVector(width, 0),
            position: POS_BOTTOMLEFT
        })
    }

    if (showRoots) {
        roots.forEach((root, index) => {
            const fill = index === rindex ? colors[index][0] : colors[index][1][0];
            const length = index === rindex ? 0.2 : 0.1;
            drawing.circle({ center: new Vector(root[0], root[1]), length, fill, color: penColor })
        })
    }
    if (showAxis) {
        drawing.line({ point0: new Vector(-minDim, 0), point1: new Vector(minDim, 0), color: penColor })
        drawing.line({ point0: new Vector(0, -minDim), point1: new Vector(0, minDim), color: penColor })
    }

    if (showInfo) {
        info = Object.keys(config).map((key) => `${key}: ${JSON.stringify(config[key])}`).join('\n')
        drawing.addText({ text: info, fontFamily: 'sans-serif', fontSize: '14px', color: penColor, point: new CanvasVector([0, 0]), position: '3' });
        if (keyManager) {
            const doc = keyManager.doc;
            if (doc) {
                drawing.addText({ text: doc, fontFamily: 'sans-serif', fontSize: '14px', color: penColor, point: new CanvasVector([width, height]), position: '7' });
            }
        }
    }
};

const KeyManager = window.KeyManager;
const keyManager = new KeyManager(initdata);

keyManager
    .add('ArrowUp', (config) => { config.roots[config.rindex][1] += 0.1 }, 'Move current root up')
    .add('ArrowDown', (config) => { config.roots[config.rindex][1] -= 0.1 }, 'Move current root down')
    .add('ArrowLeft', (config) => { config.roots[config.rindex][0] -= 0.1 }, 'Move current root left')
    .add('ArrowRight', (config) => { config.roots[config.rindex][0] += 0.1 }, 'Move current root right')
    .add('r', (config) => { config.rindex += 1; config.rindex %= config.roots.length }, 'Change current root')
    .add('x', (config) => { config.res = (config.res <= 4) ? 10 : 1 }, 'Toggle display high res (very slow)')
    .add('w', (config) => { config.res = (config.res <= 4) ? 10 : 4 }, 'Toggle display mid res (slow)')
    .add("+", (config) => { config.iter += 1 }, 'Increment size')
    .add("-", (config) => { config.iter = config.iter > 0 ? config.iter - 1 : 0 }, 'Decrement size')
    .add("KeyP", (config) => { config.showPoly = !config.showPoly }, 'Toggle show polynoms')
    .add("a", (config) => { config.showAxis = !config.showAxis }, 'Toggle show Axis')
    .add("z", (config) => { config.showRoots = !config.showRoots }, 'Toggle show Roots')
    .add("i", (config) => { config.showInfo = !config.showInfo }, 'Toggle show info')
    .add("h", (config) => { config.modeHighRes = !config.modeHighRes }, 'Toggle mode High Res')
    .add("PageUp", (config) => { config.colorCoef = config.colorCoef * 2 }, 'Adujt color coef * 2')
    .add("PageDown", (config) => { config.colorCoef = config.colorCoef / 2 }, 'Adujt color coef / 2')
    .add("3", (config) => { config.roots = [[1, 0.000001], [-0.5, Math.sqrt(3) / 2], [-0.5, -Math.sqrt(3) / 2]] }, 'Set standard 3 roots')
    .add("5", (config) => { config.roots = [[1, 0.000001], [-0.5, Math.sqrt(3) / 2], [-0.5, -Math.sqrt(3) / 2], [0.5, Math.sqrt(3) / 2], [0.5, -Math.sqrt(3) / 2]] }, 'Set standard 5 roots')
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

