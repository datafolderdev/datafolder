import {
    QyCD as r
} from "./QyCD.js";

class e extends r {
    constructor(r) {
        super(r), Object.assign(this, {
            stack: []
        });
    }
    dir(r, e) {
        return u(this, super.dir(r, e));
    }
    indexDir(r, e, s) {
        return u(this, super.indexDir(r, e, s));
    }
    file(r, e) {
        return u(this, super.file(r, e));
    }
    view(r, e, s) {
        return u(this, super.view(r, e, s));
    }
    queryFiles(r, e, s, t, i) {
        return u(this, super.queryFiles(r, e, s, t, i));
    }
    queryFilesMulti(r, e, s, t) {
        return u(this, super.queryFilesMulti(r, e, s, t));
    }
    run() {
        var r = this.stack;
        return this.stack = [], this.resetCurrentDir(), r;
    }
}

function u(r, e) {
    return r.stack.push(e), r;
}

export {
    e as QyFetch
};