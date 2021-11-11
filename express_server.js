const express = require("express");
const bodyParser = require("body-parser");
//const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const morgan = require('morgan');
const bcrypt = require('bcryptjs');

const app = express();

const PORT = 8080;                                       // default port 8080

app.set("view engine", "ejs");


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

let userId = "";
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

let alert = "";
const alerts =
{
  "alert1" : "Email or passwrord not found. Please Try Again!",
  "alert2" : "Profile cannot be added. Dubplicate emails",
  "alert3" : "URL entered already exists!",
  "alert4" : "URL cannot be empty!"
};

//*******************************************************************
// middlewares
//*******************************************************************

app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession(
  {name : 'session',
  keys : ['key1', 'key2'],
  //maxAge : 5 * 60 *1000    //24 * 60 * 60 * 1000 // 24 hours
  }));

//app.use(morgan('combined'));
app.use(morgan('dev'));

// Just to view that this is a middleware
app.use((req, res, next) => {
  console.log('You are going through a midleware');
  console.log(users);
  console.log(urlDatabase);
  next();
})


//*******************************************************************
// Functions to be separated in a different module
//*******************************************************************
const generateRandomString = function(num) {
  let characters = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let str = "";
  for (let i = 0; i < num; i++) {
    str += characters[Math.floor(Math.random() * characters.length)];
  }
  return str;
};

const sendCookie = (req, res, key, val) => {
  if (val) {
    req.session[key] = val;
    // res.cookie(key, val,
    //   {
    //     maxAge: 5 * 60 * 1000,  //24 * 60 * 60 * 1000,
    //     httpOnly: true,
    //   });
  }
};

const getCookie = (req, res) => {
  //userId = req.cookies['userId'];
  userId = req.session.userId;

  if (userId) {
    let keys = Object.keys(users);
    for (let key of keys) {
      if (users[key].id === userId || users[key].email === userId) {
        return users[key];
      }
    }
    userId = '';
  }
  return {};
};

const urlsForUser = function(id) {

  console.log ('================>',id);
  let thisObj = {};
  for (let shortURL in urlDatabase) {
    console.log("======>",urlDatabase[shortURL].userID);
    if (id === urlDatabase[shortURL].userID) {
      thisObj[shortURL] = urlDatabase[shortURL];
    }
  }
  console.log(thisObj);
  return thisObj;
};

const checkPermissionForURL = function(req,shortURL) {
  alert = '';
  let user = getCookie(req);

  if (!user['email']) {
    alert = "Action Denied! Please login first then try again!";
  }

  if (user[id] !== urlDatabase[shortURL].userID) {
    alert = "Action Denied! This record does not belong to you!";
  }

  return alert;
}
//*******************************************************************
// routers
//*******************************************************d************
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/registration", (req, res) => {
  let email = '';
  let password = '';
  let user = getCookie(req,res);

  if (user.id) {
    userId = user.id;
    email = user.email;
    //password = user.password;
  } else {
    userId = generateRandomString(12);
  }

  const templateVars = {
    userId,
    email,
    password,
    alert
  };
  res.render("registration", templateVars);
});

app.post("/registration", (req, res) => {

  alert = "";
  const user = getCookie(req,res);

  const userId = req.body.userId;
  const email = req.body.email;
  const password = req.body.password;

  const id = userId;

  if (userId && email && password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    let keys = Object.keys(users);
    for (let key of keys) {
      if (users[key].email === email && users[key].id !== user['id']) {
        alert = "alert2";
        break;
      }
    }

    if (alert === "") {
      let thisObj = {
        id,
        email,
        password : hashedPassword
      };

      if (!user['id']) {                            // new user
        users[userId] = thisObj;
        sendCookie(req, res,'userId', email);   //set userId cookie
      }

      if (userId === user['id']) {                  // update details
        users[userId] = thisObj;
        sendCookie(req, res,'userId', email);
      }

      if (userId !== user['id']) {
        delete users[user['id']];                 //delete old
        users[userId] = thisObj;                  //update users

        res.clearCookie('userId');                //delete old cookie
        sendCookie(req, res,'userId', email);          //add new cookie
      }
    }
  } else {
    alert = "Please Enter all required fields";
  }
console.log(users);
  if (alert) {
    res.status(400).send("Email already registered!");
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  let email = '';
  let user = getCookie(req,res);

  if (user['email']) {
    email = user['email'];
  }

  let urls = urlsForUser(user.id);

  if (Object.keys(urls).length === 0) {
    alert = "You have no URLs!";
    if (!email) {
      alert += " Please login first!";
    }
  }
  
  const templateVars = {
    userId,
    email,
    alert,
    urls
  };
  alert = "";

  res.render("urls_index", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  userId = '';
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  userId = '';
  let email = '';
  // alert = '';

  const templateVars = {
    userId,
    email,
    alert,
  };
  alert = '';
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  alert = "";
  let user = {};

  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);


  if (email && password) {
    let keys = Object.keys(users);
    for (let key of keys) {
      if (users[key].email === email && bcrypt.compareSync(password, users[key].password)) {
        sendCookie(req, res,'userId', email);
        user = users[key];
        break;
      }
    }

    if (!user.id) {
      alert = "alert1";
    }
  }
  if (alert) {
    res.status(400).send(alerts[alert]);
  } else {
    res.redirect("/urls");
  }
});

//router used to add or modify urls
app.post("/urls", (req, res) => {
  alert = "";
  let user = getCookie(req,res);

  let short_url = req.body.shortURL;
  let long_url = req.body.longURL;

  if (long_url) {   //URL not empty or else do nothing

    if (!short_url) {  //Add a new URL
      short_url = generateRandomString(6);
    }

    if (long_url.length > 5) {
      if (long_url.substring(0,4) !== 'http') {
        long_url = 'http://' + long_url;
      }
    }

    for (let url in urlDatabase) {
      if (urlDatabase[url] === long_url && url !== short_url) {
        alert = "alert3";
        break;
      }
    }

    if (alert === "") {
      let thisObj = {};
      thisObj.longURL = long_url;
      thisObj.userID = user['id'];   //userId;
      urlDatabase[short_url] = thisObj;
    }
  } else {
    alert = "alert4";
  }

  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  let email = '';
  let user = getCookie(req,res);

  if (!user['email']) {
    alert = "Action Denied! Please login first then try again!";
    res.redirect("/login");
    return;
  }

  email = user['email'];

  const templateVars = {
    userId,
    email,
    alert
  };
  res.render("urls_new", templateVars);
});

// Router to edit a record from the database
app.get("/urls/:shortURL", (req, res) => {
  let email = '';
  let user = getCookie(req, res);

  if (!user['email']) {
    alert = "Action Denied! Please login first then try again!";
    res.redirect("/login");
    return;
  }

  email = user['email'];

  const templateVars = {
    userId,
    email,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    alert
  };
  res.render("urls_show", templateVars);
});

// Router to delete a record from the database
app.post("/urls/:shortURL/delete", (req, res) => {

  let user = getCookie(req, res);

  if (!user['email']) {
    alert = "Action Denied! Please login first then try again!";
    res.redirect("/login");
    return;
  }

  const shortURL = req.params.shortURL;

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
