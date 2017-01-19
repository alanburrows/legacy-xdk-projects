/* jshint browser: true */
/*global $:false, intel:false */

var locationSuccess = function(p)
{
	if (p.coords.latitude !== undefined)
	{
		currentLatitude = p.coords.latitude;
		currentLongitude = p.coords.longitude;
        geolocationSuccess = true;
	}
};
var locationError = function(error)
{ 
    navigator.geolocation.getCurrentPosition(locationSuccess, locationError, coarseOptions);
};
  
