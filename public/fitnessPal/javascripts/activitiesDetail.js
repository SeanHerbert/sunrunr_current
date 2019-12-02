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
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
	console.log(data);
	var type = "undefined"
	if (data.type !=""){
		type = data.type;
	}
	var activityType = `Activity Detail ${type}`
	var drop = `<option value='""' disabled selected>Change Activity Type</option>
        	<option value='Running'>Running</option>
        	<option value='Walking'>Walking</option>
          	<option value='Biking'>Biking</option>`;
	$('#activityType').html(activityType);
	$('#drop').html(drop);
  
	var listItems="";
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
	document.getElementById('dropdown2').addEventListener('input', function (event) {
                let link = window.location.href;
                let refNum = link.split("=")[1];
                console.log("sending get request to /activity/detail/refNum/Value");
                console.log("Event Listener this.value return= "+this.value);
                /*$.ajax({
                        url: '/node/activity/detail/'+refNum+'/'+this.value,
                        type: 'GET',
                        headers: { 'x-auth': window.localStorage.getItem("authToken") },
                        dataType: 'json'
                }).done(displaySamples).fail(displaySamplesError);*/
	}, false);
        console.log("finished request");
});
