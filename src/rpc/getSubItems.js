let h = new Error("No such dir");

module.exports = ({
    dirPath: e,
    dChangeId: a,
    fChangeId: d
}) => {
    var s, e = qyDB.dirP(e);
    return e ? (s = {}, a || d || (s.fullPathHash = e.fullPathHash), a != e.dChangeId && Object.assign(s, {
        subdirList: e.sortedSubdirList.map(e => e.name),
        dChangeId: e.dChangeId
    }), d != e.fChangeId && Object.assign(s, {
        fileList: e.sortedFileList.map(e => e.name),
        fChangeId: e.fChangeId
    }), s) : h;
};