module.exports = code => {
    try {
        return eval(code);
    } catch (exception) {
        return {
            error: exception.message
        };
    }
};