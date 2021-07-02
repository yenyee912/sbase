var mqtt = require('mqtt');
var options = {
  // username:"",
  // password:"",
  clean: true
};

//mqtt topic
var topicPrefix = `/sbase/`

function checkIsQueryValid(podName, location) {
  if (podName != null && location != null) {
    let nameSubStr = podName.substring(0, 3)
    let podNumber = podName.substring(3, podName.length + 1)

    if (nameSubStr == 'pod' && parseInt(podNumber) >= 1 && parseInt(podNumber) <= 16) return true

    else return false
  }

  else return false
}

function publishEvent(podName, locationName){
  var mqttClient = mqtt.connect(`mqtt://${process.env.HOST}`, options)

  let eventTopic= topicPrefix+locationName+'/event'

  let errorMsg = {
    name: podName,
    events: 1,
    level: 4,
    type: "HTTP",
    status: '',
    msg: "Unexpected API query"
  }
  mqttClient.on('connect', () => {
    mqttClient.publish(eventTopic, JSON.stringify(errorMsg))
    mqttClient.end()
  })
}


exports.sendHardwareCommand = async (req, res) => {
  var mqttClient = mqtt.connect(`mqtt://${process.env.HOST}`, options)

  const locationName = req.query.location
  const podName = req.query.name

  let cmdTopic = topicPrefix + locationName + '/cmd'
  
  let commands = req.query
  commands.name = podName

  delete commands.location

  try {
    let isValid = checkIsQueryValid(podName, locationName)

    if (isValid == true) {
      mqttClient.on('connect', () => {
        mqttClient.publish(cmdTopic, JSON.stringify(commands))

        res.status(200).send(`Command sent.`)
        mqttClient.end()
      })
    }

    else {
      publishEvent(podName, locationName)
      res.status(400).send('Unexpected query. Please check the pod name and location.')
    }

    req.on("close", function () {
      // console.log('req.close is here')
      mqttClient.end();
    });

    req.on("end", function () {
      // console.log('req.end is here')
      mqttClient.end();
    });
  }

  catch (err) {
    res.status(500).send(err.message)
  }
}

exports.getPodStatus = async (req, res) => {
  var mqttClient = mqtt.connect(`mqtt://${process.env.HOST}`, options)
  const locationName = req.query.location
  const podName = req.query.name

  let statusTopic = topicPrefix + locationName + '/status'
  let cmdTopic = topicPrefix + locationName + '/cmd'

  try {
    let isValid = checkIsQueryValid(podName, locationName)

    if (isValid == true) {
      mqttClient.on('connect', () => {
        mqttClient.subscribe(statusTopic)
        mqttClient.publish(cmdTopic, JSON.stringify({ name: podName, STATUS: 1 }))
      })

      mqttClient.on('message', (topic, message) => {
        let encodedMsg = JSON.parse(message)
        if (topic == statusTopic && encodedMsg.name == podName, encodedMsg.type == 'status') {
          res.status(200).send(JSON.parse(message))
        }

      })
    }

    else {
      publishEvent(podName, locationName)
      res.status(400).send('Unexpected query. Please check the pod name and location.')
    }

    req.on("close", function () {
      // console.log('req.close is here')
      mqttClient.end();
    });

    req.on("end", function () {
      // console.log('req.end is here')
      mqttClient.end();
    });
  }

  catch (err) {
    res.status(500).send(err.message)
  }

}

exports.getPodNetworkInfo = async (req, res) => {
  var mqttClient = mqtt.connect(`mqtt://${process.env.HOST}`, options)
  const locationName = req.query.location
  const podName = req.query.name

  let statusTopic = topicPrefix + locationName + '/status' //network info is on status too
  let cmdTopic = topicPrefix + locationName + '/cmd'

  try {
    let isValid = checkIsQueryValid(podName, locationName)

    if (isValid == true) {
      mqttClient.on('connect', () => {

        mqttClient.subscribe(statusTopic)
        mqttClient.publish(cmdTopic, JSON.stringify({ name: podName, NETWORK: 1 }))
      })

      mqttClient.on('message', (topic, message) => {
        let encodedMsg = JSON.parse(message)
        if (topic == statusTopic && encodedMsg.name == podName, encodedMsg.type == 'network') {
          res.status(200).send(JSON.parse(message))
        }

      })
    }

    else {
      publishEvent(podName, locationName)
      res.status(400).send('Unexpected query. Please check the pod name and location.')
    }

    req.on("close", function () {
      console.log('ok close')
      mqttClient.end();
    });

    req.on("end", function () {
      console.log('ok end')
      mqttClient.end();
    });
  }

  catch (err) {
    res.status(500).send(err.message)
  }
}

exports.resetPod = async (req, res) => {
  var mqttClient = mqtt.connect(`mqtt://${process.env.HOST}`, options)

  const locationName = req.query.location
  const podName = req.query.name

  let cmdTopic = topicPrefix + locationName + '/cmd'

  try {
    let isValid = checkIsQueryValid(podName, locationName)

    if (isValid == true) {
      mqttClient.on('connect', () => {

        mqttClient.publish(cmdTopic, JSON.stringify({ name: podName, RESET: 1 }))

        res.status(200).send(`Command sent.`)

        mqttClient.end()
      })
    }

    else {
      publishEvent(podName, locationName)
      res.status(400).send('Unexpected query. Please check the pod name and location.')
    }

    req.on("close", function () {
      mqttClient.end();
    });

    req.on("end", function () {
      mqttClient.end();
    });
  }

  catch (err) {
    res.status(500).send(err.message)
  }
}