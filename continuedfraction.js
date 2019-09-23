(function(){
	ContinuedFraction = window.ContinuedFraction || {};

	const getCf = (x) => {
		let result = [];
		let sign = 1;
		if (x < 0) {
			x = -x;
			sign = -1;
		}
		let ip = Math.floor(x);
		result.push(ip);
		x = x - ip;

		for (let i = 0; i < 12; i++) {
			if (x>0) {
				x = 1 / x;
				ip = Math.floor(x);
				result.push(ip);
				x = x - ip;
			}
		}
		return result;
    };

    const getRatio = (CfParam) => {
        let cf = [...CfParam];
        let ratio = 0;
        while (cf.length > 0) {
            let value = cf.pop();
            ratio = + ratio + value;
            if (cf.length > 0) {
                ratio = 1/ratio;
            }
        }
        return ratio;
    }

    const pgcd = (x, y) => (y ? pgcd(y, x % y) : x);

    const reduceFraction = (numerator, denominator) => {
        if (numerator.length !== undefined) {
            denominator = numerator[1];
            numerator = numerator[0];
        }
        let gcd = pgcd(numerator, denominator);
        return [numerator / gcd, denominator / gcd];
    };

    const partialCf = (fract, next) => {
        next = next || 0;
        let [num, dem] = [0, 1];
        if (fract.length !== undefined) {
            [num, dem] = fract;
            dem = dem || 1;
        } else {
            num = fract;
        }
        return reduceFraction([dem + num * next, num]);
    };

    const partialCfs = (cf) => {
        let result = [];
        for (
            let partialCfMaxDepth = 0;
            partialCfMaxDepth < cf.length;
            partialCfMaxDepth++
        ) {
            let partialCfValue = cf.slice(0, partialCfMaxDepth + 1);
            let fraction = null;
            while (partialCfValue.length > 0) {
                let term = partialCfValue.pop();

                if (
                    term !== undefined &&
                    term !== null &&
                    !isNaN(term) &&
                    1 / term !== 0
                ) {
                    if (fraction === null) {
                        fraction = partialCf([1, term], 0);
                    } else {
                        fraction = partialCf(fraction, term);
                    }
                }
            }
            result.push({ fraction, value: fraction[0] / fraction[1], term: cf[partialCfMaxDepth] });
        }
        return result;
    };

    ContinuedFraction = {...ContinuedFraction, getCf, getRatio, reduceFraction, partialCf, partialCfs };

	window.ContinuedFraction = ContinuedFraction;
})(this);
