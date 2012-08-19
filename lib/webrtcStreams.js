var SimplePeerConnections = require("./simplePeerConnections")
    , DiscoveryNetwork = require("discovery-network")
    , WebRTCNetwork = DiscoveryNetwork.WebRTCNetwork
    , PeerNetwork = DiscoveryNetwork.PeerNetwork
    , EventEmitter = require("events").EventEmitter
    , log = require("./log")

module.exports = WebRTCStreams

function WebRTCStreams(conn, name, mediaStream, callback) {
    var pcs = SimplePeerConnections(mediaStream)
        , peerNetwork = PeerNetwork(conn, name + "/peer")
        , webrtcNetwork = WebRTCNetwork(conn, name + "/webrtc")
        , streams = new EventEmitter()

    // when you detect a new peer joining, open a PC to them
    peerNetwork.on("peer", handlePeer)

    // incoming offer from another peer
    webrtcNetwork.on("offer", handleOffer)

    // incoming answers from another peer
    webrtcNetwork.on("answer", pcs.handleAnswer)

    // incoming candidates from another peer
    webrtcNetwork.on("candidate", pcs.handleCandidate)

    // outgoing candidates to another peer
    pcs.on("candidate", webrtcNetwork.sendCandidate)

    // render streams from pcs
    pcs.on("stream", callback)

    peerNetwork.join()

    streams.pcs = pcs
    streams.streams = pcs.streams
    streams.peerNetwork = peerNetwork
    streams.webrtcNetwork = webrtcNetwork
    streams.destroy = destroy

    return streams


    function handlePeer(remotePeerId) {
        log.info("handlePeer", remotePeerId)
        var offer = pcs.create(remotePeerId)

        webrtcNetwork.sendOffer(remotePeerId, offer)
    }

    function handleOffer(remotePeerId, offer) {
        log.info("handleOffer", arguments)
        var answer = pcs.create(remotePeerId, offer)

        webrtcNetwork.sendAnswer(remotePeerId, answer)
    }

    function destroy() {
        pcs.destroy()
        peerNetwork.destroy()
        webrtcNetwork.destroy()

        streams.emit("close")
    }
}