const { readdirSync } = require("fs");
const { resolve } = require("path");

/**
 * 
 * @param {string} path 
 */
module.exports = (path) => {
  return readdirSync(path)
    .filter(file => file.endsWith(".js"))
    .map(file => require(resolve(`${process.cwd()}/${path}/${file}`)))
}