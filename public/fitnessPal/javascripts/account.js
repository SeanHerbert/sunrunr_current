
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
  $("#fullName").html(data.fullName);
  $("#lastAccess").html(iso2std(data.lastAccess));
  $("#main").show();
  if(data.thresh){
    console.log("thresh value is present");
    $("#curr-thresh-val").html(data.thresh);
    $("#currThresh").show();
  }
  
  // Add the devices to the list before the list item for the add device button (link)
  for (let device of data.devices) {
    $("#addDeviceForm").before("<li class='collection-item' id="+"'"+device.deviceId+"'"+"><b>ID: </b>" +
      device.deviceId + "<br><b>APIKEY: </b>" + device.apikey + 
      
      "<br><button id ='remove-" + device.deviceId + "' class = 'blue-grey waves-effect waves-dark btn-small red-text lighten-4'>Remove</button></li>");
    console.log(device.deviceId);
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
    $("#error_a").html("Error: " + status.message);
    $("#error_a").show();
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
      $("#addDeviceForm").before("<li class='collection-item' id = "+$('#deviceId').val()+"><b>ID: </b>" +
       $("#deviceId").val() + "<br><b>APIKEY: </b>" + data["apikey"] + 
        
         "<br><button id ='remove-" + $("#deviceId").val() + "' class = 'blue-grey waves-effect waves-dark btn-small red-text lighten-4'>Remove</button></li>");
      
       $("#remove-"+data.deviceId).click(function(event) {
      removeConfirm(event, data.deviceId); //was data.deviceId 
    });
       hideAddDeviceForm();
     })
     .fail(function(jqXHR, textStatus, errorThrown) {
       let response = JSON.parse(jqXHR.responseText);
       $("#error_d").html("Error: " + response.message);
       $("#error_d").show();
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
            $("#error_d").html("Error: " + response.message);
            $("#error_d").show();
        }
    }); 
}

// Show add device form and hide the add device button (really a link)
function showAddDeviceForm() {
  $("#deviceId").val("");        // Clear the input for the device ID
  $("#addDeviceControl").hide();   // Hide the add device link
  $("#addDeviceForm").slideDown();  // Show the add device form
}


function showCurrThresh() {
  
  $("#currThresh").slideDown();  // Show the add device form
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
  $("#error_d").hide();
}

function removeConfirm(event,deviceId){
  let devi = deviceId;
  let remove = confirm("Are you sure you want to Remove Device "+devi+"?");
  if(remove){
    $.ajax({
        url: '/node/devices/remove',
        type: 'DELETE',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: JSON.stringify({ 'deviceId': devi }), 
        responseType: 'json',
  contentType: 'application/json',
        success: function (data, textStatus, jqXHR) {
           $(`#${deviceId}`).remove(); 
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = jqXHR.responseText;
            $("#error_d").html("Error: " + response.message);
            $("#error_d").show();
        }
    }); 

  }
}

function showUpdateForm(){
   deets = $('#deets').detach();
    var insert =  `<div id="updateForm" class="card white teal-text" >
  <div class="card-content teal-text">
     <span class="card-title"><b><b>Update Account Information</b></b></span>
  <p class = "red-text">Leave fields you don't want changed blank.</p>
 
  
    <div class="input-field">
      <label for="new-name">New name</label>
      <input class = "teal-text" type="text" name="new-name" id="new-name">
    </div>
    <div class="input-field">
      <label for="new-email">New email</label>
      <input class = "teal-text" type="text" name="new-email" id="new-email" >
    </div>
    <div class="input-field">
      <label for="new-password">New password</label>
      <input class = "teal-text" type="password" name="new-password" id="new-password">
  </div>
  
      
      <button  id="updateIt" class="waves-effect waves-light btn">Submit Changes</button>
      <button  id="cancelIt" class="waves-effect waves-light btn">Cancel</button>
    
<div class="card-panel blue-text" id="ServerResponse"></div>
</div>
</div>`;

  $('#big-papa').html(insert);
  $('#updateIt').click(updateAcct);
  $('#cancelIt').click(function(){
    $('#big-papa').html(deets);  
  });

}

function regNotValid(){
  elist= "<div class='red-text text-darken-2'><ul>";
  document.getElementById("ServerResponse").innerHTML="";
  mailRed();

  passRed();
  elist+="</ul></div>";
  if(elist !== "<div class='red-text text-darken-2'><ul></ul></div>"){
    document.getElementById("ServerResponse").innerHTML=elist;
    return true;
  }
  else{
    document.getElementById("ServerResponse").style.display="none";
    return false;
  }

  



}

function mailRed(){
  var reg =/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
  //var red = $('#email');


if(!newEmail.replace(/\s/g, '').length){
    return;
  }
  if(!reg.test(newEmail)){
    // red.classList.add("error");
     document.getElementById("ServerResponse").style.display="block";

     elist += "<li>Invalid or missing email address.</li>";
  }
  else{
    //document.getElementById('email').removeAttribute("class");
    //document.getElementById("ServerResponse").style.display="none";

  }
}

function passRed(){
  var reg =/(.*[a-z].*)/;
  var reg1 =/(.*[A-Z].*)/;
  var reg2=/(.*\d.*)/;
  var flag = false;

  if(!newPwd.replace(/\s/g, '').length){
    return;
  }
  
  if (newPwd.length<10
 ||newPwd.length>20){
   flag = true;
    // red.classList.add("error");
    document.getElementById("ServerResponse").style.display="block";

    elist += "<li>Password must be between 10 and 20 characters.</li>";

 }

 if(!reg.test(newPwd)){
    flag = true;

    // red.classList.add("error");
    document.getElementById("ServerResponse").style.display="block";

    elist += "<li>Password must contain at least one lowercase character.</li>";

 }
  if(!reg1.test(newPwd)){
    flag = true;

    // red.classList.add("error");
    document.getElementById("ServerResponse").style.display="block";

    elist += "<li>Password must contain at least one uppercase character.</li>";

 }
  if(!reg2.test(newPwd)){
    flag = true;

   // red.classList.add("error");
   document.getElementById("ServerResponse").style.display="block";

   elist += "<li>Password must contain at least one digit.</li>";

 }
 //  if(document.getElementById('password').value!==document.getElementById('passwordConfirm').value ){
 //    flag = true;

 //    // red.classList.add("error");
 //    document.getElementById("ServerResponse").style.display="block";

 //    elist += "<li>Password and confirmation password don't match.</li>";
 //   }
 // if(flag ==false){
 //   // document.getElementById('password').removeAttribute("class");
 //  // document.getElementById("ServerResponse").style.display="none";

 // }


}

function showThreshForm(){
    sunBad = $("#sun-bad").detach();
    var insert_thr =  `<div id="updateForm" class="card white teal-text" >
  <div class="card-content teal-text">
     <span class="card-title"><b><b>Set UV Threshold</b></b></span>
     <p class = "red-text">Value must be numeric and positive.</p>
  
   <div class="input-field">
      <label for="thresh-val">Threshold</label>
      <input class = "teal-text" type="text" name="thresh-val" id="thresh-val">
    </div>
    
  
      
      <button  id="set-thresh" class="waves-effect waves-light btn">Set Threshold</button>
      <button  id="cancel-thresh" class="waves-effect waves-light btn">Cancel</button>
    
<div class="card-panel blue-text" id="err_thresh" style = "display: none;"></div>
</div>
</div>`;
  $('#err_thresh').hide();
  $('#thresh-setta').html(insert_thr);
  $('#set-thresh').click(setThresh);
  $('#cancel-thresh').click(function(){
  $('#thresh-setta').html(sunBad);  
  });

}
function setThresh(){
  thresh = $('#thresh-val').val();

  var isnum = /^\d+$/.test(thresh);
  
  
  
  
  if(!thresh.replace(/\s/g, '').length){
    //Please enter a threshold
    var noVal = `<div class='red-text text-darken-2'>Please enter a valid threshold.</div>`;
    $("#err_thresh").html(noVal);
    $('#err_thresh').show();
    return;
  }
  
  if(!isnum){
    
    var notNum = `<div class='red-text text-darken-2'>Please enter a valid threshold.</div>`;
    $("#err_thresh").html(notNum);
    $('#err_thresh').show();
    return;
  }

  // if(thresh<0){
  //   //Threshold must be a positive number
  //   var neg = `<div class='red-text text-darken-2'>Please enter a positive value.</div>`;
  //   $("#err_thresh").html(neg);
  //   $('#err_thresh').show();
  //   return;
  //  }

   $('#err_thresh').hide();
  // if(newName.replace(/\s/g, '').length){
  //   e = newEmail;
  // }

  var sendData = {threshold:thresh};

  $.ajax({
    url: '/node/users/threshold',
    type: 'PUT',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },  
    contentType: 'application/json',
    data: JSON.stringify(sendData), 
    dataType: 'json'
   })
    .done(threshSuccess)
    .fail(threshError);
  
}

function threshSuccess(data, textStatus, jqXHR){
  $('#thresh-setta').html(sunBad); 
  //put thresh into HTML
  $('#curr-thresh-val').html(thresh);
  showCurrThresh();
  console.log(data.changeData);

}

function threshError(jqXHR, textStatus, errorThrown){
  $('#thresh-setta').html(sunBad);  
  alert(textStatus);
  
}

function updateAcct(){
  //validate using same function as reg
  newEmail = $('#new-email').val();
  newName = $('#new-name').val();
  newPwd = $('#new-password').val();
  if(regNotValid()){
    return;
  }
  console.log(newEmail);
  console.log(newName);
  console.log(newPwd);
  var sendData = {e:newEmail,n:newName,p:newPwd};
  // if(newEmail.replace(/\s/g, '').length){
    
  // }
  // if(newName.replace(/\s/g, '').length){
  //   e = newEmail;
  // }

  $.ajax({
    url: '/node/users/update',
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
//show success message for second
//update deets
console.log(window.localStorage.getItem('authToken'));
if(data.newToken){
  window.localStorage.setItem('authToken', data.newToken);
}

console.log("~~~~~~~~~~~~~~~~~~~~~");
console.log(window.localStorage.getItem('authToken'));







$('#big-papa').html(deets);

if(newEmail.replace(/\s/g, '').length){
    $('#email').html(newEmail);   
}
  if(newName.replace(/\s/g, '').length){
     $('#fullName').html(newName); 
  }

let umsg = "<p class='green-text'><b>Acount information updated successfully!</b></p>"
$('#umsg').html(umsg);
$("#um").slideDown();
setTimeout(function(){$("#um").slideUp();},3000);

console.log(data);
console.log("Deets");
console.log(deets);
}

function updateError(data,textStatus,jqXHR){
//show fail message for second
let umsg = "<p class = 'red-text'>Acount information not updated. Contact Support.</p>"
$('#umsg').html(umsg);
$("#um").slideDown();
setTimeout(function(){$("#um").slideUp();},3000);
$('#big-papa').html(deets);
}



function iso2std(s) {
    var b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}



// Handle authentication on page load
$(function() {
    // If there's no authToekn stored, redirect user to 
  // the sign-in page (which is index.html)
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("https://seanh-webauthn.duckdns.org/index.html");
  }
  else {
    
    sendReqForAccountInfo();
  }
  loginClicks = 0;
  // Register event listeners
  $("#msgShow").hide();
  $("#success").hide();
  $("#fail").hide();
  $("#addDevice").click(showAddDeviceForm);
  //$("span").click(removeConfirm);
  $("#registerDevice").click(registerDevice);  
  $("#cancel").click(hideAddDeviceForm);  
  $('#logins').click(toggleLogins);
  $('#logcard').hide();
  $('#updateInfo').click(showUpdateForm);
  $('#thresh').click(showThreshForm);
  $('#currThresh').hide();
  $('#error_d').hide()
});
