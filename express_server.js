const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();

const PORT = 8080;                                       // default port 8080

app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}


let alert = "";
const alerts =
{
  alert1 : "Username or email not found",
  alert2 : "Profile cannot be added. Dubplicate email",
  alert3 : "URL entered already exists!",
  alert4 : "URL cannot be empty!"
}

//*******************************************************************
// middlewares
//*******************************************************************

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());




//*******************************************************************
// Functions to be separated in a different module
//*******************************************************************
function generateRandomString(num) {
  let characters = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let str = "";
  for (let i = 0; i < num; i++){
    str += characters[Math.floor(Math.random() * characters.length)];
  }
  return str; 
}

const sendUserIdCookie = (res,user_Id, userId) => {
  if (userId) {
    res.cookie(user_Id, userId,
    {
      maxAge: 2 * 60 * 1000,  //24 * 60 * 60 * 1000, 
      httpOnly: true,
    });
  }
}

const getUserIdCookie = (req) => {
  userId = req.cookies['userId'];

  if (userId) {
    let keys = Object.keys(users);
    for (let key of keys) {
      if (users[key].id === userId || users[key].email === userId) {
        //console.log(users[key]);
        return users[key];
      }
    }
    userId = '';
  }
  return {};
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
  let user = getUserIdCookie(req);

  if (user.id) {
    userId = user.id;
    email = user.email;
    password = user.password;
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
  const user = getUserIdCookie(req);
  const user_id = user['id'];

  const userId = req.body.userId;
  const email = req.body.email;
  const password = req.body.password;
  const id = userId;

  if (userId && email && password) {

    let keys = Object.keys(users);
    for (let key of keys) {
      if (users[key].email === email && users[key.id !== userId]) {
        alert = "alert2";
        break;
      }
    }

    if (alert === "") {
      let thisObj = {
        id,
        email,
        password 
      }

      if (!user_id) {                            // new user
        users[userId] = thisObj;
        sendUserIdCookie(res,'userId', userId);  //set userId cookie
      }

      if (userId === user_id) {          // update details
        users[userId] = thisObj;
      }

      if (userId !== user_id) {
        delete users[user_id];           //delete old
        users[userId] = thisObj;         //update user

        res.clearCookie('user_id');      //delete old cookie
        sendUserIdCookie(res,'userId', userId);  //add new cookie
      }
    }
  }
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let email = '';
  let user = getUserIdCookie(req);
  if (user['email']) {
    email = user['email']
  }

  const templateVars = { 
    userId,
    email,
    alert, 
    urls: urlDatabase
  };
  alert = "";
  console.log(templateVars);

// console.log('=======================================');
// console.log('userId =====>',userId);
// console.log('----------------');
// console.log('users =====>',users);
// console.log('=======================================');
// console.log();
// console.log();


  res.render("urls_index", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  userId = '';
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  alert = "";
  let user = {};

  userId = req.body.userId;

  if (userId) {
    let keys = Object.keys(users);
    for (let key of keys) {
      if (users[key].id === userId || users[key].email === userId) {
        sendUserIdCookie(res,'userId', userId);
        user = users[key];
        break;
      } 
    }

    if (!user.id) {
      alert = "alert1";
    }
  }
//  console.log(user);
  res.redirect("/urls");
});

//router used to add or modify urls
app.post("/urls", (req, res) => {
  alert = "";
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
      if (urlDatabase[url] === long_url && url !== short_url){
        alert = "alert3";
        break;
      }
    }
    if (alert === "") {
      urlDatabase[short_url] = long_url;
    }
  } else {
    alert = "alert4";
  }

  res.redirect("/urls");
});


app.get("/urls/new", (req, res) => {
  let email = '';
  let user = getUserIdCookie(req);
  if (user['email']) {
    email = user['email'];
  }

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
  let user = getUserIdCookie(req);
  if (user['email']) {
    email = user['email']
  }

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
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
