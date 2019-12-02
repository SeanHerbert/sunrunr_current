$(function() {
   $('#signout').click(function() {
      window.localStorage.removeItem('authToken');
      window.location = "https://seanh-webauthn.duckdns.org/index.html";
   });
});

