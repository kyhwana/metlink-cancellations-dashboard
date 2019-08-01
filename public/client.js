const findMeButton = document.querySelector('.findMe');
// findMeButton.addEventListener('click', findMe);

var x = document.getElementById("demo");
var synth = window.speechSynthesis;
let voices = [];
let selectedVoice;

function getLocation() {
  console.log('getLocation')
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  x.innerHTML = "Latitude: " + position.coords.latitude + 
  "<br>Longitude: " + position.coords.longitude; 
}



function findMe(){
  getLocation();
  test();
}





const populateVoiceList = () => {
  console.log('populateVoiceList');
  console.log(speechSynthesis.getVoices());
  if(voices.length !== speechSynthesis.getVoices().length){
    voices = speechSynthesis.getVoices();
    
    voices.map((voice, i) => {
      if(voice.lang == 'en-GB' || voice.lang == 'en-NZ' ){
      console.log(voice);
      console.log(voice.name);
        if(voice.name == 'Google UK English Female'){
          selectedVoice = voice;
          console.log(voice.name);
        }
      }
    })
  }
}

populateVoiceList();

let nearbyStopIDs = [];

const getStopNearbyListener = function() {
  console.log('getStopDeparturesListener')
  nearbyStopIDs = [];
  let stopsNearby = JSON.parse(this.responseText);
  let buttonIndex = 1;
  stopsNearby.slice(0, 5).forEach(function(stopNearby){
    $('#getStopDepartures' + buttonIndex).text(stopNearby.Sms);
    document.getElementById('getStopDepartures' + buttonIndex).style.visibility = "visible"
    nearbyStopIDs.push(nearbyStopIDs);
    buttonIndex++;
    if(stopNearby.Name){
      console.log(stopNearby.Name);
    } else {
      console.log(stopNearby.Sms);
    }
  });
  
}


const getStopDeparturesListener = function() {
  // parse our response to convert to JSON
  console.log('getStopDeparturesListener')
  let stopDepartures = JSON.parse(this.responseText);
  
  let nextDeparture = null;

  let announced = false;
  let announcementCutoffSeconds = 600;
  let now = new moment();

  
  stopDepartures.Services.forEach(function(stopDeparture){
    
    let expectedDeparture = new moment(stopDeparture.DisplayDeparture);

    if(!nextDeparture || expectedDeparture < nextDeparture){
      nextDeparture = expectedDeparture;
    }

    let calculatedDepartureSeconds = (expectedDeparture - now)/1000;

    // console.log('calculatedDepartureSeconds');
    // console.log(calculatedDepartureSeconds);
    // console.log('stopDeparture.DisplayDepartureSeconds')
    // console.log(stopDeparture.DisplayDepartureSeconds)
    
    if(calculatedDepartureSeconds < announcementCutoffSeconds){
      
      let message = describeService(stopDeparture);
    
      const speech = new SpeechSynthesisUtterance(message);
      speech.voice = selectedVoice;
      speechSynthesis.speak(speech);
      
      announced = true;
      
    }    
    
  });
  
  if(!announced){
    message = 'There are no departures in the next ' + moment.duration(announcementCutoffSeconds , "seconds").humanize();
    message += '.\n The next service is in ' + moment.duration((nextDeparture - new moment())/1000, "seconds").humanize();
    console.log(message);
    const speech = new SpeechSynthesisUtterance(message);
    speech.voice = selectedVoice;
    speechSynthesis.speak(speech);

  }
}


function describeService(service){

  let now = new moment();
  let expectedDeparture = new moment(service.DisplayDeparture);
  let calculatedDepartureSeconds = (expectedDeparture - now)/1000;

  let message;
  if(service.Service.Mode.toUpperCase() == 'BUS'){
    message = 'Bus ' + service.Service.Code 
              /* + ' from "' + service.OriginStopName + '"'*/  
              + ' to "' + service.DestinationStopName + '"'
              + ' is departing in ' + moment.duration(calculatedDepartureSeconds, "seconds").humanize();
  } else
  {
    message = 'The '  + service.Service.Mode 
              /* + ' from "' + service.OriginStopName + '"'*/ 
              + ' to "' + service.DestinationStopName + '"'
              + ' is departing in ' + moment.duration(calculatedDepartureSeconds, "seconds").humanize();
  }

  console.log(message);

  message = message.replace(/WgtnStn/gi, 'Wellington')
  message = message.replace(/WELL-All stops/gi, 'Wellington (all stops)')
  message = message.replace(/JOHN-All stops/gi, 'Johnsonville (all stops)')
  message = message.replace(/UPPE/gi, 'Upper Hutt')
  message = message.replace(/WaikanaeStn/gi, 'Whycan-i')
  message = message.replace(/WAIK - All stops/gi, 'Whycan-i (all stops)')
  message = message.replace(/Waikanae/gi, 'whycan-i')
  message = message.replace(/Papakowhai/gi, 'pahpah-co fi')
  message = message.replace(/Paremata/gi, 'Para-mata')
  message = message.replace(/Whitby-NavigationDr/gi, 'Whitby, Navigation Drive')
  message = message.replace(/Porirua/gi, 'Poory Rua')
  message = message.replace(/RaumatiBchShops-Rau/gi, 'Row mati Beach Shops')
  message = message.replace(/Raumati/gi, 'Row mati')
  message = message.replace(/ParaparaumuStn-/gi, 'Para Para Umu Station ')
  message = message.replace(/Paraparaumu/gi, 'Para Para Umu')

  message = message.replace(/KapitiHealthCtr \(op/gi, 'Kapiti Health Centre')
  // message = message.replace(/Paekakariki/gi, 'Para Para Umu')
  

  console.log(message);
  
  return message;
}

function findLocation()
{
  populateVoiceList();
  const speech = new SpeechSynthesisUtterance("Locating...");
  speech.voice = selectedVoice;
  speechSynthesis.speak(speech);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getStopsNearby);
  } else {
    speech = new SpeechSynthesisUtterance("Geolocation not supported by this browser");
    speech.voice = selectedVoice;
    speechSynthesis.speak(speech);
  }
}

function getStopsNearby(position){
  const stopNearbyRequest = new XMLHttpRequest();
  stopNearbyRequest.onload = getStopNearbyListener;
  stopNearbyRequest.open('get', '/stopNearby/' + position.coords.latitude + '/' + position.coords.longitude);
  stopNearbyRequest.send();

}

function getStopDepartures(stopNumber){
  populateVoiceList();
  const speech = new SpeechSynthesisUtterance("Checking...");
  speech.voice = selectedVoice;
  speechSynthesis.speak(speech);

  const stopDeparturesRequest = new XMLHttpRequest();
  stopDeparturesRequest.onload = getStopDeparturesListener;
  stopDeparturesRequest.open('get', '/stopDepartures/' + stopNumber);
  stopDeparturesRequest.send();

}

function test(){
  const speech = new SpeechSynthesisUtterance("hello there - testing 1 2 3");
  speech.voice = selectedVoice;
  // speech.pitch = pitchInput.value;
  // speech.rate = rateInput.value;
  speechSynthesis.speak(speech);
}

$('#findMe').on('click', function(event) {
  // event.preventDefault(); // To prevent following the link (optional)
  findLocation();
});

$('#getStopDepartures').on('click', function(event) {
  // event.preventDefault(); // To prevent following the link (optional)
  const stopNumber = $('#stopNumber').val().toUpperCase();
  console.log(stopNumber);

  getStopDepartures(stopNumber);
});

$('#getStopDepartures1').on('click', function(event) {
  // event.preventDefault(); // To prevent following the link (optional)
  getStopDepartures();
});



