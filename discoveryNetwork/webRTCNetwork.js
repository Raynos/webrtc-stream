var RemoteEventEmitter = require("remote-events")
    , EventEmitter = require("events").EventEmitter
    , log = require("./log")
    , SessionDescription = window.SessionDescription
    , IceCandidate = window.IceCandidate

module.exports = WebRTCNetwork

function WebRTCNetwork(connection) {
    var mx = connection.mx
        , networkName = connection.networkName
        , localPeerId = connection.selfId
        , webrtcStream = mx.createStream(networkName + "/webrtc/echo")
        , webrtcEmitter = new RemoteEventEmitter()
        , network = new EventEmitter()

    webrtcStream.pipe(webrtcEmitter.getStream()).pipe(webrtcStream)
    
    webrtcEmitter.on("offer", onoffer)
    webrtcEmitter.on("answer", onanswer)
    webrtcEmitter.on("candidate", oncandidate)

    network.sendOffer = sendOffer
    network.sendAnswer = sendAnswer
    network.sendCandidate = sendCandidate

    network.identify = identify

    return network

    function onoffer(toPeerId, fromPeerId, offer) {
        log.verbose("onoffer", arguments)
        if (toPeerId === localPeerId) {
            network.emit("offer", fromPeerId, new SessionDescription(offer))
        }
    }

    function onanswer(toPeerId, fromPeerId, answer) {
        log.verbose("onanswer", arguments)
        if (toPeerId === localPeerId) {
            network.emit("answer", fromPeerId, new SessionDescription(answer))
        }
    }

    function oncandidate(toPeerId, fromPeerId, candidate) {
        log.silly("oncandidate", arguments)
        if (toPeerId === localPeerId) {
            network.emit("candidate", fromPeerId
                , new IceCandidate(candidate.label, candidate.candidate))
        }
    }

    function sendOffer(remotePeerId, offer) {
        log.info("sendOffer", arguments)
        // sending an offer
        webrtcEmitter.emit("offer", remotePeerId, localPeerId, offer.toSdp())
    }

    function sendAnswer(remotePeerId, answer) {
        log.info("sendAnswer", arguments)

        webrtcEmitter.emit("answer", remotePeerId, localPeerId, answer.toSdp())
    }

    function sendCandidate(remotePeerId, candidate) {
        log.silly("candidate", arguments)
        webrtcEmitter.emit("candidate", remotePeerId, localPeerId, {
            label: candidate.label
            , candidate: candidate.toSdp()
        })
    }

    function identify(user) {
        localPeerId = user.toString()
    }
}