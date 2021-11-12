const generateRandomString = function(num) {
  let characters = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let str = "";
  for (let i = 0; i < num; i++) {
    str += characters[Math.floor(Math.random() * characters.length)];
  }
  return str;
};

const urlsForUser = function(id, db) {

  let thisObj = {};
  for (let shortURL in db) {
    if (id === db[shortURL].userID) {
      thisObj[shortURL] = db[shortURL];
    }
  }
  return thisObj;
};

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