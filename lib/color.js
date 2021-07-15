const toHex = (d) => ("0" + (Number(d).toString(16))).slice(-2).toLowerCase();

const rgb2color = (r, g, b) => '#' + [r, g, b].map(x => Math.floor(x * 255)).map(toHex).join('');

/**
 * Convert a hue between 0 and 1 to a color string #xxxxxx
 * @param {Number} hue The hue (A value between 0 and 1)
 * @param {Number} min The min (A value between 0 and 1)
 * @param {Number} max The max (A value between 0 and 1)
 * @returns {string}
 */
const hue2color_minmax = (hue, min, max) => {
    const delta = max-min;
    const sixhue = 6*hue;
    if (sixhue < 1) {
        return rgb2color(max, min + delta * sixhue, min);
    } else if (sixhue < 2) {
        return rgb2color(min + delta * (2 - sixhue), max, min);
    } else if (sixhue < 3) {
        return rgb2color(min, max, min + delta * (sixhue - 2));
    } else if (sixhue < 4) {
        return rgb2color(min, min + delta * (4 - sixhue), max);
    } else if (sixhue < 5) {
        return rgb2color(min + delta * (sixhue - 4), min, max);
    } else {
        return rgb2color(max, min, min + delta * (6 - sixhue));
    }
}

/**
 * Convert a hue between 0 and 1 to a color string #xxxxxx
 * @param {Number} hue A value between 0 and 1
 * @returns {string}
 */
const hue2color = (hue) => hue2color_minmax(hue, 0, 1);

