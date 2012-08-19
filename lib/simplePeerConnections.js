var EventEmitter = require("events").EventEmitter
    , PeerConnection = require("./peerConnection")
    , forEach = require("iterators").forEachSync
    , log = require("./log")

module.exports = SimplePeerConnections

function SimplePeerConnections(myMediaStream) {
    var peerConnections = {}
        , streams = {}
        , pcs = new EventEmitter()

    pcs.create = create
    pcs.streams = streams
    pcs.handleCandidate = handleCandidate
    pcs.handleAnswer = handleAnswer
    pcs.destroy = destroy

    return pcs

    function create(remotePeerId, offer) {
        log.info("create", arguments)
        var pc = peerConnections[remotePeerId] = PeerConnection(myMediaStream)

        pc.on("candidate", pcs.emit.bind(pcs, "candidate", remotePeerId))

        if (offer) {
            pc.on("stream", handleStream)
            
            pc.receiveOffer(offer)
            
            return pc.createAnswer(offer)
        }

        return pc.createOffer()

        function handleStream(stream) {
            streams[remotePeerId] = stream

            pcs.emit("stream", remotePeerId, stream)
        }
    }

    function handleCandidate(remotePeerId, candidate) {
        log.silly("handleCandidate", arguments)
        var pc = peerConnections[remotePeerId]

        pc.receiveCandidate(candidate)
    }

    function handleAnswer(remotePeerId, answer) {
        log.info("handleAnswer", arguments)
        var pc = peerConnections[remotePeerId]

        pc.on("stream", handleStream)

        pc.receiveAnswer(answer)

        function handleStream(stream) {
            streams[remotePeerId] = stream

            pcs.emit("stream", remotePeerId, stream)
        }
    }

    function destroy() {
        forEach(peerConnections, close)

        pcs.emit("close")
    }

    function close(stream) {
        stream.close()
    }
}