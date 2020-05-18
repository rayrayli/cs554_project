let hostport = process.env.REDISCLOUD_URL.split('@') || "127.0.0.1:6379"
let password = hostport[0].split(':')[2]
let [hostname, port] = hostport[1].split(':') 

const rsmq = require("rsmq");
const emailDriver = new rsmq({
  host: hostname,
  port: Number(port),
  ns: "rsmq",
  password: password
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
