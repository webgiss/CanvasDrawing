(function () {
    let window = this;

    const random = (n) => Math.floor(Math.random() * n);

    window.CanvasDrawing = { ...(window.CanvasDrawing || {}), random };
})(this);
