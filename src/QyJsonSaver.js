let getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions, QySaver = require("./QySaver.js").QySaver;

class QyJsonSaver extends QySaver {
    constructor(e, r) {
        super(e, {
            ...getDefaultOptions("QyJsonSaver"),
            ...r
        });
    }
    processAfterLoad(e, r) {
        return JSON.parse(super.processAfterLoad(e, r));
    }
    processBeforeSave(e, r) {
        return super.processBeforeSave(JSON.stringify(e), r);
    }
}

Object.assign(module.exports, {
    QyJsonSaver: QyJsonSaver
});