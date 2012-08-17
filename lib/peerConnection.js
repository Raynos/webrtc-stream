var RTCPeerConnection = window.PeerConnection || window.webkitPeerConnection00
    , SERVER = "STUN stun.l.google.com:19302"
    , EventEmitter = require("events").EventEmitter
    , log = require("./log")

module.exports = PeerConnection

function PeerConnection(stream) {
    var pc = new RTCPeerConnection(SERVER, onIceCandidate)
        , emitter = new EventEmitter()

    pc.addStream(stream)

    pc.onaddstream = onRemoteStreamAdded

    emitter.createOffer = createOffer
    emitter.receiveOffer = receiveOffer
    emitter.createAnswer = createAnswer
    emitter.receiveAnswer = receiveAnswer
    emitter.receiveCandidate = receiveCandidate

    return emitter

    function onIceCandidate(candidate) {
        log.silly("onIceCandidate", arguments)
        emitter.emit("candidate", candidate)
    }

    function onRemoteStreamAdded(event) {
        log.verbose("onRemoteStreamAdded", event)
        emitter.emit("stream", event.stream)
    }

    function createOffer() {
        log.info("createOffer")
        var offer = pc.createOffer({
            video: true
            , audio: true
        })

        pc.setLocalDescription(pc.SDP_OFFER, offer)
        pc.startIce()

        return offer
    }

    function receiveOffer(offer) {
        log.info("receiveOffer", arguments)
        pc.setRemoteDescription(pc.SDP_OFFER, offer)
    }

    function createAnswer(offer) {
        log.info("createAnswer", offer)
        var answer = pc.createAnswer(offer.toSdp(), {
            video: true
            , audio: true
        })

        pc.setLocalDescription(pc.SDP_ANSWER, answer)
        pc.startIce()

        return answer
    }

    function receiveAnswer(answer) {
        log.info("receiveAnswer", answer)
        pc.setRemoteDescription(pc.SDP_ANSWER, answer)
    }

    function receiveCandidate(candidate) {
        log.silly("receiveCandidate", candidate)
        pc.processIceMessage(candidate)
    }
}