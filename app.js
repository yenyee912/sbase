var express = require('express')
const methodOverride = require("method-override");
var app = express();
// var sleep = require('system-sleep');
const basicAuth = require("./auth/basicAuth")
const errorHandler = require("./auth/errorHandler");

var mqttApi= require('./mqtt/mqttRoute')
var userApi= require('./users/userController')

app.use(express.json({ limit: "300kb" }));
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(basicAuth)
app.use(errorHandler)

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

// Set up mongoose connection
var mongoose = require('mongoose');
const mongoURI = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOSTNAME}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;

mongoose
  .connect(mongoURI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => console.log(`${process.env.MONGO_DB} connected`));
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.use('/api/v1/mqtt', mqttApi)
app.use('/api/v1/users', userApi)

app.get('/api/v1', (req, res)=>{
  res.send('sbase api.')
})

app.listen(process.env.PORT, () => {
  console.log(`Server is up and running on port number ${process.env.PORT}...`);
});

