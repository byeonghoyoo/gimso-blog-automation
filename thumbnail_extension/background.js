chrome.commands.onCommand.addListener((command) => {
    if (command === "open-popup") {
        // 팝업 열기
        chrome.action.openPopup();
    }
});