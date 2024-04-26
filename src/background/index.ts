chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id || 0 },
      func: () => {
        const button: HTMLButtonElement = document.createElement("button");
        button.textContent = "Notification";
        button.style.position = 'fixed';
        button.style.top = '0';
        button.style.left = '0';
        button.onclick = () => {
          alert("Hello World, this is alert by notification!");
        };
        document.body.appendChild(button);
      },
    });
  } catch (error) {
    console.error(error);
  }
});
