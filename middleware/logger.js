const { format } = require("date-fns")
const { v4: uuid } = require("uuid")
const fs = require("fs")
const fsPromises = require("fs").promises
const path = require("path")

const logEvents = async (message, logFileName) => {
  // Create new date and time instance
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss")
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`

  // 
  try {
    // Check if logs folder exists and create if not
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"))
    }
    // Create log file if it doesnt exists and add log inside file
    await fsPromises.appendFile(path.join(__dirname, "..", "logs",
      logFileName), logItem)
  } catch (error) {
    console.log(error)
  }
}

// Call logEvents and next()
const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log")
  console.log(`${req.method} ${req.path}`)
  next()
}

module.exports = { logEvents, logger }

