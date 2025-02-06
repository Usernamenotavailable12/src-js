function switchLanguage(lang) {
    let url = window.location.href;
    let newUrl = url.replace(/\/(ka|ru|en|tr)\//, `/${lang}/`);
    
    if (url !== newUrl) {
        window.location.href = newUrl; // Redirect to the new URL
    }
}
