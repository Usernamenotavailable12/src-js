function switchCurrnetUrl(navurl) {
  let url = window.location.href;
  let updatedUrl = url.replace(/(\/(ka|ru|en|tr))(\/.*)?$/, `$1/${navurl}`);

  if (url !== updatedUrl) {
      window.location.href = updatedUrl; 
  }
}
