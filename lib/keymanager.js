(function () {
    let window = this;

    const sleep = async (timeout) => new Promise((resolve, reject) => setTimeout(() => resolve(), timeout));

    class Config {
        log() {
            console.log(JSON.stringify(this));
        }
    }

    class KeyManager {
        constructor (config) {
            this._runningId = 0;
            config = config || {};
            this._config = new Config();
            for (let key in config) {
                this._config[key] = config[key];
            }
            this._action = null;
            window.keyManagers = window.keyManagers || [];
            window.keyManagers.push(this);
            this.setCurrent();
            this._keys = {};
            this._onResize = false;
            this._debug = false;
            this._registeredAction = (e) => this._doAction();
            this._config_to_run = null;
            this._doc = [];
            this.register();
            this._unlockTimeout = 200
        }

        get config() {
            return this._config;
        }

        get action() {
            return this._action;
        }

        set debug(value) {
            this._debug = value;
        }

        onResize(value) {
            value = value && true || false;
            if (value !== this._onResize) {
                if (value) {
                    window.addEventListener("resize", this._registeredAction);
                } else {
                    window.removeEventListener("resize", this._registeredAction);
                }
                this._onResize = value;
            }
            return this;
        }

        setCurrent() {
            window.keyManager = this;
            window.config = this.config;
            if (this.action === null) {
                window.action = this.action;
            } else {
                window.action = async (params) => this._doAction(params);
            }
        }

        add(key, modifier, description) {
            this._keys[key] = this._keys[key] || [];
            this._keys[key].push(modifier);
            this._doc.push({ key, modifier, description })
            return this;
        }

        _onKey(key) {
            let modifiers = this._keys[key];
            if (modifiers) {
                modifiers.forEach(modifier => modifier(this.config));
                return true;
            }
            return false;
        }

        async _doAction(params) {
            this._runningId += 1;
            const runningId = this._runningId
            params = params || {};
            for (let param in params) {
                this.config[param] = params[param];
            }
            this._config_to_run = { ...this.config }
            setTimeout(async () => await this._runAction(runningId), 1)
        }

        async _runAction(runningId) {
            if (this.action && this._config_to_run && runningId === this._runningId) {
                const startTime = (new Date()).getTime()
                let lastTick = 0;
                await this.action(this._config_to_run, this, { 
                    shouldContinue: async () => {
                        if (runningId !== this._runningId) {
                            return false;
                        }
                        const tick = (new Date()).getTime()-startTime;
                        const grut = Math.floor(tick / this._unlockTimeout);
                        if (grut > lastTick) {
                            lastTick = grut;
                            await sleep(1);
                        }
                        return true;
                    },
                });
            }
        }

        register() {
            window.action = async (params) => await this._doAction(params);
            document.addEventListener("keydown", async (e) => {
                let xCode = e.code;
                if (e.shiftKey) {
                    xCode = `Shift+${xCode}`;
                }
                if (e.altKey) {
                    xCode = `Alt+${xCode}`;
                }
                if (e.ctrlKey) {
                    xCode = `Ctrl+${xCode}`;
                }
                if (this._debug) {
                    console.log('on key', e.key, xCode, this.config);
                }
                if (this._onKey(e.key) || this._onKey(xCode)) {
                    if (this._debug) {
                        console.log('do action', this.config);
                    }
                    await this._doAction();
                    if (this._debug) {
                        console.log('action done', this.config);
                    }
                }
            });
        }

        get doc() {
            return this._doc.filter(doc => doc.description !== undefined).map(doc => `${doc.key} : ${doc.description}`).join('\n')
        }

        setAction(action) {
            this._action = action;
            this._doAction();
            return this;
        }
    };

    window.KeyManager = KeyManager;
})(this);
