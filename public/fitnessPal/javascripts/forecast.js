

function sendForecastReq() {
  var lat  = window.localStorage.getItem("lat");
  var lon  = window.localStorage.getItem("lon");
   $.ajax({
    url: '/node/weather/forecast/'+lat+'/'+lon,
    type: 'GET',
    headers: { "x-auth" : window.localStorage.getItem("authToken") },
    responseType: 'json',
    contentType: 'application/json',
    dataType: 'json'
  })
    .done(forecastHandler)
    .fail(errorHandler);
}

function forecastHandler(data, textSatus, jqXHR) {
  //console.log(data.list[0]);
  days = [];
  days[1] = "<b>MONDAY</b>";
  days[2] = "<b>TUESDAY</b>";
  days[3] = "<b>WEDNESDAY</b>";
  days[4] = "<b>THURSDAY</b>";
  days[5] = "<b>FRIDAY</b>";
  days[6] = "<b>SATURDAY</b>";
  days[0] = "<b>SUNDAY</b>";
  var d = new Date();
  var n = d.getDay();
  var d1 = "<b>TODAY</b>";
  var d2 = days[(n+1)%7];
  var d3 = days[(n+2)%7];
  var d4 = days[(n+3)%7];
  var d5 = days[(n+4)%7];
  icons = [];
  his = [];
  los=[];
  descs = [];
  min = 10000000;
  max =0;
  console.log(data.arrayUV);
  for(let i =0;i<data.weatherData.cnt;i++){
    let d = data.weatherData.list[i];
     
    if(d.main.temp_min<min){
        min = d.main.temp_min;
  }
    if(d.main.temp_max>max){
        max = d.main.temp_max;
  }
   if(i%7==0&& i !== 0){
  his.push(max);
  los.push(min);
  min = 10000000;
  max = 0;
  }

    if(d.dt_txt.includes('3:00')){
      icons.push(d.weather[0].id);
      //his.push(d.main.temp_max);
     // los.push(d.main.temp_min);
      descs.push(d.weather[0].description);
           
    }
}


var uvs = [];
    for(let i=1;i<5;i++){
    uvs.push([data.arrayUV[i].value]);
    }
    
    $('#uv1').html(`<b>UV Index:</b> ${data.currUV.value}`);
    $('#uv2').html(`<b>UV Index:</b> ${uvs[0]}`);
    $('#uv3').html(`<b>UV Index:</b> ${uvs[1]}`);
    $('#uv4').html(`<b>UV Index:</b> ${uvs[2]}`);
    $('#uv5').html(`<b>UV Index:</b> ${uvs[3]}`);


    $('#d1').html(d1);
    $('#d2').html(d2);
    $('#d3').html(d3);
    $('#d4').html(d4);
    $('#d5').html(d5);

    $('#day1').addClass(`wi wi-owm-${icons[0]}`);
    $('#day2').addClass(`wi wi-owm-${icons[1]}`);
    $('#day3').addClass(`wi wi-owm-${icons[2]}`);
    $('#day4').addClass(`wi wi-owm-${icons[3]}`);
    $('#day5').addClass(`wi wi-owm-${icons[4]}`);
    

    $('#hl1').html(`<b>High:</b> ${his[0]}&deg; <b>Low:</b> ${los[0]}&deg;`);
    $('#hl2').html(`<b>High:</b> ${his[1]}&deg; <b>Low:</b> ${los[1]}&deg;`);
    $('#hl3').html(`<b>High:</b> ${his[2]}&deg; <b>Low:</b> ${los[2]}&deg;`);
    $('#hl4').html(`<b>High:</b> ${his[3]}&deg; <b>Low:</b> ${los[3]}&deg;`);
    $('#hl5').html(`<b>High:</b> ${his[4]}&deg; <b>Low:</b> ${los[4]}&deg;`);

    $('#desc1').html(`<b>Desription:</b> ${descs[0]}`);
    $('#desc2').html(`<b>Desription:</b> ${descs[1]}`);
    $('#desc3').html(`<b>Desription:</b> ${descs[2]}`);
    $('#desc4').html(`<b>Desription:</b> ${descs[3]}`);
    $('#desc5').html(`<b>Desription:</b> ${descs[4]}`);




  
  
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
