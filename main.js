
Date.prototype.isLeapYear = function() {
    var year = this.getFullYear();
    if((year & 3) != 0) return false;
    return ((year % 100) != 0 || (year % 400) == 0);
};

// Get Day of Year
Date.prototype.getDOY = function() {
    var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var mn = this.getUTCMonth();
    var dn = this.getUTCDate();
    var dayOfYear = dayCount[mn] + dn;
    if(mn > 1 && this.isLeapYear()) dayOfYear++;
    return dayOfYear;
};

var updateInterval;

(function() {
  const RIGHT_ASCENSION = 14.2612 // hours
  // const DECLINATION = 19.1873 // degrees
  const DECLINATION = 0.33488 // radians

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
  
  function getLocalSiderealTime(lng) {
    GST_2016 = 6.821 // base for jan 01 0h UT

    const now = new Date();
    const dayOfYear = now.getDOY();
    const ut_in_hours = now.getUTCHours() + now.getUTCMinutes()/60 + now.getUTCSeconds()/(60*60) + now.getUTCMilliseconds()/(60*60*1000);
    cur_gst = (GST_2016 + 0.06570982441908*dayOfYear + 1.00273790935*ut_in_hours) % 24;

    // 15 deg is 1 hr
    // ensure above 0?
    local_sidereal_time = (cur_gst + (lng / 15) + 24) % 24;

    console.log(`Local sidereal time (hours) ${local_sidereal_time}`);
    console.log(`Local sidereal time (radians) ${toRadians(local_sidereal_time * 15)}`);

    return local_sidereal_time;
  }

  function toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  function toDegrees(radians) {
    return radians * 180 / Math.PI;
  }

  function computeHorizontalCoords() {
    const localSiderealTime = getLocalSiderealTime(LNG);

    local_hour_angle = (local_sidereal_time - RIGHT_ASCENSION + 24) % 24
    const localHourRadian = toRadians(local_hour_angle * 15);

    const latRad = toRadians(LAT);
    const decl = DECLINATION;
    const adjacent = Math.cos(localHourRadian)*Math.sin(latRad) - Math.tan(decl) * Math.cos(latRad);
    azimuth = Math.atan2(Math.sin(localHourRadian), adjacent);
    azimuth += Math.PI;
    console.log(`azimuth (radians) ${azimuth}`);
    console.log(`azimuth (degrees) ${toDegrees(azimuth)}`);

    altitude = Math.asin(Math.sin(latRad)*Math.sin(decl) + Math.cos(latRad)*Math.cos(decl)*Math.cos(localHourRadian));
    console.log(`altitude (radians) ${altitude}`);
    console.log(`altitude (degrees) ${toDegrees(altitude)}`);

    return [azimuth, altitude];
  }

  function degreeComponents(degrees) {
    const d = Math.trunc(degrees);
    const m = Math.trunc(Math.abs(degrees - d) * 60);
    const s = Math.trunc((Math.abs(degrees - d) * 60 - m) * 60);
    return [d, m, s];
  }

  /**
   * +19° 10′ 56″
   */
  function formatDegrees(rawDegrees) {
    const [d, m, s] = degreeComponents(rawDegrees);
    return `${d}&deg; ${m}' ${s}"`;
  }

  function updateDisplay(parentSelector, degree, minute, second) {
    document.querySelector(parentSelector + " > .degree").innerHTML = degree;
    document.querySelector(parentSelector + " > .minute").innerHTML = minute;
    document.querySelector(parentSelector + " > .second").innerHTML = second;
  }

  // function updateSphere(azimuth, altitude) {
  //   // azimuth = toRadians(0);
  //   // altitude = toRadians(45);
  //   const starPosMatrix = new Array(16);
  //   mat4.identity(starPosMatrix);
  //   mat4.rotateZ(starPosMatrix, starPosMatrix, -altitude);
    
  //   const starPos = new Array(4);
  //   vec4.transformMat4(starPos, vec4.fromValues(100, 0, 0, 0), starPosMatrix);

  //   const starElem = document.getElementById('star');
  //   starElem.setAttribute('cx', starPos[0]);
  //   starElem.setAttribute('cy', starPos[1]);

  //   const compass = document.getElementById('compass');
  //   compass.setAttribute('transform', `rotate(${toDegrees(azimuth)+90})`);
  // }

  let testAzimuth = 0;
  function updateDOM() {
    const [azimuth, altitude] = computeHorizontalCoords();

    const azimuthArr = degreeComponents(toDegrees(azimuth));
    const altitudeArr = degreeComponents(toDegrees(altitude));

    updateDisplay('#azimuth', ...azimuthArr);
    updateDisplay('#altitude', ...altitudeArr);
    // updateSphere(azimuth, altitude);
    testAzimuth += toRadians(5);
  }


  // Update numbers every second
  updateInterval = setInterval(() => updateDOM(), 1000);
  updateDOM();
})();