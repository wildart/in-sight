var Watson = require("watson-developer-cloud");

var conversation = new Watson.ConversationV1({
  username: process.env.CNV_USER,
  password: process.env.CNV_PASS,
  version_date: '2017-05-26'
});

var params = {
  workspace_id: "b974c6b2-7910-4810-8395-327216a3541e"
};

conversation.getWorkspace(params, function(err, response) {
  if (err) {
    console.error(err);
  } else {
    console.log(JSON.stringify(response, null, 2));
  }
});

module.exports = conversation
