var mqtt = require('mqtt');
var express = require('express')
const methodOverride = require("method-override");
var timeout = require('connect-timeout')
var helmet = require('helmet')
var app = express();
var sleep = require('system-sleep');

app.use(express.json({ limit: "300kb" }));
app.use(
  express.urlencoded({
    extended: false,
  })
);

// CORS
var corsMiddleware = function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*"); //replace localhost with actual host
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, PUT, PATCH, POST, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Requested-With, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  if ("OPTIONS" == req.method) {
    res.sendStatus(200);
  } else next();
};
app.use(corsMiddleware);
app.use(methodOverride("_method"));
app.use(helmet())
require("dotenv").config();

// app.use(timeout('5s'))
// app.use(haltOnTimedout)
function haltOnTimedout(req, res, next) {
  if (!req.timedout) next()
}

var options = {
  mqttClientId: "mqttjs_e9cf61b2",
  // username:"",
  // password:"",
  clean: true
};

//mqtt topic
var topicPrefix = `/sbase/`

/*{
   2 quite bad, operationa, 4 is infornational

 { "name": "pod1", "events": 1, "level": 3, "type": "MQTT", "status": "MQTT=1", "msg": "connected to MQTT" }
} */

function checkIsQueryValid(podName, location) {
  let nameSubStr = podName.substring(0, 3)
  let podNumber = podName.substring(3, podName.length + 1)
  console.log(nameSubStr, podNumber)
  if (podName != null && location != null && nameSubStr == 'pod' && parseInt(podNumber) >= 1 && parseInt(podNumber) <= 16)
    return true
  else return false
}

app.get('/api/v1/status', timeout('5s'), haltOnTimedout, async (req, res) => {
  var mqttClient = mqtt.connect(`mqtt://${process.env.HOST}`, options)
  const locationName = req.query.location
  const podName = req.query.name

  let statusTopic = topicPrefix + locationName + '/status'
  let pubTopic = topicPrefix + locationName + '/cmd'

  try {
    let isValid = checkIsQueryValid(podName, locationName)

    if (isValid == true) {
      mqttClient.on('connect', () => {
        mqttClient.subscribe(statusTopic)
        mqttClient.publish(pubTopic, JSON.stringify({ name: podName, STATUS: 1 }))
      })

      mqttClient.on('message', (topic, message) => {
        let encodedMsg = JSON.parse(message)
        if (topic == statusTopic && encodedMsg.name == podName, encodedMsg.type == 'status') {
          console.log(JSON.parse(message))
          res.status(200).send(JSON.parse(message))
        }

      })

      req.on("close", function () {
        // console.log('req.close is here')
        mqttClient.end();
      });

      req.on("end", function () {
        // console.log('req.end is here')
        mqttClient.end();
      });
    }

    else {
      mqttClient.on('connect', () => {
        mqttClient.subscribe(statusTopic)
        mqttClient.publish(pubTopic, JSON.stringify({ name: req.query.name, STATUS: 1 }))
      })
      res.status(400).send('Unexpected query. Please check the pod name and location.')
    }
  }

  catch (err) {
    res.status(500).send(err.message)
  }

})

app.get('/api/v1/network', timeout('5s'), haltOnTimedout, async (req, res) => {
  var mqttClient = mqtt.connect(`mqtt://${process.env.HOST}`, options)
  let locationName = req.query.location
  let podName = req.query.name

  let statusTopic = topicPrefix + locationName + '/status'
  let pubTopic = topicPrefix + locationName + '/cmd'

  try {
    let isValid = checkIsQueryValid(podName, locationName)

    if (isValid == true) {
      mqttClient.on('connect', () => {

        mqttClient.subscribe(statusTopic)
        mqttClient.publish(pubTopic, JSON.stringify({ name: req.query.name, NETWORK: 1 }))
      })

      mqttClient.on('message', (topic, message) => {

        res.status(200).send(JSON.parse(message))
        mqttClient.end()
      })
    }

    else {
      res.status(400).send('Unexpected query. Please check the pod name and location.')
    }
  }

  catch (err) {
    res.status(500).send(err.message)
  }
})

app.post('/api/v1/reset', async (req, res) => {
  var mqttClient = mqtt.connect(`mqtt://${process.env.HOST}`, options)

  let locationName = req.query.location
  let pubTopic = topicPrefix + locationName + '/cmd'

  try {
    mqttClient.on('connect', () => {

      mqttClient.publish(pubTopic, JSON.stringify({ name: req.query.name, RESET: 1 }))

      sleep(3500)
      res.status(200).send('ok')

      mqttClient.end()

    })
  }

  catch (err) {
    res.status(500).send(err.message)
  }
})

app.post('/api/v1/cmd', async (req, res) => {
  var mqttClient = mqtt.connect(`mqtt://${process.env.HOST}`, options)

  let locationName = req.query.location
  let pubTopic = topicPrefix + locationName + '/cmd'
  // let subTopic = topicPrefix + locationName + '/status'

  let cmds = req.body
  cmds.name = req.query.name

  try {
    let isValid = checkIsQueryValid(req.query.name, req.query.location)

    if (isValid == true) {
      mqttClient.on('connect', () => {
        // mqttClient.subscribe(subTopic)

        mqttClient.publish(pubTopic, JSON.stringify(cmds))

        res.status(200).send('ok')
        mqttClient.end()
      })
    }

    else {
      res.send('wrong query')
    }
  }

  catch (err) {
    res.status(500).send(err.message)
  }
})


app.listen(process.env.PORT, () => {
  console.log(`Server is up and running on port number ${process.env.PORT}...`);
});

