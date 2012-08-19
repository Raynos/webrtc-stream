var browserifyServer = require("browserify-server")

var server = browserifyServer.listen(__dirname, 8080)

console.log("running on port 8080")