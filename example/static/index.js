var WebRTC = require("../../browser")
    , MediaStream = WebRTC.MediaStream
    , WebRTCStreams = WebRTC.WebRTCStreams
    , DiscoveryNetwork = require("discovery-network")
    , Connection = DiscoveryNetwork.Connection

var localVideo = document.getElementById("local-webrtc")
    , remoteVideos = document.getElementById("remote-videos")

WebRTC.log.enabled = true
DiscoveryNetwork.log.enabled = true

MediaStream.local(localVideo, function (myMediaStream) {
    var conn = Connection("http://discoverynetwork.co/service")
        
    WebRTCStreams(conn, "mediaStreams-demo", myMediaStream, renderStream)

    function renderStream(remotePeerId, stream) {
        var remoteVideo = document.createElement("video")
        remoteVideo.autoplay = true
        remoteVideos.appendChild(remoteVideo)
        MediaStream.remote(remoteVideo, stream)
    }
})