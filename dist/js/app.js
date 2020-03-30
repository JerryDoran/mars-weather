const API_KEY = 'bY9n6aUHJfJp6XoYMNgav5beFDfmwc5G1nrm7M23';
const API_URL = `https://api.nasa.gov/insight_weather/?api_key=${API_KEY}&feedtype=json&ver=1.0`;
let selectedSolIndex;
const previousWeatherToggle = document.querySelector('.show-previous-weather');
const previousWeather = document.querySelector('.previous-weather');
const currentSolElement = document.querySelector('[data-current-sol]');
const currentDateElement = document.querySelector('[data-current-date]');
const currentTempHighElement = document.querySelector(
  '[data-current-temp-high]'
);
const currentTempLowElement = document.querySelector('[data-current-temp-low]');
const windSpeedElement = document.querySelector('[data-wind-speed]');
const windDirectionText = document.querySelector('[data-wind-direction-text]');
const windDirectionArrow = document.querySelector(
  '[data-wind-direction-arrow]'
);

const unitToggle = document.querySelector('[data-unit-toggle]');
const cel = document.getElementById('cel');
const fah = document.getElementById('fah');

// Previous seven sols selectors
const previousSolTemplate = document.querySelector(
  '[data-previous-sol-template]'
);
const previousSolContainer = document.querySelector('[data-previous-sols');

previousWeatherToggle.addEventListener('click', () => {
  previousWeather.classList.toggle('show-weather');
});

function getWeather() {
  return fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      // Destructure the data into multiple variables
      const { sol_keys, validity_checks, ...solData } = data;
      const temp = Object.entries(solData).map(([sol, data]) => {
        return {
          sol: sol,
          maxTemp: data.AT.mx,
          minTemp: data.AT.mn,
          windSpeed: data.HWS.av,
          windDirectionDegrees: data.WD.most_common.compass_degrees,
          windDirectionCardinal: data.WD.most_common.compass_point,
          date: new Date(data.First_UTC)
        };
      });
      return temp;
    });
}

function displayPreviousSols(sols) {
  previousSolContainer.innerHTML = '';
  sols.forEach((solData, index) => {
    const solContainer = previousSolTemplate.content.cloneNode(true);
    solContainer.querySelector('[data-sol]').innerText = solData.sol;
    solContainer.querySelector('[data-date]').innerText = displayMonthDay(
      solData.date
    );
    solContainer.querySelector(
      '[data-temp-high]'
    ).innerText = displayTemperature(solData.maxTemp);
    solContainer.querySelector(
      '[data-temp-low]'
    ).innerText = displayTemperature(solData.minTemp);
    solContainer
      .querySelector('[data-select-button]')
      .addEventListener('click', () => {
        selectedSolIndex = index;

        displaySelectedSol(sols);
      });
    previousSolContainer.appendChild(solContainer);
  });
}

function displaySelectedSol(sols) {
  const selectedSol = sols[selectedSolIndex];
  currentSolElement.innerText = selectedSol.sol;
  currentDateElement.innerText = displayDate(selectedSol.date);
  currentTempHighElement.innerText = displayTemperature(selectedSol.maxTemp);
  currentTempLowElement.innerText = displayTemperature(selectedSol.minTemp);
  windSpeedElement.innerText = displaySpeed(selectedSol.windSpeed);
  windDirectionArrow.style.setProperty(
    '--direction',
    `${selectedSol.windDirectionDegrees}deg`
  );
  windDirectionText.innerText = selectedSol.windDirectionCardinal;
}

function displayMonthDay(date) {
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long'
  });
}

function displayDate(date) {
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function displayTemperature(temp) {
  return Math.round(temp);
}

function displaySpeed(speed) {
  return Math.round(speed);
}

function updateUnits() {
  const speedUnits = document.querySelectorAll('[data-speed-unit]');
  const tempUnits = document.querySelectorAll('[data-temp-unit]');

  speedUnits.forEach(unit => (unit.innerText = isMetric() ? 'kph' : 'mph'));
  tempUnits.forEach(temp => (temp.innerText = isMetric() ? 'C' : 'F'));
}

function isMetric() {
  return cel.checked;
}

getWeather().then(sols => {
  // This gets last day in the array of sols
  selectedSolIndex = sols.length - 1;
  displaySelectedSol(sols);
  displayPreviousSols(sols);
  updateUnits();

  unitToggle.addEventListener('click', () => {
    let metricUnits = !isMetric();
    cel.checked = metricUnits;
    fah.checked = !metricUnits;
    updateUnits();
  });
});
