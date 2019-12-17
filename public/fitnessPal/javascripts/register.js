
function sendRegisterRequest() {
  let email = $('#email').val();
  let password = $('#password').val();
  let fullName = $('#fullName').val();
  let passwordConfirm = $('#passwordConfirm').val();
  
  
  if(regNotValid()){
    return;
  }
  
  $.ajax({
   url: '/node/users/register',
   type: 'POST',
   contentType: 'application/json',
   data: JSON.stringify({email:email, fullName:fullName, password:password}),
   dataType: 'json'
  })
    .done(registerSuccess)
    .fail(registerError);
}

function regNotValid(){
  elist= "<div class='red-text text-darken-2'><ul>";
  document.getElementById("ServerResponse").innerHTML="";
  nameRed();
  mailRed();

  passRed();
  elist+="</div></ul>";
  if(elist !== "<ul></ul>"){
    console.log(elist);
    document.getElementById("ServerResponse").innerHTML=elist;
    return true;
  }
  else{
    return false;
  }

  



}

function mailRed(){
  var reg =/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
  var red = $('#email');
  if(!reg.test(red.val())){
    // red.classList.add("error");
     document.getElementById("ServerResponse").style.display="block";

     elist += "<li>Invalid or missing email address.</li>";
  }
  else{
    document.getElementById('email').removeAttribute("class");
    document.getElementById("ServerResponse").style.display="none";

  }
}

function passRed(){
  var reg =/(.*[a-z].*)/;
  var reg1 =/(.*[A-Z].*)/;
  var reg2=/(.*\d.*)/;
  var flag = false;


  var red = document.getElementById('password');
  if (document.getElementById('password').value.length<10
 ||document.getElementById('password').value.length>20){
   flag = true;
    // red.classList.add("error");
    document.getElementById("ServerResponse").style.display="block";

    elist += "<li>Password must be between 10 and 20 characters.</li>";

 }

 if(!reg.test(red.value)){
    flag = true;

    // red.classList.add("error");
    document.getElementById("ServerResponse").style.display="block";

    elist += "<li>Password must contain at least one lowercase character.</li>";

 }
  if(!reg1.test(red.value)){
    flag = true;

    // red.classList.add("error");
    document.getElementById("ServerResponse").style.display="block";

    elist += "<li>Password must contain at least one uppercase character.</li>";

 }
  if(!reg2.test(red.value)){
    flag = true;

   // red.classList.add("error");
   document.getElementById("ServerResponse").style.display="block";

   elist += "<li>Password must contain at least one digit.</li>";

 }
  if(document.getElementById('password').value!==document.getElementById('passwordConfirm').value ){
    flag = true;

    // red.classList.add("error");
    document.getElementById("ServerResponse").style.display="block";

    elist += "<li>Password and confirmation password don't match.</li>";
   }
 if(flag ==false){
   // document.getElementById('password').removeAttribute("class");
   document.getElementById("ServerResponse").style.display="none";

 }


}


function nameRed(){
  var red = document.getElementById('fullName');

  if(document.getElementById('fullName').value.length===0||!document.getElementById('fullName').value.replace(/\s/g, '').length){
    // red.classList.add("error");
    document.getElementById("ServerResponse").style.display="block";

    elist += "<li>Missing full name.</li>";

  }
  else{
    // document.getElementById('fullName').removeAttribute("class");
    document.getElementById("ServerResponse").style.display="none";

  }

}




function registerSuccess(data, textStatus, jqXHR) {
  if (data.success) {  
    window.location = "index.html";
  }
  else {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Error: " + data.message + "</span>");
    $('#ServerResponse').show();
  }
}

function registerError(jqXHR, textStatus, errorThrown) {
  if (jqXHR.statusCode == 404) {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Server could not be reached.</p>");
    $('#ServerResponse').show();
  }
  else {
    $('#ServerResponse').html("<span class='red-text text-darken-2'>Error: " + jqXHR.responseJSON.message + "</span>");
    $('#ServerResponse').show();
  }
}

$(function () {
  $('#signup').click(sendRegisterRequest);
});

