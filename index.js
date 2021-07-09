var express = require("express");
var app = express();
require('dotenv').config();

var path = require("path");
var session = require("express-session");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret : process.env.session_secret,
    resave : false,
    saveUninitialized : true,
    maxAge : 3600000,
  })
)

var login = require("./routes/login");
app.use("/", login);

var main = require("./routes/main");
app.use("/board", main);


var port = 3000;
app.listen(port, function () {
  console.log("웹 서버 시작", port);
});








