var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const parseJsonIntoProduct = (data) => {
    const id = data['_id']['$oid'];
    const name = data['title'];
    const link = data['url'];
    const price = Number(data['price']);
    const website = "Grailed";
    const imgPath = data['img_url'];
    const size = data['size'];
    const brand = (data['designers']).join(", ");
    const product = Object({
        id: id,
        name: name,
        link: link,
        price: price,
        website: website,
        imgPath: imgPath,
        size: size,
        brand: brand
    });
    return (product);
};
export const getProductStoreIfNec = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, error) => {
        chrome.storage.session.get(["storedProducts"], function (results) {
            if (id in results) {
                resolve(results[id]);
            }
            else {
                console.log("Making a GET request for product with ID " + id);
                var requestOptions = {
                    method: 'GET',
                    redirect: 'follow'
                };
                fetch("https://aws.letsift.com/product/" + id)
                    .then(response => response.json())
                    .then(response => {
                    return response;
                })
                    .then((productData) => {
                    const product = parseJsonIntoProduct(productData);
                    //Making a deep copy
                    let newStoredProducts;
                    if (Object.keys(results).length == 0 || results == null) {
                        newStoredProducts = {};
                    }
                    else {
                        newStoredProducts = JSON.parse(JSON.stringify(results.storedProducts));
                    }
                    newStoredProducts[id] = product;
                    console.log(product);
                    chrome.storage.session.set({ "storedProducts": newStoredProducts }, function () {
                        resolve(product);
                    });
                })
                    .catch(error => console.log('error', error));
            }
        });
    });
});
