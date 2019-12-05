

function sendReqForAccountInfo() {
// alert(window.localStorage.getItem("authToken"));
  $.ajax({
    url: '/node/users/account',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    contentType: 'application/json',
    dataType: 'json'
  })
    .done(accountInfoSuccess)
    .fail(accountInfoError);
}

function accountInfoSuccess(data, textSatus, jqXHR) {
  $("#email").html(data.email);
  $("#fullName").html(data.fullname);
  $("#lastAccess").html(data.lastaccess);
  $("#main").show();
  
  // Add the devices to the list before the list item for the add device button (link)
  for (var device of data.devices) {
    $("#addDeviceForm").before("<li class='collection-item'>ID: " +
      device.deviceId + ", APIKEY: " + device.apikey + 
      " <button id='ping-" + device.deviceId + "' class='waves-effect waves-light btn'>Ping</button> " +
      "<br><br><button id ='remove-" + device.deviceId + "' class = 'red-text'>Remove</button></li>");
    $("#ping-"+device.deviceId).click(function(event) {
      pingDevice(event, device.deviceId);
    });
    $("#remove-"+device.deviceId).click(function(event) {
      removeConfirm(event, device.deviceId);
    });
  }
}

function accountInfoError(jqXHR, textStatus, errorThrown) {
  // If authentication error, delete the authToken 
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

// Registers the specified device with the server
function registerDevice() {
  $.ajax({
    url: '/node/devices/register',
    type: 'POST',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },  
    contentType: 'application/json',
    data: JSON.stringify({ deviceId: $("#deviceId").val() }), 
    dataType: 'json'
   })
     .done(function (data, textStatus, jqXHR) {
       // Add new device to the device list
      $("#addDeviceForm").before("<li class='collection-item' id = "+$('#deviceId').val()+">ID: " +
       $("#deviceId").val() + ", APIKEY: " + data["apikey"] + 
         " <button id='ping-" + $("#deviceId").val() + "' class='waves-effect waves-light btn'>Ping</button> " +
         "<br><button id ='remove-" + $("#deviceId").val() + "' class = 'red-text'>Remove</button></li>");
       $("#ping-"+$("#deviceId").val()).click(function(event) {
         pingDevice(event, data.deviceId);
       });
       $("#remove-"+$("#deviceId").val()).click(function(event) {
      removeConfirm(event, data.deviceId);
    });
       hideAddDeviceForm();
     })
     .fail(function(jqXHR, textStatus, errorThrown) {
       let response = JSON.parse(jqXHR.responseText);
       $("#error").html("Error: " + response.message);
       $("#error").show();
     }); 
}

function pingDevice(event, deviceId) {
 

   $.ajax({
        url: '/node/devices/ping',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: { 'deviceId': deviceId }, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
            console.log("Pinged.");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
}

// Show add device form and hide the add device button (really a link)
function showAddDeviceForm() {
  $("#deviceId").val("");        // Clear the input for the device ID
  $("#addDeviceControl").hide();   // Hide the add device link
  $("#addDeviceForm").slideDown();  // Show the add device form
}
function toggleLogins(){
  if(loginClicks%2==0){
    requestLogins();
    $('#logcard').slideDown();

  }
  else{
    $('#logcard').slideUp();
  }
  loginClicks++;

}

function requestLogins(){
  $.ajax({
    url: '/node/users/logins',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    contentType: 'application/json',
    dataType: 'json'
  })
    .done(displayLogins)
    .fail(displayLoginsError);
 

}

function displayLogins(logins, textStatus, jqXHR) {
  console.log(logins);
  var listItems = '<li class="collection-header grey lighten-4" ><h4>Login History</h4></li>';
  if(logins.length==0){
    listItems += `<li class="collection-item teal lighten-5"><div><b>Login data is empty.</b></div></li>`;
  }
  for(let login of logins){
                listItems+=
                `<li class="collection-item teal lighten-5">
                <div><b> Date:</b> ${login.time}</div>
                <li class="collection-item grey lighten-4"><div><b>Location:</b> ${login.loc}</div></li>
                <li class="collection-item grey lighten-4"><div><b>IP address:</b> ${login.ip}</div></li>
                </li>`;

    
  }
  
  $('#loglist').html(listItems);
  
          
}


function displayLoginsError(jqXHR, textStatus, errorThrown){
        $('#loglist').html(`<li class="collection-item teal lighten-5"><div><b>Could not retrieve login data.</b></div></li>`);
}




// Hides the add device form and shows the add device button (link)
function hideAddDeviceForm() {
  $("#addDeviceControl").show();  // Hide the add device link
  $("#addDeviceForm").slideUp();  // Show the add device form
  $("#error").hide();
}

function removeConfirm(event,deviceId){
  let remove = confirm("Are you sure you want to Remove this Device?");
  if(remove){
    $.ajax({
        url: '/node/devices/remove',
        type: 'DELETE',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: JSON.stringify({ 'deviceId': deviceId }), 
        responseType: 'json',
  contentType: 'application/json',
        success: function (data, textStatus, jqXHR) {
           $(`#${deviceId}`).remove(); 
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = jqXHR.responseText;
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 

  }
}
// Handle authentication on page load
$(function() {
  
  // If there's no authToekn stored, redirect user to 
  // the sign-in page (which is index.html)
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("index.html");
  }
  else {
    
    sendReqForAccountInfo();
  }
  loginClicks = 0;
  // Register event listeners
  $("#addDevice").click(showAddDeviceForm);
  //$("span").click(removeConfirm);
  $("#registerDevice").click(registerDevice);  
  $("#cancel").click(hideAddDeviceForm);  
  $('#logins').click(toggleLogins);
  $('#logcard').hide();
});
