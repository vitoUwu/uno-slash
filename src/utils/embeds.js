const { Colors } = require("discord.js");

module.exports =  {
  /**
   * 
   * @param {string} message 
   * @returns 
   */
  error: (message) => ({
    description: `[\`🚫\`] ${message}`,
    color: Colors.Red
  }),
  /**
   * 
   * @param {string} message 
   * @returns 
   */
  success: (message) => ({
    description: `[\`✅\`] ${message}`,
    color: Colors.Green
  })
}