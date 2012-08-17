// God damn
window.Buffer = require("buffer").Buffer

var MuxDemux = require("mux-demux")
    , RemoteEventEmitter = require("remote-events")
    , shoe = require("shoe")
    , EventEmitter = require("events").EventEmitter
    , SessionDescription = window.SessionDescription
    , IceCandidate = window.IceCandidate
    , uuid = require("node-uuid")
    , log = require("../../browser").log

    
module.exports = DiscoveryNetwork

function DiscoveryNetwork(networkName, stream) {
    if (typeof networkName !== "string") {
        stream = networkName
        networkName = null
    }

    networkName = networkName || "/discovery"

    var mx = MuxDemux()
        , selfId = uuid()
        , networkEmitter = new RemoteEventEmitter()

    stream.pipe(mx).pipe(stream)

    var echoChamberStream = mx.createStream(networkName + "/echo")
    echoChamberStream.pipe(networkEmitter.getStream()).pipe(echoChamberStream)

    return Network(networkEmitter, selfId)
}

function Network(emitter, localPeerId) {
    log.info("Network", arguments)
    var network = new EventEmitter()

    emitter.on("peer", onpeer)
    emitter.on("offer", onoffer)
    emitter.on("answer", onanswer)
    emitter.on("candidate", oncandidate)

    // Emit that you as a peer are connecting
    emitter.emit("peer", localPeerId)

    network.sendOffer = sendOffer
    network.sendAnswer = sendAnswer
    network.sendCandidate = sendCandidate

    return network

    function onpeer(remotePeerId) {
        log.info("onpeer", remotePeerId)
        if (remotePeerId !== localPeerId) {
            network.emit("peer", remotePeerId)
        }
    }

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
        emitter.emit("offer", remotePeerId, localPeerId, offer.toSdp())
    }

    function sendAnswer(remotePeerId, answer) {
        log.info("sendAnswer", arguments)

        emitter.emit("answer", remotePeerId, localPeerId, answer.toSdp())
    }

    function sendCandidate(remotePeerId, candidate) {
        log.silly("candidate", arguments)
        emitter.emit("candidate", remotePeerId, localPeerId, {
            label: candidate.label
            , candidate: candidate.toSdp()
        })
    }
}