
function getActivitiesSummary() { 
  $.ajax({
    url: '/node/activity/summary/30',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(displayActivities)
    .fail(displayActivitiesError);
}




function getCals(){
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
return burned.toFixed(2);
}






function displayActivities(data, textSatus, jqXHR) {
  var listItems = '<li class="collection-header grey lighten-4" ><h4>Activities Summary</h4></li>';
  if(data.activities.length==0){
    listItems += `<li class="collection-item teal lighten-5"><div><b>No activities to show.</b></div></li>`;
  }
  for(let activity of data.activities){
    uvv= Number.parseFloat(activity.uv);
    uvv = uvv.toFixed(2);
    speeds = [];
     uvs = [];
     avgSpeed = 0;
     totUV = 0;
     len = activity.samples.length;
     mins = len/4;
     type = activity.type;
    for (let s of activity.samples){
        
        avgSpeed +=s.speed;
        totUV += s.uv;

    }
    avgSpeed = avgSpeed / (len);
    totUV = totUV.toFixed(2);
    calsBurned = getCals();
    start = parseISOString(activity.start);
   

    link = "activitiesDetail.html?number="+activity.id;
                listItems+=
                `<li class="collection-item teal lighten-5">
                <div><b> Activity:</b> ${type}<a href=${link} class="secondary-content"><i class="material-icons">info_outline</i></a></div>
                <li class="collection-item grey lighten-4"><div><b>Date:</b> ${start}</div></li>
                <li class="collection-item grey lighten-4"><div><b>Duration:</b> ${activity.duration}</div></li>
                <li class="collection-item grey lighten-4"><div><b>Calories Burned:</b> ${calsBurned}</div></li>
                <li class="collection-item grey lighten-4"><div><b>UV Exposure:</b> ${totUV} watts/cm<sup>2</sup></div></li>
                <li class="collection-item grey lighten-4"><div><b>Temperature:</b> ${activity.weather.temperature}&deg;F</div></li>
                <li class="collection-item grey lighten-4"><div><b>Humidity:</b> ${activity.weather.humidity}%</div></li>



                </li>`;

    
  }
  
  $('#activityList').html(listItems);
  putMsg(data);
  
          
}


function putMsg(data){
  var msg = `<li class="collection-item teal lighten-5"><div><b>Since you became a FitnessPal, you have logged:</b></div></li>`;
  if( data.activities.length==0){

     msg +=`<li class="collection-item grey lighten-4"><div>0 Activities, get moving. You can do it!</div></li>`;
              

  }
  else{
      msg +=`<li class="collection-item grey lighten-4"><div>${data.activities.length} activities, keep up the good work!</div></li>`;
              
  }
   $('#good-job').html(msg);
}

function displayActivitiesError(jqXHR, textStatus, errorThrown) {
  // If authentication error, delete the authToken 
  // redirect user to sign-in page (which is index.html)
  if( jqXHR.status === 401 ) {
    window.localStorage.removeItem("authToken");
    window.location.replace("index.html");
  } 
  else {
    $("#activityList").html("Error: " + status.message);
    
  } 
}


function parseISOString(s) {
    var b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}


// Handle authentication on page load
$(function() {
   // If there's no authToken stored, redirect user to the signin page (i.e., index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("https://seanh-webauthn.duckdns.org/index.html");
   }
   getActivitiesSummary();
});
