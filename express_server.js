const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur";
const hashedPassword = bcrypt.hashSync(password, 10);
var cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ["ham"],
}))

//require ejs and sets up views
app.set('view engine', 'ejs');

//setup cookie parser
app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));

// OBJECT DATABASE SECTION
// New Url database
var urlDatabase = {
  "b2xVn2": { userID: "UserRandomID", longURL: "http://www.lighthouselabs.ca", shortURL: "b2xVn2"},

  "9sm5xK": { userID: "userRandomID2", longURL: "http://www.google.com", shortURL: "9sm5xK" }

}
var saltRounds = 10;
//sets the number of rounds of hashing
var salt = bcrypt.genSaltSync(saltRounds);

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
  },
  "yves": {
    id: "yves",
    email: "yves@gmail.com",
    password: "test"
  }
}

const YvesPassword = bcrypt.hashSync("test", 10)

// HELPER FUNCTION SECTION
//variable to hold randomized string
generateRandomString(){
let rString = '0123456789abcdefghijklmnopqrstuvwxyz';
//function used to generate random 6 character string
    var result = '';
    for (var i = 6; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

function CompareIDtoEmail(email) {
  console.log("email submitted to function: :", email);
  for (let entry in users) {
    if (users[entry].email === email) {
      return entry;
    }
  }
  return "";
}

//   for (var test in users) {
//     ("users email in function: ", users[test].email);
//     if (users[test].email = email) {
//       return test;
//     }
//   }
//   console.log("found users id after for loop in function: ", users[test].email);

// }
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
// function used to find the links for a given user
function urlsForUser(id){
  let userLinks = {};
  for (let list in urlDatabase) {
    if (urlDatabase[list].userID === id) {
      userLinks[list] = urlDatabase[list];
    }
  }
  return userLinks;
  console.log(userLinks);
}

//function to check that the user is registered in the database
function checkUser(userID) {
  console.log("userID supplied to function :", userID);
  let isAUser = false;
  for (let usertest in users) {
    console.log(users[usertest].id);
    if (users[usertest].id === userID) {
     isAUser = true;
     console.log("Is a user end of loop: ", isAUser);
    }
  }
   return isAUser;
}

function PasswordCheck(userID, password){
  return bcrypt.compareSync(inputPassword, users[userID].password);
}

//REGISTER GET & POST SECTION
//renders register page on get request for this address
app.get("/register", (req, res) => {
    let templateVars = { urls: urlDatabase, shortURL: req.params.id, userdata: users[req.session.user_id]};
res.render(`urls_register.ejs`, templateVars);

});
// post reciever that registers a new user and initiates checks
app.post("/register", (req, res) => {
  var newUsersId = generateRandomString();
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
      console.log(req.body.password);
        users[newUsersId] = {
        id:       newUsersId,
        email:    req.body.email,
        password: bcrypt.hashSync(req.body.password, salt),
        };
        console.log("users after register: " , users);
        //adds new user to cookie
        req.session.user_id = newUsersId;
        res.redirect("/urls");
        }
});

//LOGOUT POST SECTION - recieves query for logout and deletes cookie
app.post("/logout", (req, res)=>{
  // req.session.user_id = null;
  // req.session("user_id", "", { expires: new Date(0)});
  req.session = null;
  res.redirect(`/urls`);
});

// LOGIN POST AND GET SECTION
// renders login page
app.get("/login", (req, res) =>{
  console.log("Req Session :", req.session.user_id);
  if (req.session.user_id === undefined){
    res.render("urls_login");
  } else {
    let templateVars = { urlList: urlsForUser(req.session.user_id), userinfo: users[req.session.user_id] };
    res.redirect("/urls");
  }
});
// login checked and working
app.post("/login", (req, res) => {
  var userEmail = req.body.email;
  var password = req.body.password;
  let userID ="";
   userID = CompareIDtoEmail(req.body.email);
  console.log("UserID :", userID, "password: ", req.body.password, "user email : ", req.body.email);
  if (!req.body.email | !req.body.password) {
    res.status(400);
    res.send("Error. Must enter a valid email and password.");
  } else if (!checkRegisteredUserEmail(userEmail)) {
    res.status(403);
    res.send("Error. That email is not registered.");
  } else if (passwordCheck(userID, password)){
    res.status(403);
    res.send("Uh oh The gnomes behind the scenes have checked our lists and your password does not match!");
  } else {
    console.log(req.session.user_id);
    req.session.user_id = userID;
    res.redirect("/urls");
  }

});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);

});

// Deletes a URL from database if it is the users link
app.post("/urls/:id/delete", (req, res) => {


  console.log("req.session: ", req.session.user_id);
  if ((urlDatabase[req.params.id].userID !== req.session.user_id) || (!req.session.user_id)) {
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
  let shortURL = generateRandomString();
  console.log("urlDatabase before: ", urlDatabase);
  urlDatabase[shortURL] = { "userID": req.session.user_id,
                          "longURL": req.body.longURL,
                          "shortURL": shortURL }
  console.log("urlDatabase after: ", urlDatabase)
  console.log("long url: ", urlDatabase[shortURL].longURL);
  res.send("What a beauty! Your new short URL: is http//localhost:8080/u");
});

// on a get request at /urls/new - render urls_new.ejs file and displays it for user
app.get("/urls/new", (req, res) => {
  console.log(req.session.user_id);
  if (req.session.user_id === undefined){
    res.redirect("/login");
  } else {
  let templateVars = { shortURL: req.params.id, urls : urlDatabase, urlList: urlsForUser(req.session.user_id), userinfo: users[req.session.user_id] };;
    res.render("urls_new", templateVars);
  }
});

//displays the ejs file urls_show when the url entered is a key value in th urlDatabase
app.get("/urls/:id", (req, res) => {
  console.log(urlDatabase[req.params.id].userID);
   if ((urlDatabase[req.params.id].userID !== req.session.user_id) || (!req.session.user_id)) {
    res.redirect("/urls");
  } else {
  let templateVars = { shortURL: req.params.id, urls : urlDatabase, urlList: urlsForUser(req.session.user_id), userinfo: users[req.session.user_id] };;
  res.render("urls_show", templateVars);
}

});

//main url list page - makes you login or register to view

//make logic sit here not on index page
app.get("/urls", (req, res) => {
  if (!req.session.user_id){
    res.status(403);
    res.send("Sorry Bub. You need to <a href=\"/login\">login  </a> or <a href=\"/register\">register  </a> to view your URLs.");
    return;
  } else {
    var newDataBase = {};
    var newDataBase = urlsForUser(req.session.user_id);
    console.log(newDataBase);
    let templateVars = {url: newDataBase , userinfo: users[req.session.user_id] };
    res.render("urls_index", templateVars);
  }
});
//   if (CheckUser(req.session.user_id)) {
//
//     res.render("urls_index", templateVars);
//

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
app.get("/u/:id", (req, res) => {

  // let longURL = urlDatabase[rString].longURL;
  console.log("longURL:", urlDatabase[req.session.user_id].longURL);
   let longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});