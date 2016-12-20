
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

  function getPhaseName(phase) {
    const phaseTolerance = 1 / 8 / 2; // .0625 on either side
    const NEW = 0;
    const FIRST_Q = 0.25;
    const FULL = 0.5;
    const THIRD_Q = 0.75;
    if (phase > NEW - phaseTolerance % 1 && phase < NEW + phaseTolerance % 1) {
      return "New"
    }
    const phases = [0, .25, .5, .75, 1];
    const phaseNames = ["New", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full", "Waning Gibbous", "Last Quarter", "Waning Crescent", "New"];
    for(let i = 0; i < phases.length; i++) {
      if (phase >= phases[i] - phaseTolerance % 1 && phase < phases[i] + phaseTolerance % 1) {
        return phaseNames[2*i];
      } else if (phase >= phases[i] + phaseTolerance % 1 && phase < phases[i+1] - phaseTolerance % 1) {
        return phaseNames[2*i+1];
      }
    }
  }

  function formatIllumination(fraction) {
    return Math.round(fraction * 100);
  }

  function updateMoonPhaseSvg(phase) {
    const LIT = 'fill: #eee';
    const NOT_LIT = 'fill: #222';
    const ellipse = document.getElementById('ellipse');
    const right = document.getElementById('right-half');
    const left = document.getElementById('left-half');
    ellipse.setAttribute('rx', 100*Math.abs(Math.cos(2 * Math.PI * phase)));
    if (0.25 <= phase && phase <= 0.75) {
      ellipse.setAttribute('style', LIT);
    } else {
      ellipse.setAttribute('style', NOT_LIT);
    }
    right.setAttribute('style', phase <= 0.5 ? LIT : NOT_LIT);
    left.setAttribute('style', phase <= 0.5 ? NOT_LIT : LIT);
  }

  function updateDOM() {
    const now = new Date();
    const moonPos = SunCalc.getMoonPosition(now, LAT, LNG);
    const moonIllumination = SunCalc.getMoonIllumination(now);

    // azimuth is off by 180 deg again, somehow
    const azimuthArr = Rktrs.degreeComponents(Rktrs.deg(moonPos.azimuth + Math.PI));
    const altitudeArr = Rktrs.degreeComponents(Rktrs.deg(moonPos.altitude));
    const phaseName = getPhaseName(moonIllumination.phase);
    const illumination = formatIllumination(moonIllumination.fraction);

    Rktrs.updateDisplay('#azimuth', ...azimuthArr);
    Rktrs.updateDisplay('#altitude', ...altitudeArr);
    document.getElementById('phase').innerHTML = phaseName;
    document.getElementById('illumination').innerHTML = illumination;
    updateMoonPhaseSvg(moonIllumination.phase);
  }

  // Update numbers every second
  updateInterval = setInterval(() => updateDOM(), 1000);
  updateDOM();
})();