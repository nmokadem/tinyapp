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


//*******************************************************************
// middlewares
//*******************************************************************

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());




//*******************************************************************
// Functions to be separated in a different module
//*******************************************************************
function generateRandomString() {
  let characters = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let str = "";
  for (let i = 0; i < 6; i++){
    str += characters[Math.floor(Math.random() * characters.length)];
  }
  return str; 
}

const sendUserIdCookie = (res,user_Id, userId) => {
  res.cookie(user_Id, userId,
  {
    maxAge: 2 * 60 * 1000,  //24 * 60 * 60 * 1000, 
    httpOnly: true,
  });
}

const getUserIdCookie = (req) => {
  return req.cookies['userId'];
}



//*******************************************************************
// routers
//*******************************************************d************
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  userId = getUserIdCookie(req);

  const templateVars = { 
    userId: req.cookies["userId"],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  userId = '';
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  userId = req.body.userId;
  if (userId) {
    sendUserIdCookie(res,'userId', userId);
  }
  res.redirect("/urls");
});

//router used to add or modify urls
app.post("/urls", (req, res) => {
  let short_url = req.body.shortURL;
  if (!short_url) {  //Add a new URL
    short_url = generateRandomString();
  }
  let long_url = req.body.longURL;
  if (long_url.length > 5) {
    if (long_url.substring(0,4) !== 'http') {
      long_url = 'http://' + long_url;
    }
    urlDatabase[short_url] = long_url;
  }
  res.redirect("/urls");
});


app.get("/urls/new", (req, res) => {
  const templateVars = { 
    userId
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    userId, 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_show", templateVars);
  // let longURL = urlDatabase[req.params.shortURL];
  // res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
