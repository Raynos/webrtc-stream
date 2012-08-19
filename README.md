# webrtc-stream 

Stream video and audio

## Example

See [example folder][1] for more details

``` js
var WebRTC = require("../../browser")
    , MediaStream = WebRTC.MediaStream
    , WebRTCStreams = WebRTC.WebRTCStreams
    , DiscoveryNetwork = require("discovery-network")
    , Connection = DiscoveryNetwork.Connection

var localVideo = document.getElementById("local-webrtc")
    , remoteVideos = document.getElementById("remote-videos")

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
```

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://github.com/Raynos/webrtc-stream/tree/master/example