var express = require('express')
const methodOverride = require("method-override");
var app = express();
// const basicAuth = require("./auth/basicAuth")
const errorHandler = require("./auth/errorHandler");

app.use(express.json({ limit: "300kb" }));
app.use(
  express.urlencoded({
    extended: false,
  })
);

// app.use(basicAuth)
app.use(errorHandler)

// CORS
var corsMiddleware = function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*"); //replace localhost with actual host
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, PUT, PATCH, POST, DELETE"
  );
  // res.setHeader(
  //   "Access-Control-Allow-Headers",
  //   "Content-Type, X-Requested-With, Authorization"
  // );
  // res.setHeader("Access-Control-Allow-Credentials", true);
  if ("OPTIONS" == req.method) {
    res.sendStatus(200);
  } else next();
};
app.use(corsMiddleware);
app.use(methodOverride("_method"));

require("dotenv").config();

app.use('/api/v1/mqtt', require('./mqtt/mqttRoute'))

app.get('/api/v1', (req, res)=>{
  // to check if API is working
  res.send('This is Sbase API.')
})

app.listen(process.env.PORT, () => {
  console.log(`Server is up and running on port number ${process.env.PORT}...`);
});

