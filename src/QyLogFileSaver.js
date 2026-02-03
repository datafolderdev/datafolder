let QyMessager = require("./QyMessager.js").QyMessager, getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions;

class QyLogFileSaver extends QyMessager {
    constructor(e, s) {
        super(e, "QyLogFileSaver_Worker.js", s = {
            ...getDefaultOptions("QyLogFileSaver"),
            ...s
        }, s, [ "switch" ], [ "save" ]);
    }
}

Object.assign(module.exports, {
    QyLogFileSaver: QyLogFileSaver
});