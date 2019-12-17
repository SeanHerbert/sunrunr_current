
function getActivity() {
  let link = window.location.href;
  let refNum = link.split("=")[1];
        console.log("sending get request to /activity/detail/")
  $.ajax({
    url: '/node/activity/detail/'+refNum,
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(activityHandler)
    .fail(errorHandler);
}

function activityHandler(data, textStatus, jqXHR){
    
     speeds = [];
     uvs = [];
     avgSpeed = 0;
     len = data.samples.length;
     mins = len/4;
     type = data.type;
    for (let s of data.samples){
        speeds.push({y : s.speed});
        uvs.push({y : s.uv});
        avgSpeed +=s.speed;
  

    }
        
    avgSpeed = avgSpeed / (len);
    
    setChecked(type);
    putCals();
    buildDetails(data);
    makeSpeedChart(speeds);
    makeUVChart(uvs);
    
    

}


function changeTypeDisplayed(){


}



                








function buildDetails(data){

    var activity= data.activity;
    //console.log(activty);
    uvv= Number.parseFloat(activity.uv);
    act_start = iso2std(activity.start);
    uvv = uvv.toFixed(2);
    var detailsHTML = `<li class="collection-header grey lighten-4" ><h4>Activity Details</h4></li>
                <li class="collection-item teal lighten-5">
                <div><b> Activity:</b><span id = 'actyp'> ${activity.type}</span></div>
                <li class="collection-item grey lighten-4"><div><b>Date:</b> ${act_start}</div></li>
                <li class="collection-item grey lighten-4"><div><b>Duration:</b> ${activity.duration}</div></li>
                <li class="collection-item grey lighten-4"><div><b>UV Exposure:</b> ${uvv} watts/cm<sup>2</sup></div></li>
                <li class="collection-item grey lighten-4"><div><b>Temperature:</b> ${activity.weather.temperature}&deg;F</div></li>
                <li class="collection-item grey lighten-4"><div><b>Humidity:</b> ${activity.weather.humidity}%</div></li> 
                </li>`;;
  $('#activityList').html(detailsHTML);
}
function setChecked(type){
   w = $('#w');
   r = $('#r');
   b = $('#b');
  
  if(type == 'walking'){
    w.prop("checked", true);
  }
  else if(type == 'running'){
    r.prop("checked", true);
    
  }
  else{
    b.prop("checked", true);
  
  }

}
function putCals(){
  var burned = 0;
  if(type == 'walking'){
  if(avgSpeed<=2){
      burned = 3*mins; 
  }
  if(avgSpeed<=3 && avgSpeed>2){
    burned = 4.3*mins;
  }
  if(avgSpeed<=4 && avgSpeed>3){
    burned = 5.8*mins;
  }
  if(avgSpeed<=5 && avgSpeed>4){
    burned = 9.5*mins;
  }
  if(avgSpeed>5){
    burned = 12*mins;
  }
}

if(type == 'running'){
  if(avgSpeed<=5){
      burned = 10*mins; 
  }
  if(avgSpeed<=6 && avgSpeed>5){
    burned = 13.7*mins;
  }
  if(avgSpeed<=7 && avgSpeed>6){
    burned = 15.7*mins;
  }
  if(avgSpeed<=8 && avgSpeed>7){
    burned = 17.7*mins;
  }
  if(avgSpeed>8){
    burned = 21*mins;
  }
}

if(type == 'biking'){
  if(avgSpeed<=10){
      burned = 5.4*mins; 
  }
  if(avgSpeed<=12 && avgSpeed>10){
    burned = 8*mins;
  }
  if(avgSpeed<=14 && avgSpeed>12){
    burned = 10.6*mins;
  }
  if(avgSpeed<=16 && avgSpeed>14){
    burned = 13.5*mins;
  }
  if(avgSpeed<=19 && avgSpeed>16){
    burned = 16*mins;
  }
  if(avgSpeed>19){
    burned = 21*mins;
  }
}
$('#cals').html(burned.toFixed(2));
$('#actyp').html(` ${type}`);
}

function errorHandler(jqXHR, textStatus, errorThrown) {
  // If authentication error, delete the authToken 
  // redirect user to sign-in page (which is index.html)
        console.log("in displaySamplesError");
  if( jqXHR.status === 401 ) {
    window.localStorage.removeItem("authToken");
    window.location.replace("index.html");
  }
  else {
    $("#activityDetail").html("Error: " + status.message);

  }
}



function makeSpeedChart(dataPoints0){



     var chart1 = new CanvasJS.Chart("chartContainer1", {
  animationEnabled: true,
  theme: "light2",
  title:{
    text: `Speed`
  },
  axisY:{
    title: "mph",
    includeZero: false
  },
  axisX:{
    title: "minutes",
    includeZero: false,
    interval: 4,
    labelFormatter: function(e){

        return  e.value/4;
      }
  },
  data: [{        
    type: "line",       
    dataPoints: dataPoints0
  }]
});
chart1.render();
}


function makeUVChart(dataPoints){



     var chart2 = new CanvasJS.Chart("chartContainer2", {
  animationEnabled: true,
  theme: "light2",
  title:{
    text: `UV Exposure`
  },
  axisY:{
    title: "watts/cm^2",
    includeZero: false
  },
  axisX:{
    title: "minutes",
    includeZero: false,
    interval: 4,
    labelFormatter: function(e){

        return  e.value/4;
      }
  },
  data: [{        
    type: "line",       
    dataPoints: dataPoints
  }]
});
chart2.render();
}


function sendTypeUpdate(){
    let link = window.location.href;
    let refNum = link.split("=")[1];
    sendData = {type: type, ref: refNum};
    $.ajax({
    url: '/node/activity/update',
    type: 'POST',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },  
    contentType: 'application/json',
    data: JSON.stringify(sendData), 
    dataType: 'json'
   })
    .done(updateSuccess)
    .fail(updateError); 
}

function updateSuccess(data, textSatus, jqXHR){
    console.log(`activity ${data.id} ${data.message}`);

}
function updateError(jqXHR, textStatus, errorThrown){
    console.log(jqXHR);
     console.log(textStatus);
      console.log(errorThrown);

}
function iso2std(s) {
    var b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}

// Handle authentication on page load
$(function() {
   // If there's no authToken stored, redirect user to the signin page (i.e., index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("https://seanh-webauthn.duckdns.org/index.html");
   }
   getActivity();
   $('input[type=radio]').click(function(){
    if(type != this.value){
      console.log("type changed");
      type = this.value;
      putCals();
      sendTypeUpdate();
    }
    
    
    });
   // $('#r').click(putCals('running'));
   // $('#b').click(putCals('biking'));

});
