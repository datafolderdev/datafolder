import {
    QyCD as r
} from "./QyCD.js";

class e extends r {
    stack = [];
    constructor(r) {
        super(r);
        for (let s of [ "dir", "indexDir", "file", "view", "triggerFile", "triggerFiles", "rpcFile", "rpcFiles", "queryFiles", "queryFilesMulti", "queryTree", "queryTreeMulti" ]) this[s] = (...r) => {
            return e = this, r = super[s].apply(this, r), e.stack.push(r), e;
            var e;
        };
    }
    run() {
        var r = this.stack;
        return this.stack = [], this.resetCurrentDir(), r;
    }
}

export {
    e as QyFetch
};