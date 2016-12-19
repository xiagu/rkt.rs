
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

  function updateDOM() {
    const now = new Date();
    const moonPos = SunCalc.getMoonPosition(now, LAT, LNG);

    // azimuth is off by 180 deg again, somehow
    const azimuthArr = Rktrs.degreeComponents(Rktrs.deg(moonPos.azimuth + Math.PI));
    const altitudeArr = Rktrs.degreeComponents(Rktrs.deg(moonPos.altitude));

    Rktrs.updateDisplay('#azimuth', ...azimuthArr);
    Rktrs.updateDisplay('#altitude', ...altitudeArr);
  }

  // Update numbers every second
  updateInterval = setInterval(() => updateDOM(), 1000);
  updateDOM();
})();