const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

//require ejs and sets up views
app.set('view engine', 'ejs');

//setup cookie parser
app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));


// OBJECT DATABASE SECTION
//database object holding key value pairs matching random generated keys to longform URLS
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

}
// database of users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

// HELPER FUNCTION SECTION
//variable to hold randomized string
var rString = generateRandomString('0123456789abcdefghijklmnopqrstuvwxyz');


//function used to generate random 6 character string
function generateRandomString(chars){
    var result = '';
    for (var i = 6; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

function getUserID(email) {
  for (var test in users) {
    if (users[test].email === email) {
      return users[test].id;
    }
  }

}
// function used to check if an email has already been registered
function checkRegisteredUserEmail(email) {
  let isEmail = false;
  for (var test in users) {
    if (users[test].email === email){
      isEmail = true;
    }
  }
  return isEmail;
}

// function used to check if a password matches a specific email
function passwordCheck(email, password){
  let isPassword = false;
  for (var test in users) {
    if (users[test].email === email){
      if (users[test].password === password) {

      isPassword = true;
      }
    return isPassword;
    }
  }
}



//REGISTER GET & POST SECTION
//renders register page on get request for this address
app.get("/register", (req, res) => {
    let templateVars = { urls: urlDatabase, shortURL: req.params.id, userdata: users[req.cookies.user_id]};
res.render(`urls_register.ejs`, templateVars);

});
// post reciever that registers a new user and initiates checks
app.post("/register", (req, res) => {
  let newUsersId = rString;
  // Check that user inputed an email and password.
  if (!req.body.email | !req.body.password) {
    res.status(400);
    res.send("Please enter a password and email.");
  // Check that the email isn't already registered.
  } else if (checkRegisteredUserEmail(req.body.email)) {
    res.status(400);
    res.send("Woah...You are like totally already registered!");
  } else {
      //adds new registered user to object 'users'
      console.log("users before register: " , users);
        users[newUsersId] = {
        id:       newUsersId,
        email:    req.body.email,
        password: req.body.password,
        };
        console.log("users after register: " , users);
        //adds new user to cookie
        res.cookie("user_id", rString);
        res.redirect("/urls");
        }
});

//LOGOUT POST SECTION - recieves query for logout and deletes cookie
app.post("/logout", (req, res)=>{
  // req.cookies.user_id = null;
  res.cookie("user_id", "", { expires: new Date(0)});
  res.redirect(`/urls`);
});

// LOGIN POST AND GET SECTION
// renders login page
app.get("/login", (req, res) =>{
  let templateVars = { urls: urlDatabase, shortURL: req.params.id, userdata: users[req.cookies.user_id]};
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  console.log(req.body.email);
  if (!req.body.email | !req.body.password) {
    res.status(400);
    res.send("Error. Must enter a valid email and password.");
  } else if (!checkRegisteredUserEmail(req.body.email)) {
    res.status(403);
    res.send("Error. That email is not registered.");
  } else if (passwordCheck(req.body.email, req.body.password) == false) {
    res.status(403);
    res.send("Uh oh The gnomes behind the scenes have checked our lists and your password does not match!");
  } else {
    res.cookie("user_id", getUserID(req.body.email));
    res.redirect("/urls");
  }

});

// res.cookie(req.body)
// broke this link - it no longer redirects you to long url. NEed to fix this post request


app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);

});
//deletes item from database on button click


// Deletes a URL from database if it is the users link
app.post("/urls/:id/delete", (req, res) => {
  console.log("url database: ", urlDatabase[req.params.id].userID);
  console.log("req.cookies: ", req.cookies.user_id);
  if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
    res.status(403);
    res.send("Naughty Gnomes at it again! NO deleting other people's links please");
  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls"); // Sends user back to the URLs page after deletion.
  }
});
// takes the user input and puts it in our urlDatabase object
//matched up with a random generated key
app.post("/urls", (req, res) => {
  console.log(req.body.longURL);
  urlDatabase[rString] = req.body.longURL;
  res.redirect(`/urls/${rString}`);
});

// on a get request at /urls/new - render urls_new.ejs file and displays it for user
app.get("/urls/new", (req, res) => {
  console.log(req.cookies.user_id);
  if (req.cookies.user_id === undefined){
    res.redirect("/login");
  } else {
  let templateVars = { urls: urlDatabase, shortURL: req.params.id, userdata: users[req.cookies.user_id]};
    res.render("urls_new", templateVars);
  }
});

//displays the ejs file urls_show when the url entered is a key value in th urlDatabase
app.get("/urls/:id", (req, res) => {
  console.log(urlDatabase[req.params.id].userID )
   if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
    res.redirect("/urls");
  } else {
  let templateVars = { urls: urlDatabase, shortURL: req.params.id, userdata: users[req.cookies.user_id]};
  res.render("urls_show", templateVars);
}

});

//pulls up the urls_index page when the user enters the /url domain
app.get("/urls", (req, res) => {
  console.log(req.cookies, req.cookies.username);
  let templateVars = { urls: urlDatabase , user_id: req.cookies.user_id};
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
  console.log(longURL);
  res.redirect(longURL);
});

