const PORT = 8080;             // default port 8080

let urlDatabase = {};
let users = {};

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
  "alert9" : "Action Denied! This URL does not belong to you!",
  "alertA" : "Record does not exist!",
  "alertB" : "Permission denied! You are not the owner of this URL"
};


module.exports = { PORT, urlDatabase, users, alerts };
//module.exports = { PORT, urlDatabase, users, alerts, saveURLs, saveUsers };