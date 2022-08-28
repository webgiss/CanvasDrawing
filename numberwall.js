const { Drawing, Vector, CanvasVector, POS_CENTER } = CanvasDrawing;

const drawing = new Drawing({ canvasId: "item" });

const range = (n) => [...(new Array(Number(n))).keys()]

const getOnRow = (row, x, tableWidth, doesRepeat) => {
    if (doesRepeat) {
        return row[(x + tableWidth) % tableWidth]
    } else {
        if (x < 0) {
            return undefined
        }
        if (x >= tableWidth) {
            return undefined
        }
        return row[x]
    }
}

const compute_ratio = (num, den, use_mod_values, mod_value, division_mod_table) => {
    if (use_mod_values) {
        const value = division_mod_table[math_mod(den, mod_value)][math_mod(num, mod_value)]
        return value === null ? undefined : value
    } else {
        return num / den
    }
}

const computeBigCross = (newRow, lastRow, previousRow, yetPreviousRow, yetYetPreviousRow, x, tableWidth, doesRepeat, normalize) => {
    if (!yetYetPreviousRow) {
        return false
    }
    const inBottomNumber = lastRow[x]
    const inTopNumber = yetPreviousRow[x]
    const outTopNumber = yetYetPreviousRow[x]
    const inLeftNumber = getOnRow(previousRow, x - 1, tableWidth, doesRepeat)
    const outLeftNumber = getOnRow(previousRow, x - 2, tableWidth, doesRepeat)
    const inRightNumber = getOnRow(previousRow, x + 1, tableWidth, doesRepeat)
    const outRightNumber = getOnRow(previousRow, x + 2, tableWidth, doesRepeat)

    if (
        (inBottomNumber === undefined) ||
        (inTopNumber === undefined) ||
        (outTopNumber === undefined) ||
        (inLeftNumber === undefined) ||
        (outLeftNumber === undefined) ||
        (inRightNumber === undefined) ||
        (outRightNumber === undefined) ||
        (inTopNumber === 0n)
    ) {
        return false
    } else {
        const ratioNum = (outLeftNumber * inRightNumber * inRightNumber + outRightNumber * inLeftNumber * inLeftNumber - outTopNumber * inBottomNumber * inBottomNumber)
        const ratioDen = (inTopNumber * inTopNumber)
        newRow.push(normalize(ratioNum, ratioDen))
        return true
    }
}

const computeSmallCross = (newRow, lastRow, previousRow, x, tableWidth, doesRepeat, normalize) => {
    const leftNumber = getOnRow(lastRow, x - 1, tableWidth, doesRepeat)
    const rightNumber = getOnRow(lastRow, x + 1, tableWidth, doesRepeat)
    const topNumber = previousRow[x]
    const centerNumber = lastRow[x]
    if (
        (leftNumber === undefined) ||
        (rightNumber === undefined) ||
        (topNumber === undefined) ||
        (centerNumber === undefined) ||
        (topNumber === 0n)
    ) {
        return false
    } else {
        const ratioNum = (centerNumber * centerNumber - leftNumber * rightNumber)
        const ratioDen = topNumber
        newRow.push(normalize(ratioNum, ratioDen))
        return true
    }
}

const computeRow = (wall, tableWidth, doesRepeat, normalize) => {
    const lastRow = wall[wall.length - 1]
    const previousRow = wall[wall.length - 2]
    const yetPreviousRow = wall[wall.length - 3]
    const yetYetPreviousRow = wall[wall.length - 4]
    const newRow = []
    for (let x = 0; x < tableWidth; x++) {
        if (!computeSmallCross(newRow, lastRow, previousRow, x, tableWidth, doesRepeat, normalize)) {
            if (!computeBigCross(newRow, lastRow, previousRow, yetPreviousRow, yetYetPreviousRow, x, tableWidth, doesRepeat, normalize)) {
                newRow.push(undefined)
            }
        }
    }
    wall.push(newRow)
    return wall
}

const computeWall = async (sequence, width, height, doesRepeat, normalize, { shouldContinue }) => {
    const sequenceLength = sequence.length
    // const pyramidalHeight = Math.floor((sequenceLength - 1) / 2) + 3
    // const tableHeight = doesRepeat ? height + 1 : Math.min(height + 1, pyramidalHeight)
    const tableWidth = sequenceLength
    const baseRow = range(tableWidth)
    const wall = [baseRow.map(x => normalize(0)), baseRow.map(x => normalize(1)), baseRow.map(x => normalize(sequence[x]))]
    let line = 0
    while (wall.length < height) {
        line += 1
        if (line % 10 === 0) {
            if (!await shouldContinue()) {
                return
            }
        }
        computeRow(wall, tableWidth, doesRepeat, normalize)
    }
    // console.log({ wall })
    return wall
}

const getFromWall = (wall, x, y) => {
    if (y >= 0 && y < wall.length) {
        if (x >= 0 && x < wall[y].length) {
            const value = wall[y][x]
            if (value !== undefined) {
                return value
            }
        }
    }
    return null
}

const makeGradient = (gradient_maker, mod_value, gradient_is_bicolor) => {
    return range(mod_value).map((n) => '#' + ([0, 1, 2].map((i) => {
        const min = gradient_maker[0][i]
        const max = gradient_maker[1][i]
        const value = gradient_is_bicolor ? (n === 0 ? min : max) : Math.floor(min + ((max - min) * n) / (mod_value - 1))
        const result = '00' + value.toString(16)
        return result.slice(result.length - 2)
    }).join('')))
}

const math_mod = (x, n) => {
    return ((x % n) + n) % n
}

const mainAction = async (config, keyManager, { shouldContinue }) => {
    const {
        penColor,
        backgroundColor,
        gradient_maker,
        gradient_is_bicolor,
        n,
        sequence,
        has_text,
        should_repeat,
        font_size,
        use_mod,
        mod_value,
        use_mod_values,
    } = config
    const mod_value_unit = BigInt(mod_value)
    const [width, height] = [window.innerWidth, window.innerHeight];
    const minDim = Math.min(width, height);
    const baseSquare = minDim / n
    const widthSquareCount = Math.floor(width / baseSquare) + 1
    const heightSquareCount = Math.floor(height / baseSquare) + 1
    const origin = [0, 0];
    const mapx = minDim / n;
    const mapy = minDim / n;
    const fontSize = `${font_size}px`
    const gradient = makeGradient(gradient_maker, mod_value, gradient_is_bicolor)
    let division_mod_table = null
    if (use_mod_values) {
        // console.log({gradient})
        const multiplication_mod_table = range(mod_value_unit).map((y) => range(mod_value_unit).map((x) => math_mod(BigInt(x * y), mod_value_unit)))
        division_mod_table = range(mod_value_unit).map((y) => range(mod_value_unit).map((x) => {
            const indexes = multiplication_mod_table[y].map((value, index) => [value, index]).filter(([value, index]) => value === BigInt(x)).map(([value, index]) => index)
            if (indexes.length === 1) {
                return BigInt(indexes[0])
            } else {
                return null
            }
        }))
        console.log({multiplication_mod_table, division_mod_table})
    }
    let normalize = (a, b) => {
        if (b === undefined) {
            return BigInt(a)
        }
        if (math_mod(a, b) !== 0n) {
            return undefined
        }
        return a / b
    }
    if (use_mod_values) {
        normalize = (a, b) => {
            if (b === undefined) {
                return math_mod(BigInt(a), mod_value_unit)
            }
            const value = division_mod_table[Number(math_mod(b, mod_value_unit))][Number(math_mod(a, mod_value_unit))]
            return value === null ? undefined : value
        }
    }
    drawing.reinit({ height, width, origin, mapx, mapy, bgcolor: backgroundColor });

    const wall = await computeWall(sequence, widthSquareCount, heightSquareCount, should_repeat, normalize, { shouldContinue })
    for (let x = 0; x < widthSquareCount; x++) {
        if (((x % 10) == 0) && !await shouldContinue()) {
            return;
        }
        const xWall = should_repeat ? (x % (wall[0].length)) : x
        for (let y = 0; y < heightSquareCount; y++) {
            const value = getFromWall(wall, xWall, y)
            let value_mod = undefined
            if (value !== null)
            {
                if (use_mod) {
                    value_mod = math_mod(value, mod_value_unit)
                    const color = gradient[value_mod]
                    drawing.filledRectangle({ point0: new Vector(x, y), point1: new Vector(x + 1, y + 1), color: color })
                }
                if (has_text) {
    
                    let color = penColor
                    if (use_mod) {
                        if (gradient_is_bicolor) {
                            color = value_mod === 0n ? penColor : backgroundColor
                        } else {
                            color = (2n * value_mod >= mod_value_unit) ? backgroundColor : penColor
                        }
                    }
                    drawing.addText({
                        text: `${value === null ? "" : `${value}`}`,
                        color,
                        fontFamily: 'Calibri, Verdana, sans-serif',
                        fontSize,
                        space: '0',
                        position: POS_CENTER,
                        point: new Vector(x + 0.5, y + 0.5),
                    })
                } else {
                    if (!use_mod) {
                        if ((x + y) % 2 == 0) {
                            drawing.filledRectangle({ point0: new Vector(x, y), point1: new Vector(x + 1, y + 1), color: penColor })
                        }
                    }
                }
            }
        }
    }
}

const KeyManager = window.KeyManager;
const keyManager = new KeyManager({
    penColor: '#331108',
    backgroundColor: '#e0e0cc',
    gradient_maker: [[0xe0, 0xe0, 0xcc], [0x33, 0x11, 0x08]],
    gradient_is_bicolor: false,
    n: 100,
    // sequence: [1, 5, 2, 3, 4, 8, 1, 2, 3, 5, 6],
    // sequence: [1, 8, 5, 2, 3, 4, 2],
    // sequence: [1, 2, 3, 5, 7, 10, 12, 17, 18, 23, 25, 30, 32, 33, 38, 40, 45, 47, 52, 58, 70, 72, 77, 87, 95, 100, 103, 107, 110, 135, 137, 138, 143, 147, 170, 172, 175, 177, 182, 192, 205, 213, 215, 217, 220, 238, 242, 247, 248, 268, 270, 278, 283, 287, 298, 312, 313, 322, 325],
    sequence: [	2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271],
    sequence: [2,3,5,7,11,13,17,19,23,29,
        31,37,41,43,47,53,59,61,67,71,
        73,79,83,89,97,101,103,107,109,113,
        127,131,137,139,149,151,157,163,167,173,
        179,181,191,193,197,199,211,223,227,229,
        233,239,241,251,257,263,269,271,277,281,
        283,293,307,311,313,317,331,337,347,349,
        353,359,367,373,379,383,389,397,401,409,
        419,421,431,433,439,443,449,457,461,463,
        467,479,487,491,499,503,509,521,523,541,
        547,557,563,569,571,577,587,593,599,601,
        607,613,617,619,631,641,643,647,653,659,
        661,673,677,683,691,701,709,719,727,733,
        739,743,751,757,761,769,773,787,797,809,
        811,821,823,827,829,839,853,857,859,863,
        877,881,883,887,907,911,919,929,937,941,
        947,953,967,971,977,983,991,997,1009,1013,
        1019,1021,1031,1033,1039,1049,1051,1061,1063,1069,
        1087,1091,1093,1097,1103,1109,1117,1123,1129,1151,
        1153,1163,1171,1181,1187,1193,1201,1213,1217,1223,
        1229,1231,1237,1249,1259,1277,1279,1283,1289,1291,
        1297,1301,1303,1307,1319,1321,1327,1361,1367,1373,
        1381,1399,1409,1423,1427,1429,1433,1439,1447,1451,
        1453,1459,1471,1481,1483,1487,1489,1493,1499,1511,
        1523,1531,1543,1549,1553,1559,1567,1571,1579,1583,
        1597,1601,1607,1609,1613,1619,1621,1627,1637,1657,
        1663,1667,1669,1693,1697,1699,1709,1721,1723,1733,
        1741,1747,1753,1759,1777,1783,1787,1789,1801,1811,
        1823,1831,1847,1861,1867,1871,1873,1877,1879,1889,
        1901,1907,1913,1931,1933,1949,1951,1973,1979,1987,
        1993,1997,1999,2003,2011,2017,2027,2029,2039,2053,
        2063,2069,2081,2083,2087,2089,2099,2111,2113,2129,
        2131,2137,2141,2143,2153,2161,2179,2203,2207,2213,
        2221,2237,2239,2243,2251,2267,2269,2273,2281,2287,
        2293,2297,2309,2311,2333,2339,2341,2347,2351,2357,
        2371,2377,2381,2383,2389,2393,2399,2411,2417,2423,
        2437,2441,2447,2459,2467,2473,2477,2503,2521,2531,
        2539,2543,2549,2551,2557,2579,2591,2593,2609,2617,
        2621,2633,2647,2657,2659,2663,2671,2677,2683,2687,
        2689,2693,2699,2707,2711,2713,2719,2729,2731,2741,
        2749,2753,2767,2777,2789,2791,2797,2801,2803,2819,
        2833,2837,2843,2851,2857,2861,2879,2887,2897,2903,
        2909,2917,2927,2939,2953,2957,2963,2969,2971,2999,
        3001,3011,3019,3023,3037,3041,3049,3061,3067,3079,
        3083,3089,3109,3119,3121,3137,3163,3167,3169,3181,
        3187,3191,3203,3209,3217,3221,3229,3251,3253,3257,
        3259,3271,3299,3301,3307,3313,3319,3323,3329,3331,
        3343,3347,3359,3361,3371,3373,3389,3391,3407,3413,
        3433,3449,3457,3461,3463,3467,3469,3491,3499,3511,
        3517,3527,3529,3533,3539,3541,3547,3557,3559,3571,
        3581,3583,3593,3607,3613,3617,3623,3631,3637,3643,
        3659,3671,3673,3677,3691,3697,3701,3709,3719,3727,
        3733,3739,3761,3767,3769,3779,3793,3797,3803,3821,
        3823,3833,3847,3851,3853,3863,3877,3881,3889,3907,
        3911,3917,3919,3923,3929,3931,3943,3947,3967,3989,
        4001,4003,4007,4013,4019,4021,4027,4049,4051,4057,
        4073,4079,4091,4093,4099,4111,4127,4129,4133,4139,
        4153,4157,4159,4177,4201,4211,4217,4219,4229,4231,
        4241,4243,4253,4259,4261,4271,4273,4283,4289,4297,
        4327,4337,4339,4349,4357,4363,4373,4391,4397,4409,
        4421,4423,4441,4447,4451,4457,4463,4481,4483,4493,
        4507,4513,4517,4519,4523,4547,4549,4561,4567,4583,
        4591,4597,4603,4621,4637,4639,4643,4649,4651,4657,
        4663,4673,4679,4691,4703,4721,4723,4729,4733,4751,
        4759,4783,4787,4789,4793,4799,4801,4813,4817,4831,
        4861,4871,4877,4889,4903,4909,4919,4931,4933,4937,
        4943,4951,4957,4967,4969,4973,4987,4993,4999,5003,
        5009,5011,5021,5023,5039,5051,5059,5077,5081,5087,
        5099,5101,5107,5113,5119,5147,5153,5167,5171,5179,
        5189,5197,5209,5227,5231,5233,5237,5261,5273,5279,
        5281,5297,5303,5309,5323,5333,5347,5351,5381,5387,
        5393,5399,5407,5413,5417,5419,5431,5437,5441,5443,
        5449,5471,5477,5479,5483,5501,5503,5507,5519,5521,
        5527,5531,5557,5563,5569,5573,5581,5591,5623,5639,
        5641,5647,5651,5653,5657,5659,5669,5683,5689,5693,
        5701,5711,5717,5737,5741,5743,5749,5779,5783,5791,
        5801,5807,5813,5821,5827,5839,5843,5849,5851,5857,
        5861,5867,5869,5879,5881,5897,5903,5923,5927,5939,
        5953,5981,5987,6007,6011,6029,6037,6043,6047,6053,
        6067,6073,6079,6089,6091,6101,6113,6121,6131,6133,
        6143,6151,6163,6173,6197,6199,6203,6211,6217,6221,
        6229,6247,6257,6263,6269,6271,6277,6287,6299,6301,
        6311,6317,6323,6329,6337,6343,6353,6359,6361,6367,
        6373,6379,6389,6397,6421,6427,6449,6451,6469,6473,
        6481,6491,6521,6529,6547,6551,6553,6563,6569,6571,
        6577,6581,6599,6607,6619,6637,6653,6659,6661,6673,
        6679,6689,6691,6701,6703,6709,6719,6733,6737,6761,
        6763,6779,6781,6791,6793,6803,6823,6827,6829,6833,
        6841,6857,6863,6869,6871,6883,6899,6907,6911,6917,
        6947,6949,6959,6961,6967,6971,6977,6983,6991,6997,
        7001,7013,7019,7027,7039,7043,7057,7069,7079,7103,
        7109,7121,7127,7129,7151,7159,7177,7187,7193,7207,
        7211,7213,7219,7229,7237,7243,7247,7253,7283,7297,
        7307,7309,7321,7331,7333,7349,7351,7369,7393,7411,
        7417,7433,7451,7457,7459,7477,7481,7487,7489,7499,
        7507,7517,7523,7529,7537,7541,7547,7549,7559,7561],
    has_text: false,
    should_repeat: false,
    font_size: 11,
    use_mod: true,
    use_mod_values: false,
    mod_value: 3,
});

keyManager
    .add('+', (config) => { config.n += 1 })
    .add('-', (config) => { if (config.n > 2) { config.n -= 1 } })
    .add('t', (config) => { config.has_text = !config.has_text })
    .add('r', (config) => { config.should_repeat = !config.should_repeat })
    .add('f', (config) => { if (config.font_size > 6) { config.font_size -= 1 } })
    .add('F', (config) => { config.font_size += 1 })
    .add('l', (config) => { if (config.mod_value > 2) { config.mod_value -= 1 } })
    .add('L', (config) => { config.mod_value += 1 })
    .add('m', (config) => { config.use_mod = !config.use_mod })
    .add('M', (config) => { config.use_mod_values = !config.use_mod_values })
    .add('g', (config) => { config.gradient_is_bicolor = !config.gradient_is_bicolor })
    .setAction(mainAction)
    .onResize(true)
    ;

