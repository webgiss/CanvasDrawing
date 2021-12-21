const getMathRgb = (r, g, b) => {
    if (b === undefined) {
        g = r[1];
        b = r[2];
        r = r[0];
    }
    r /= 255;
    g /= 255;
    b /= 255;
    return [r, g, b];
}

const getMathHxx = (h, x1, x2) => {
    if (x2 === undefined) {
        x1 = h[1];
        x2 = h[2];
        h = h[0];
    }
    h /= 360;
    x1 /= 100;
    x2 /= 100;
    return [h, x1, x2];
}

const getRoundedRgb = ([r, g, b]) => {
    return [r, g, b].map(x => Math.round(x * 255));
    // return [r,g,b].map(x=>Math.floor(Math.round((x*255)/17)*17));
}

const getRoundedHxx = ([h, x1, x2, x3]) => {
    if (x3 === undefined) {
        return [Math.floor(h * 360), Math.round(x1 * 100), Math.round(x2 * 100)];
    }
    return [Math.floor(h * 360), Math.round(x1 * 100), Math.round(x2 * 100), Math.round(x3 * 100)];
}

const getRoundedHue = (h) => {
    return Math.floor(h * 360);
}

const hslToHcwb = ([h, s, l]) => {
    let c = s - s * Math.abs(2 * l - 1);
    let w = l - c / 2;
    let b = 1 - c - w;
    return [h, c, w, b];
}

const hcwbToHsl = ([h, c, w, b]) => {
    let l = c / 2 + w;
    let z = 2 * l;
    if (z >= 1) {
        z = 2 - z;
    }
    let s = c / z;
    return [h, s, l];
}

const rgbToHsl = ([r, g, b]) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = null;
    let s = null;
    let l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        if (l > 0.5) {
            s = d / (2 - max - min);
        } else {
            s = d / (max + min);
        }

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

const hue2rgb = function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}

const hslToRgb = ([h, s, l]) => {
    let r = null;
    let g = null;
    let b = null;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r, g, b];
}

const rgbToHcwb = ([r, g, b], debug) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = null;
    let c = max - min;
    let w = min;

    if (c === 0) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / c + (g < b ? 6 : 0); break;
            case g: h = (b - r) / c + 2; break;
            case b: h = (r - g) / c + 4; break;
        }
        h /= 6;
    }

    if (debug) {
        console.log('rgbToHcwb', [r, g, b], [max, min], [h, c, w]);
    }

    let black = 1 - c - w;
    if (black < 0) {
        black = 0;
    }

    return [h, c, w, black];
}

const hcwbToRgb = ([h, c, w, b], debug) => {
    if (c === null) {
        c = 1 - b - w;
    } else if (w === null) {
        w = 1 - c - b;
    }

    let sixh = 6 * ((1 + (h % 1)) % 1);
    let fmid = c * (sixh % 1);

    if (debug) {
        console.log('hcwbToRgb', [h, c, w, b], sixh, fmid);
    }

    switch (Math.floor(sixh)) {
        case 0: return [w + c, w + fmid, w];
        case 1: return [w + c - fmid, w + c, w];
        case 2: return [w, w + c, w + fmid];
        case 3: return [w, w + c - fmid, w + c];
        case 4: return [w + fmid, w, w + c];
        case 5: return [w + c, w, w + c - fmid];
    }

    // should never happens
    console.log('should never happens', [h, c, w, b], debug, sixh, fmid)
    return [max, mid, min];
}

const hcwbForceH = ([h, c, w, b], newH) => {
    return [newH, c, w, b];
}
const hcwbForceC = ([h, c, w, b], newC) => {
    if (w + b === 0) {
        w = 0.5;
        b = 0.5;
    }
    const k = (1 - newC) / (b + w);
    return [h, newC, k * w, k * b];
}
const hcwbForceW = ([h, c, w, b], newW) => {
    if (c + b === 0) {
        c = 0.5;
        b = 0.5;
    }
    const k = (1 - newW) / (c + b);
    return [h, k * c, newW, k * b];
}
const hcwbForceB = ([h, c, w, b], newB) => {
    if (c + w === 0) {
        c = 0.5;
        w = 0.5;
    }
    const k = (1 - newB) / (c + w);
    return [h, k * c, k * w, newB];
}

const normalize01 = (x) => {
    x = x || 0;
    if (x < 0) return 0;
    if (x > 1) return 1;
    return x;
}

const normalizeHcwb = (hcwb) => {
    if (!hcwb) {
        return [0, 0, 0, 1];
    }

    hcwb = [0, 1, 2, 3].map(position => normalize01(hcwb[position]));

    let [h, c, w, b] = hcwb;

    if (c === 0) {
        h = 0;
    }

    let s = c + b + w;

    if (s === 0) {
        return [0, 0, 0, 1];
    }

    if (s === 1) {
        return [h, c, w, b];
    }

    return [h, c / s, w / s, b / s];
}

const normalizeHxx = (hxx) => {
    if (!hxx) {
        return [0, 0, 0];
    }

    return [0, 1, 2].map(position => normalize01(hxx[position]));
}

const normalizeRgb = (rgb) => {
    if (!rgb) {
        return [0, 0, 0];
    }

    return [0, 1, 2].map(position => normalize01(rgb[position]));
}

const toByteHex = (x) => (Math.floor(x) % 256 + 256).toString(16).slice(1);

const rgbToColor = (rgb) => {
    let [r, g, b] = getRoundedRgb(rgb);
    return `#${toByteHex(r)}${toByteHex(g)}${toByteHex(b)}`
};

const isCharHexa = (c) => (c => '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
const allReducer = (acc, elem) => acc && elem;

const colorToRgb = (color) => {
    color = color.replace(/(^[# ]+|[# ]+$)/mg, '');
    if ([...color].map(isCharHexa).reduce(allReducer, true)) {
        if (color.length === 6) {
            return [0, 1, 2].map(position => Number.parseInt(color.slice(position * 2, position * 2 + 2), 16) / 255);
        }
        if (color.length === 3) {
            return [0, 1, 2].map(position => Number.parseInt(color.slice(position, position + 1), 16) * 0x11 / 255);
        }
    }
    return null;
};

const sqrt3 = Math.sqrt(3);

const xyToTriangleWeight = (x, y, width) => {
    const xmax = (width - 1);
    const yy = xmax - y;
    const xx = xmax - x;
    const w2 = xmax / 2;
    const yymax = sqrt3 * w2;

    if (yy <= sqrt3 * x && yy <= sqrt3 * xx) {
        let c = yy / yymax;
        let w = x / xmax - c / 2;
        let b = 1 - c - w;

        return [c, w, b];
    }
    return null;
}

const TriangleWeightToXY = (c, w, b, width) => {
    const xmax = (width - 1);
    let y = xmax - (c * sqrt3 * (xmax / 2));
    let x = xmax * (w + c / 2);
    return [x, y];
}

const xyToRingHue = ([x, y, width, fmin, fmax, huebase], debug) => {
    const len = (width - 1);
    const w2 = len / 2;
    let yy = (w2 - y) / w2;
    let xx = (x - w2) / w2;
    let d = Math.sqrt(xx * xx + yy * yy);

    if (d >= fmin && d <= fmax) {
        let alpha = Math.acos(xx / d);
        let alphahue = alpha / (2 * Math.PI);
        if (yy < 0) {
            alphahue = 1 - alphahue;
        }
        let h = (alphahue + huebase - 0.25);
        h = (1 + h % 1) % 1;
        if (debug) {
            console.log('xyToRingHue', h)
        }
        // let rgb = hslToRgb([h, 1, 0.5]);
        let rgb = hcwbToRgb([h, 1, 0, 0], debug);
        // let c = rgbToColor(rgb);
        return [h, rgb];
    }
    return null;
}

const rgbToHsv = ([r, g, b]) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = null;
    let v = max;
    let s = 0;
    let d = max - min;

    if (d === 0) {
        h = 0;
        s = 0;
    } else {
        s = d / v;

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}

const hcwbToHsv = ([h, c, w, b]) => {
    let v = c + w;
    let s = c / v;

    return [h, s, v];
}

const hslToHsv = ([h, S, L]) => {
    let x = S * ((L <= 0.5) ? L : 1 - L);

    let v = (L + x);
    let s = (2 * x) / (L + x);

    return [h, s, v];
}

const hsvToRgb = ([h, s, v]) => {
    if (s !== 0) {
        let sixh = Math.floor(6 * h);
        let f = 6 * h - sixh;
        let p = v * (1 - s);
        let q = v * (1 - s * f);
        let t = v * (1 - s * (1 - f));

        switch (sixh) {
            case 0: return [v, t, p]; break;
            case 1: return [q, v, p]; break;
            case 2: return [p, v, t]; break;
            case 3: return [p, q, v]; break;
            case 4: return [t, p, v]; break;
            case 5: return [v, p, q]; break;
        }
    }
    return [v, v, v];
}

const hsvToHcwb = ([h, s, v]) => {
    console.log({h, s, v})
    if (s === 0) {
        return [h, 0, v, 1 - v];
    } else {
        let c = s * v;
        let w = c * (1 - s) / s;
        let b = 1 - c - w;
        if (b < 0) {
            b = 0;
        }
        return [h, c, w, b];
    }
}

const hsvToHsl = ([h, s, v]) => {
    let x = (2 - s) * v;
    let S = s * v / (x < 1 ? x : 2 - x);
    let L = x / 2;

    return [h, S, L];
}
