import React, { useContext, useState } from 'react';
import { Container, Row, Col, Image, Form, Button, FormGroup } from 'react-bootstrap';
import { AuthContext } from '../firebase/Auth';
import { Redirect, useParams } from 'react-router-dom';
import $ from "jquery"

const io = require('socket.io-client');

class ChatBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: props.user._id,
      socket: undefined,
      firstName: props.user.firstName,
      lastName: props.user.lastName
    };
  }

  componentDidMount() {
    window.firstName = this.state.firstName;

    $(document).ready(function () {
      const url = window.location.href.split("/");
      const id = url[url.length - 1];
      window.cid = id;

      const socket = io('https://covid-testing-hub.herokuapp.com/', {secure: true});
      window.sockets = socket;
      socket.emit("join_chat", { id: id, user: window.firstName });
      $("#submit").on("click", function () {
        console.log("clicked");
        let contents = document.getElementById("text_box").value;
        if (contents != "") {
          document.getElementById("text_box").value = "";
          let ack = socket.emit('send_msg', { user: window.firstName, msg: contents });
          if (ack != null && ack != undefined) {
            $("#text_box").text("");
          }
        }
      });

      socket.on('announce', function (data) {
        console.log(data);
        $('#chat_box').append('<p>' + data.message + '</p>')
      });
    });
  }

  render() {
    return (
      <Container className='main' fluid>
        <div id="chat">
          <div id="chat_box" />
          <input type="text" id="text_box" />
          <input type="submit" name="submit" id="submit" />
        </div>
      </Container >
    )
  }
}

const Chat = () => {
  const { currentUser } = useContext(AuthContext);
  const { cid } = useParams();
  const user = currentUser.dbUser;


  if (user.messages.length > 0 && user.messages.filter(message => message.cid === cid)) {
    return (
      <ChatBox user={user} />
    )
  } else {
    return (
        <div id='no-chat'>
          <h2> No Messages </h2>
        </div>
    )
  }
};

export default Chat;