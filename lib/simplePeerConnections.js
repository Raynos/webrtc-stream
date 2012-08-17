var EventEmitter = require("events").EventEmitter
    , PeerConnection = require("./peerConnection")
    , log = require("./log")

module.exports = SimplePeerConnections

function SimplePeerConnections(myMediaStream) {
    var peerConnections = {}
        , pcs = new EventEmitter()

    pcs.create = create
    pcs.handleCandidate = handleCandidate
    pcs.handleAnswer = handleAnswer

    return pcs

    function create(remotePeerId, offer) {
        log.info("create", arguments)
        var pc
        if (offer) {
            pc = peerConnections[remotePeerId] = PeerConnection(myMediaStream)

            pc.on("stream", pcs.emit.bind(pcs, "stream", remotePeerId))
            pc.on("candidate", pcs.emit.bind(pcs, "candidate", remotePeerId))

            pc.receiveOffer(offer)
            
            return pc.createAnswer(offer)
        }

        pc = peerConnections[remotePeerId] = PeerConnection(myMediaStream)

        pc.on("candidate", pcs.emit.bind(pcs, "candidate", remotePeerId))

        return pc.createOffer()
    }

    function handleCandidate(remotePeerId, candidate) {
        log.silly("handleCandidate", arguments)
        var pc = peerConnections[remotePeerId]

        pc.receiveCandidate(candidate)
    }

    function handleAnswer(remotePeerId, answer) {
        log.info("handleAnswer", arguments)
        var pc = peerConnections[remotePeerId]

        pc.on("stream", pcs.emit.bind(pcs, "stream", remotePeerId))

        pc.receiveAnswer(answer)
    }
}