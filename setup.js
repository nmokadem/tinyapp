const fs = require('fs');

const PORT = 8080;             // default port 8080


// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

let urlDatabase = {};
let users = {};

// let urlDatabase = {
//   b6UTxQ: {
//     longURL: "https://www.tsn.ca",
//     userID: "aJ48lW"
//   },
//   i3BoGr: {
//     longURL: "https://www.google.ca",
//     userID: "aJ48lW"
//   }
// };

// let users =
// {
//   "userRandomID": {
//     "id": "userRandomID",
//     "email": "user@example.com",
//     "password": "purple-monkey-dinosaur"
//   },
//   "user2RandomID": {
//     "id": "user2RandomID",
//     "email": "user2@example.com",
//     "password": "dishwasher-funk"
//   }
// };

const alerts =
{
  "alert1" : "Email or passwrord not found. Please Try Again!",
  "alert2" : "Profile cannot be added. Dubplicate emails!",
  "alert3" : "URL entered already exists!",
  "alert4" : "URL cannot be empty!",
  "alert5" : "Please Enter all required fields", 
  "alert6" : "No URLs found!",
  "alert7" : "Please Login/Register first.",
  "alert8" : "Action Denied! Please login first then try again!",
  "alert9" : "Action Denied! This URL does not belong to you!"
};


//============================================================
// functions to read and write from file for users and URLs
//
//IIFE to read users rom files
// ( () => {
//   fs.readFile('users.json', 'utf-8', (err, data) => {
//     if (err) {
//       throw err;
//     }

//     // Parse JSON object
//     if (data.length) {               // data is not empty
//       users = JSON.parse(data.toString());
//     } else {
//       let users =
//         {
//           "userRandomID": {
//             "id": "userRandomID",
//             "email": "user@example.com",
//             "password": "purple-monkey-dinosaur"
//           },
//           "user2RandomID": {
//             "id": "user2RandomID",
//             "email": "user2@example.com",
//             "password": "dishwasher-funk"
//           }
//         };
//     }
//   })
// })();


//IIFE to read urls from files
// ( () => {
//   fs.readFile('urls.json', 'utf-8', (err, data) => {
//     if (err) {
//       throw err;
//     }

//     // Parse JSON object
//     if (data.length) {               // data is not empty
//       urlDatabase = JSON.parse(data.toString());
//     } else {
//       urlDatabase = {
//         b6UTxQ: {
//           longURL: "https://www.tsn.ca",
//           userID: "aJ48lW"
//         },
//         i3BoGr: {
//           longURL: "https://www.google.ca",
//           userID: "aJ48lW"
//         }
//       };
//     }
//   })
// })();


// // Save Users to file
// const saveUsers = () => {
//   const data = JSON.stringify(users);
//   fs.writeFile('users.json', data, (err) => {
//     if (err) {
//       throw err;
//     }
//   })
// };


// // Save URLs to file
// const saveURLs = () => {
//   const data = JSON.stringify(urlDatabase);
//   fs.writeFile('urls.json', data, (err) => {
//     if (err) {
//       throw err;
//     }
//   })
// };


module.exports = { PORT, urlDatabase, users, alerts };
//module.exports = { PORT, urlDatabase, users, alerts, saveURLs, saveUsers };