// God damn
window.Buffer = require("buffer").Buffer

var Connection = require("./connection")
    , PeerNetwork = require("./peerNetwork")
    , WebRTCNetwork = require("./webRTCNetwork")
    , log = require("./log")

module.exports = {
    Connection: Connection
    , PeerNetwork: PeerNetwork
    , WebRTCNetwork: WebRTCNetwork
    , log: log
}