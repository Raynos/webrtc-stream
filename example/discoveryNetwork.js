var MuxDemux = require("mux-demux")
    , StreamRouter = require("stream-router")
    , Channel = require("multi-channel-mdm")

module.exports = DiscoveryNetwork

function DiscoveryNetwork(prefix) {
    prefix = prefix || "/discovery"

    var router = StreamRouter()

    router.addRoute(prefix, Channel())

    return handleStream

    function handleStream(stream) {
        var mx = MuxDemux(router)
        mx.pipe(stream).pipe(mx)
    }
}