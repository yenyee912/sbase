var mqtt = require('mqtt');
var express = require('express')
const methodOverride = require("method-override");

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
require("dotenv").config();

var options = {
  clientId: "mqttjs_e9cf61b2",
  // username:"",
  // password:"",
  clean: true
};

//mqtt topic
var topicPrefix = `/sbase/`

app.get('/api/v1/status', async (req, res) => {
  var client = mqtt.connect(`mqtt://${process.env.HOST}`, options)
  let locationName = req.query.location

  let statusTopic = topicPrefix + locationName + '/status'
  let pubTopic = topicPrefix + locationName + '/cmd'

  try {
    client.on('connect', () => {

      client.subscribe(statusTopic)
      client.publish(pubTopic, JSON.stringify({ name: req.query.name, STATUS: 1 }))
    })

    client.on('message', (topic, message) => {

      res.status(200).send(JSON.parse(message))
      client.end()
    })
  }

  catch (err) {
    console.log(err.message)
  }

})

app.get('/api/v1/network', async (req, res) => {
  var client = mqtt.connect(`mqtt://${process.env.HOST}`, options)
  let locationName = req.query.location

  let statusTopic = topicPrefix + locationName + '/status'
  let pubTopic = topicPrefix + locationName + '/cmd'

  try {
    client.on('connect', () => {

      client.subscribe(statusTopic)
      client.publish(pubTopic, JSON.stringify({ name: req.query.name, NETWORK: 1 }))
    })

    client.on('message', (topic, message) => {

      res.status(200).send(JSON.parse(message))
      client.end()
    })
  }

  catch (err) {
    console.log(err.message)
  }
})

app.post('/api/v1/reset', async (req, res) => {
  var client = mqtt.connect(`mqtt://${process.env.HOST}`, options)

  let locationName = req.query.location
  let pubTopic = topicPrefix + locationName + '/cmd'

  try {
    client.on('connect', () => {

      client.publish(pubTopic, JSON.stringify({ name: req.query.name, RESET: 1 }))

      sleep(1000)
      res.send('ok')

      client.end()

    })
  }

  catch (err) {
    console.log(err.message)
  }
})

app.post('/api/v1/cmd', async (req, res) => {
  var client = mqtt.connect(`mqtt://${process.env.HOST}`, options)

  let locationName = req.query.location
  let pubTopic = topicPrefix + locationName + '/cmd'
  let subTopic = topicPrefix + locationName + '/status'

  let cmds = req.body
  cmds.name = req.query.name

  try {
    client.on('connect', () => {
      client.subscribe(subTopic)

      client.publish(pubTopic, JSON.stringify(cmds))

      res.send('ok')
      client.end()
    })
  }

  catch (err) {
    console.log(err.message)
  }
})


app.listen(process.env.PORT, () => {
  console.log(`Server is up and running on port number ${process.env.PORT}...`);
});

