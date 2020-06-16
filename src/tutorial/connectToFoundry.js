export default async () => {
  const EXIT_BUTTON = "Exit Tutorial";
  const NEXT_BUTTON = "Next";
  let result;
  /**
   * STEP 1
   */
  let text = `<h1>What is "Native App"?</h1><p>When you run Foundry VTT by clicking on the Foundry executable, you are running Foundry in <b>Native App</b> mode. You probably know that Foundry VTT consists of two components:</p>
    <ol>
        <li>a server that is managing all the data and handles</li>
        <li>one or multiple clients, which connect to the server in order to play together</li>
    </ol>
    <p>When you are starting the <b>Native App</b> you are starting both components at the same time: The server is pretty hidden from you, and all you see is <b>the client component</b> that enables to login and to work with your worlds.</p>
    <hr />`;
  // Welcome - hidden on "Next"
  result = await window.vtta.hint.show(text, {
    align: "CENTER",
    buttons: [EXIT_BUTTON, NEXT_BUTTON],
    width: window.innerWidth * 0.5,
  });

  if (result === EXIT_BUTTON) return;

  /**
   * STEP 2
   */
  text = `<h1>The Chrome extension</h1><p>I gather that you already visited the <a href="https://chrome.google.com/webstore/detail/vttassets-dd-beyond-found/mhbmahbbdgmmhbbfjbojneimkbkamoji" target="_blank">Chrome Webstore</a>
  to install the VTTAssets: D&D Beyond & Foundry VTT Bridge extension. You might be wondering why you are hitting that <b>Connect to Foundry</b> button and nothing happens.</p>
  <p>
    This is because the Native App and Google Chrome are <b>seperate applications</b> and therefore are having a hard time communicating. 
    Whenever you click on the <b>Connect to Foundry</b> button, the Chrome extension sends a "Hello, vtta-dndbeyond module, are you there?" message <b>to the currently displayed browser tab</b> and waits for the module to respond. 
    The <b>Native App</b> does not get that connection request because of the seperation to Google Chrome and you are not succesful on your connection attempt.
  </p>
    <hr />`;
  // Welcome - hidden on "Next"
  result = await window.vtta.hint.show(text, {
    align: "CENTER",
    buttons: [EXIT_BUTTON, NEXT_BUTTON],
    width: window.innerWidth * 0.5,
  });

  if (result === EXIT_BUTTON) return;

  /**
   * STEP 3
   */
  text = `<h1>Understood. What do I do?</h1>
  <p>
    Four easy steps:
  </p>
  <p>
    <ol>
       <li>Close down the Foundry server</li>
       <li>Start the Foundry server, but do not login into your world. Instead, you are </li>
       <li>starting Chrome and heading to <a href="${game.data.addresses.local}">${game.data.addresses.local}</a>. Your Foundry server responds, presenting you the login screen. Login into your world, you can do everything like within the <b>Native App</b>.</li>
       <li>With the Chrome tab pointing now to your Foundry server, the "Hello" by clicking on the <b>Connect to Foundry</b>-button within the Chrome extension is heard, responded to and communication is possible. Success!</li>
    </ol>
 </p>
    <hr />`;
  // Welcome - hidden on "Next"
  result = await window.vtta.hint.show(text, {
    align: "CENTER",
    buttons: [EXIT_BUTTON, NEXT_BUTTON],
    width: window.innerWidth * 0.5,
  });

  /**
   * STEP 4
   */
  text = `<h1>Did you know?</h1>
  <p>
    You can find the Invitation Link I used in the previous panel in the sidebar to the right when openening the <b><i class="fas fa-cogs"></i> Game Settings</b>. You will find the <b>Game Invitation Links</b> at the very bottom.
  </p>
  <p>Use the 
  <ul><li>
  <b>Local Network</b> link when you are connecting to yourself from the computer that runs the Foundry server</li>
  <li><b>Internet</b> link to send to your friends.</li>
  </p>
  <p>You can find more information on that on the <a href="https://foundryvtt.com/article/installation/" target="_blank">official Foundry VTT knowledge base</a>.</p>
   <hr />`;
  // Welcome - hidden on "Next"
  result = await window.vtta.hint.show(text, {
    align: "CENTER",
    buttons: [EXIT_BUTTON],
    width: window.innerWidth * 0.5,
  });
};
