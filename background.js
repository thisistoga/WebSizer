chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "resizeViewport") {
    resizeViewport(message.width, message.height).then(sendResponse);
    return true; // keep channel open for async response
  }
  if (message.action === "getViewport") {
    getViewport().then(sendResponse);
    return true;
  }
});

async function getViewport() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
      }),
    });
    return { success: true, ...result.result };
  } catch {
    return { success: false };
  }
}

async function resizeViewport(targetWidth, targetHeight) {
  try {
    const currentWindow = await chrome.windows.getCurrent();
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
      }),
    });

    const dims = result.result;
    const chromeWidth = dims.outerWidth - dims.innerWidth;
    const chromeHeight = dims.outerHeight - dims.innerHeight;

    const newWidth = targetWidth + chromeWidth;
    const newHeight = targetHeight + chromeHeight;

    await chrome.windows.update(currentWindow.id, {
      width: newWidth,
      height: newHeight,
    });

    // Verify and correct after a short delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const [verify] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
      }),
    });

    const actual = verify.result;
    const widthDiff = targetWidth - actual.innerWidth;
    const heightDiff = targetHeight - actual.innerHeight;

    if (widthDiff !== 0 || heightDiff !== 0) {
      const correctedWindow = await chrome.windows.getCurrent();
      await chrome.windows.update(correctedWindow.id, {
        width: correctedWindow.width + widthDiff,
        height: correctedWindow.height + heightDiff,
      });
    }

    return { success: true };
  } catch {
    return { success: false };
  }
}
