const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const HOST = 'localhost';

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let str = "";
  for (let i = 0; i < 6; i++){
    str += characters[Math.floor(Math.random() * characters.length)];
  }
  return str;
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


// A router to list all the urls in the database
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Router to add a new record
app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  let short_url = generateRandomString();
  let long_url = req.body.longURL;
  urlDatabase[short_url] = long_url;
  //console.log(urlDatabase);
  res.redirect("/urls");
});

// Router to display a form to add a new record
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Router to edit a record from the database
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = 
    { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL],
      host : HOST,
      port : PORT 
    };
  res.render("urls_show", templateVars);
  // let longURL = urlDatabase[req.params.shortURL];
  // res.redirect(longURL);
});

// Router to delete a record from the database
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Router to update a record from the database
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  //console.log('...............',shortURL,longURL);
  //console.log(req.body.longURL);
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
 
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });

// app.get("/hello", (req, res) => {
//   const templateVars = { greeting: 'Hello World!' };
//   res.render("hello_world", templateVars);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});