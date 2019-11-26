function getSamplesSummary() {
  let link = window.location.href;
  let refNum = link.split("=")[1];
        console.log("sending get request to /activity/detail/")
  $.ajax({
    url: '/node/activity/detail/'+refNum,
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(displaySamples)
    .fail(displaySamplesError);
}

function displaySamples(data, textSatus, jqXHR) {
        
  var listItems = '<li class="collection-header grey lighten-4" ><h4>Activity Detail</h4></li>';
  

  for (let sample of data.samples){
                               listItems+=
                `<li class="collection-item teal lighten-5">
                <div><b>Sample</b></div>
                <li class="collection-item grey lighten-4"><div><b>UV Exposure:</b> ${sample.uv}</div></li>
                <li class="collection-item grey lighten-4"><div><b>Latitude:</b> ${sample.latitude}</div></li>
                <li class="collection-item grey lighten-4"><div><b>Longitude:</b> ${sample.longitude}</div></li>
                <li class="collection-item grey lighten-4"><div><b>Speed:</b> ${sample.speed}</div></li>

                </li>`;

  }
        $('#activityDetail').html(listItems);
}

function displaySamplesError(jqXHR, textStatus, errorThrown) {
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

// Handle authentication on page load
$(function() {
   // If there's no authToken stored, redirect user to the signin page (i.e., index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("index.html");
   }
   getSamplesSummary();
        console.log("finished request");
});
