$(document).ready(function () {
    $('#getEnteredCityWeather,#prevSearches').on('click', function () {
        
        var clickEvent = $(event.target)[0];
        var location = "";
        
        if (clickEvent.id === "getEnteredCityWeather") {
            location = $('#cityEntered').val().trim().toUpperCase();
        } 
        
        else if (clickEvent.className === ("cityList")) {
            location = clickEvent.innerText;
        }
        
        if (location == "") return;

        updateLocalStorage(location);
        getCurrentWeather(location);
        getForecastWeather(location);
    });

    function convertDate(UNIXtimestamp) {

        var convertedDate = "";
        var a = new Date(UNIXtimestamp * 1000);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
      
        convertedDate = month + ' ' + date + ', ' + year;
     
        return convertedDate;
    }

    function updateLocalStorage(location) {

        var cityList = JSON.parse(localStorage.getItem("cityList")) || [];
        
        cityList.push(location);
        cityList.sort();

        for (var i = 1; i < cityList.length; i++) {
            if (cityList[i] === cityList[i - 1]) cityList.splice(i, 1);
        }

        localStorage.setItem('cityList', JSON.stringify(cityList));

        $('#cityEntered').val("");
    }

    function establishCurrentLocation() {
        var location = {};

        function success(position) {
            location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                success: true
            }

            getCurrentWeather(location);
            getForecastWeather(location);
        }

        function error() {

            location = { success: false }
            return location;

        }

        if (!navigator.geolocation) {
            console.log('Geolocation is not supported by your browser');
        } 
        
        else {
            navigator.geolocation.getCurrentPosition(success, error);
        }
    }

    function getCurrentWeather(loc) {

        var cityList = JSON.parse(localStorage.getItem("cityList")) || [];

        $('#prevSearches').empty();

        cityList.forEach(function (city) {

            var searchedCityName = $('<div>');
            
            searchedCityName.addClass("cityList");
            searchedCityName.attr("value", city);
            searchedCityName.text(city);

            $('#prevSearches').append(searchedCityName);

        });

        $('#city-search').val("");

        if (typeof loc === "object") {
            city = `lat=${loc.latitude}&lon=${loc.longitude}`;
        } 
        
        else {
            city = `q=${loc}`;
        }

        var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
        var cityName = city;
        var unitsURL = "&units=imperial";
        var apiIdURL = "&appid="
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var openCurrentWeatherAPI = currentURL + cityName + unitsURL + apiIdURL + apiKey;

        $.ajax({

            url: openCurrentWeatherAPI,
            method: "GET"

        }).then(function (response1) {
            weatherObj = {
                city: `${response1.name}`,
                wind: response1.wind.speed,
                humidity: response1.main.humidity,
                temp: Math.round(response1.main.temp),
                date: (convertDate(response1.dt)),
                icon: `http://openweathermap.org/img/w/${response1.weather[0].icon}.png`,
                desc: response1.weather[0].description
            }

            $('#forecast').empty();
            $('#city').text(weatherObj.city + " (" + weatherObj.date + ")");
            $('#currWeathIcn').attr("src", weatherObj.icon);
            $('#currentTemperature').text("Temperature: " + weatherObj.temp + " " + "°F");
            $('#currentHumidity').text("Humidity: " + weatherObj.humidity + "%");
            $('#currentWind').text("Windspeed: " + weatherObj.wind + " MPH");

            var uviURL = "https://api.openweathermap.org/data/2.5/uvi";
            var apiIdURL = "?appid="
            var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
            var city = `&lat=${parseInt(response1.coord.lat)}&lon=${parseInt(response1.coord.lon)}`;
            var openUviWeatherAPI = uviURL + apiIdURL + apiKey + city;

            $.ajax({

                url: openUviWeatherAPI,
                method: "GET"

            }).then(function (response3) {
                var UviLevel = parseFloat(response3.value);
                var backgrdColor = 'violet';
                var uviTitle = '<span>UV Index: </span>';
                var color = uviTitle + `<span style="background-color: ${backgrdColor}; padding: 0 7px 0 7px;">${response3.value}</span>`;

                if (UviLevel < 3) { backgrdColor = 'green'; }
                else if (UviLevel < 6) { backgrdColor = 'yellow'; }
                else if (UviLevel < 8) { backgrdColor = 'orange'; }
                else if (UviLevel < 11) { backgrdColor = 'red'; }

                $('#currentUVIndex').html(color);
            });
        });
    }

    function getForecastWeather(loc) {
        
        if (typeof loc === "object") {
            city = `lat=${loc.latitude}&lon=${loc.longitude}`;
        } 
        
        else {
            city = `q=${loc}`;
        }

        var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
        var cityName = city;
        var unitsURL = "&units=imperial";
        var apiIdURL = "&appid="
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var openCurrentWeatherAPI2 = currentURL + cityName + unitsURL + apiIdURL + apiKey;

        $.ajax({

            url: openCurrentWeatherAPI2,
            method: "GET",

        }).then(function (response4) {
            var cityLon = response4.coord.lon;
            var cityLat = response4.coord.lat;

            city = `lat=${cityLat}&lon=${cityLon}`;

            var cityLon = response4.coord.lon;
            var cityLat = response4.coord.lat;
            var weatherArr = [];
            var weatherObj = {};
            var currentURL = "https://api.openweathermap.org/data/2.5/onecall?";
            var cityName = city;
            var exclHrlURL = "&exclude=hourly";
            var unitsURL = "&units=imperial";
            var apiIdURL = "&appid=";
            var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
            var openFcstWeatherAPI = currentURL + cityName + exclHrlURL + unitsURL + apiIdURL + apiKey;

            $.ajax({

                url: openFcstWeatherAPI,
                method: "GET"

            }).then(function (response2) {

                for (var i = 1; i < (response2.daily.length - 2); i++) {
                    
                    var cur = response2.daily[i]

                    weatherObj = {
                        weather: cur.weather[0].description,
                        icon: `http://openweathermap.org/img/w/${cur.weather[0].icon}.png`,
                        minTemp: Math.round(cur.temp.min),
                        maxTemp: Math.round(cur.temp.max),
                        humidity: cur.humidity,
                        uvi: cur.uvi,
                        date: (convertDate(cur.dt))
                    }

                    weatherArr.push(weatherObj);
                
                }

                for (var i = 0; i < weatherArr.length; i++) {
                    
                    var $colmx1 = $('<div class="col mx-1">');
                    var $cardBody = $('<div class="card-body forecast-card">');
                    var $cardTitle = $('<h6 class="card-title">');
                    var $ul = $('<ul>');
                    var $iconLi = $('<li>');
                    var $iconI = $('<img>');
                    var $weathLi = $('<li>');
                    let $tempHigh = $('<li>');
                    let $tempLow = $('<li>');        
                    var $humidityLi = $('<li>');

                    $cardTitle.text(weatherArr[i].date);
                    $iconI.attr('src', weatherArr[i].icon);
                    $weathLi.text(weatherArr[i].weather);
                    $tempHigh.text('Temp High: ' + weatherArr[i].maxTemp + " °F");
                    $tempLow.text('Temp Low: ' + weatherArr[i].minTemp + " °F");        
                    $humidityLi.text('Humidity: ' + weatherArr[i].humidity + "%");
                    $iconLi.append($iconI);
                    $ul.append($iconLi);
                    $ul.append($weathLi);
                    $ul.append($tempHigh);
                    $ul.append($tempLow);        
                    $ul.append($humidityLi);
                    $cardTitle.append($ul);
                    $cardBody.append($cardTitle);
                    $colmx1.append($cardBody);

                    $('#forecast').append($colmx1);
                }
            });
        });
    }
    // var location = establishCurrLocation();
});