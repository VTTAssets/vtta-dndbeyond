function linkImages(directory, html, user) {
  if (!game.user.isGM) return;

  // mark all images
  $(html)
    .find('div[data-edit="content"] img')
    .each((index, element) => {
      const showPlayersButton = $("<a class='vtta-button'><i class='fas fa-eye'></i>&nbsp;Show Players</a>");
      $(showPlayersButton).click((event) => {
        const src = $(element).attr("src");
        console.log("Showing players image: " + src);
        game.socket.emit("module.vtta-dndbeyond", { sender: game.user.data._id, action: "showImage", src: src });
      });

      $(element).wrap("<div class='vtta-image-container'></div>");
      // show the button on mouseenter of the image
      $(element)
        .parent()
        .mouseenter(function () {
          console.log("Hovering");
          $(this).append(showPlayersButton);
          $(showPlayersButton).click((event) => {
            const src = $(element).attr("src");
            console.log("Showing players image: " + src);
            game.socket.emit("module.vtta-dndbeyond", { sender: game.user.data._id, action: "showImage", src: src });
          });
        });
      $(element)
        .parent()
        .mouseleave(function () {
          console.log("Unhovering");
          $(this).find("a").remove();
        });
      // $(element)
      //   .parent()
      //   .onmouseenter((event) => {
      //     $(element).parent().append(showPlayersButton);

      //     $(showPlayersButton).onmouseleave((event) => {});
      //   });

      // $(showPlayersButton).click((event) => {
      //   const src = $(element).attr("src");
      //   console.log("Showing players image: " + src);
      //   game.socket.emit("module.vtta-dndbeyond", { sender: game.user.data._id, action: "showImage", src: src });
      // });
    });
}

export default linkImages;
