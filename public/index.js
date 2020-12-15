var months = ["January","Febuary","March","April","May","June","July","August","September",
"October","November","December"];
var  daysOfTheWeek = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function daysInMonth (month, year) {
  return new Date(year, month, 0).getDate();
}
var currentDate = new Date();
var currentMonth = currentDate.getMonth();
var currentYear = currentDate.getFullYear();



generate_calendar(currentMonth,currentYear,currentDate);
//generate calendar

function generate_calendar(currentmonth,currentyear,currentdate){

  // var currentdate = new Date(currentyear,currentmonth);
   var newdate = currentdate.getDate();
  var days_in_month = daysInMonth(currentmonth+1,currentyear);
  var daysOfTheWeekIndex = new Date(currentyear,currentmonth,1).getDay();

 
  var table = document.querySelector(".calendar-table");
  var id =0;
  var dateValue =1;
  var tr1 = document.createElement("tr");
  tr1.setAttribute("class","row");
  for(var x=0; x<=6; x++){
    var th1 = document.createElement("th");;
    th1.setAttribute("class","daysOfTheWeek");
    th1.innerHTML = daysOfTheWeek[x];
    tr1.appendChild(th1);
  }
  table.appendChild(tr1);


  for(var i=0; i<6; i++){
    var tr2 = document.createElement("tr");
    tr2.setAttribute("class","row");
     for(var j=0; j<7; j++){
       var td = document.createElement("td");
      
      
    
        if(id >= daysOfTheWeekIndex && dateValue <= days_in_month){
          td.innerHTML = dateValue; 
          td.setAttribute("id",(id-(daysOfTheWeekIndex-1)).toString());
          td.setAttribute("class","cal-date");


          if(dateValue == newdate){
          
          
          td.style.background = "#16213e";
          td.style.color = "white";
         
          }
          dateValue++;
          
        }
        else{
          td.innerHTML = "";
        }
      
      tr2.appendChild(td);
      id++;
       }
       
       table.appendChild(tr2);
       
     }

     var year = $(".year");
     var month = $(".month");
     var date = $(".date");
     var day = $(".day");

     var dateInput = document.querySelector(".date-holder");
     var dayInput = document.querySelector(".day-holder");
     var monthInput = document.querySelector(".month-holder");
     var yearInput = document.querySelector(".year-holder");

     for(var v=0; v<year.length; v++){
      date[v].innerHTML = newdate;
      month[v].innerHTML = months[currentmonth];
      year[v].innerHTML = currentyear;
      daysInNumber = new Date(currentyear,currentmonth,newdate).getDay();
      day[v].innerHTML = days[daysInNumber];
      dayInput.value =  daysOfTheWeek[daysInNumber];
      dateInput.value = newdate
     monthInput.value = months[currentmonth];
     yearInput.value = currentyear;
   
     }
    
     //display the current month
    var cal_month = document.querySelector(".cal-months");
    cal_month.innerHTML = months[currentmonth];

    //display the current year
    var cal_year = document.querySelector(".cal-year");
    cal_year.innerHTML = currentyear;



  var dateValue = $(".cal-date");


dateValue.click(function(){
  var c = $(this).attr("id");
  for(var i=0; i<date.length; i++){
    date[i].innerHTML = c;
    daysInNumber = new Date(currentyear,currentmonth,c).getDay();
    day[i].innerHTML = days[daysInNumber];
    dateInput.value = c;
    dayInput.value =daysOfTheWeek[daysInNumber];
    monthInput.value = months[currentmonth];
    yearInput.value = currentyear;
  
  }
   window.scrollTo(0,window.innerHeight);

});
   
}


//calendar left navigation icon
var cal_left_nav = document.querySelector(".navLeft");
cal_left_nav.addEventListener("click",function(){
  Onclick_Left_Nav(currentMonth,currentYear);
});

function Onclick_Left_Nav(current_month,current_year){
  var table = document.querySelector(".calendar-table");
    var tr = document.querySelectorAll(".row")
    for(var i=0; i<tr.length; i++){
      table.removeChild(tr[i]);
  }
  var month = 0;
  if(months[current_month] == "January"){
    current_month = 12;
    month = current_month-1;
    current_year = current_year - 1;
  }
  else{
    var month = current_month-1;
  }
  
  var date = new Date(current_year,month);
 
  generate_calendar(month,current_year,date);

  currentMonth = month;
  currentYear = current_year;
}

//calendar right navigation icon
var cal_right_nav = document.querySelector(".navRight");
cal_right_nav.addEventListener("click",function(){
  Onclick_Right_Nav(currentMonth,currentYear);
});

function Onclick_Right_Nav(current_month,current_year){
  var table = document.querySelector(".calendar-table");
    var tr = document.querySelectorAll(".row")
    for(var i=0; i<tr.length; i++){
      table.removeChild(tr[i]);
    }
    var month = 0;
    if(months[current_month] == "December"){
      current_month = -1;
      month = current_month+1;
      current_year = current_year+1;
    }
    else{
      var month = current_month+1;
    }
    
  var date = new Date(current_year,month);
  generate_calendar(month,current_year,date);

  currentMonth = month;
  currentYear = current_year;
}



// // duration container dropdown
// var title = document.querySelectorAll(".title input");
// var title_length = title.length;
// for(var i=0; i<title_length; i++){
//   title[i].addEventListener("keyup",durationDropDown);
// }

// function durationDropDown(){

//     var display_duration_box = document.querySelectorAll(".timeAndSubmit")
//     for(var i = 0; i<display_duration_box.length; i++){
//       display_duration_box[i].style.visibility = "visible";
//     }
// }






  
  





  


