var express = require('express')
var router = express.Router()
var controller= require("./mqttController")

var timeout = require('connect-timeout')

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next()
}

router.get('/status', timeout('5s'), haltOnTimedout, controller.getPodStatus)

router.get('/network', timeout('5s'), haltOnTimedout, controller.getPodNetworkInfo)

router.post('/cmd', controller.sendHardwareCommand)

router.post('/reset', controller.resetPod)

module.exports= router