export async function isLoggedIn(baseUrl: string) {
    var requestOptions: RequestInit = {
        method: 'GET',
        redirect: 'follow'
    };
    try {
        const res = await fetch(baseUrl + "getUserInfo", requestOptions)
        if (res) {
            if (res.status === 200) {
                return true;
            } else if (res.status == 401) {
                return false;
            } else {
                return false;
            }
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}