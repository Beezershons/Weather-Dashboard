const API_KEY = "f18313f772d233d04e9c8cd53f36eff9";

// click event to get user input value
var submitBtn = document.getElementById("submit-btn");
submitBtn.addEventListener('click', submitBtnEvent);
var userCity = document.getElementById("input");
let clearBtn = document.getElementById("clear-history");
clearBtn.addEventListener('click', clearHistory);

function submitBtnEvent(event) {
    event.preventDefault();
    var userCityVal = userCity.value;

    if (!userCityVal) {
        alert('Please type a city name.');
        return;
    } else {
        // format user input (uppercase first letter of each word using RegEx)
        userCityVal = userCityVal.toLowerCase();
        const formattedInput = userCityVal.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
        saveSearches(formattedInput);
        // show btn after saved to local storage
        populateSearchHistory();
        document.getElementById('input').value = null;
    }

    searchCoordinatesApi(userCityVal);
};

function clearHistory(event) {
    event.preventDefault();
    localStorage.removeItem('city');
    // clear btn showing on page (no data in local storage)
    populateSearchHistory();
}

// save to input local storage
function saveSearches(formattedInput) {
    let localStorageData = JSON.parse(localStorage.getItem("city"));
    if (localStorageData === null) {
        localStorageData = []
        localStorageData.push(formattedInput)
    } else {
        let filteredData = localStorageData.filter(data => data.toLowerCase() === formattedInput.toLowerCase())
        if (filteredData.length === 0) {
            localStorageData.push(formattedInput)
        }
    };
    localStorage.setItem("city", JSON.stringify(localStorageData));
};

// coordinate API 
function searchCoordinatesApi(userCityVal) {
    var coordinatesUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + userCityVal + "&limit=1&appid=" + API_KEY

    fetch(coordinatesUrl)
        .then(response => response.json())
        .then(data => {
            let lat = data[0].lat.toFixed(2);
            let lon = data[0].lon.toFixed(2);
            searchWeatherApi(lat, lon);
        })
        .catch(function (error) {
            alert('There has been an error. Please try again.');
            console.log(error);
        });
};

// weather API
function searchWeatherApi(lat, lon) {
    var weatherUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + API_KEY + "&units=imperial"

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
            console.log(data);
        })
        .catch(function (error) {
            alert('There has been an error. Please try again.');
            console.log(error);
        });
};

// display weather on page
function displayWeather(data) {

    // display city name
    let cityName = data.city.name;
    document.getElementById("city-name").innerHTML = cityName;

    // display current and future forecast
    document.getElementById("current-weather").innerHTML = "";
    document.getElementById("five-day-forecast").innerHTML = "";
    for (var i = -1; i <= data.list.length; i += 8) {
        console.log(i);
        let index;
        if (i === -1) {
            index = i + 1
        } else {
            index = i
        }
        let date = new Date(data.list[index].dt * 1000);
        let temperature = Math.round(data.list[index].main.temp);
        let humidity = data.list[index].main.humidity;
        let windSpeed = data.list[index].wind.speed;

        if (i === -1) {
            currentText = `
                <div>
                <img src="https://openweathermap.org/img/wn/${data.list[index].weather[0].icon}@2x.png" alt="weather icon">
                <p>${date.toDateString()}</p>
                <p> Temp:&nbsp${temperature}&#176F</p>
                <p> Humidity:&nbsp${humidity}%</p>
                <p> Wind:&nbsp${windSpeed}mph</p>
                </div>
                `;
            document.getElementById("current-weather").innerHTML = currentText;
        } else {
            console.log(index)
            fiveDayText = ''
            fiveDayText = `
                <div class="five-day-text">
                <img src="https://openweathermap.org/img/wn/${data.list[index].weather[0].icon}@2x.png" alt="weather icon">
                <p>${date.toDateString()}</p>
                <p> Temp:&nbsp${temperature}&#176F</p>
                <p> Humidity:&nbsp${humidity}%</p>
                <p> Wind:&nbsp${windSpeed}mph</p>
                </div>
                `;
            document.getElementById("five-day-forecast").innerHTML += fiveDayText;
        }
    }
};


// create buttons that show search history, display weather on click
function populateSearchHistory() {
    document.getElementById('search-history').innerHTML = "";
    let localStorageData = JSON.parse(localStorage.getItem('city'));
    let searchHistoryDiv = document.createElement('div');

    if (localStorageData) {
        for (let i = 0; i < localStorageData.length; i++) {
            let historyBtn = document.createElement("button")
            historyBtn.innerHTML = localStorageData[i]
            historyBtn.className = "searched-cities-btn button is-dark";
            historyBtn.addEventListener("click", function (event) {
                event.preventDefault();
                let cityName = event.target.innerHTML;
                searchCoordinatesApi(cityName);
            })
            searchHistoryDiv.append(historyBtn)
        }
    }

    document.getElementById('search-history').append(searchHistoryDiv);
};
// show btn on refresh
populateSearchHistory();

// show Austin weather on page load
window.onload = function loadAustin() {
    userCityVal = "Austin";
    searchCoordinatesApi(userCityVal)
};