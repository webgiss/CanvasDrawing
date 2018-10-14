(function(){
let window = this;

const getXY = (x,y) => {
    if (x.__proto__.constructor === Vector) {
        return [x.x, x.y];
    }
    if (typeof(x)===typeof([])) {
        return [x[0],x[1]];
    }
    return [x,y];
}

class Vector{
    constructor(x,y,isPolar){
        if (isPolar) {
            [this._x,this._y] = [x*Math.cos(y), x*Math.sin(y)];
        } else {
            [this._x,this._y] = getXY(x,y);
        }
    }
    get x() { return this._x; }
    get y() { return this._y; }
    get xy() { return [this._x, this._y]; }
    get length() { return Math.sqrt(this.x*this.x+this.y*this.y); }
    
    add(x,y) {
        [x,y]=getXY(x,y);
        return new Vector(this.x+x, this.y+y);
    }
    sub(x,y) {
        [x,y]=getXY(x,y);
        return new Vector(this.x-x, this.y-y);
    }
    mul(x,y) {
        [x,y]=getXY(x,y);
        return new Vector(this.x*x-this.y*y, this.x*y+this.y*x);
    }
}
class Path {
    constructor({drawing, color}) {
        this._drawing = drawing;
        this._context = this._drawing.context;
        this._color = color || BLACK;
        this._actions = [];
        this._firstPoint = null;
        this._lastPoint = null;
    }
    
    usePoint(x,y){
        let point = new Vector(x,y);
        if (this._firstPoint === null) {
          this._firstPoint = point;
        }
        this._lastPoint = point;
        
        return point;
    }
    moveTo(x,y) {
        let point = this.usePoint(x,y);
        this._actions.push(()=>{
            this._drawing._moveTo(point);
        })
    }
    lineTo(x,y) {
        let point = this.usePoint(x,y);
        this._actions.push(()=>{
            this._drawing._lineTo(point);
        })
    }
    lineLoop () {
        if (this._firstPoint !== null) {
            let point = this._firstPoint;
            this.lineTo(point);
        }
    }
    segmentLine (points, isLoop) {
        if (points.length > 0) {
          this.moveTo(points[0]);
          points.slice(1).map(point=>this.lineTo(point));
          if (isLoop) {
            this.lineTo(points[0]);
          }
        }
    }
    segmentLineLoop (points) { return this.segmentLine(points, true); }
    arc (center, length, startAngle,stopAngle) {
        center = this.usePoint(center);
        this._actions.push(()=>{
            this._drawing._arc(center, length, startAngle, stopAngle);
        })
    }
    close() {
        this._context.strokeStyle = this._color;
        this._context.beginPath();
        this._actions.map(action=>action());
        this._context.stroke();
        this._context.closePath();
    }
}
class Drawing {
    constructor(params) {
        this.reinit(params);
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }  
    get context() {
        return this._context;
    }
    reinit({canvas, height, width, origin, mapx, mapy, bgcolor}) {
        let needClear = false;

        this._canvas = canvas;
        this._height = height || 800;
        this._width = width || 800;
        this._bgcolor = bgcolor;
        if (origin === undefined) {
            origin = [0,0];
        }
        this._origin = new Vector(origin);
        
        mapx = mapx || 1;
        mapy = mapy || 1;
        
        this._map = new Vector(mapx,mapy);
        
        if (this._width === undefined) {
            this._width = this._canvas.width;
        } else {
            this._canvas.width = this._width;
            needClear = true;
        }
        if (this._height === undefined) {
            this._height = this._canvas.height;
        } else {
            this._canvas.height = this._height;
            needClear = true;
        }
        this._context = this._canvas.getContext('2d');
        if (bgcolor !== undefined) {
            this._bgcolor = bgcolor;
            needClear = true;
        }
        if (needClear) {
            this.clear();
        }
    }
    clear() {
        let bgcolor = this._bgcolor || '#fff';
        this.rect(0,0,this._width,this._height, bgcolor);
    }
    getContextCoord(x,y) {
        let v = new Vector(x,y);
        return this._origin.add(this._map.x*v.x, this._map.y*v.y);
    }
    getContextDistance(x) {
        return this.getContextCoord(0,x).sub(this.getContextCoord(0,0)).length;
    }
 
    getPath(params) {
        let {color} = params ||{};
      
        return new Path({drawing: this, color});
    }
    
    rect(x,y,w,h,c) {
        this._context.fillStyle=c;
        this._context.fillRect(x,y,w,h);
    }
    
    _lineTo(point){ this._context.lineTo(...this.getContextCoord(point).xy); }
    _moveTo(point){ this._context.moveTo(...this.getContextCoord(point).xy); }
 
    _arc(center, length, startAngle, stopAngle){
        console.log({center, length, startAngle, stopAngle});
        this._context.arc(
            ...this.getContextCoord(center).xy, 
            this.getContextDistance(length),
            startAngle, 
            stopAngle
        );
    }
    
    line({ point0, point1, color }){
        let path = this.getPath({color});
        path.moveTo(point0);
        path.lineTo(point1);
        path.close();
    }
    
    circle({center, length, color}) {
        let path = this.getPath({color});
        path.arc(center, length, 0, 2*Math.PI);
        path.close();
    }
    
    segmentLine({points, color}) {
        let path = this.getPath({color});
        path.segmentLine(points);
        path.close();
    }
    
    segmentLineLoop({points, color}) {
        let path = this.getPath({color});
        path.segmentLineLoop(points);
        path.close();
    }
    
}

const CanvasDrawing = {Vector, Drawing, getXY};
window.CanvasDrawing = CanvasDrawing;

})(this);
