var apiKey = '6b267a9f7672416a9294c35162bf6216';
var $submitBtn = $('#searchBtn');
var $mainEl = $('main');
var $asideEl = $('aside');
var $cityBtns = $('.historyBtn');
var $alert = $('.alert');
var $strongEl = $('<strong>');
var $resetBtn = $('#reset');
var $displayHistoryBtn = $('#display-button');
var weatherData = [];
var cityNames = [];

$strongEl.addClass('d-block');
$strongEl.text('Click here to close');

/*-------Section for functions------------*/

//Function populates page with buttons of past search history
function initialize(){
    if(localStorage.getItem("history")){
        var locHistory = JSON.parse(localStorage.getItem("history"));
        var locNames = JSON.parse(localStorage.getItem("cityNames"));
        weatherData = locHistory;
        cityNames = locNames;
        //Adds buttons of past searches
        for(var i = 0; i < weatherData.length; i++){
            var $btn = $('<button>');
            $btn.text(locNames[i]);
            $btn.addClass('historyBtn');
            $btn.attr('data-number', i);
            $displayHistoryBtn.append($btn);
        }
    }
}

//Function converts Unix to readable date
function getDate(unix){
    var date = new Date(unix*1000);
    var formatDate = date.toLocaleString();
    var dateOnly = formatDate.split(',');
    return dateOnly[0];
}

//Function updates weather information 
function showWeather(data, name){
    var uvIndex = data.current.uvi;
    var $dailyForecast = $mainEl.children().eq(2).children();
    //Color code for UV Index
    if(uvIndex >= 8){
        $mainEl.children().eq(0).children('p').eq(3).children().attr('class', 'bg-danger p-1');
    }else if(uvIndex > 5 && uvIndex < 8){
        $mainEl.children().eq(0).children('p').eq(3).children().attr('class', 'bg-warning p-1');
    }else if(uvIndex > 2 && uvIndex < 6){
        $mainEl.children().eq(0).children('p').eq(3).children().attr('class', 'bg-moderate p-1');
    }else{
        $mainEl.children().eq(0).children('p').eq(3).children().attr('class', 'bg-success p-1');
    }
    //Update current weather for today
    $mainEl.children().eq(0).children('figure').children().attr('src', 'https://openweathermap.org/img/wn/' + data.current.weather[0].icon + '@2x.png');//Icon
    $mainEl.children().eq(0).children('figure').children().attr('alt', data.current.weather[0].main);//<img> alt attribute
    $mainEl.children().eq(0).children('h2').text(name + " (" + getDate(data.current.dt) + ") ");//Name and Date
    $mainEl.children().eq(0).children('p').eq(0).text("Temp: " + data.current.temp + '\u00B0F');//Temp
    $mainEl.children().eq(0).children('p').eq(1).text("Wind: " + data.current.wind_speed + ' MPH');//Wind
    $mainEl.children().eq(0).children('p').eq(2).text("Humidity: " + data.current.humidity + ' %');//Humidity
    $mainEl.children().eq(0).children('p').eq(3).children().text(data.current.uvi.toFixed(2));//UV Index
    //Update Weather for week
    for(var i = 0; i<5; i++){
        $dailyForecast.eq(i).children().children().children('figure').children().attr('src', 'https://openweathermap.org/img/wn/' + data.daily[i+1].weather[0].icon + '@2x.png');//Icon
        $dailyForecast.eq(i).children().children().children('figure').children().attr('alt', data.daily[i+1].weather[0].main);//<img> alt attribute
        $dailyForecast.eq(i).children().children().children('h4').text(getDate(data.daily[i+1].dt));//Date
        $dailyForecast.eq(i).children().children().children('p').eq(0).text("Temp: " + data.daily[i+1].temp.day + '\u00B0F');//Temp
        $dailyForecast.eq(i).children().children().children('p').eq(1).text("Wind: " + data.daily[i+1].wind_speed + ' MPH');//Wind
        $dailyForecast.eq(i).children().children().children('p').eq(2).text("Humidity: " + data.daily[i+1].humidity + ' %');//Humidity
    }
    $mainEl.attr('class', 'col');//Enable visibility of main content
}//End of showWeather() function

//Function for fetching url requests and adding items to local storage
function handleSubmission(){
    var $city = $('#search-input').val();
    if(!$city){
        $alert.attr('class', 'alert alert-warning');
        $alert.text('You need to add a city ');
        $alert.append($strongEl);
        return;
    }
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?units=imperial&q=" + $city + "&appid=" + apiKey;
    //fetch coordinates for city
    fetch(queryURL)
        .then(function(response){
            if(!response.ok){
                return Promise.reject('Error: ' + response.status + " (" + response.statusText + ")");
            }
            return response.json();
        })
        .then(function(data){
            var name = data.name;
            var lat = data.coord.lat;
            var lon = data.coord.lon;
            var dailyForecastURL = "https://api.openweathermap.org/data/2.5/onecall?units=imperial&exclude=minutely,hourly,alerts&lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;
            //fetch current and daily forecasts
            fetch(dailyForecastURL)
            .then(function(response){
                return response.json();
            })
            .then(function(data){
                weatherData.push(data);
                cityNames.push(name);
                localStorage.setItem("history", JSON.stringify(weatherData));
                localStorage.setItem("cityNames", JSON.stringify(cityNames));
                showWeather(data, name);
                //section for adding a new button
                var $btn = $('<button>');
                $btn.text(name);
                $btn.addClass('historyBtn');
                $btn.attr('data-number', cityNames.length-1);
                $displayHistoryBtn.append($btn);
                //Enable visibility of main content
                $mainEl.attr('class', 'col');
            })
        })
        //Show an error alert if there was a problem with request
        .catch(function(error){
            $alert.attr('class', 'alert alert-warning');
            $alert.text(error);
            $alert.append($strongEl);
        })//end of fetch
    $('#search-input').val("");
}//end of handleSubmission() function

initialize();

/*----Section for event listeners-----------*/

//Event listener for search button
$submitBtn.on('click', handleSubmission);

//Event listener for city buttons
$displayHistoryBtn.on('click', '.historyBtn', function(event){
    var index = event.target.getAttribute('data-number');
    showWeather(weatherData[index], cityNames[index]);
})

//Event listener for alert notification
$alert.on('click', function(){
    $alert.attr('class', 'alert alert-warning d-none');
})

//Event listener for Clear All button
$resetBtn.on('click', function(){
    localStorage.clear();
    $('.historyBtn').remove();
    $mainEl.attr('class', 'col d-none');
    weatherData = [];
    cityNames = [];
})