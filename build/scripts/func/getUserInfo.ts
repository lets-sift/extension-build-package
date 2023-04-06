
export default async function getUserInfo(baseUrl: string) {
    var requestOptions: RequestInit = {
        method: 'GET',
        redirect: 'follow'
    };
    try {
        const userInfoResponse = await fetch(baseUrl + "getUserInfo", requestOptions)
        const userInfoData = await userInfoResponse.json();
        return userInfoData;
    } catch (error) {
        console.error(error);
        return [];
    }
}