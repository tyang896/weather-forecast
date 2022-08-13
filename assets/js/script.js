var apiKey = '6b267a9f7672416a9294c35162bf6216';
var $submitBtn = $('#searchBtn');
var $mainEl = $('main');

var weatherData = [];

function handleSubmission(event){
    event.preventDefault();
    var $city = $('#search-input').val();
    if(!$city){
        console.error('You need to add a city');
        //Add textinput here to appear on the html webpage
        return;
    }

    var queryURL = "http://api.openweathermap.org/data/2.5/weather?units=imperial&q=" + $city + "&appid=" + apiKey;
    fetch(queryURL)
        .then(function(response){
            if(!response.ok){//if the response did not return successfully
                return Promise.reject('Error: ' + response.status + " (" + response.statusText + ")");
                //throw response.json();
            }
            return response.json();
        })
        .then(function(data){
            var name = data.name;//Add the name to the buttons on the left side so that you can fill in the name later when someone calls that button
            var lat = data.coord.lat;
            var lon = data.coord.lon;
            var dailyForecastURL = "https://api.openweathermap.org/data/2.5/onecall?units=imperial&exclude=current,minutely,hourly,alerts&lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;

            fetch(dailyForecastURL)
            .then(function(response){
                return response.json();
            })
            .then(function(data){
                console.log(data);
                weatherData.push(data);
                localStorage.setItem("History", JSON.stringify(weatherData));
                //Add Chnages to text here:
                //$mainEl.children().eq(0).children('h2').text(name + data.daily[0].)
            })
        })
        .catch(function(error){
            console.log(error);
            //Add the textinput here to appear on the html webpage
        })//end of fetch

        console.log(weatherData);
}

console.log(JSON.parse(localStorage.getItem("History")));
console.log($mainEl.children().eq(0).children('h2').text());

$submitBtn.on('click', handleSubmission);