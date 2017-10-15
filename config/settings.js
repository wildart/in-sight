require('dotenv').config({silent: true});

module.exports = {
  port: process.env.PORT || 3000,
  chat_port: process.env.CHAT_PORT || 3001,
  env: process.env.ENV || 'development',
};