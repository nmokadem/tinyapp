const express = require("express");
const bodyParser = require("body-parser");
//const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');

const { generateRandomString, urlsForUser, getUserByEmail } = require('./helpers');
const { PORT, urlDatabase, users, alerts } = require('./setup');
const app = express();

let userId = "";
let alert = "";
let statistics = {};

app.set("view engine", "ejs");



//*******************************************************************
// middlewares
//*******************************************************************

app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession(
  {name : 'session',
    keys : ['key1', 'key2'],
  //maxAge : 5 * 60 *1000    //24 * 60 * 60 * 1000 // 24 hours
  }
));

//app.use(morgan('combined'));
app.use(morgan('dev'));

// Middleware to be used for HTTP DELETE and PUT
//app.use(methodOverride('X-HTTP-Method-Override'));
//app.use(methodOverride('_method'));  // this works fine with delete but not put
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}));

// Just to view that this is a middleware
app.use((req, res, next) => {
  //console.log('You are going through a midleware');
  //console.log(users);
  //console.log(urlDatabase);

console.log(`Statistics : ${req.method} ${req.originalUrl}`);

  if (statistics[req.method][req.originalUrl]) {
    statistics[req.method][req.originalUrl].count += 1;
  } else {
    statistics[req.method][req.originalUrl].count = 1;
  }
  next();
});


//*******************************************************************
// Functions to be separated in a different module
//*******************************************************************

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

const getUserFromCookie = (req, res) => {
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

const checkPermissionForURL = function(req,shortURL) {
  alert = '';
  let user = getUserFromCookie(req);

  if (!user['email']) {
    alert = "Action Denied! Please login first then try again!";
  }

  if (user.id !== urlDatabase[shortURL].userID) {
    alert = "Action Denied! This record does not belong to you!";
  }

  return alert;
};

const routeURLHelper = function(req, res) {

  let email = '';
  let user = getUserFromCookie(req,res);

  email = user['email'];
  if (!email) {
    alert = "Action Denied! Please login first then try again!";
  }

  const templateVars = {
    userId,
    email,
    alert
  };

  return templateVars;
};


//*******************************************************************
// routers
//*******************************************************d************
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/registration", (req, res) => {
  let email = '';
  let password = '';
  let user = getUserFromCookie(req,res);

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
  const user = getUserFromCookie(req,res);

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

  if (alert) {
    res.status(400).send("Email already registered!");
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  let email = '';
  let user = getUserFromCookie(req,res);

  if (user['email']) {
    email = user['email'];
  }

  let urls = urlsForUser(user.id, urlDatabase);

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
  //const hashedPassword = bcrypt.hashSync(password, 10);

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

//router used to edit urls
app.put("/urls", (req, res) => {

  alert = "";
  let user = getUserFromCookie(req,res);

  let short_url = req.body.shortURL;
  let long_url = req.body.longURL;

  if (long_url) {   //URL not empty or else do nothing

    if (!short_url) {  //Add a new URL
      short_url = generateRandomString(6);
    }

    if (long_url.length > 5) {
      if (long_url.substring(0,4) !== 'http') {
        if (long_url.substr(0,3) !== 'www') {
          long_url = "www." + long_url;
        }
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

// router used to display new form for url
app.get("/urls/new", (req, res) => {
  let obj = {};
  obj = routeURLHelper(req, res);

  if (!obj.email) {   // user not logged in
    res.redirect("/login");
    return;
  }
  alert = "";
  res.render("urls_new", obj);
});

//router used to add urls
app.post("/urls", (req, res) => {

  alert = "";
  let user = getUserFromCookie(req,res);

  let short_url = req.body.shortURL;
  let long_url = req.body.longURL;

  if (long_url) {   //URL not empty or else do nothing

    if (!short_url) {  //Add a new URL
      short_url = generateRandomString(6);
    }

    if (long_url.length > 5) {
      if (long_url.substring(0,4) !== 'http') {
        if (long_url.substr(0,3) !== 'www') {
          long_url = "www." + long_url;
        }
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
  let obj = {};
  obj = routeURLHelper(req, res);

  if (!obj.email) {   // user not logged in
    res.redirect("/login");
    return;
  }
  alert = "";
  res.render("urls_new", obj);
});

// Router to edit a record from the database
app.get("/urls/:shortURL", (req, res) => {
  let obj = {};
  obj = routeURLHelper(req, res);

  if (!obj.email) {                   // user not logged in
    res.redirect("/login");
    return;
  }

  obj.shortURL = req.params.shortURL,
  obj.longURL  = urlDatabase[req.params.shortURL].longURL,

  alert = "";
  res.render("urls_show", obj);
});

// Router to delete a record from the database using method override
//? Need confirmation to delete
app.delete("/urls/:shortURL", (req, res) => {
  let user = getUserFromCookie(req, res);

  if (!user['id']) {
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
