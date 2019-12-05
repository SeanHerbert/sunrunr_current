

function sendForecastReq() {
// alert(window.localStorage.getItem("authToken"));
  $.ajax({
    url: 'https://api.openweathermap.org/data/2.5/forecast?lat=32.2&lon=-110.9&units=imperial&appid=092b2e289298b368fb3c48b8b747b8af',
    type: 'GET',
    //crossDomain:true,
    responseType: 'json',
    contentType: 'application/json',
    dataType: 'jsonp'
  })
    .done(forecastHandler)
    .fail(errorHandler);
}

function forecastHandler(data, textSatus, jqXHR) {
  console.log(data.list[0]);
  icons = [];
  his = [];
  los=[];
  descs = [];
  for(let i =0;i<data.cnt;i++){
    let d = data.list[i];
    if(d.dt_txt.includes('03:00')){
      icons.push(d.weather[0].icon);
      his.push(d.main.temp_max);
      los.push(d.main.temp_min);
      descs.push(d.weather[0].description);
      console.log(d.weather[0].main);  
      console.log(d.weather[0].description);
      console.log(d.weather[0].icon);
     
      console.log(d.main.temp_min);
      console.log(d.main.temp_max);
    }

    $('#day1').attr("src",`http://openweathermap.org/img/wn/${icons[0]}@2x.png`);
    $('#day2').attr("src",`http://openweathermap.org/img/wn/${icons[1]}@2x.png`);
    $('#day3').attr("src",`http://openweathermap.org/img/wn/${icons[2]}@2x.png`);
    $('#day4').attr("src",`http://openweathermap.org/img/wn/${icons[3]}@2x.png`);
    $('#day5').attr("src",`http://openweathermap.org/img/wn/${icons[4]}@2x.png`);

    $('#hl1').html(`High: ${his[0]}&deg; Low: ${los[0]}&deg;`);
    $('#hl2').html(`High: ${his[1]}&deg; Low: ${los[1]}&deg;`);
    $('#hl3').html(`High: ${his[2]}&deg; Low: ${los[2]}&deg;`);
    $('#hl4').html(`High: ${his[3]}&deg; Low: ${los[3]}&deg;`);
    $('#hl5').html(`High: ${his[4]}&deg; Low: ${los[4]}&deg;`);

    $('#desc1').html(`${descs[0]}`);
    $('#desc2').html(`${descs[1]}`);
    $('#desc3').html(`${descs[2]}`);
    $('#desc4').html(`${descs[3]}`);
    $('#desc5').html(`${descs[4]}`);




  }
  
  //data = JSON.parse(data);
  // console.log(data.list.weather.main);
  // console.log(data.list.weather.description);
 
  // console.log(data.list.main.temp_min);
  // console.log(data.list.main.temp_min);
  
}

function errorHandler(jqXHR, textStatus, errorThrown) {
  // If authentication error, delete the authToken 
   console.log("There was an error");
  // redirect user to sign-in page (which is index.html)
  if( jqXHR.status === 401 ) {
    window.localStorage.removeItem("authToken");
    window.location.replace("https://seanh-webauthn.duckdns.org/index.html");
  } 
  else {
    $("#error").html("Error: " + status.message);
    $("#error").show();
  } 
}


// Handle authentication on page load
$(function() {
  
  // If there's no authToekn stored, redirect user to 
  // the sign-in page (which is index.html)
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("https://seanh-webauthn.duckdns.org/index.html"); 
  }
  else {
    
    sendForecastReq();
  }
  });
