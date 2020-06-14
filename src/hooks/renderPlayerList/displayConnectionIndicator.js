export default (app, html) => {
  // display an indicator to the user that the connection is established
  if (window.vtta && window.vtta.isConnected) {
    $(html).find("h3").addClass("vttaConnected");
  }
};
