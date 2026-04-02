module.exports = r => {
    try {
        return new Function("dataFolder", `return (${r})();`)(dataFolder);
    } catch (r) {
        return {
            error: r.message
        };
    }
};