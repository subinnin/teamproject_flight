const USERNAME = "geonwoo";
const PASSWORD = "wwrla1124!";

// const USERNAME = "xxxbin";
// const PASSWORD = "subinkang";
const encodeData = btoa(`${encodeURIComponent(USERNAME)}:${encodeURIComponent(PASSWORD)}`);

module.exports = encodeData;