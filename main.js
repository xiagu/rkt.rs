
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
    console.log(`Local sidereal time (radians) ${Rktrs.rad(local_sidereal_time * 15)}`);

    return local_sidereal_time;
  }

  function computeHorizontalCoords() {
    const localSiderealTime = getLocalSiderealTime(LNG);

    local_hour_angle = (local_sidereal_time - RIGHT_ASCENSION + 24) % 24
    const localHourRadian = Rktrs.rad(local_hour_angle * 15);

    const latRad = Rktrs.rad(LAT);
    const decl = DECLINATION;
    const adjacent = Math.cos(localHourRadian)*Math.sin(latRad) - Math.tan(decl) * Math.cos(latRad);
    azimuth = Math.atan2(Math.sin(localHourRadian), adjacent);
    azimuth += Math.PI;
    console.log(`azimuth (radians) ${azimuth}`);
    console.log(`azimuth (degrees) ${Rktrs.deg(azimuth)}`);

    altitude = Math.asin(Math.sin(latRad)*Math.sin(decl) + Math.cos(latRad)*Math.cos(decl)*Math.cos(localHourRadian));
    console.log(`altitude (radians) ${altitude}`);
    console.log(`altitude (degrees) ${Rktrs.deg(altitude)}`);

    return [azimuth, altitude];
  }

  function updateDOM() {
    const [azimuth, altitude] = computeHorizontalCoords();

    const azimuthArr = Rktrs.degreeComponents(Rktrs.deg(azimuth));
    const altitudeArr = Rktrs.degreeComponents(Rktrs.deg(altitude));

    Rktrs.updateDisplay('#azimuth', ...azimuthArr);
    Rktrs.updateDisplay('#altitude', ...altitudeArr);
  }

  // Update numbers every second
  updateInterval = setInterval(() => updateDOM(), 1000);
  updateDOM();
})();