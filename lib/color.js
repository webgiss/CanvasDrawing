const toHex = (d) => ("0" + (Number(d).toString(16))).slice(-2).toLowerCase();

const rgb2color = (r, g, b) => '#' + [r, g, b].map(x => Math.floor(x * 255)).map(toHex).join('');

/**
 * Convert a hue between 0 and 1 to a color string #xxxxxx
 * @param {Number} hue A value between 0 and 1
 * @returns {string}
 */
const hue2color = (hue) => {
    if (hue * 6 < 1) {
        return rgb2color(1, hue * 6, 0);
    } else if (hue * 6 < 2) {
        return rgb2color(2 - hue * 6, 1, 0);
    } else if (hue * 6 < 3) {
        return rgb2color(0, 1, hue * 6 - 2);
    } else if (hue * 6 < 4) {
        return rgb2color(0, 4 - hue * 6, 1);
    } else if (hue * 6 < 5) {
        return rgb2color(hue * 6 - 4, 0, 1);
    } else {
        return rgb2color(1, 0, 6 - hue * 6);
    }
}

