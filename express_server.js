const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
//require ejs
app.set('view engine', 'ejs');


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//database object holding key value pairs matching random generated keys to longform URLS
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"


};
//random string generator creates a new random 6 character string and
//sets it to variable rString
var rString = generateRandomString('0123456789abcdefghijklmnopqrstuvwxyz');

function generateRandomString(chars){
    var result = '';
    for (var i = 6; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

// gets urls_new.ejs file and displays it for user
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// takes the user input and puts it in our urlDatabase object
//matched up with a random generated key
app.post("/urls", (req, res) => {
  console.log(req.body.longURL);
  urlDatabase[rString] = req.body.longURL;
  res.redirect(`/urls/${rString}`);
});

//displays the ejs file urls_show when the url entered is a key value in th urlDatabase
app.get("/urls/:id", (req, res) => {
  let templateVars = { urls: urlDatabase, shortURL: req.params.id };
  res.render("urls_show", templateVars);
});

//pulls up the urls_index page when the user enters the /url domain
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//displays 'Hello' on page /
app.get("/", (req, res) => {
  res.end("Hello!");
});

// creates a simple hello html framework when the user navigates to /hello
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

//displays the port that the server is listening to on on the console.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//send the user to long form url when they have entered their token id after the /
app.get("/u/:shortURL", (req, res) => {
  let longURL = "http://" + urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

