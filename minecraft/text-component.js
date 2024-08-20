const log = require("../log");

/**
 * @param {*} value
 * @returns {string}
 */
function resolveObject(value) {
    if (typeof value === "string") {
        return resolveString(value);
    } else if (Array.isArray(value)) {
        return resolveArray(value);
    }
    const result = [];
    function text(value) {
        return value.text;
    }
    function translatable(value) {
        if (value.fallback !== null || value.fallback !== undefined)
            return value.fallback;
        return value.translate;
    }
    function keybind(value) {
        return value.keybind;
    }
    function process(value) {
        switch (value.type) {
            case "text":
                if (value.text)
                    return text(value);
                break;
            case "translatable":
                if (value.translate)
                    return translatable(value);
                break;
            case "keybind":
                if (value.keybind)
                    return keybind(value);
                break;
        }
        if (value.text)
            return text(value);
        if (value.translate)
            return translatable(value);
        if (value.keybind)
            return keybind(value);
        return "";
    }
    result.push(process(value));
    if (value.extra)
        result.push(resolveObject(value.extra));
    return result.join("");
}
/**
 * @param {[]} value
 * @returns {string}
 */
function resolveArray(value) {
    const result = [];
    for (const s of value) {
        result.push(resolveObject(s));
    }
    return result.join("");
}
/**
 * @param {string} value
 * @returns {string}
 */
function resolveString(value) {
    const result = [];
    let isEscaped = false;
    for (const c of value) {
        if (isEscaped) {
            isEscaped = false;
        } else if (c === "§") {
            isEscaped = true;
        } else {
            result.push(c);
        }
    }
    return result.join("");
}

module.exports = {
    /**
     * @param {*} value
     * @returns {string}
     */
    asString(value) {
        return resolveObject(value);
    }
}