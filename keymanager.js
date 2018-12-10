(function(){
    let window = this;

    class Config {
        log() {
            console.log(JSON.stringify(this));
        }
    }

    class KeyManager {
        constructor(config) {
            config = config || {};
            this._config = new Config();
            for (let key in config) {
                this._config[key] = config[key];
            }
            this._action = null;
            window.keyManagers = window.keyManagers || [];
            window.keyManagers.push(this);
            this.setCurrent();
            this._keys = {}
        }
    
        get config() {
            return this._config;
        }
    
        get action() {
            return this._action;
        }

        setCurrent() {
            window.keyManager = this;
            window.config = this.config;
            if (this.action === null) {
                window.action = this.action;
            } else {
                window.action = (params) => this._doaction(params);
            }
        }
    
        add(key, modifier) {
            this._keys[key] = this._keys[key]||[];
            this._keys[key].push(modifier);
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
    
        _doaction(params) {
            params = params || {};
            for (let param in params) {
                this.config[param] = params[param];
            }
            if (this.action) {
                this.action(this.config);
            }
        }
        
        setAction(action) {
            this._action = action;
            window.action = (params) => this._doaction(params);
            this._doaction();
            document.addEventListener("keydown", e => {
                // console.log('on key', e.key, this.config);
                if (this._onKey(e.key)) {
                    // console.log('do action', this.config);
                    this._doaction();
                    // console.log('action done', this.config);
                }
            });
            return this;
        }
    };

    window.KeyManager = KeyManager;
})(this);
