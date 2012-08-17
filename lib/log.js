var EventEmitter = require("events").EventEmitter
    , log = new EventEmitter
    , slice = Array.prototype.slice

log.on("log", toConsole)
log.silly = emit("silly")
log.verbose = emit("verbose")
log.info = emit("info")
log.warn = emit("warn")
log.error = emit("error")

module.exports = log

function toConsole() {
    if (log.enabled) {
        console.log.apply(console, arguments)
    }
}

function emit(name) {
    return logger

    function logger() {
        var args = slice.call(arguments)
        args.unshift("log", name)
        log.emit.apply(log, args)
    }
}