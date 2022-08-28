
(function () {
    /** @type {Window} */
    let window = this;

    const POS_TOPRIGHT = "9";
    const POS_TOP = "8";
    const POS_TOPLEFT = "7";
    const POS_RIGHT = "6";
    const POS_CENTER = "5";
    const POS_LEFT = "4";
    const POS_BOTTOMRIGHT = "3";
    const POS_BOTTOM = "2";
    const POS_BOTTOMLEFT = "1";
    const POS_NONE = "0";

    const ALIGN_LEFT = "ALIGN_LEFT";
    const ALIGN_RIGHT = "ALIGN_RIGHT";
    const ALIGN_CENTER = "ALIGN_CENTER";

    /**
     * Get a range enumerator
     * @param {Number} min 
     * @param {Number} max 
     * @param {Number} step 
     */
    const getXRange = function* (min, max, step) {
        if (step === undefined) {
            step = 1;
        }
        if (max === undefined) {
            [min, max] = [0, min]
        }
        if (step === 0) {
            return;
        };
        const cond = (step > 0) ? (x => x < max) : (x => x > max);
        let current = min;
        while (cond(current)) {
            yield current;
            current += step;
        }
    };

    /**
     * Get a range list
     * @param {Number} min 
     * @param {Number} max 
     * @param {Number} step 
     * @returns {Number[]}
     */
    const getRange = (min, max, step) => [...getXRange(min, max, step)];

    /**
     * Get a Vector with (x,y) coordinate, or with (x,y) in a polar mode if isPolar is true
     * @param {number} x The x coordinate (or the length in polar mode)
     * @param {number} y The y coordinate (or the angle in polar mode)
     * @param {boolean} isPolar True if the coordinate are in polar mode
     * @returns Vector
     */
    const getVector = (x, y, isPolar) => {
        if (x.__proto__.constructor === CanvasVector) {
            return new CanvasVector(x);
        }
        return new Vector(x, y, isPolar);
    }

    /**
     * Get a list of [x,y] coordinate given either x,y or a vector or a canvas vector or a list of [x,y]
     * @param {number|Vector|CanvasVector} x 
     * @param {number|undefined} y 
     * @returns {Number[]}
     */
    const getXY = (x, y) => {
        if (x.__proto__.constructor === Vector || x.__proto__.constructor === CanvasVector) {
            return [x.x, x.y];
        }
        if (typeof (x) === typeof ([])) {
            return [x[0], x[1]];
        }
        return [x, y];
    }

    /**
     * Return the size of a rectangle of text (single line) in the form of a [width, height]
     * @param {string} family 
     * @param {Number} size 
     * @param {Number} weight 
     * @param {string} text 
     * @returns {Number[]}
     */
    const determineFontSize = (family, size, weight, text) => {
        let fontStyle = "font-family: " + family + "; font-size: " + size + "; font-weight : " + weight + ";"
        let body = window.document.getElementsByTagName("body")[0];
        let dummyParagraph = window.document.createElement("p");
        let dummyElement = window.document.createElement("span");
        let dummyText = window.document.createTextNode(text);
        dummyElement.appendChild(dummyText);
        dummyElement.setAttribute("style", fontStyle);
        dummyParagraph.appendChild(dummyElement);
        body.appendChild(dummyParagraph);
        let result = [dummyElement.offsetWidth, dummyElement.offsetHeight];
        body.removeChild(dummyParagraph);
        return result;
    }

    /**
     * Return the size of a rectangle of text (multi line) in the form of a [width, height]
     * @param {string} family 
     * @param {Number} size 
     * @param {Number} weight 
     * @param {string} text 
     * @returns {Number[]}
     */
    const determineFontSizeMultiline = (fontFamily, fontSize, fontWeight, text) => {
        let lines = text.split('\n').map(line => ({ line, size: determineFontSize(fontFamily, fontSize, fontWeight, line) }));
        let width = lines.reduce((pwidth, line) => Math.max(pwidth, line.size[0]), 0);
        let height = lines.reduce((pheight, line) => pheight + line.size[1], 0);
        let global = [width, height];
        return { lines, global };
    }


    /**
     * A class representing a Vector
     */
    class Vector {
        /**
         * @param {Number} x The x coordinate (or the length in polar mode)
         * @param {Number} y The y coordinate (or the angle in polar mode)
         * @param {boolean} isPolar True if the coordinate are in polar mode
         */
        constructor (x, y, isPolar) {
            if (isPolar) {
                [this._x, this._y] = [x * Math.cos(y), x * Math.sin(y)];
            } else {
                [this._x, this._y] = getXY(x, y);
            }
        }

        /**
         * @return {number} The x coordinate
         */
        get x() { return this._x; }
        /**
         * @return {number} The y coordinate
         */
        get y() { return this._y; }
        /**
         * @return {number[]} The [x,y] coordinates
         */
        get xy() { return [this._x, this._y]; }
        /**
         * @return {number} The length of the Vector
         */
        get length() { return Math.sqrt(this.x * this.x + this.y * this.y); }

        /**
         * Add an other vector to the current one, a return a new one corresponding to the sum
         * @param {number|Vector|CanvasVector} x The x coordinate of the vector, or a Vector, or a CanvasVector
         * @param {number|undefined} y The y coordinate of the vector
         * @returns {Vector}
         */
        add(x, y) {
            [x, y] = getXY(x, y);
            return new Vector(this.x + x, this.y + y);
        }
        /**
         * Substract an other vector to the current one, a return a new one corresponding to the difference
         * @param {number|Vector|CanvasVector} x The x coordinate of the vector, or a Vector, or a CanvasVector
         * @param {number|undefined} y The y coordinate of the vector
         * @returns {Vector}
         */
        sub(x, y) {
            [x, y] = getXY(x, y);
            return new Vector(this.x - x, this.y - y);
        }
        /**
         * Multiply an other vector to the current one, a return a new one corresponding to a vector where affix is the product of the two affixes of the original vectors
         * @param {number|Vector|CanvasVector} x The x coordinate of the vector, or a Vector, or a CanvasVector
         * @param {*} y The y coordinate of the vector
         * @returns {number}
         */
        mul(x, y) {
            [x, y] = getXY(x, y);
            return new Vector(this.x * x - this.y * y, this.x * y + this.y * x);
        }
    }

    /**
     * A Vector expressed not in the diagram referential, but in the canvas referential.
     */
    class CanvasVector extends Vector {
        /**
         * @param {number} x The x coordinate (or the length in polar mode)
         * @param {number} y The y coordinate (or the angle in polar mode)
         * @param {boolean} isPolar True if the coordinate are in polar mode
         */
        constructor (...params) {
            super(...params);
        }
        /**
         * Add an other vector to the current one, a return a new one corresponding to the sum
         * @param {number|Vector|CanvasVector} x The x coordinate of the vector, or a Vector, or a CanvasVector
         * @param {number|undefined} y The y coordinate of the vector
         * @returns {Vector}
         */
        add(x, y) {
            [x, y] = getXY(x, y);
            return new CanvasVector(this.x + x, this.y + y);
        }
        /**
         * Substract an other vector to the current one, a return a new one corresponding to the difference
         * @param {number|Vector|CanvasVector} x The x coordinate of the vector, or a Vector, or a CanvasVector
         * @param {*} y The y coordinate of the vector
         * @returns {Vector}
         */
        sub(x, y) {
            [x, y] = getXY(x, y);
            return new CanvasVector(this.x - x, this.y - y);
        }
        /**
         * Multiply an other vector to the current one, a return a new one corresponding to a vector where affix is the product of the two affixes of the original vectors
         * @param {number|Vector|CanvasVector} x The x coordinate of the vector, or a Vector, or a CanvasVector
         * @param {*} y The y coordinate of the vector
         * @returns {number}
         */
        mul(x, y) {
            [x, y] = getXY(x, y);
            return new CanvasVector(this.x * x - this.y * y, this.x * y + this.y * x);
        }
    }

    /**
     * A path in a Canvas
     */
    class Path {
        /**
         * Create a new Path
         * @param {Object} params The parameters
         * @param {Drawing} params.drawing The drawing to which the Path belong to
         * @param {string|CanvasGradient|CanvasPattern|undefined} params.color The color of the path, or nothing if no border to the path
         * @param {string|CanvasGradient|CanvasPattern|undefined} params.fill The color of the fill color, or nothing if no fill
         */
        constructor ({ drawing, color, fill }) {
            /** @type {Drawing} */
            this._drawing = drawing;
            /** @type {CanvasRenderingContext2D} */
            this._context = this._drawing.context;
            this._color = color;
            this._fill = fill;
            this._actions = [];
            this._firstPoint = null;
            this._lastPoint = null;
        }

        /**
         * Add a new point to the path
         * @param {number|Vector|CanvasVector} x The x coordinate of the vector, or a Vector, or a CanvasVector
         * @param {number|undefined} y The y coordinate of the vector
         * @returns {Vector} The newly created Vector
         */
        usePoint(x, y) {
            let point = getVector(x, y);
            if (this._firstPoint === null) {
                this._firstPoint = point;
            }
            this._lastPoint = point;

            return point;
        }

        /**
         * Move to a new point without drawing a line
         * @param {number|Vector|CanvasVector} x The x coordinate of the vector, or a Vector, or a CanvasVector
         * @param {number|undefined} y The y coordinate of the vector
         */
        moveTo(x, y) {
            let point = this.usePoint(x, y);
            this._actions.push(() => {
                this._drawing._moveTo(point);
            })
        }
        /**
         * Draw a line from the current point to a new point
         * @param {number|Vector|CanvasVector} x The x coordinate of the vector, or a Vector, or a CanvasVector
         * @param {number|undefined} y The y coordinate of the vector
         */
        lineTo(x, y) {
            let point = this.usePoint(x, y);
            this._actions.push(() => {
                this._drawing._lineTo(point);
            })
        }

        /**
         * Draw a line from the last point to the first point
         */
        lineLoop() {
            if (this._firstPoint !== null) {
                let point = this._firstPoint;
                this.lineTo(point);
            }
        }

        /**
         * Draw a line among a set of point, looping to the first one or not
         * @param {number[][]|Vector[]|CanvasVector[]} points A list of points to draw a line
         * @param {boolean} isLoop True if the line should loop
         */
        segmentLine(points, isLoop) {
            if (points.length > 0) {
                this.moveTo(points[0]);
                points.slice(1).map(point => this.lineTo(point));
                if (isLoop) {
                    this.lineTo(points[0]);
                }
            }
        }

        /**
         * Draw a line among a set of point, looping to the first one
         * @param {number[][]|Vector[]|CanvasVector[]} points A list of points to draw a line
         */
        segmentLineLoop(points) { return this.segmentLine(points, true); }

        /**
         * Draw an arc
         * @param {Vector|CanvasVector|number[]} center The center of the arc
         * @param {number} length The lenth of the arc
         * @param {number} startAngle The angle where the arc starts
         * @param {number} stopAngle The angle where the arc stops
         */
        arc(center, length, startAngle, stopAngle) {
            center = this.usePoint(center);
            this._actions.push(() => {
                this._drawing._arc(center, length, startAngle, stopAngle);
            })
        }

        /**
         * Close the path and actually draws the path onto the Drawing
         */
        close() {
            if (this._context !== undefined) {
                this._context.strokeStyle = this._color || 'none';
                this._context.beginPath();
                this._actions.map(action => action());
                if (this._fill) {
                    this._context.fillStyle = this._fill;
                    this._context.fill();
                }
                if (this._color) {
                    this._context.stroke();
                }
                this._context.closePath();
            }
        }
    }

    /**
     * A Drawing inside a Canvas
     */
    class Drawing {
        constructor (params) {
            this.reinit(params);
        }
        /** @returns {number} */
        get width() {
            return this._width;
        }
        /** @returns {number} */
        get height() {
            return this._height;
        }

        /** @returns {CanvasRenderingContext2D} */
        get context() {
            return this._context;
        }
        /**
         * 
         * @param {Object} params
         * @param {HTMLCanvasElement} params.canvas
         * @param {string|undefined} params.canvasId
         * @param {number|undefined} params.height
         * @param {number|undefined} params.width
         * @param {CanvasVector|number[]|undefined} params.origin
         * @param {number|undefined} params.mapx
         * @param {number|undefined} params.mapy
         * @param {Vector[]|undefined} params.corners
         * @param {string|undefined} params.bgcolor
         * @returns 
         */
        reinit({ canvas, canvasId, height, width, origin, mapx, mapy, corners, bgcolor }) {
            let needClear = false;

            if (canvas !== undefined) {
                this._canvas = canvas;
                needClear = true;
            } else if (canvasId !== undefined) {
                /** @type {HTMLCanvasElement} */ 
                this._canvas = document.getElementById(canvasId);
                needClear = true;
            }

            if (this._canvas === undefined) {
                return;
            }

            if (width === undefined) {
                this._width = this._canvas.width;
            } else {
                this._width = width;
                this._canvas.width = this._width;
                needClear = true;
            }
            if (height === undefined) {
                this._height = this._canvas.height;
            } else {
                this._height = height;
                this._canvas.height = this._height;
                needClear = true;
            }

            if (corners === undefined) {
                if (origin !== undefined) {
                    this._origin = new CanvasVector(origin);
                    needClear = true;
                }

                if (this._origin === undefined) {
                    this._origin = new CanvasVector([0, 0]);
                    needClear = true;
                }

                if (mapx !== undefined) {
                    this._mapx = mapx;
                    needClear = true;
                }
                if (mapy !== undefined) {
                    this._mapy = mapy;
                    needClear = true;
                }
                if (this._mapx === undefined) {
                    this._mapx = 1;
                    needClear = true;
                }
                if (this._mapy === undefined) {
                    this._mapy = 1;
                    needClear = true;
                }
            } else {
                let corner0 = corners[0];
                let corner1 = corners[1];
                let [c0x, c0y] = corner0.xy;
                let [c1x, c1y] = corner1.xy;
                let [minX, maxX] = [Math.min(c0x, c1x), Math.max(c0x, c1x)];
                let [minY, maxY] = [Math.min(c0y, c1y), Math.max(c0y, c1y)];
                let [dx, dy] = [maxX - minX, maxY - minY];
                if (dx * this._height < dy * this._width) {
                    this._mapy = -this._height / dy;
                    this._mapx = -this._mapy;

                    let Ox = (this._width - dx * this._mapx) / 2 - this._mapx * minX;
                    let Oy = -this._mapy * maxY;
                    this._origin = new Vector(Ox, Oy);
                } else {
                    this._mapx = this._width / dx;
                    this._mapy = -this._mapx;

                    let Ox = -this._mapx * minX;
                    let Oy = (this._height + dy * this._mapy) / 2 - this._mapy * maxY;
                    this._origin = new Vector(Ox, Oy);
                }
                needClear = true;
            }

            this._map = new CanvasVector(this._mapx, this._mapy);

            this._context = this._canvas.getContext('2d');

            if (bgcolor !== undefined) {
                this._bgcolor = bgcolor;
                needClear = true;
            }
            if (needClear) {
                this.clear();
            }
        }

        /**
         * Add a click listener on the Canvas
         * @param {(params:{canvasPosition: CanvasVector, position: Vector, event: MouseEvent})=>void} listener 
         */
        addClickListener(listener) {
            if (this._canvas) {
                this._canvas.addEventListener("click", (event) => {
                    let [x, y] = [event.pageX - this._canvas.offsetLeft, event.pageY - this._canvas.offsetTop];
                    let canvasPosition = new CanvasVector(x, y);
                    let position = this.getCoordFromContextCoord(canvasPosition);
                    listener({ canvasPosition, position, event });
                });
            }
        }

        /**
         * Clear the Canvas
         * @returns {undefined}
         */
        clear() {
            let bgcolor = this._bgcolor || '#fff';
            this._rect(0, 0, this._width, this._height, bgcolor);
        }

        /**
         * Get a CanvasVector given a Vector (or a CanvasVector or number array)
         * @param {number|number[]|Vector|CanvasVector} x The x coordinate of the vector, or a Vector, or a CanvasVector
         * @param {number|undefined} y The y coordinate of the vector
         * @returns {CanvasVector}
         */
        getContextCoord(x, y) {
            if (x.__proto__.constructor === CanvasVector) {
                return new CanvasVector(x, y);
            } else {
                let v = new Vector(x, y);
                return this._origin.add(this._map.x * v.x, this._map.y * v.y);
            }
        }

        /**
         * Get a Vector given a CanvasVector (or a Vector or number array)
         * @param {number|Vector|CanvasVector} x The x coordinate of the vector, or a Vector, or a CanvasVector
         * @param {number|undefined} y The y coordinate of the vector
         * @returns {Vector}
         */
        getCoordFromContextCoord(x, y) {
            if (x.__proto__.constructor === Vector) {
                return new Vector(x, y);
            } else {
                let v = new CanvasVector(x, y);
                let [dx, dy] = v.sub(this._origin).xy;
                return new Vector(dx / this._map.x, dy / this._map.y);
            }
        }

        /**
         * Convert a value in the Vector space into a value in the CanvasVector space
         * @param {number} x 
         * @returns {number}
         */
        getContextDistance(x) {
            return this.getContextCoord(0, x).sub(this.getContextCoord(0, 0)).length;
        }

        /**
         * Create a new Path assiociated to the Drawing
         * @param {Object} params Parameters
         * @param {string|CanvasGradient|CanvasPattern|undefined} params.color The color of the path, or nothing if no border to the path
         * @param {string|CanvasGradient|CanvasPattern|undefined} params.fill The color of the fill color, or nothing if no fill
         * @returns 
         */
        getPath(params) {
            let { color, fill } = params || {};

            return new Path({ drawing: this, color, fill });
        }


        /**
         * Draw a rectangle
         * @param {number} x The position of the left side (in the canvas space)
         * @param {number} y Top position of the top side (in the canvas space)
         * @param {number} w The width of the rectange  (in the canvas space)
         * @param {number} h The height of the rectangle (in the canvas space)
         * @param {string | CanvasGradient | CanvasPattern} c 
         */
        _rect(x, y, w, h, c) {
            if (this._context !== undefined) {
                this._context.fillStyle = c;
                this._context.fillRect(x, y, w, h);
            }
        }

        /**
         * Draw a line to the point
         * @param {number[]|Vector|CanvasVector} point
         */
        _lineTo(point) {
            if (this._context !== undefined) {
                this._context.lineTo(...this.getContextCoord(point).xy);
            }
        }
        /**
         * Move to the point
         * @param {number[]|Vector|CanvasVector} point
         */
         _moveTo(point) {
            if (this._context !== undefined) {
                this._context.moveTo(...this.getContextCoord(point).xy);
            }
        }

        /**
         * Draw an arc on the drawing
         * @param {Vector|CanvasVector} center The center of the arc
         * @param {number} length The radius of the arc
         * @param {number} startAngle The start angle of the arc
         * @param {number} stopAngle The stop angle of the arc
         */
        _arc(center, length, startAngle, stopAngle) {
            if (this._context !== undefined) {
                this._context.arc(
                    ...this.getContextCoord(center).xy,
                    this.getContextDistance(length),
                    startAngle,
                    stopAngle
                );
            }
        }

        /**
         * Draw a filled rectangle
         * @param {Object} params The Parameters
         * @param {Vector|CanvasVector} params.point0 A corner of the rectangle to draw
         * @param {Vector|CanvasVector} params.point1 The corner opposite of point0 of the rectangle to draw
         * @param {string|CanvasGradient|CanvasPattern|undefined} params.color The color to fill the rectangle
         */
        filledRectangle({ point0, point1, color }) {
            let [x0, y0] = this.getContextCoord(point0).xy;
            let [x1, y1] = this.getContextCoord(point1).xy;
            let xmin = Math.min(x0, x1);
            let ymin = Math.min(y0, y1);
            let xmax = Math.max(x0, x1);
            let ymax = Math.max(y0, y1);

            this._rect(xmin, ymin, xmax - xmin, ymax - ymin, color || 'black');
        }

        /**
         * Draw a rectangle (filled or not)
         * @param {Object} params The Parameters
         * @param {Vector|CanvasVector} params.point0 A corner of the rectangle to draw
         * @param {Vector|CanvasVector} params.point1 The corner opposite of point0 of the rectangle to draw
         * @param {string|CanvasGradient|CanvasPattern|undefined} params.color The color for the border of the rectangle
         * @param {string|CanvasGradient|CanvasPattern|undefined} params.fill The color used for filling the rectangle
         */
        rectangle({ point0, point1, color, fill }) {
            let path = this.getPath({ color, fill });
            let [x0, y0] = this.getContextCoord(point0).xy;
            let [x1, y1] = this.getContextCoord(point1).xy;
            let pointA = new CanvasVector(x0, y0);
            let pointB = new CanvasVector(x0, y1);
            let pointC = new CanvasVector(x1, y1);
            let pointD = new CanvasVector(x1, y0);

            path.moveTo(pointA);
            path.lineTo(pointB);
            path.lineTo(pointC);
            path.lineTo(pointD);
            path.lineLoop();
            path.close();
        }

        /**
         * Draw a between two points
         * @param {Object} params The Parameters
         * @param {Vector|CanvasVector} params.point0 A point
         * @param {Vector|CanvasVector} params.point1 An other point
         * @param {string|CanvasGradient|CanvasPattern|undefined} params.color The color for the line
         */
        line({ point0, point1, color }) {
            let path = this.getPath({ color });
            path.moveTo(point0);
            path.lineTo(point1);
            path.close();
        }

        circle({ center, length, color, fill }) {
            let path = this.getPath({ color, fill });
            path.arc(center, length, 0, 2 * Math.PI);
            path.close();
        }

        segmentLine({ points, color }) {
            let path = this.getPath({ color });
            path.segmentLine(points);
            path.close();
        }

        segmentLineLoop({ points, color, fill }) {
            let path = this.getPath({ color, fill });
            path.segmentLineLoop(points);
            path.close();
        }

        /**
         * Add some text
         * @param {Object} params
         * @param {string} params.text A text to draw on the canvas
         * @param {string} params.color A color as a string
         * @param {string} params.fontWeight A CSS valid font-weight
         * @param {string} params.fontFamily A CSS valid font-family
         * @param {number} params.fontSize A CSS valid font-size
         * @param {number} params.space A spacing in pixel unit from the specified point
         * @param {('POS_BOTTOMLEFT'|'POS_TOPLEFT'|'POS_LEFT'|'POS_BOTTOMRIGHT'|'POS_TOPRIGHT'|'POS_RIGHT'|'POS_TOP'|'POS_BOTTOM'|'POS_CENTER')} params.position A position from the point where to put the text
         * @param {Vector|CanvasVector} params.point The point used as a starting point to put the text
         * @param {number} params.debug If defined, the color to use to highlight the border of the text for debugging purpose
         * @param {('ALIGN_LEFT'|'ALIGN_CENTER'|'ALIGN_CENTER')} params.textAlign The allignement of the text inside of the box (when on several lines)
         */
        addText({ text, color, fontWeight, fontFamily, fontSize, space, position, point, debug, textAlign }) {
            fontFamily = fontFamily || "sans-serif";
            fontSize = fontSize || "12px";
            fontWeight = fontWeight || "normal";
            textAlign = textAlign || ALIGN_LEFT;
            color = color || "#000";
            if (space === undefined) {
                space = 5;
            }
            let size = determineFontSizeMultiline(fontFamily, fontSize, fontWeight, text);

            let [width, height] = size.global;
            let [xmin, ymin] = this.getContextCoord(point).xy;
            switch (position) {
                case POS_BOTTOMLEFT:
                case POS_LEFT:
                case POS_TOPLEFT:
                    xmin = xmin - space - width;
                    break;
                case POS_BOTTOM:
                case POS_CENTER:
                case POS_TOP:
                    xmin = xmin - width / 2;
                    break;
                case POS_BOTTOMRIGHT:
                case POS_RIGHT:
                case POS_TOPRIGHT:
                    xmin = xmin + space;
                    break;
                case POS_NONE:
                default:
                    return;
                    break;
            }
            switch (position) {
                case POS_TOPLEFT:
                case POS_TOP:
                case POS_TOPRIGHT:
                    ymin = ymin - space - height;
                    break;
                case POS_LEFT:
                case POS_CENTER:
                case POS_RIGHT:
                    ymin = ymin - height / 2;
                    break;
                case POS_BOTTOMLEFT:
                case POS_BOTTOM:
                case POS_BOTTOMRIGHT:
                    ymin = ymin + space;
                    break;
                case POS_NONE:
                default:
                    return;
                    break;
            }
            this._context.strokeStyle = color;
            this._context.beginPath();
            this._context.textBaseline = "bottom";
            this._context.font = fontWeight + " " + fontSize + " " + fontFamily;
            this._context.fillStyle = color;
            let deltay = 0;
            for (let lineInfo of size.lines) {
                let deltax = 0;
                switch (textAlign) {
                    case ALIGN_CENTER:
                        deltax = (width - lineInfo.size[0]) / 2;
                        break;
                    case ALIGN_RIGHT:
                        deltax = width - lineInfo.size[0];
                        break;
                }
                this._context.fillText(lineInfo.line, xmin + deltax, ymin + deltay + lineInfo.size[1]);
                deltay = deltay + lineInfo.size[1];
            }
            this._context.closePath();

            if (debug !== undefined) {
                this._context.strokeStyle = debug;
                this._context.beginPath();
                this._context.rect(xmin, ymin, width, height)
                this._context.stroke();
                this._context.closePath();
            }
        }

    }

    window.CanvasDrawing = { ...(window.CanvasDrawing || {}), Vector, CanvasVector, Drawing, getXY, getRange, getXRange };
    window.CanvasDrawing = { ...(window.CanvasDrawing || {}), POS_TOPRIGHT, POS_TOP, POS_TOPLEFT, POS_RIGHT, POS_CENTER, POS_LEFT, POS_BOTTOMRIGHT, POS_BOTTOM, POS_BOTTOMLEFT, POS_NONE };

})(/** @type {Window} */this);
