const { Drawing, Vector, CanvasVector, getRange, random } = CanvasDrawing;
const { POS_BOTTOMRIGHT, POS_TOPLEFT, POS_TOPRIGHT, POS_CENTER, ALIGN_RIGHT } = CanvasDrawing;

const KeyManager = window.KeyManager;

const color_top = '#457cff'; // from mathologer video
const color_right = '#ff532f'; // from mathologer video
const color_bottom = '#49bf31'; // from mathologer video
const color_left = '#ecb429'; // from mathologer video

let background_color = '#e0e0cc';
let pen_color = '#aa6644';

const get_color = (direction) => {
    if (direction[1] > 0) {
        return color_top;
    } else if (direction[1] < 0) {
        return color_bottom;
    } else if (direction[0] > 0) {
        return color_right;
    } else if (direction[0] < 0) {
        return color_left;
    } else {
        return background_color;
    }
};

const get_rectangle = (tile) => {
    const { base, direction } = tile;
    const orthodirection = [-direction[1], direction[0]];
    const point0 = [base[0] + orthodirection[0], base[1] + orthodirection[1]];
    const point1 = [base[0] - orthodirection[0] + direction[0], base[1] - orthodirection[1] + direction[1]];
    return [point0, point1];
};

const get_point_id = (point) => `${point[0]};${point[1]}`;

const direction_choices = [[[0, 1], [0, -1]], [[1, 0], [-1, 0]]]

const move_tiles = (tiles, d) => {
    // console.log({ tiles, d })
    // console.log({ d })
    points = []
    const tiles_table = {};
    getRange(d + 1).forEach((sx) => {
        getRange(d + 1).forEach((sy) => {
            const point = [sx - sy, sx + sy - d];
            points.push(point);
            tiles_table[get_point_id(point)] = [];
        });
    });
    // console.log({ points, tiles_table });
    tiles.forEach((tile) => {
        const { base, direction } = tile;
        const pointing_point = [base[0] + direction[0], base[1] + direction[1]];
        const id = get_point_id(pointing_point);
        if (tiles_table[id]) {
            tiles_table[id].push(tile);
        }
    });
    const result = []
    points.forEach((point) => {
        const id = get_point_id(point);
        if (tiles_table[id]) {
            if (tiles_table[id].length === 1) {
                const tile = tiles_table[id][0];
                const { base, direction } = tile;
                const new_tile = { base: [base[0] + direction[0], base[1] + direction[1]], direction };
                result.push(new_tile);
            } else {
                if (tiles_table[id].length === 0) {
                    // No tiles for that or, or multiple one, either way, we randomly generate new ones.
                    const random_choice = random(2);
                    directions = direction_choices[random_choice];
                    directions.forEach((direction) => {
                        const new_tile = { base: point, direction };
                        result.push(new_tile);
                    })
                }
            }
        }
    });
    return result;
};


const mainAction = (config) => {
    let { d, tiles, border, infos } = config;
    let [width, height] = [window.innerWidth, window.innerHeight];
    let minDim = Math.min(width, height);
    drawing.reinit({
        height,
        width,
        origin: [width / 2, height / 2],
        mapx: (minDim / (2 * d + 2)),
        mapy: -(minDim / (2 * d + 2)),
        bgcolor: background_color,
    });
    if (infos) {
        drawing.addText({
            text: `<Space> or <Arrow Up> to add a new dimension\n<Arrow right> to add 10 dimensions\n<x> to swap tiles borders\n<+> to add 100 dimensions\n<r> to restart`,
            point: new CanvasVector(0, height),
            position: POS_TOPRIGHT,
            color: pen_color,
        });
        drawing.addText({
            text: `d: ${d}\ntiles count: ${tiles.length}\nborder: ${border}`,
            point: new CanvasVector(width, height),
            position: POS_TOPLEFT,
            textAlign: ALIGN_RIGHT,
            color: pen_color,
        });
    }

    tiles.forEach((tile) => {
        const [point0, point1] = get_rectangle(tile);
        const color = get_color(tile.direction);
        drawing.filledRectangle({ point0: new Vector(point0), point1: new Vector(point1), color });
        if (border) {
            drawing.rectangle({ point0: new Vector(point0), point1: new Vector(point1), color: pen_color });
        }
    });
};

const keyManager = new KeyManager({
    d: 1,
    tiles: move_tiles([], 0),
    border: true,
    infos: true,
});

const drawing = new Drawing({ canvasId: "item" });

keyManager
    .add("ArrowUp", config => {
        config.tiles = move_tiles(config.tiles, config.d);
        config.d = config.d + 1;
    })
    .add("ArrowRight", config => {
        getRange(10).forEach(() => {
            config.tiles = move_tiles(config.tiles, config.d);
            config.d = config.d + 1;
        })
    })
    .add("+", config => {
        getRange(100).forEach(() => {
            config.tiles = move_tiles(config.tiles, config.d);
            config.d = config.d + 1;
        })
    })
    .add("Space", config => {
        config.tiles = move_tiles(config.tiles, config.d);
        config.d = config.d + 1;
    })
    .add("x", config => config.border = !config.border)
    .add("r", config => { config.tiles = move_tiles([], 0); config.d = 1; })
    .add("h", config => config.infos = !config.infos)
    .setAction(mainAction)
    .onResize(true)
    ;

