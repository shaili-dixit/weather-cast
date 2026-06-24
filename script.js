// =====================
// API KEY
// =====================

const API_KEY = "56545a7e7f7772f5f715935e102ce17e";

// =====================
// DOM ELEMENTS
// =====================

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const feelsLike = document.getElementById("feelsLike");
const weatherIcon = document.getElementById("weatherIcon");

const themeToggle =
document.getElementById("themeToggle");

// =====================
// SEARCH BUTTON
// =====================

searchBtn.addEventListener("click", () => {

    const city =
    cityInput.value.trim();

    if(city === ""){

        alert(
            "Please enter a city name."
        );

        return;
    }

    getWeather(city);

});

// =====================
// ENTER KEY SUPPORT
// =====================

cityInput.addEventListener(
    "keypress",
    (e)=>{

        if(e.key === "Enter"){

            searchBtn.click();

        }

    }
);

// =====================
// WEATHER FETCH
// =====================

async function getWeather(city){

    try{

        // CACHE CHECK

        const cache =
        localStorage.getItem(
            city.toLowerCase()
        );

        if(cache){

            const parsed =
            JSON.parse(cache);

            const now =
            Date.now();

            // 10 MINUTES

            if(
                now - parsed.time
                < 600000
            ){

                displayWeather(
                    parsed.data
                );

                console.log(
                    "Loaded from cache"
                );

                return;
            }
        }

        const url =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

        const response =
        await fetch(url);

        if(!response.ok){

            throw new Error(
                "City not found"
            );

        }

        const data =
        await response.json();

        // SAVE CACHE

        localStorage.setItem(

            city.toLowerCase(),

            JSON.stringify({

                data:data,

                time:Date.now()

            })

        );

        displayWeather(data);

    }

    catch(error){

        cityName.textContent =
        "City Not Found";

        temperature.textContent =
        "--°C";

        condition.textContent =
        "--";

        humidity.textContent =
        "--";

        wind.textContent =
        "--";

        pressure.textContent =
        "--";

        feelsLike.textContent =
        "--";

        weatherIcon.src = "";

        alert(
            "City not found. Please try again."
        );

        console.log(error);

    }

}

// =====================
// DISPLAY WEATHER
// =====================

function displayWeather(data){

    cityName.textContent =
    `${data.name}, ${data.sys.country}`;

    temperature.textContent =
    `${Math.round(
        data.main.temp
    )}°C`;

    condition.textContent =
    data.weather[0].description;

    humidity.textContent =
    `${data.main.humidity}%`;

    wind.textContent =
    `${data.wind.speed} m/s`;

    pressure.textContent =
    `${data.main.pressure} hPa`;

    feelsLike.textContent =
    `${Math.round(
        data.main.feels_like
    )}°C`;

    const iconCode =
    data.weather[0].icon;

    weatherIcon.src =
    `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    updateTheme(
        data.weather[0].main
    );

}

// =====================
// GEOLOCATION
// =====================

function getLocationWeather(){

    if(!navigator.geolocation){

        getWeather("Kanpur");

        return;
    }

    navigator.geolocation.getCurrentPosition(

        async(position)=>{

            try{

                const lat =
                position.coords.latitude;

                const lon =
                position.coords.longitude;

                console.log(
                    lat,
                    lon
                );

                const url =
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

                const response =
                await fetch(url);

                const data =
                await response.json();

                displayWeather(data);

            }

            catch(error){

                console.log(error);

                getWeather("Kanpur");

            }

        },

        ()=>{

            getWeather("Kanpur");

        }

    );

}

// =====================
// WEATHER THEMES
// =====================

function updateTheme(weather){

    document.body.classList.remove(

        "sunny-theme",
        "cloud-theme",
        "rain-theme"

    );

    weather =
    weather.toLowerCase();

    if(
        weather.includes(
            "clear"
        )
    ){

        document.body.classList.add(
            "sunny-theme"
        );

    }

    else if(

        weather.includes(
            "rain"
        ) ||

        weather.includes(
            "drizzle"
        ) ||

        weather.includes(
            "thunderstorm"
        )

    ){

        document.body.classList.add(
            "rain-theme"
        );

    }

    else{

        document.body.classList.add(
            "cloud-theme"
        );

    }

}

// =====================
// DARK MODE
// =====================

themeToggle.addEventListener(
    "click",
    ()=>{

        document.body.classList.toggle(
            "dark-mode"
        );

        const isDark =
        document.body.classList.contains(
            "dark-mode"
        );

        if(isDark){

            themeToggle.textContent =
            "☀️";

            localStorage.setItem(
                "theme",
                "dark"
            );

        }

        else{

            themeToggle.textContent =
            "🌙";

            localStorage.setItem(
                "theme",
                "light"
            );

        }

    }
);

// =====================
// LOAD SAVED THEME
// =====================

const savedTheme =
localStorage.getItem(
    "theme"
);

if(savedTheme === "dark"){

    document.body.classList.add(
        "dark-mode"
    );

    themeToggle.textContent =
    "☀️";

}

// =====================
// INITIAL LOAD
// =====================

getLocationWeather();
