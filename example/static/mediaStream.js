var getUserMedia = window.navigator.getUserMedia ||
        window.navigator.webkitGetUserMedia
    , URL = window.URL || window.webkitURL

module.exports = {
    local: LocalMediaStream
    , remote: RemoteMediaStream
}

function LocalMediaStream(videoElem, callback) {
    console.log("LocalMediaStream", arguments)
    return getUserMedia.call(navigator, {
        video: true
        , audio: true
    }, function (stream) {
        videoElem.src = URL.createObjectURL(stream)
        callback(stream)
    })
}

function RemoteMediaStream(videoElem, stream) {
    console.log("RemoteMediaStream", arguments)
    videoElem.src = URL.createObjectURL(stream)
}