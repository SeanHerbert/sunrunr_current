function calculateData(){
    // Need to modify in a way to only calculate for past 7 days
    $.ajax({
        url: '/node/activity/summary/7',
        type: 'GET',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },
        responseType: 'json',
        success: (res) => {
            console.log(res);

            var msMinute = 60*1000;
            var msDay = 60*60*24*1000;
            var msSecond = 1000;
            var msHour = 60*60*1000;

            var total = 0;
            var sumUV = 0;
            var sumCal = 0;

            var today = new Date();
            res = JSON.parse(res);
            var activities = res.activities;

            console.log(activities);
            activities.forEach((data)=>{

                //Total Duration Activity
                var begin = parseISOString(data.start);
                console.log("begin: " + begin);

                var duration_msecs = data.samples.length * 15000;

                // var created = parseISOString(data.createdTime);
                // timeSince = today - created;

               // var days = Math.floor((timeSince) / msDay);

               // if(days <= 7){
                    //total activity time
                    total += duration_msecs;

                    // Total UV
                    var i = 0;
                    for (i = 0; i < data.samples.length; i++){
                        sumUV += data.samples[i].uv;
                    }

                    // Total Calories Burned
                    //Each activity needs to be identified as either walking, biking, or running

                     var time = Math.ceil((duration_msecs) / msMinute);
                    // console.log("time = " + time);

                    // Speed determines the activity type (Guessed these values) 
                    if (data.type === "walking"){
                        console.log("calculating walking calories");
                        var calWalk = 0.175 * (time) * 4.5 * 60
                        sumCal += calWalk;
                    }
                    else if (data.type === "running") {
                        console.log("calculating running calories");
                        var calRun = 0.175 * (time) * 8 * 60
                        sumCal += calRun;
                    }
                    else if (data.type === "biking") {
                        console.log("calculating biking calories");
                        var calBike = 0.175 * (time) * 4 * 60
                        sumCal += calBike;
                    }
                    else{
                        console.log("error with calories");
                    }
               // }
            });


            var hours = Math.floor((total) % msDay / msHour);
            var minutes = Math.floor((total % msDay) / msMinute);
            var seconds = Math.floor((total % msDay) % msMinute / msSecond);


            console.log("Total time: ");
            console.log(total);

            console.log("UVsum = " + sumUV);
            console.log("Calsum = " + sumCal);     

            $("#score1").html(`${("0" + hours).slice(-2)}:${("0" + minutes).slice(-2)}:${("0" + seconds).slice(-2)}`);
            $("#score2").html(sumCal);
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
function parseISOString(s) {
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
        calculateData();
    //}
});