var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function getProducts(baseUrl, product_ids) {
    return __awaiter(this, void 0, void 0, function* () {
        function parseRawIntoBackendProduct(data) {
            const id = data['id'];
            const name = data['name'];
            const link = data['link'];
            const price = Number(data['price']);
            const website = data["website"];
            const imgPath = data['img_path'];
            const size = data['size'];
            const brand = data['brand'];
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
            return product;
        }
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({
            "product_ids": product_ids
        });
        console.log(raw);
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        try {
            console.log("getting recs");
            const response = yield fetch("http://webserver-env.eba-nu7yntyk.us-east-1.elasticbeanstalk.com/product/getMany", requestOptions);
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const responseJson = yield response.json();
                const products = responseJson.map((product) => {
                    console.log(product);
                    return parseRawIntoBackendProduct(product);
                });
                return products;
            }
            else {
                const responseText = yield response.text();
                console.log(responseText);
                return [];
            }
        }
        catch (error) {
            console.error(`An error occurred: ${error}`);
            return [];
        }
    });
}
