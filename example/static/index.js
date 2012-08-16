var MediaStream = require("./mediaStream")
    , PeerConnection = require("./peerConnection")
    , DiscoveryNetwork = require("./discoveryNetwork")
    , reconnect = require("reconnect/shoe")

var localVideo = document.getElementById("local-webrtc")
    , remoteVideo = document.getElementById("remote-webrtc")

MediaStream.local(localVideo, function (myMediaStream) {
    reconnect(networkConnection).connect('/shoe')

    function networkConnection(networkStream) {
        var network = DiscoveryNetwork(networkStream)
            , peerConnections = {}

        console.log("networkConnection")

        // when you detect a new peer joining, open a PC to them
        network.on("peer", handlePeer)

        // incoming offer from another peer
        network.on("offer", handleOffer)

        // incoming answers from another peer
        network.on("answer", handleAnswer)

        function handlePeer(remotePeerId) {
            console.log("handlePeer", remotePeerId)
            var pc = peerConnections[remotePeerId] =
                PeerConnection(myMediaStream)

            pc.on("offer", sendOfferOverNetwork)

            pc.createOffer()

            function sendOfferOverNetwork(offer, candidates) {
                console.log("sendOfferOverNetwork", arguments)
                network.sendOffer(remotePeerId, offer, candidates)
            }
        }

        function handleOffer(remotePeerId, offer, candidates) {
            console.log("handleOffer", arguments)
            var pc = PeerConnection(myMediaStream)

            pc.on("stream", onRemoteStream)

            pc.receiveOffer(offer, candidates)

            pc.on("answer", sendAnswerOverNetwork)
            
            pc.createAnswer(offer)

            function sendAnswerOverNetwork(answer, candidates) {
                console.log("sendAnswerOverNetwork", arguments)
                network.sendAnswer(remotePeerId, answer, candidates)
            }
        }

        function onRemoteStream(stream) {
            console.log("onRemoteStream", stream)
            MediaStream.remote(remoteVideo, stream)
        }

        function handleAnswer(remotePeerId, answer, candidates) {
            console.log("handleAnswer", arguments)
            var pc = peerConnections[remotePeerId]

            pc.on("stream", onRemoteStream)

            pc.receiveAnswer(answer, candidates)
        }
    }
})