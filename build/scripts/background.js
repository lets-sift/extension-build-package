var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getProducts } from "./func/getProducts.js";
import getUserInfo from "./func/getUserInfo.js";
import { isLoggedIn } from "./func/isLoggedIn.js";
// const baseUrl = "https://web.aws.letsift.com/";
const baseUrl = "http://webserver-env.eba-nu7yntyk.us-east-1.elasticbeanstalk.com/";
// Send url changes
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.url) {
        console.log(`tabId: ${tabId}, changeInfoUrl: ${changeInfo.url}`);
        if (/^arc:\/\//.test(changeInfo.url) || /^chrome:\/\//.test(changeInfo.url)) {
            // Skip
        }
        else {
            chrome.tabs.get(tabId, function (tab) {
                if (chrome.runtime.lastError || !tab) {
                    // The tab doesn't exist or there was an error getting the tab
                    console.log('Tab does not exist');
                }
                else {
                    // The tab still exists
                    chrome.tabs.sendMessage(tabId, {
                        message: 'url-change',
                        url: changeInfo.url
                    });
                }
            });
        }
    }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("message:" + message.message);
    if (message.message === "recommend-products") {
        console.log(message.payload);
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const frontendProduct = message.payload;
        // TODO: clean up
        const imgUrl = frontendProduct.img_url;
        const img = Array.isArray(imgUrl) ? imgUrl[0] : imgUrl;
        const img_url = img.startsWith("//") ? "https:" + img : img;
        var raw = JSON.stringify({
            "name": frontendProduct.title,
            "description": frontendProduct.description,
            "category_path": "",
            "img_url": [
                img_url
            ],
            "product_url": message.url,
            "sanity_check": false
        });
        console.log(raw);
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        fetch(baseUrl + "recommend_", requestOptions)
            .then(response => {
            console.log("in recommend_");
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json()
                    .then(jsonResponse => {
                    console.log("Recommended Product Ids");
                    console.log(JSON.stringify(jsonResponse));
                    getProducts(baseUrl, jsonResponse["recs"])
                        .then((products) => {
                        sendResponse({
                            products: products,
                            sessionId: jsonResponse["id"]
                        });
                    });
                });
            }
            else {
                return response.text()
                    .then((text) => {
                    console.log(text);
                });
            }
        })
            .catch(error => console.log('error', error));
    }
    else if (message.message === "liked-products") {
        var requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };
        isLoggedIn(baseUrl)
            .then((isLoggedIn) => {
            if (isLoggedIn) {
                fetch(baseUrl + "getLikedProducts", requestOptions)
                    .then(response => {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        return response.json()
                            .then((product_ids) => {
                            return getProducts(baseUrl, product_ids);
                        })
                            .then((products) => {
                            sendResponse(products);
                        });
                    }
                    else {
                        return response.text()
                            .then((text) => {
                            console.log(text);
                        });
                    }
                });
            }
        })
            .catch(error => console.log('error', error));
    }
    else if (message.message === "insert-liked-product") {
        console.log("adding a liked product");
        isLoggedIn(baseUrl)
            .then((isLoggedIn) => {
            if (isLoggedIn) {
                var myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                var raw = JSON.stringify({
                    "product_id": message.payload
                });
                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: raw,
                    redirect: 'follow'
                };
                fetch(baseUrl + "insertLikedProduct", requestOptions)
                    .then(response => response.text())
                    .then(result => {
                    console.log(`successfully inserted liked product with id ${message.payload}`);
                    console.log(result);
                });
            }
            else {
                console.error("Cannot insert liked product because no user is logged in");
            }
        })
            .catch(error => console.log('error', error));
    }
    else if (message.message === "delete-liked-product") {
        console.log("Deleting a liked product");
        isLoggedIn(baseUrl)
            .then((isLoggedIn) => {
            if (isLoggedIn) {
                var myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                var raw = JSON.stringify({
                    "product_id": message.payload
                });
                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: raw,
                    redirect: 'follow'
                };
                fetch(baseUrl + "insertLikedProduct", requestOptions)
                    .then(response => response.text())
                    .then(result => {
                    console.log(`successfully deleted liked product with id ${message.payload}`);
                    console.log(result);
                });
            }
            else {
                console.error("Cannot delete liked product because no user is logged in");
            }
        })
            .catch(error => console.log('error', error));
    }
    else if (message.message === "submit-feedback") {
        const name = message.formData.name;
        const email = message.formData.email;
        const receivedMessage = message.formData.message;
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({
            "name": name,
            "email": email,
            "message": receivedMessage,
        });
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        fetch(baseUrl + "sendFeedback", requestOptions)
            .then(response => response.text())
            .then(result => {
            sendResponse(result);
        })
            .catch(error => console.log('error', error));
    }
    else if (message.message === "login") {
        const login = () => __awaiter(void 0, void 0, void 0, function* () {
            const originalTabId = sender.tab.id;
            yield chrome.tabs.create({ url: baseUrl + "login" });
            chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
                if (changeInfo.url === baseUrl + 'protected') {
                    getUserInfo(baseUrl)
                        .then((userInfo) => {
                        sendResponse(userInfo);
                    })
                        .then(() => {
                        chrome.tabs.remove(tabId);
                    })
                        .then(() => {
                        chrome.tabs.update(originalTabId, { active: true });
                    });
                }
            });
        });
        login();
    }
    else if (message.message === "is-logged-in") {
        const isLoggedIn = () => __awaiter(void 0, void 0, void 0, function* () {
            let requestOptions = {
                method: 'GET',
                redirect: 'follow'
            };
            try {
                const serverResponse = yield fetch(baseUrl + "getUserInfo", requestOptions);
                console.log(serverResponse);
                if (serverResponse.status == 200) {
                    const response = yield getUserInfo(baseUrl);
                    if (response.length == 0) {
                        console.log("User is not logged in");
                    }
                    sendResponse(response);
                }
                else {
                    sendResponse(null);
                }
            }
            catch (error) {
                console.error(error);
            }
        });
        isLoggedIn();
    }
    else if (message.message === "logout") {
        try {
            const originalTabId = sender.tab.id;
            chrome.tabs.create({ url: baseUrl + "logout" })
                .then(() => {
                chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
                    if (changeInfo.url === baseUrl + '/protected') {
                        console.log("Should remove");
                        chrome.tabs.remove(tabId);
                        chrome.tabs.update(originalTabId, { active: true });
                    }
                });
            })
                .then(() => {
                sendResponse(true);
            });
        }
        catch (error) {
            console.error(error);
        }
    }
    else if (message.message === "click-product") {
        const product_url = message.urls.product_url;
        const referrer_url = message.urls.referrer_url;
        const referrer_tabId = sender.tab.id;
        chrome.tabs.create({ url: product_url, active: true }, (tab) => {
            // chrome.tabs.executeScript(tab.id!, { file: "redirect-content.js" }, () => {
            //     chrome.tabs.sendMessage(tab.id!, {
            //         message: 'referrer_url',
            //         referrer_url: referrer_url
            //     })
            // });
            chrome.scripting.insertCSS({
                target: {
                    tabId: tab.id
                },
                files: ["/scripts/font.css"],
            }, () => {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ["/scripts/redirect-content.js"],
                })
                    .then(() => {
                    console.log("Script injected");
                    setTimeout(() => {
                        chrome.tabs.sendMessage(tab.id, {
                            message: 'referrer_url',
                            referrer_url: referrer_url,
                            referrer_tabId: referrer_tabId
                        });
                    }, 1000);
                });
            });
        });
        var raw = JSON.stringify(message.payload);
        var requestOptions = {
            method: 'POST',
            body: raw,
            redirect: 'follow'
        };
        fetch(baseUrl + "clickProduct", requestOptions)
            .then(response => { response.text(); })
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
    }
    else if (message.message === "visit-site") {
        var raw = JSON.stringify(message.payload);
        var requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: raw,
            redirect: 'follow'
        };
        fetch(baseUrl + "visitSite", requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
    }
    else if (message.message === "navigate-back-to-referrer") {
        // Called by redirect-content.js
        const referrer_url = message.payload.referrer_url;
        const referrer_tabId = message.payload.referrer_tabId;
        chrome.tabs.get(referrer_tabId, function (tab) {
            if (typeof tab == 'undefined') {
                console.log(`Tab with ID ${referrer_tabId} does not exist`);
                chrome.tabs.create({ url: referrer_url, active: true });
            }
            else {
                chrome.tabs.update(referrer_tabId, { active: true });
            }
        });
    }
    return true;
});
