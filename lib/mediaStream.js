var getUserMedia = window.navigator.getUserMedia ||
        window.navigator.webkitGetUserMedia
    , URL = window.URL || window.webkitURL
    , log = require("./log")

module.exports = {
    local: LocalMediaStream
    , remote: RemoteMediaStream
}

function LocalMediaStream(videoElem, callback) {
    log.verbose("LocalMediaStream", arguments)
    return getUserMedia.call(navigator, {
        video: true
        , audio: true
    }, function (stream) {
        videoElem.src = URL.createObjectURL(stream)
        callback(stream)
    })
}

function RemoteMediaStream(videoElem, mediaStream) {
    log.verbose("RemoteMediaStream", arguments)
    videoElem.src = URL.createObjectURL(mediaStream)
}