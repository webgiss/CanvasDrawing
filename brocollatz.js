const addStyle = (() => {
    let styleElement = null;
    let styleContent = null;

    return (styleText) => {
        if (styleElement === null) {
            styleElement = document.createElement('style');
            styleContent = "";
            document.head.appendChild(styleElement);
        } else {
            styleContent += "\n";
        }

        styleContent += styleText;
        styleElement.textContent = styleContent;
    };
})();

const readyPromise = new Promise((resolve, reject) => {
    if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
        setTimeout(() => resolve(), 1);
    } else {
        const onContentLoaded = () => {
            resolve();
            document.removeEventListener('DOMContentLoaded', onContentLoaded, false);
        }
        document.addEventListener('DOMContentLoaded', onContentLoaded, false);
    }
})

const {setHashChanged, setLocationHash, getCurrentLocationHash} = (() => {
    /**
     * A callback that should be called each time the hash has changed, or the first time the callback is installed
     * @type {(hash: string) => void}
     */
    let onHashChanged = null;

    /**
     * The current hash in the page
     * @type {string}
     */
    let currentHash = null;

    /**
     * Force execute the callback "onHashChanged" if any
     */
    const executeHashChanged = () => {
        if (onHashChanged) {
            onHashChanged(currentHash);
        }
    }
    /**
     * Update the current hash with a new value
     * @param {string} hash The new value of the hash to set.
     */
    const updateCurrentHash = (hash) => {
        currentHash = hash;
        executeHashChanged();
    }
    /**
     * Set the location hash, executing the callback only if the new hash is different from the old one.
     * @param {string} hash 
     */
    const setLocationHash = (hash) => {
        if (hash !== currentHash) {
            location.hash = hash;
            updateCurrentHash(location.hash);
        }
    }
    // Install the hash change callback
    window.onhashchange = () => {
        if (location.hash !== currentHash) {
            updateCurrentHash(location.hash);
        }
    };
    currentHash = location.hash;
    /**
     * Add a callback when the hash has changed.
     * @param {(hash: string) => void} event The callback to call when the hash has changed
     */
    const setHashChanged = (event) => {
        onHashChanged = event;
        executeHashChanged();
    }
    const getCurrentLocationHash = () => currentHash.slice(1);
    return {setHashChanged, setLocationHash, getCurrentLocationHash};
})();


/**
 * 
 * @param {Object} params
 * @param {string} params.name
 * @param {HTMLElement?} params.parent
 * @param {string[]?} params.classNames
 * @param {HTMLElement[]} params.children
 * @param {string?} params.text
 * @param {(element: HTMLElement)=>void} params.onCreated
 * 
 * @returns {HTMLElement}
 */
const createElement = ({ name, parent, classNames, children, text, onCreated }) => {
    const element = document.createElement(name);

    if (parent) {
        parent.appendChild(element);
    }

    if (classNames) {
        classNames.forEach((className) => element.classList.add(className));
    }

    if (children) {
        children.forEach((child) => {
            element.appendChild(child)
        });
    }

    if (text) {
        element.textContent = text;
    }

    if (onCreated) {
        onCreated(element);
    }

    return element;
}

/**
 * Convert a number to a string reprenting that number in binary
 * @param {number} n 
 * @return {string} The binary representation of the number n
 */
const getBinary = (n) => {
    let i = n;
    const result = [];
    while (i > 0) {
        result.unshift(i % 2);
        i = Math.floor(i / 2);
    }
    if (result.length === 0) {
        result.unshift(0);
    }
    return result.join('');
}

/**
 * Convert a string reprenting a binary number to the number
 * @param {string} data a string composed of 0 and 1
 * @returns The number whose binary representation is the string data
 */
const getDec = (data) => {
    let result = 0;
    [...data].forEach((char) => {
        if (char === '0' || char === '1') {
            result *= 2
            if (char === '1') {
                result += 1
            }
        }
    })
    return result
}

const getColatz = (n) => {
    const nBin = getBinary(n);
    const tn = 3 * n;
    const tnBin = getBinary(tn);
    const tnone = tn + 1;
    const tnoneBin = getBinary(tnone);
    let next = tnone;
    let count = 0;
    while (next % 2 === 0) {
        next /= 2;
        count += 1;
    }
    const nextBin = getBinary(next);
    return { n, nBin, tn, tnBin, tnone, tnoneBin, next, nextBin, count };
}

/**
 * 
 * @param {Object} colatz
 * @param {HTMLElement} element 
 */
const addColatz = (colatz, parent) => {
    createElement({
        name: 'div', parent, classNames: ['colatzItem'], children: [
            createElement({
                name: 'div', classNames: ['number'], children: [
                    createElement({ name: 'div', classNames: ['binary'], text: `${colatz.nBin}` }),
                    createElement({ name: 'div', classNames: ['value'], text: `(${colatz.n})` }),
                ]
            }),
            createElement({
                name: 'div', classNames: ['number'], children: [
                    createElement({ name: 'div', classNames: ['binary'], text: `${colatz.tnBin}` }),
                    createElement({ name: 'div', classNames: ['value'], text: `(${colatz.tn})` }),
                ]
            }),
            createElement({
                name: 'div', classNames: ['number'], children: [
                    createElement({ name: 'div', classNames: ['binary'], text: `${colatz.tnoneBin}` }),
                    createElement({ name: 'div', classNames: ['value'], text: `(${colatz.tnone})` }),
                ]
            }),
            createElement({
                name: 'div', classNames: ['number', 'next'], children: [
                    createElement({ name: 'div', classNames: ['binary'], text: `${colatz.nextBin}` }),
                    createElement({ name: 'div', classNames: ['value'], text: `(${colatz.next})` }),
                ]
            }),
        ]
    })
}

const addColatzs = (n, parent) => {
    let value = n;
    let count = 0;
    const countZone = createElement({ name: 'p', classNames: ['count'], parent })

    while (value !== 1 || isNaN(value)) {
        const colatz = getColatz(value);
        addColatz(colatz, parent);
        value = colatz.next;
        count += 1;
    }

    countZone.textContent = `Count : ${count}`;
}

const updateInput = (input, value) => {
    if (input.value !== value) {
        input.value = value;
    }
}

const getInputValue = (input) => input.value;

const start = () => {
    addStyle('.colatzItem { width: 100%; padding-bottom: 15px; }')
    addStyle('.number { display: block; }')
    addStyle('.binary { display: inline-block; width: 30em; text-align: right; padding: 0 1em; background-color: #ee6; }')
    addStyle('.value { display: inline-block; padding: 0 0.5em; }')
    addStyle('.input { margin-bottom: 15px; }')
    addStyle('.next > * { font-weight : bold; }')
    let inputDec;
    let inputBin;
    createElement({
        name: 'div', classNames: ['inputs'], parent: document.body, children: [
            createElement({
                name: 'div', classNames: ['inputZone'], children: [
                    createElement({ name: 'input', classNames: ['input'], onCreated: (element) => { inputDec = element; } }),
                ]
            }),
            createElement({
                name: 'div', classNames: ['inputZone'], children: [
                    createElement({ name: 'input', classNames: ['input'], onCreated: (element) => { inputBin = element; } }),
                ]
            }),
        ]
    })
    const workspace = createElement({ name: 'div', parent: document.body, classNames: ['workspace'] });

    const updateInputDec = (value) => updateInput(inputDec, value)
    const updateInputBin = (value) => updateInput(inputBin, value)
    const getInputDec = () => getInputValue(inputDec)
    const getInputBin = () => getInputValue(inputBin)

    let n = 0;
    const run = () => {
        workspace.innerHTML = '';
        addColatzs(n, workspace);
    }

    const onHashChanged = () => {
        const hash = getCurrentLocationHash()
        const value = hash * 1;
        if (!isNaN(value)) {
            n = value;
            const binary = getBinary(n);
            updateInputDec(`${n}`)
            updateInputBin(binary)
            run();
        }
    }

    const setHash = (value) => {
        setLocationHash(`${value}`)
        onHashChanged()
    }

    inputDec.addEventListener('input', () => {
        const value = getInputDec() * 1;
        if (!isNaN(value)) {
            n = value;
            setHash(n)
        }
    })

    inputBin.addEventListener('input', () => {
        n = getDec(getInputBin())
        setHash(n)
    })

    if (getCurrentLocationHash()==='') {
        setLocationHash('27')
    }

    setHashChanged(onHashChanged)
    onHashChanged()
}

readyPromise.then(start);
