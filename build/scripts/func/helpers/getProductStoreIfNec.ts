//Helper function to turn JSON object into desired product object
import {BackendProduct} from "../../../../src/types/custom-types/BackendProduct.js";

const parseJsonIntoProduct = (data: any) => {
    const id = data['_id']['$oid']
    const name = data['title'];
    const link = data['url'];
    const price = Number(data['price']);
    const website = "Grailed";
    const imgPath = data['img_url'];
    const size = data['size'];
    const brand = (data['designers']).join(", ")
    const product: BackendProduct = Object({
        id: id,
        name: name,
        link: link,
        price: price,
        website: website,
        imgPath: imgPath,
        size: size,
        brand: brand
    })
    return (product)
}


export const getProductStoreIfNec = async (id: String) => {

    return new Promise<BackendProduct>((resolve, error) => {

        chrome.storage.session.get(["storedProducts"], function (results: { [key: string]: BackendProduct }) {
            if ((id as string) in results) {
                resolve(results[(id as string)]);
            } else {
                console.log("Making a GET request for product with ID " + id);
                var requestOptions: RequestInit = {
                    method: 'GET',
                    redirect: 'follow'
                };

                fetch("https://aws.letsift.com/product/" + id)
                    .then(response => response.json())
                    .then(response => {
                        return response
                    })
                    .then((productData: any) => {
                        const product: BackendProduct = parseJsonIntoProduct(productData);

                        //Making a deep copy
                        let newStoredProducts;
                        if (Object.keys(results).length == 0 || results == null) {
                            newStoredProducts = {}
                        } else {
                            newStoredProducts = JSON.parse(JSON.stringify(results.storedProducts));
                        }
                        newStoredProducts[(id as string)] = product;
                        console.log(product);
                        chrome.storage.session.set({"storedProducts": newStoredProducts}, function () {
                            resolve(product);
                        });
                    })
                    .catch(error => console.log('error', error));

            }
        })
    })


}