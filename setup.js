const PORT = 8080;  // default port 8080

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users =
{
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
};

const alerts =
{
  "alert1" : "Email or passwrord not found. Please Try Again!",
  "alert2" : "Profile cannot be added. Dubplicate emails",
  "alert3" : "URL entered already exists!",
  "alert4" : "URL cannot be empty!"
};

module.exports = { PORT, urlDatabase, users, alerts };