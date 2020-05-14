const onSocketMessage = (sender, data) => {
  console.log("Socket Message received from " + sender.name);
  console.log(data);
};

export default onSocketMessage;
