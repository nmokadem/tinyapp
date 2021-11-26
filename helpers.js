/*
Generate a random string of a certain length to be used as a short url
Parmeters
  num is the length of the string
Return a random str of length num
*/
const generateRandomString = function(num) {
  let characters = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let str = "";
  for (let i = 0; i < num; i++) {
    str += characters[Math.floor(Math.random() * characters.length)];
  }
  return str;
};

/*
Parameters
  id : user id
  db : an object with all the urls
return The urls for the user
*/
const urlsForUser = function(id, db) {

  let thisObj = {};
  for (let shortURL in db) {
    if (id === db[shortURL].userID) {
      thisObj[shortURL] = db[shortURL];
    }
  }
  return thisObj;
};

// return an objec user
// input : email
// users : an object with all the users
const getUserByEmail = function(email, users) {
  const keys = Object.keys(users);
  for (let key of keys) {
    if (email === users[key].email) {
      return users[key];
    }
  }
  return {};
};

module.exports = { generateRandomString, urlsForUser, getUserByEmail };