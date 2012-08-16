// God damn
window.Buffer = require("buffer").Buffer

var MuxDemux = require("mux-demux")
    , RemoteEventEmitter = require("remote-events")
    , EventEmitter = require("events").EventEmitter
    , SessionDescription = window.SessionDescription
    , IceCandidate = window.IceCandidate
    , uuid = require("node-uuid")

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

    var discoveryStream = mx.createStream(networkName)
    discoveryStream.pipe(networkEmitter.getStream()).pipe(discoveryStream)

    return Network(networkEmitter, selfId)
}

function Network(emitter, localPeerId) {
    console.log("Network", arguments)
    var network = new EventEmitter()

    emitter.on("peer.connected", onpeer)
    emitter.on("send.offer", onoffer)
    emitter.on("send.answer", onanswer)

    // Emit that you as a peer are connecting
    emitter.emit("peer.connected", localPeerId)

    network.sendOffer = sendOffer
    network.sendAnswer = sendAnswer

    return network

    function onpeer(remotePeerId) {
        console.log("onpeer", remotePeerId)
        if (remotePeerId !== localPeerId) {
            network.emit("peer", remotePeerId)
        }
    }

    function onoffer(toPeerId, fromPeerId, offer, candidates) {
        console.log("onoffer", arguments)
        if (toPeerId === localPeerId) {
            network.emit("offer", fromPeerId
                , new SessionDescription(offer)
                , candidates.map(deserializeCandidates))
        }
    }

    function onanswer(toPeerId, fromPeerId, answer, candidates) {
        console.log("onanswer", arguments)
        if (toPeerId === localPeerId) {
            network.emit("answer", fromPeerId
                , new SessionDescription(answer)
                , candidates.map(deserializeCandidates))
        }
    }

    function sendOffer(remotePeerId, offer, candidates) {
        console.log("sendOffer", arguments)
        // sending an offer
        emitter.emit("send.offer", remotePeerId, localPeerId, offer.toSdp()
            , candidates.map(serializeCandidate))
    }

    function sendAnswer(remotePeerId, answer, candidates) {
        console.log("sendAnswer", arguments)

        emitter.emit("send.answer", remotePeerId, localPeerId, answer.toSdp()
            , candidates.map(serializeCandidate))
    }
}

function serializeCandidate(candidate) {
    return {
        label: candidate.label
        , candidate: candidate.toSdp()
    }
}

function deserializeCandidates(candidate) {
    return new IceCandidate(candidate.label, candidate.candidate)
}