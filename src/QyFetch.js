let QyCD = require("./QyCD.js").QyCD;

class QyFetch extends QyCD {
    constructor(s) {
        super(s), Object.assign(this, {
            stack: []
        });
    }
    dir(s, e) {
        return this._push(super.dir(s, e));
    }
    indexDir(s, e, r) {
        return this._push(super.indexDir(s, e, r));
    }
    file(s, e) {
        return this._push(super.file(s, e));
    }
    view(s, e, r) {
        return this._push(super.view(s, e, r));
    }
    queryFiles(s, e, r, t, u) {
        return this._push(super.queryFiles(s, e, r, t, u));
    }
    queryFilesMulti(s, e, r, t) {
        return this._push(super.queryFilesMulti(s, e, r, t));
    }
    run() {
        var s = this.stack;
        return this.stack = [], this.resetCurrentDir(), s;
    }
    _push(s) {
        return this.stack.push(s), this;
    }
}

Object.assign(module.exports, {
    QyFetch: QyFetch
});