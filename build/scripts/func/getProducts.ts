import { BackendProduct } from "../../../src/types/custom-types/BackendProduct";
export async function getProducts(baseUrl: string, product_ids: string[]): Promise<BackendProduct[]> {
    function parseRawIntoBackendProduct(data: any): BackendProduct {
        const id = data['id']
        const name = data['name'];
        const link = data['link'];
        const price = Number(data['price']);
        const website = data["website"]
        const imgPath = data['img_path'];
        const size = data['size'];
        const brand = data['brand']
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
        return product
    }



    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "product_ids": product_ids
    });
    console.log(raw);

    var requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    try {
        console.log("getting recs");
        const response = await fetch("http://webserver-env.eba-nu7yntyk.us-east-1.elasticbeanstalk.com/product/getMany", requestOptions);
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const responseJson: any[] = await response.json();
            const products: BackendProduct[] = responseJson.map((product) => {
                console.log(product);
                return parseRawIntoBackendProduct(product);
            })
            return products;
        } else {
            const responseText: string = await response.text();
            console.log(responseText);
            return [];
        }

    } catch (error) {
        console.error(`An error occurred: ${error}`);
        return [];
    }

}