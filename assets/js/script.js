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

function initialize(){
    //$mainEl.attr('class', 'col d-none');
    if(localStorage.getItem("history")){
        var locHistory = JSON.parse(localStorage.getItem("history"));
        var locNames = JSON.parse(localStorage.getItem("cityNames"));
        weatherData = locHistory;
        cityNames = locNames;
        //include initializing buttons here
        for(var i = 0; i < weatherData.length; i++){
            var $btn = $('<button>');
            $btn.text(locNames[i]);
            //$asideEl.children().children('div').eq(1).append($btn);
            $btn.addClass('historyBtn');
            //$btn.data('number', i);
            $btn.attr('data-number', i);
            $displayHistoryBtn.append($btn);
        }
    }

}

//Converts Unix to readable date
function getDate(unix){
    var date = new Date(unix*1000);
    var formatDate = date.toLocaleString();
    var dateOnly = formatDate.split(',');
    return dateOnly[0];
}

function handleSubmission(){
    var $city = $('#search-input').val();
    if(!$city){
        $alert.attr('class', 'alert alert-warning');
        $alert.text('You need to add a city ');
        $alert.append($strongEl);
        return;
    }

    var queryURL = "http://api.openweathermap.org/data/2.5/weather?units=imperial&q=" + $city + "&appid=" + apiKey;
    fetch(queryURL)
        .then(function(response){
            if(!response.ok){//if the response did not return successfully
                return Promise.reject('Error: ' + response.status + " (" + response.statusText + ")");
            }
            return response.json();
        })
        .then(function(data){
            var name = data.name;//Add the name to the buttons on the left side so that you can fill in the name later when someone calls that button
            var lat = data.coord.lat;
            var lon = data.coord.lon;

            var dailyForecastURL = "https://api.openweathermap.org/data/2.5/onecall?units=imperial&exclude=minutely,hourly,alerts&lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;

            fetch(dailyForecastURL)
            .then(function(response){
                return response.json();
            })
            .then(function(data){
                weatherData.push(data);//Add data to the existing array
                cityNames.push(name);
                localStorage.setItem("history", JSON.stringify(weatherData));
                localStorage.setItem("cityNames", JSON.stringify(cityNames));
                showWeather(data, name);
                //include appending a new button here
                var $btn = $('<button>');
                $btn.text(name);
                //$asideEl.children().children('div').eq(1).append($btn);
                $btn.addClass('historyBtn');
                $btn.attr('data-number', cityNames.length-1);
                $displayHistoryBtn.append($btn);

                $mainEl.attr('class', 'col');
            })
        })
        .catch(function(error){
            //console.log(error);
            //Add the textinput here to appear on the html webpage

            //var $alarm = $('<div>').attr('class', 'alert alert-warning alert-dismissible fade show');
            $alert.attr('class', 'alert alert-warning');
            $alert.text(error);
            $alert.append($strongEl);

        })//end of fetch
        $('#search-input').val("");
        console.log(weatherData);
        
}

function showWeather(data, name){
    var uvIndex = data.current.uvi;
    var $dailyForecast = $mainEl.children().eq(2).children();//div.row.forecast-container

    //Color code UV Index
    if(uvIndex >= 8){
        $mainEl.children().eq(0).children('p').eq(3).children().attr('class', 'bg-danger p-1');
    }else if(uvIndex > 5 && uvIndex < 8){
        $mainEl.children().eq(0).children('p').eq(3).children().attr('class', 'bg-warning p-1');
    }else if(uvIndex > 2 && uvIndex < 6){
        $mainEl.children().eq(0).children('p').eq(3).children().attr('class', 'bg-moderate p-1');
    }else{
        $mainEl.children().eq(0).children('p').eq(3).children().attr('class', 'bg-success p-1');
    }

    //Update Current Day Weather
    $mainEl.children().eq(0).children('figure').children().attr('src', 'https://openweathermap.org/img/wn/' + data.current.weather[0].icon + '@2x.png');//icon
    $mainEl.children().eq(0).children('figure').children().attr('alt', data.current.weather[0].main);
    $mainEl.children().eq(0).children('h2').text(name + " (" + getDate(data.current.dt) + ") ");//Name and Date
    $mainEl.children().eq(0).children('p').eq(0).text("Temp: " + data.current.temp + '\u00B0F');//Temp
    $mainEl.children().eq(0).children('p').eq(1).text("Wind: " + data.current.wind_speed + ' MPH');//Wind
    $mainEl.children().eq(0).children('p').eq(2).text("Humidity: " + data.current.humidity + ' %');//Humidity
    $mainEl.children().eq(0).children('p').eq(3).children().text(data.current.uvi);//UV Index

    
    //Update Weather for week
    for(var i = 0; i<5; i++){
        $dailyForecast.eq(i).children().children().children('figure').children().attr('src', 'https://openweathermap.org/img/wn/' + data.daily[i+1].weather[0].icon + '@2x.png');//Icon
        $dailyForecast.eq(i).children().children().children('figure').children().attr('alt', data.daily[i+1].weather[0].main);
        $dailyForecast.eq(i).children().children().children('h4').text(getDate(data.daily[i+1].dt));//Date
        $dailyForecast.eq(i).children().children().children('p').eq(0).text("Temp: " + data.daily[i+1].temp.day + '\u00B0F');//Temp
        $dailyForecast.eq(i).children().children().children('p').eq(1).text("Wind: " + data.daily[i+1].wind_speed + ' MPH');//Wind
        $dailyForecast.eq(i).children().children().children('p').eq(2).text("Humidity: " + data.daily[i+1].humidity + ' %');//Humidity
    }

    $mainEl.attr('class', 'col');
}

//console.log($mainEl.children().eq(2).children().eq(0).children().children().children('h4'));
console.log(JSON.parse(localStorage.getItem("history")));

initialize();

$submitBtn.on('click', handleSubmission);


$displayHistoryBtn.on('click', '.historyBtn', function(event){
    var index = event.target.getAttribute('data-number');
    showWeather(weatherData[index], cityNames[index]);
})

$alert.on('click', function(){
    $alert.attr('class', 'alert alert-warning d-none');
})

$resetBtn.on('click', function(){
    localStorage.clear();
    $('.historyBtn').remove();
    $mainEl.attr('class', 'col d-none');
    weatherData = [];
    cityNames = [];

})