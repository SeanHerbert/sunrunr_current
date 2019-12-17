function calcSums(){
    // Need to modify in a way to only calculate for past 7 days
    $.ajax({
        url: '/node/activity/summary/7',
        type: 'GET',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },
        responseType: 'json',
        success: (res) => {
            

            var msMinute = 60*1000;
            var msDay = 60*60*24*1000;
            var msSecond = 1000;
            var msHour = 60*60*1000;

            var total = 0;
            var sumUV = 0;
            var burned = 0;

            var today = new Date();
            res = JSON.parse(res);
            var activities = res.activities;

            console.log(activities);
            activities.forEach((data)=>{

                //Total Duration Activity
                var begin = iso2std(data.start);
                console.log("begin: " + begin);

                var duration_msecs = data.samples.length * 15000;

                // var created = iso2std(data.createdTime);
                // timeSince = today - created;

               // var days = Math.floor((timeSince) / msDay);

               // if(days <= 7){
                    //total activity time
                    total += duration_msecs;

                    // Total UV
                    var i = 0;
                    var avgSpeed = 0 ;

                    for (i = 0; i < data.samples.length; i++){
                        sumUV += data.samples[i].uv;
                        avgSpeed += data.samples[i].speed;
                    }
                    avgSpeed = avgSpeed/data.samples.length;

                    // Total Calories Burned
                    //Each activity needs to be identified as either walking, biking, or running

                     var time = Math.ceil((duration_msecs) / msMinute);
                    // console.log("time = " + time);
  
  if(data.type == 'walking'){
  if(avgSpeed<=2){
      burned += 3*time; 
  }
  if(avgSpeed<=3 && avgSpeed>2){
    burned +=4.3*time;
  }
  if(avgSpeed<=4 && avgSpeed>3){
    burned+= 5.8*time;
  }
  if(avgSpeed<=5 && avgSpeed>4){
    burned +=9.5*time;
  }
  if(avgSpeed>5){
    burned +=12*time;
  }
}

if(data.type == 'running'){
  if(avgSpeed<=5){
      burned +=10*time; 
  }
  if(avgSpeed<=6 && avgSpeed>5){
    burned +=13.7*time;
  }
  if(avgSpeed<=7 && avgSpeed>6){
    burned +=15.7*time;
  }
  if(avgSpeed<=8 && avgSpeed>7){
    burned +=17.7*time;
  }
  if(avgSpeed>8){
    burned +=21*time;
  }
}

if(data.type == 'biking'){
  if(avgSpeed<=10){
      burned+= 5.4*time; 
  }
  if(avgSpeed<=12 && avgSpeed>10){
    burned+= 8*time;
  }
  if(avgSpeed<=14 && avgSpeed>12){
    burned +=10.6*time;
  }
  if(avgSpeed<=16 && avgSpeed>14){
    burned+= 13.5*time;
  }
  if(avgSpeed<=19 && avgSpeed>16){
    burned +=16*time;
  }
  if(avgSpeed>19){
    burned +=21*time;
  }
}


                    
            });


            var hours = Math.floor((total) % msDay / msHour);
            var minutes = Math.floor((total % msDay) / msMinute);
            var seconds = Math.floor((total % msDay) % msMinute / msSecond);


            burned = burned.toFixed(2);
            sumUV = sumUV.toFixed(2);
            $("#score1").html(`${("0" + hours).slice(-2)}:${("0" + minutes).slice(-2)}:${("0" + seconds).slice(-2)}`);
            $("#score2").html(burned);
            $("#score3").html(sumUV);


        }
    });
}
function dayOfWeek(num){
    switch(num){     
        case 0 : return "SUNDAY";
        case 1 : return "MONDAY";
        case 2 : return "TUESDAY";
        case 3 : return "WEDNESDAY";
        case 4 : return "THURSDAY";
        case 5 : return "FRIDAY";
        case 6 : return "SATURDAY";
    }
}
function iso2std(s) {
    var b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}


// Handle authentication on page load
$(function() {
    // If there's no authToekn stored, redirect user to 
    // the sign-in page (which is index.html)
    //if (!window.localStorage.getItem("authToken")) {
        //window.location.replace("index.html");
    //}
    //else {
        calcSums();
    //}
});