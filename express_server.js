const express = require("express");
const bodyParser = require("body-parser");
//const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');
const fs = require('fs');

const { generateRandomString, urlsForUser, getUserByEmail } = require('./helpers');
let { PORT, urlDatabase, users, alerts } = require('./setup');
const app = express();

let userId = "";
let alert = "";
//let statistics = {};


//============================================================
//functions to read and write from file for users and URLs

//============================================================
// functions to read and write from file for users and URLs
//
// IIFE to read users rom files
( () => {
  fs.readFile('users.json', 'utf-8', (err, data) => {
    if (err) {
      throw err;
    }

    // Parse JSON object
    if (data.length) {               // data is not empty
      users = JSON.parse(data.toString());
    } else {
      let users =
        {
          "userRandomID": {
            "id": "userRandomID",
            "email": "user@example.com",
            "password": "purple-monkey-dinosaur"
          },
          "user2RandomID": {
            "id": "user2RandomID",
            "email": "user2@example.com",
            "password": "dishwasher-funk"
          }
        };
    }
  })
})();


//IIFE to read urls from files
( () => {
  fs.readFile('urls.json', 'utf-8', (err, data) => { 
    if (err) {
      throw err;
    }

    // Parse JSON object
    if (data.length) {               // data is not empty
      urlDatabase = JSON.parse(data.toString());
    } else {
      urlDatabase = {
        b6UTxQ: {
          longURL: "https://www.tsn.ca",
          userID: "aJ48lW"
        },
        i3BoGr: {
          longURL: "https://www.google.ca",
          userID: "aJ48lW"
        }
      };
    }
  })
})();


// Save Users to file
const saveUsers = () => {
  const data = JSON.stringify(users);
  fs.writeFile('users.json', data, (err) => {
    if (err) {
      throw err;
    }
  })
};


// Save URLs to file
const saveURLs = () => {
  const data = JSON.stringify(urlDatabase);
  fs.writeFile('urls.json', data, (err) => {
    if (err) {
      throw err;
    }
  })
};

//===========================================================

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
app.use(methodOverride(function(req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// Just to view that this is a middleware
app.use((req, res, next) => {
  //console.log('You are going through a midleware');
  //console.log(users);
  //console.log(urlDatabase);

  // console.log(`Statistics : ${req.method} ${req.originalUrl}`);

  // if (statistics[req.method][req.originalUrl]) {
  //   statistics[req.method][req.originalUrl].count += 1;
  // } else {
  //   statistics[req.method][req.originalUrl].count = 1;
  // }
  next();
});


//*******************************************************************
// Functions to be separated in a different module
//*******************************************************************

//clear cookies set by cookie-session
//Two cookies need to be clear 'session' and session.sig (cookie-session)
const clearCookies = (res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  userId = '';                          //reset the global userId
}

//create cookies set by cookie-session
// there will be two cookies session and session.sig (cookie-session)
const sendCookie = (req, res, key, val) => {
  if (val) {
    //clearCookies(res);
    req.session[key] = val;
    userId = val;
  }
};

const getUserFromCookie = (req) => {
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


const routeURLHelper = function(req, res) {

  let email = '';
  let user = getUserFromCookie(req);

  email = user['email'];
  if (!email) {
    alert = alerts["alert8"];
  }

  const templateVars = {
    userId,
    email,
    alert
  };

  return templateVars;
};


// Called from the routers PUT/POST of users
const postOrPutUser = (method, req, res) => {
  alert = "";
  let thisObj = {};

  const id = req.body.userId;
  const email = req.body.email;
  const password = req.body.password;

  // All fields are required
  if (id && email && password) {
    let keys = Object.keys(users);
    for (let key of keys) {
      if ((method === 'post' && users[key].email === email) ||
          (method === 'put' && users[key].email === email && users[key].id !== id)) {
        alert = alerts["alert2"];
        break;
      }
    }
    if (alert === "") {
      const hashedPassword = bcrypt.hashSync(password, 10);
      thisObj = {
        id,
        email,
        password : hashedPassword
      };

      //POST or PUT profile (no change of id so no need to delete first in case of an update)
      users[id] = thisObj;                        
      saveUsers();                                // Save to file
      sendCookie(req, res, 'userId', email);      //set new cookie
    }
  } else {
    alert = alerts["alert5"];
  }

  if (alert) {
    res.redirect("/registration");         //An error occured Restart the registration
  } else {
    res.redirect("/urls");
  }
};


// Called from the routers PUT/POST of URLs
const postOrPutURL = (method,req, res) => {
  alert = "";
  let user = getUserFromCookie(req);

  let shorturl = req.body.shortURL;
  let longurl = req.body.longURL;

  if (longurl) {   //URL not empty or else do nothing

    if (!shorturl) {  //Add a new URL
      shorturl = generateRandomString(6);
    }

    if (longurl.length > 5) {  //? what if it is shorter
      if (longurl.substring(0,4) !== 'http') {
        if (longurl.substr(0,3) !== 'www') {
          longurl = "www." + longurl;
        }
        longurl = 'http://' + longurl;
      }
    }

    for (let url in urlDatabase) {
      if ((method === "put" && urlDatabase[url].longURL === longurl && url !== shorturl) ||
         (method === "post" && urlDatabase[url].longURL === longurl)) {
        alert = alerts["alert3"];
        break;
      }
    }

    if (alert === "") {
      let thisObj = {};
      thisObj.longURL = longurl;
      thisObj.userID = user['id'];   //userId;
      urlDatabase[shorturl] = thisObj;
      saveURLs();
    }
  } else {
    alert = alerts["alert4"];
  }

  if (alert) {
    if (method === "post") {
      res.redirect("/urls/new");
    }
    if (method === "put") {
      res.redirect("/urls/"+shorturl);
    }
    return;
  }

  res.redirect("/urls");
};

//*******************************************************************
// routers
//*******************************************************************
//Home Router ==> redirect to /urls to list urls
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//==================================================================

// Router used to login
app.get("/login", (req, res) => {
  userId = '';
  const email = '';   // Global
  const password = '';
  // alert = '';

  const templateVars = {
    userId,
    email,
    password,
    alert
  };
  alert = '';
  res.render("login", templateVars);
});


// Router to validate email and password
app.post("/login", (req, res) => {
  alert = "";
  let user = {};

  let email = req.body.email;
  let password = req.body.password;

  if (email && password) {
    let keys = Object.keys(users);
    for (let key of keys) {
      if (users[key].email === email && bcrypt.compareSync(password, users[key].password)) {
        sendCookie(req, res, 'userId', email);
        user = users[key];
        break;
      }
    }

    if (Object.keys(user).length === 0) {      // check if user is an empty object
      alert = alerts["alert1"];
    }
  }

  if (alert) {
    res.redirect("/login");
    //res.status(400).send(alerts[alert]);
  } else {
    res.redirect("/urls");
  }
});


//Router used to log out 
app.post("/logout", (req, res) => {
  clearCookies(res);
  res.redirect("/urls");
});

//=========================================================================

//Router used to display either registration.ejs to edit a profile or
//                              registration_new.ejs to register a new profile
app.get("/registration", (req, res) => {
  let email = '';
  let password = '';
  let user = getUserFromCookie(req);

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

  if (email) {
    res.render("registration", templateVars);     //Edit existing profile
  } else {
    res.render("registration_new", templateVars); //Create new profile
  }
});


// router used to post/add a new profile
app.post("/registration", (req, res) => {
  postOrPutUser("post", req, res);
});

// router used to put/edit profile
app.put("/registration", (req, res) => {
  postOrPutUser("put", req, res);
});


// Routers for URLs
//=====================================================
//router used to display list of urls
app.get("/urls", (req, res) => {
  let email = '';
  let urls = {};

  let user = getUserFromCookie(req);

  if (user['email']) {
    email = user['email'];
    urls = urlsForUser(user.id, urlDatabase);
  }


  if (!email) {
    alert = alerts["alert7"];      //Login first
  } else if (Object.keys(urls).length === 0) {
    alert = alerts["alert6"];         //No urls found
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


//router used to edit urls
app.put("/urls", (req, res) => {
  postOrPutURL('put',req, res);
});

//router used to add urls
app.post("/urls", (req, res) => {
  postOrPutURL('post',req, res);
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


// Router used to edit a url record
app.get("/urls/:shortURL", (req, res) => {
  let obj = {};
  obj = routeURLHelper(req, res);

  // user not logged in (cannot happen in the current system)
  if (!obj.email) {
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
  let user = getUserFromCookie(req);

  if (!user['id']) {
    alert = alerts["alert8"];
    res.redirect("/login");
    return;
  }

  const shortURL = req.params.shortURL;

  delete urlDatabase[shortURL];
  saveURLs();

  res.redirect("/urls");
});


app.listen(process.env.PORT || PORT, () => {
  console.log(`TinyURLs app ==> listening on port ${PORT}!`);
});
