export default () => {
  if (/electron/i.test(navigator.userAgent)) {
    window.vtta.notification.show(
      "<h2>Native App detected</h2><p>Connect to your Foundry server using Google Chrome to enable the VTTA extension.</p>",
      null
    );
  }
};
