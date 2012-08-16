var RTCPeerConnection = window.PeerConnection || window.webkitPeerConnection00
    , SERVER = "STUN stun.l.google.com:19302"
    , EventEmitter = require("events").EventEmitter
    , after = require("after")

module.exports = PeerConnection

function PeerConnection(stream) {
    var pc = new RTCPeerConnection(SERVER, onIceCandidate)
        , emitter = new EventEmitter()
        , candidates = []
        , offer
        , answer
        , candidateReady = false
        , sendOffer = after(2, offerReady)
        , sendAnswer = after(2, answerReady)

    pc.addStream(stream)

    pc.onaddstream = onRemoteStreamAdded

    emitter.createOffer = createOffer
    emitter.receiveOffer = receiveOffer
    emitter.createAnswer = createAnswer
    emitter.receiveAnswer = receiveAnswer

    return emitter

    function onIceCandidate(candidate) {
        console.log("onIceCandidate", candidate)
        if (candidate === null && candidateReady === false) {
            candidateReady = true
            sendOffer()
            sendAnswer()
            return
        }
        candidates.push(candidate)
    }

    function offerReady() {
        console.log("offerReady")
        emitter.emit("offer", offer, candidates)
    }

    function answerReady() {
        console.log("answerReady")
        emitter.emit("answer", answer, candidates)
    }

    function onRemoteStreamAdded(event) {
        console.log("onRemoteStreamAdded", event)
        emitter.emit("stream", event.stream)
    }

    function createOffer() {
        console.log("createOffer")
        offer = pc.createOffer({
            video: true
            , audio: true
        })

        pc.setLocalDescription(pc.SDP_OFFER, offer)
        pc.startIce()
        sendOffer()
    }

    function receiveOffer(offer, candidates) {
        console.log("receiveOffer", arguments)
        pc.setRemoteDescription(pc.SDP_OFFER, offer)

        candidates.forEach(addCandidate)
    }

    function addCandidate(candidate) {
        console.log("addCandidate", candidate)
        pc.processIceMessage(candidate)
    }

    function createAnswer(offer) {
        console.log("createAnswer", offer)
        answer = pc.createAnswer(offer.toSdp(), {
            video: true
            , audio: true
        })

        pc.setLocalDescription(pc.SDP_ANSWER, answer)
        pc.startIce()
        sendAnswer()
    }

    function receiveAnswer(answer, candidates) {
        console.log("receiveAnswer", answer)
        pc.setRemoteDescription(pc.SDP_ANSWER, answer)

        candidates.forEach(addCandidate)
    }
}