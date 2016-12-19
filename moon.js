
var updateInterval;

(function() {
  "use strict";

  // San Jose, CA
  let LAT = 37.338;
  let LNG = -121.886;

  function getLatLng() {
    if (!("geolocation" in navigator)) return;
    // Otherwise, geolocation is available
    navigator.geolocation.getCurrentPosition((position) => {
      LAT = position.coords.latitude;
      LNG = position.coords.longitude;
    });
  }
  getLatLng();

  function toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  function toDegrees(radians) {
    return radians * 180 / Math.PI;
  }

  function updateDisplay(parentSelector, degree, minute, second) {
    document.querySelector(parentSelector + " > .degree").innerHTML = degree;
    document.querySelector(parentSelector + " > .minute").innerHTML = minute;
    document.querySelector(parentSelector + " > .second").innerHTML = second;
  }

  function updateDOM() {
    const now = new Date();
    const moonPos = SunCalc.getMoonPosition(now, LAT, LNG);

    // azimuth is off by 180 deg again, somehow
    const azimuthArr = Rktrs.degreeComponents(toDegrees(moonPos.azimuth + Math.PI));
    const altitudeArr = Rktrs.degreeComponents(toDegrees(moonPos.altitude));

    updateDisplay('#azimuth', ...azimuthArr);
    updateDisplay('#altitude', ...altitudeArr);
  }

  // Update numbers every second
  updateInterval = setInterval(() => updateDOM(), 1000);
  updateDOM();
})();