export const getToken = () => {
    const authJSON = localStorage.getItem('auth');
    if (!authJSON) {
        return '';
    }
    const authData = JSON.parse(authJSON);
    return authData?.token;
};