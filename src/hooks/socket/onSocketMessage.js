const onSocketMessage = (sender, data) => {
  console.log("Socket Message received from " + sender.name);
  console.log(data);

  switch (data.action) {
    case "showImage": {
      const src = data.src;

      // check for an existing popout with that source
      let isDisplayed = false;
      $("div.vtta-image-popout img").each((index, element) => {
        if ($(element).attr("src") === src) isDisplayed = true;
      });
      if (isDisplayed) return;

      // create the image popup
      const popout = $('<div class="vtta-image-popout"><img src="' + src + '"/></div>');
      popout.on("click", () => {
        $(popout).hide(400, () => {
          $(popout).remove();
        });
      });
      $("body").prepend(popout);
      $(popout).show(400);
      break;
    }
    // no default
  }
};

export default onSocketMessage;
