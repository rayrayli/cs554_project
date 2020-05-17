const rsmq = require("rsmq");
const emailDriver = new rsmq({
  host: "redis",
  port: 6379,
  ns: "rsmq"
});

module.exports = {
  create_queue: async () => {
    try {
      response = await emailDriver.createQueueAsync({
          qname: "emailqueue",
      }, )
      if (response === 1) {
          console.log("Queue created", response);
      }
    } catch (err) {
      if (err.name == 'queueExists') {
        console.log(" DQueue Exists");
      } else {
        console.log("redis error");
      }
    }
  },
  send_email: async (recipients, subject, contents) => {
    try {
      response = await emailDriver.sendMessageAsync({
        qname: "emailqueue",
        message: JSON.stringify({recipients: recipients, subject: subject, contents: contents})
      }, );
      if (response) {
        console.log("Message sent. ID:", response);
      }
    } catch (err) {
      console.log(err)
    }
  }
}
