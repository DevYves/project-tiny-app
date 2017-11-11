


const bcrypt = require('bcrypt');

let password = "rubberduck";
let saltRounds = 10;

var salt = bcrypt.genSaltSync(saltRounds);

var hash = bcrypt.hashSync(password, salt);

console.log(hash);

if (bcrypt.compareSync(password, hash)) {
  console.log("The password is a match!");
} else {
  console.log("You suck at passwords.");
}