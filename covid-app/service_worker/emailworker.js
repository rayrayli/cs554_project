const rsmq = require("rsmq-worker");
const worker = new rsmq("emailqueue", {
  host: "127.0.0.1",
  port: 6379,
  ns: "rsmq"
});

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "covidappcs554@gmail.com",
    pass: "thisisareallystrongpassword"
  }
});

const mailOptions = function(recipient, subject, contents) {
  return {
    from: "covidappcs554@gmail.com",
    to: recipient,
    subject: subject,
    text: contents
  }
}

const sendEmail = function(recipient, subject, contents) {
  const options = mailOptions(recipient, subject, contents);
  transporter.sendMail(options, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("email sent: " + info.response);
      
    }
  });
}

worker.on("message", function(msg, next, id) {
  const emailDetails = JSON.parse(msg);
  let emails = ""; 
  if (emailDetails.recipients.length > 1) {
    emails = emailDetails.recipients.join(", ");
  } else {
    emails = emailDetails.recipients[0];
  }
  sendEmail(emails, emailDetails.subject, emailDetails.contents);
  next();
});

console.log("working");
worker.start();
