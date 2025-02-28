const pathModule = (url) =>{
    const path = require("path");
    return path.join(path.dirname(__dirname),url);
}

module.exports = pathModule;