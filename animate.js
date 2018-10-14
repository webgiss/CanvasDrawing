const animate = ({ action, from, to, step, duration, count, frameTime }) => {
    return new Promise((resolve, reject) => {
        if (frameTime === 0) {
            reject('frameTime with 0 value makes no sense.');
        }
        if (step === 0) {
            reject('step with 0 value makes no sense.');
        }

        if (duration === undefined && count !== undefined && frameTime !== undefined) {
            duration = count * frameTime;
        } else if (duration !== undefined && count === undefined && frameTime !== undefined) {
            if (frameTime === 0) {
                count = 1;
            } else {
                count = Math.floor(duration / frameTime);
            }
        } else if (duration !== undefined && count !== undefined && frameTime === undefined) {
            if (count !== 0) {
                frameTime = duration / count;
            } else {
                count = 1;
                frameTime = 0;
            }
        } else if (duration !== undefined && count !== undefined && frameTime !== undefined) {
            if (duration !== count * frameTime) {
                reject(`Inconsistancy between duration=[${duration}] and count*frameTime=[${count*frameTime}] (count=[${count}], frameTime=[${frameTime}])`);
            }
        } else {
            if (count === undefined && (duration !== undefined || frameTime !== undefined) && to !== undefined) {
                from = from || 0;
                step = step || 1;
                count = 1 + ((to - from) / step);
            } else {
                reject(`Too few information, you need to provide two of the following informations : duration=[${duration}], count=[${count}], frameTime=[${frameTime}]`);
            }
        }

        if (count === 0) {
            resolve();
        }

        if (to === undefined) {
            from = from || 0;
            step = step || 1;
            to = from + (count - 1) * step;
        } else {
            if (step === undefined) {
                from = from || 0;
                if (count === 1) {
                    step = 1;
                } else {
                    step = (to - from) / (count - 1);
                }
            } else {
                if (from === undefined) {
                    from = to - (count - 1) * step;
                } else {
                    if (to !== from + (count - 1) * step) {
                        reject(`Inconsistancy between to=[${to}] and from+(count-1)*step=[${from+(count-1)*step}] (from=[${from}], count=[${count}], step=[${step}])`);
                    }
                }
            }
        }

        for (let frame = 0; frame < count; frame++) {
            let value = from + frame * step;
            setTimeout(() => action({ from, to, step, value, count, frameTime, frame, duration }), 1000 * frameTime * frame);
        }
        setTimeout(() => resolve(), 1000 * frameTime * count);
    });
}
