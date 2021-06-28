var database_uri = 'mongodb+srv://raenell:r43n311@raenellpractice.a0vow.mongodb.net/raenellPractice?retryWrites=true&w=majority'

// server.js
// where your node app starts

// init project
require('dotenv').config();
var express = require('express'), app = express();
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var shortid = require('shortid');
var app = express();
var port = process.env.PORT || 3000;

mongoose.connect(database_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/timestamp", function (req, res) {
  res.sendFile(__dirname + '/views/timestamp.html');
});

app.get("/requestHeaderParser", function (req, res) {
  res.sendFile(__dirname + '/views/requestHeaderParser.html');
});

app.get("/urlShortenerMicroservice", function (req, res) {
  res.sendFile(__dirname + '/views/urlShortenerMicroservice.html');
});

app.get("/exercise-tracker", function (req, res) {
  res.sendFile(__dirname + '/views/exercise-tracker.html');
});


// your first API endpoint...
app.get("/api/hello", function (req, res) {
  console.log({greeting: 'hello API'})
  res.json({greeting: 'hello API'});
});

app.get("/api", function(req, res) {
  var now = new Date()
  res.json({
    "unix": now.getTime(),
    "utc": now.toUTCString()
  });
});

//Header Request
app.get("/api/whoami", function(req, res) {
  res.json({
    // "value": Object.keys(req),
    "ipaddress": req.connection.remoteAddress,
    "language": req.headers["accept-language"],
    "software": req.headers["user-agent"],
    // "req-headers": req.headers

  })
})


//URL Shortener Service

//Build a schema and model to store saved URLS
var ShortURL = mongoose.model('ShortURL', new mongoose.Schema({
    short_url : String,
    original_url: String,
    suffix: String
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// POST /api/users gets JSON bodies
app.post("/api/shorturl/", (req, res) => {

  let client_requested_url = req.body.url;
  let suffix = shortid.generate();
  let newShortURL = suffix

  let newURL = new ShortURL({
    short_url: __dirname + "/api/shorturl/" + suffix,
    original_url: client_requested_url,
    suffix: suffix
  })

  newURL.save((err, doc) => {
    if (err) return console.error(err);
    res.json({
      "saved": true,
      "short_url": newURL.short_url,
      "original_url": newURL.original_url,
      "suffix": newURL.suffix
    })
  });
})

app.get("/api/shorturl/:suffix", (req, res) => {
  let userGeneratedSuffix = req.params.suffix;
  ShortURL.find({suffix: userGeneratedSuffix}).then(foundUrls => {
    let urlForRedirect = foundUrls[0];
    res.redirect(urlForRedirect.original_url);
  });
});


//Exercise tracker
var ExerciseUser = mongoose.model('exerciseUser', new mongoose.Schema({
    _id : String,
    username: {type:String, unique: true }
}));

app.post("/api/users", (req, res) => {
    console.log("Accessing post request");

    var mongooseGenerateID = mongoose.Types.ObjectId();
    console.log(mongooseGenerateID, " <= mongooseGerateID")
    let exerciseUser = new ExerciseUser({
      username: req.body.username,
      _id: mongooseGenerateID
    })
    console.log(exerciseUser, " <= exerciseUser")

    exerciseUser.save((err, doc) => {
      if (err) return console.error(err);
      console.log("About to save exercise user")
      res.json({
        "saved": true,
        "username": exerciseUser.username,
        "_id": exerciseUser["_id"]
      });
    });
  })


app.get("/api/users/", (req, res) => {
  ExerciseUser.find({}, (err, exerciseUsers) =>{

    res.json({
        users: exerciseUsers
    })
  });
});





//Timestamp
app.get("/api/:date_string", function (req, res) {
  let dateString = req.params.date_string;

  if (parseInt(dateString) > 10000) {
    let unixTime = new Date(parseInt(dateString));
    res.json({
      "unix": unixTime.getTime(),
      "utc": unixTime.toUTCString()
    })
  }

  let passedInValue = new Date(dateString);

  if (passedInValue == "Invalid Date") {
    res.json({"error" : "Invalid Date"});
  }else {
    res.json({
      "unix": passedInValue.getTime(),
      "utc": passedInValue.toUTCString()
    })
  }
});


// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
