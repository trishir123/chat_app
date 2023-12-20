const moment = require('moment');

function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment(new Date(Date.now())).format('hh:mm a'),
  };
}

module.exports = formatMessage;
