"use strict";
console.log("Connected to redirect content script");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message.message);
    if (message.message === "referrer_url") {
        const referrer_url = message.referrer_url;
        const referrer_tabId = message.referrer_tabId;
        // create a button that is fixed on the screen that can take the user back to the page they came from
        const button = document.createElement("button");
        button.innerText = "Go Back to Sift";
        button.style.zIndex = "2147483647";
        button.style.fontFamily = "Poppins ";
        button.style.fontSize = "16px";
        button.id = "sift-back-button";
        button.style.position = "fixed";
        button.style.top = "10%";
        button.style.right = "0";
        button.style.backgroundColor = "white";
        button.style.color = "#6BAEF2";
        button.style.padding = "10px";
        button.style.border = "1px solid rgb(211, 211, 211)";
        button.style.borderRadius = "0 0 0 10px";
        button.style.cursor = "pointer";
        button.style.borderRadius = "15px";
        button.style.boxShadow = "rgba(0, 0, 0, 0.15) 0px 6px 5px";
        button.style.fontWeight = "500";
        button.addEventListener("click", () => {
            console.log("Button clicked");
            const payload = {
                referrer_tabId: referrer_tabId,
                referrer_url: referrer_url
            };
            chrome.runtime.sendMessage({ message: "navigate-back-to-referrer", payload: payload });
        });
        document.body.appendChild(button);
    }
});
