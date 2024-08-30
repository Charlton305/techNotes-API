const { legEvents, logEvents } = require("./logger")

const errorHandler = (err, req, res, next) => {
  logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errLog.log")
  console.log(err.stack)

  // Check if status code is already set in res and add one if not
  const status = res.statusCode ? res.statusCode : 500 // Server error

  res.status(status)

  res.json({ message: err.message })
}

module.exports = errorHandler