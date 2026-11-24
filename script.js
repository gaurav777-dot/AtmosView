const API = {
  geo: function (city) {
    return "https://geocoding-api.open-meteo.com/v1/search?name=" +
      encodeURIComponent(city) +
      "&count=1&language=en&format=json";
  },

  weather: function (lat, lon) {
    return "https://api.open-meteo.com/v1/forecast?latitude=" +
      encodeURIComponent(lat) +
      "&longitude=" +
      encodeURIComponent(lon) +
      "&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m" +
      "&timezone=auto";
  }
};

const state = {
  city: "Gaya",
  weather: null,
  timezone: "Asia/Kolkata",
  unit: "C",
  timer: null
};

const weatherMap = {
  0: ["Clear sky", "☀"],
  1: ["Mainly clear", "🌤"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁"],
  45: ["Fog", "🌫"],
  48: ["Rime fog", "🌫"],
  51: ["Light drizzle", "🌦"],
  53: ["Drizzle", "🌦"],
  55: ["Dense drizzle", "🌧"],
  61: ["Slight rain", "🌦"],
  63: ["Moderate rain", "🌧"],
  65: ["Heavy rain", "🌧"],
  71: ["Light snow", "🌨"],
  73: ["Snow", "❄"],
  75: ["Heavy snow", "❄"],
  80: ["Rain showers", "🌦"],
  81: ["Rain showers", "🌧"],
  82: ["Violent rain showers", "⛈"],
  95: ["Thunderstorm", "⛈"],
  96: ["Thunderstorm with hail", "⛈"],
  99: ["Thunderstorm with hail", "⛈"]
};

function $(id) {
  return document.getElementById(id);
}

function showToast(message) {
  const toast = $("toast");

  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(function () {
    toast.classList.remove("show");
  }, 3000);
}

function setLoading(status) {
  const loading = $("loading");
  const weatherPanel = $("weatherPanel");
  const errorPanel = $("errorPanel");

  if (loading) {
    loading.classList.toggle("hidden", !status);
  }

  if (status) {
    if (weatherPanel) {
      weatherPanel.classList.add("hidden");
    }

    if (errorPanel) {
      errorPanel.classList.add("hidden");
    }
  }
}

function setError(message) {
  const loading = $("loading");
  const weatherPanel = $("weatherPanel");
  const errorPanel = $("errorPanel");
  const errorMessage = $("errorMessage");

  if (loading) {
    loading.classList.add("hidden");
  }

  if (weatherPanel) {
    weatherPanel.classList.add("hidden");
  }

  if (errorPanel) {
    errorPanel.classList.remove("hidden");
  }

  if (errorMessage) {
    errorMessage.textContent = message;
  }

  console.error(message);
}

function cToF(celsius) {
  return (celsius * 9 / 5) + 32;
}

function displayTemp(celsius) {
  if (state.unit === "F") {
    return Math.round(cToF(celsius));
  }

  return Math.round(celsius);
}

function formatCityTime(timezone, options) {
  try {
    return new Intl.DateTimeFormat(
      undefined,
      Object.assign({}, options, {
        timeZone: timezone
      })
    ).format(new Date());
  } catch (error) {
    return new Intl.DateTimeFormat(
      undefined,
      options
    ).format(new Date());
  }
}

function updateClock() {
  const timezone = state.timezone || "UTC";

  const liveTime = $("liveTime");
  const liveDate = $("liveDate");
  const localClock = $("localClock");

  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  };

  const dateOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  };

  const shortTimeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  };

  if (liveTime) {
    liveTime.textContent =
      formatCityTime(timezone, timeOptions);
  }

  if (liveDate) {
    liveDate.textContent =
      formatCityTime(timezone, dateOptions);
  }

  if (localClock) {
    localClock.textContent =
      formatCityTime(timezone, shortTimeOptions);
  }
}

function weatherDescription(code) {
  return weatherMap[code] || ["Unknown conditions", "🌡"];
}

function windDescription(speed) {
  if (speed < 10) {
    return [
      "Calm",
      "Light winds make outdoor activity comfortable."
    ];
  }

  if (speed < 25) {
    return [
      "Gentle",
      "A light breeze is present."
    ];
  }

  if (speed < 40) {
    return [
      "Breezy",
      "Noticeable wind conditions."
    ];
  }

  return [
    "Strong",
    "Strong winds — take extra care outdoors."
  ];
}

function updateInsights(current) {
  if (!current) {
    return;
  }

  const result =
    windDescription(Number(current.wind_speed_10m));

  const quality = result[0];
  const text = result[1];

  const windQuality = $("windQcuality");
  const windQualityCorrect = $("windQuality");
  const windText = $("windText");
  const daylightStatus = $("daylightStatus");
  const daylightText = $("daylightText");
  const timezoneText = $("timezoneText");

  if (windQuality) {
    windQuality.textContent = quality;
  }

  if (windQualityCorrect) {
    windQualityCorrect.textContent = quality;
  }

  if (windText) {
    windText.textContent = text;
  }

  const isDay = Number(current.is_day) === 1;

  if (daylightStatus) {
    daylightStatus.textContent =
      isDay ? "Daytime" : "Night";
  }

  if (daylightText) {
    daylightText.textContent =
      isDay
        ? "The sun is currently above the horizon."
        : "It is currently nighttime at this location.";
  }

  if (timezoneText) {
    timezoneText.textContent =
      "Timezone: " + (state.timezone || "UTC");
  }
}

function renderWeather(place, data) {
  if (!data || !data.current) {
    throw new Error("Weather data is incomplete.");
  }

  state.weather = data.current;

  state.timezone =
    data.timezone ||
    data.timezone_abbreviation ||
    "UTC";

  const current = data.current;

  const description =
    weatherDescription(current.weather_code);

  const condition = description[0];
  const icon = description[1];

  const cityName = $("cityName");
  const temperature = $("temperature");
  const conditionElement = $("condition");
  const weatherIcon = $("weatherIcon");
  const wind = $("wind");
  const humidity = $("humidity");
  const feelsLike = $("feelsLike");
  const coordinates = $("coordinates");
  const updatedTime = $("updatedTime");
  const humidityMeter = $("humidityMeter");
  const windMeter = $("windMeter");
  const feelsMeter = $("feelsMeter");

  if (cityName) {
    const city =
      place.name ||
      "Unknown Location";

    const country =
      place.country ||
      "";

    cityName.textContent =
      country
        ? city + ", " + country
        : city;
  }

  if (temperature) {
    temperature.textContent =
      displayTemp(current.temperature_2m);
  }

  if (conditionElement) {
    conditionElement.textContent =
      condition;
  }

  if (weatherIcon) {
    weatherIcon.textContent =
      icon;
  }

  if (wind) {
    wind.textContent =
      Math.round(Number(current.wind_speed_10m));
  }

  if (humidity) {
    humidity.textContent =
      Math.round(Number(current.relative_humidity_2m));
  }

  if (feelsLike) {
    feelsLike.textContent =
      displayTemp(current.apparent_temperature);
  }

  if (coordinates) {
    coordinates.textContent =
      Number(place.latitude).toFixed(2) +
      ", " +
      Number(place.longitude).toFixed(2);
  }

  if (updatedTime) {
    try {
      updatedTime.textContent =
        new Intl.DateTimeFormat(
          undefined,
          {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: state.timezone
          }
        ).format(new Date(current.time));
    } catch (error) {
      updatedTime.textContent =
        current.time || "--";
    }
  }

  if (humidityMeter) {
    humidityMeter.style.width =
      Math.min(
        100,
        Number(current.relative_humidity_2m)
      ) + "%";
  }

  if (windMeter) {
    windMeter.style.width =
      Math.min(
        100,
        Number(current.wind_speed_10m) * 2
      ) + "%";
  }

  if (feelsMeter) {
    const feels =
      Number(current.apparent_temperature);

    const percentage =
      Math.min(
        100,
        Math.max(
          5,
          ((feels + 10) / 55) * 100
        )
      );

    feelsMeter.style.width =
      percentage + "%";
  }

  updateInsights(current);
  updateClock();

  const loading = $("loading");
  const errorPanel = $("errorPanel");
  const weatherPanel = $("weatherPanel");

  if (loading) {
    loading.classList.add("hidden");
  }

  if (errorPanel) {
    errorPanel.classList.add("hidden");
  }

  if (weatherPanel) {
    weatherPanel.classList.remove("hidden");
  }
}

async function fetchWeather(city) {
  const cleanCity =
    String(city || "").trim();

  if (cleanCity.length < 2) {
    setError("Please enter a valid city name.");
    return;
  }

  setLoading(true);

  try {
    const geoResponse =
      await fetch(API.geo(cleanCity));

    if (!geoResponse.ok) {
      throw new Error(
        "Location service is unavailable."
      );
    }

    const geo =
      await geoResponse.json();

    if (
      !geo.results ||
      geo.results.length === 0
    ) {
      throw new Error(
        'No matching city found for "' +
        cleanCity +
        '".'
      );
    }

    const place =
      geo.results[0];

    const weatherResponse =
      await fetch(
        API.weather(
          place.latitude,
          place.longitude
        )
      );

    if (!weatherResponse.ok) {
      throw new Error(
        "Weather service is temporarily unavailable."
      );
    }

    const weather =
      await weatherResponse.json();

    state.city =
      place.name ||
      cleanCity;

    renderWeather(
      place,
      weather
    );

    const cityName =
      place.name ||
      cleanCity;

    showToast(
      "Weather updated for " +
      cityName
    );

  } catch (error) {
    console.error(
      "Weather error:",
      error
    );

    setError(
      error.message ||
      "Unable to load weather data."
    );
  }
}

function toggleTheme() {
  const body =
    document.body;

  if (!body) {
    return;
  }

  body.classList.toggle("light");

  const light =
    body.classList.contains("light");

  const themeButton =
    $("themeBtn");

  if (themeButton) {
    themeButton.textContent =
      light ? "☀" : "☾";
  }

  localStorage.setItem(
    "skyTheme",
    light ? "light" : "dark"
  );

  showToast(
    light
      ? "Light theme enabled"
      : "Dark theme enabled"
  );
}

function toggleUnit() {
  state.unit =
    state.unit === "C"
      ? "F"
      : "C";

  const unitButton =
    $("unitBtn");

  if (unitButton) {
    unitButton.textContent =
      "°" + state.unit;
  }

  if (state.weather) {
    const temperature =
      $("temperature");

    const feelsLike =
      $("feelsLike");

    if (temperature) {
      temperature.textContent =
        displayTemp(
          state.weather.temperature_2m
        );
    }

    if (feelsLike) {
      feelsLike.textContent =
        displayTemp(
          state.weather.apparent_temperature
        );
    }
  }

  showToast(
    "Temperature unit changed to °" +
    state.unit
  );
}

function useLocation() {
  if (!navigator.geolocation) {
    showToast(
      "Geolocation is not supported by this browser."
    );
    return;
  }

  showToast(
    "Requesting your location..."
  );

  navigator.geolocation.getCurrentPosition(
    function (position) {
      fetchByCoordinates(
        position.coords.latitude,
        position.coords.longitude
      );
    },
    function (error) {
      console.error(
        "Geolocation error:",
        error
      );

      showToast(
        "Location permission was not granted."
      );
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000
    }
  );
}

async function fetchByCoordinates(lat, lon) {
  setLoading(true);

  try {
    const response =
      await fetch(
        API.weather(lat, lon)
      );

    if (!response.ok) {
      throw new Error(
        "Unable to read weather for your location."
      );
    }

    const weather =
      await response.json();

    let place = {
      name: "Your Location",
      country: "Local",
      latitude: lat,
      longitude: lon
    };

    try {
      const reverseUrl =
        "https://nominatim.openstreetmap.org/reverse" +
        "?format=json" +
        "&lat=" +
        encodeURIComponent(lat) +
        "&lon=" +
        encodeURIComponent(lon) +
        "&zoom=10" +
        "&addressdetails=1";

      const reverseResponse =
        await fetch(reverseUrl);

      if (reverseResponse.ok) {
        const reverseData =
          await reverseResponse.json();

        if (reverseData.address) {
          const address =
            reverseData.address;

          const name =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.county ||
            "Your Location";

          const country =
            address.country ||
            "Local";

          place = {
            name: name,
            country: country,
            latitude: lat,
            longitude: lon
          };
        }
      }
    } catch (reverseError) {
      console.warn(
        "Reverse geocoding failed:",
        reverseError
      );
    }

    state.city =
      place.name;

    renderWeather(
      place,
      weather
    );

    showToast(
      "Showing weather for " +
      place.name
    );

  } catch (error) {
    console.error(
      "Location weather error:",
      error
    );

    setError(
      error.message ||
      "Unable to load weather."
    );
  }
}

function setupEvents() {
  const searchForm =
    $("searchForm");

  if (searchForm) {
    searchForm.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();

        const input =
          $("cityInput");

        if (input) {
          fetchWeather(
            input.value
          );
        }
      }
    );
  }

  document
    .querySelectorAll("[data-city]")
    .forEach(function (button) {
      button.addEventListener(
        "click",
        function () {
          const city =
            button.getAttribute(
              "data-city"
            );

          const input =
            $("cityInput");

          if (input) {
            input.value =
              city;
          }

          fetchWeather(city);
        }
      );
    });

  const themeButton =
    $("themeBtn");

  if (themeButton) {
    themeButton.addEventListener(
      "click",
      toggleTheme
    );
  }

  const unitButton =
    $("unitBtn");

  if (unitButton) {
    unitButton.addEventListener(
      "click",
      toggleUnit
    );
  }

  const locationButton =
    $("locateBtn");

  if (locationButton) {
    locationButton.addEventListener(
      "click",
      useLocation
    );
  }

  const retryButton =
    $("retryBtn");

  if (retryButton) {
    retryButton.addEventListener(
      "click",
      function () {
        fetchWeather(
          state.city
        );
      }
    );
  }

  const navToggle =
    $("navToggle");

  const navLinks =
    $("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener(
      "click",
      function () {
        navLinks.classList.toggle(
          "open"
        );
      }
    );
  }

  document
    .querySelectorAll(".nav-links a")
    .forEach(function (link) {
      link.addEventListener(
        "click",
        function () {
          if (navLinks) {
            navLinks.classList.remove(
              "open"
            );
          }
        }
      );
    });
}

function loadTheme() {
  const savedTheme =
    localStorage.getItem(
      "skyTheme"
    );

  const themeButton =
    $("themeBtn");

  if (savedTheme === "light") {
    document.body.classList.add(
      "light"
    );

    if (themeButton) {
      themeButton.textContent =
        "☀";
    }
  } else {
    if (themeButton) {
      themeButton.textContent =
        "☾";
    }
  }
}

function initialize() {
  loadTheme();

  const unitButton =
    $("unitBtn");

  if (unitButton) {
    unitButton.textContent =
      "°C";
  }

  updateClock();

  clearInterval(
    state.timer
  );

  state.timer =
    setInterval(
      updateClock,
      1000
    );

  setupEvents();

  fetchWeather(
    state.city
  );
}

if (
  document.readyState === "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initialize
  );
} else {
  initialize();
}
