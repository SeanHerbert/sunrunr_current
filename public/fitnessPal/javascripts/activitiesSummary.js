let map = null;

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

function displayActivities(data, textSatus, jqXHR) {
	var listItems = '<li class="collection-header grey lighten-4" ><h4>Activities Summary</h4></li>';
  if(data.activities.length==0){
    listItems += `<li class="collection-item teal lighten-5"><div><b>No activities to show.</b></div></li>`;
  }
	for(let activity of data.activities){
		link = "activitiesDetail.html?number="+activity.id;
                listItems+=
                `<li class="collection-item teal lighten-5">
                <div><b> Activity:</b> ${activity.type}<a href=${link} class="secondary-content"><i class="material-icons">info_outline</i></a></div>
                <li class="collection-item grey lighten-4"><div><b>Date:</b> ${activity.start}</div></li>
                <li class="collection-item grey lighten-4"><div><b>Duration:</b> ${activity.duration}</div></li>
                <li class="collection-item grey lighten-4"><div><b>Calories Burned:</b> Decide calculation</div></li>
                <li class="collection-item grey lighten-4"><div><b>UV Exposure:</b> ${activity.uv}</div></li>
                <li class="collection-item grey lighten-4"><div><b>Temperature:</b> ${activity.weather.temperature}</div></li>
                <li class="collection-item grey lighten-4"><div><b>Humidity:</b> ${activity.weather.humidity}</div></li>



                </li>`;

		
	}
	
	$('#activityList').html(listItems);
	
          
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

// Executes once the google map api is loaded, and then sets up the handler's and calls
// getRecentPotholes() to display the recent potholes
// function initRecent() {
  //  Allow the user to refresh by clicking a button.
    // $("#refreshRecent").click(getRecentPotholes);
    // getRecentPotholes();
// }

// Handle authentication on page load
$(function() {
   // If there's no authToken stored, redirect user to the signin page (i.e., index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("index.html");
   }
   getActivitiesSummary();
});
