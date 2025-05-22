var fields;
var sub_time = 0;
var follow_time = 0;
var bit_amt = 0;
var bit_time = 0;
var tip_amt = 0;
var tip_time = 0;
var tip_currency = "€";
var countDownTimer = new Date().getTime();
var initial_duration = 0;
var max_duration = 0;
var maxEndDate = new Date().getTime();
var show_info = false;
var info_interval = 0;
var info_duration = 0;
//** LOAD IN INITIAL WIDGET DATA
//*
//*
window.addEventListener('onWidgetLoad', function (obj) {
  // Get base data
  let data = obj["detail"]["session"]["data"];
  //Exmaple for Pulling Fields
  const fieldData = obj["detail"]["fieldData"];
  fields = fieldData;
  sub_time = fieldData["sub_time"];
  follow_time = fieldData["follow_time"];
  bit_amt = fieldData["bit_minimum"];
  bit_time = fieldData["bit_time"];
  tip_amt = fieldData["tip_minimum"];
  tip_time = fieldData["tip_time"];
  tip_currency = fieldData["tip_currency"];
  initial_duration = fieldData["initial_duration"];
  max_duration = fieldData["max_duration"];
  show_info = fieldData["show_info"];
  info_interval = fieldData["info_interval"];
  info_duration = fieldData["info_duration"];
  //This is the maximum end time for the stream. We need to use this when we add time
  //to ensure we don't exceed this. 
  maxEndDate = maxEndDate + (max_duration * 1000 * 60 * 60);
  countDownTimer = new Date().getTime();
  countDownTimer = countDownTimer + (initial_duration * 1000 * 60 * 60);
  
  //This section sets all the text. So then in the repeating function, I only need to show/hide, rather than re-setting the p values
  var subText = "";
  var bitText = "";
  var tipText = "";
  var maxText = "";

  subText = "Sub: +" + Math.round(sub_time * 60).toString() + " Sekunden";
  bitText = bit_amt.toString() + " Bit(s): " + Math.round(bit_time * 60).toString() + " Sekunden";
  tipText = tip_amt.toString() + tip_currency + " Dono: " + Math.round(tip_time * 60).toString() + " Sekunden";
  if (max_duration > 0) {
    maxText = "Maximale Streamzeit: " + max_duration.toString() + " Stunden"; 
  }

  $('#SubsText').text(subText);
  $('#BitsText').text(bitText);
  $('#TipsText').text(tipText);
  $('#MaxText').text(maxText);
  $('#infoPanel').hide();
  
  
  var x = setInterval(function(){
    var now = new Date().getTime();
    var diff = countDownTimer - now; 

    if (diff <= 0) {
      clearInterval(x);
      document.getElementById('countdown').innerHTML = "0d 0h 0m 0s";

      $('popup').fadeIn(500);
      setTimeout(function() {
        $('#popup').fadeOut(500);
      }, 3000)
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);
    document.getElementById('countdown').innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s";
  }, 1000);
  
  $('#event').hide();
  $('.eventContainer').hide();
  info_interval = info_interval * 60000;
  info_duration = info_duration * 1000; 
  if (show_info){

  var y = setInterval(function(){
  //Here we will show the panel, delay then hide the panel. 
  //$('#infoPanel').show().delay(info_duration).hide();
  $('#infoPanel').show("fast").delay(info_duration).hide("fast");
  }, info_interval);
  }
});

//** UPDATE INFO WIDGET INFORMATION
//
//
window.addEventListener('onEventReceived', function (obj) {
  const listener = obj.detail.listener;
  const event = obj["detail"]["event"];
  var amount = 0;
  var toAdd = 0; 
  
    if ( listener == 'subscriber-latest' ) {
      addTimeToCounter(sub_time, event, "subbed");
    }
    else if (listener == 'cheer-latest' ){
	    amount = event["amount"];
      if (amount >= bit_amt){ 
          toAdd = Math.floor(amount/bit_amt);
          addTimeToCounter(toAdd * bit_time, event, "cheered"); 
      }
    }
  
    else if (listener == 'tip-latest' ){
       amount = event["amount"];
       if (amount >= tip_amt){
           toAdd = Math.floor(amount/tip_amt);
  	   	   addTimeToCounter(toAdd * tip_time, event, "tipped");	
       }
    }

    else if (listener == 'follower-latest') {
      addTimeToCounter(follow_time, event, "followed");
    }
 
});

function addTimeToCounter(minToAdd, event, type, amt){
  var newTime = countDownTimer + (minToAdd * 60000);
  //logic to check to see if the time added would take the stream over the maximun set
  if (newTime > maxEndDate){
  	countDownTimer = maxEndDate;
  }
  else {
    countDownTimer = countDownTimer + (minToAdd * 60000);
  }
  
  var eventMsg = event["name"] + " " + type;
  var minuteString = minToAdd.toString();
  if (type ==  "subbed"){
      eventMsg = eventMsg + " + " + minuteString + " Minuten länger online"; 
  }
  else if (type == "cheered"){
    amountString = event["amount"].toString();
    eventMsg = eventMsg + " + " + minuteString + " Minuten länger online";  
  }
  else{
    amountString = event["amount"].toString();
    eventMsg = eventMsg + " + " + minuteString + " Minuten länger online"; 
  }
  document.getElementById('event').innerHTML = eventMsg;
  $('.eventContainer').show().animate({height: "50px"});
  $('#event').show();
  setTimeout(function(){
        clearEvent();
	},3000);   
  
}

function clearEvent(){
  $('.eventContainer').animate({height: "0px"}).hide();  
  $('#event').hide();
    
}