/* jshint browser: true */
/*global $:false, intel:false */

var currentLatitude = 51.372942;
var currentLongitude = -0.205909;
var geolocationSuccess = false;

function pleaseWaitMessageWithTime(header)
{
	var currentdate = new Date();
	setHeader(header + ' (at ' + currentdate.getHours() + ":" + (currentdate.getMinutes()<10?'0':'') + currentdate.getMinutes() + ')');
	displayMain('Please wait...');
}

function pleaseWaitMessage(header)
{
	setHeader(header);
	displayMain('Please wait...');
}

function pleaseWaitGeolocationMessage(header)
{
	setHeader(header);
	displayMain('Waiting for location, please try again shortly...');
}

function errorMessage()
{
	setHeader('');
	displayMain('An error occurred... please try again.<br/>Possibly the TFL data is unavailable, or there are no bus stops nearby (within 400m).');
}

function noFavouritesMessage()
{
	setHeader('');
	displayMain('No favourites stops');
}

function displayMain(message)
{
	document.getElementById("bus_canvas").innerHTML = '<table style="width:100%;padding:0px"><tr><td align="center">' + message + '</td></tr></table>';
}

function setHeader(message)
{
	document.getElementById("header_canvas").innerHTML = '<table style="width:100%;padding:0px"><tr class="headerText"><td align="center" valign="middle">' + message + '</td></tr></table>';
	document.getElementById("header_canvas").style.visibility = 'collapse';
}

function displayHeader()
{
	document.getElementById("header_canvas").style.visibility = 'visible';
}

function getTimeFromEpoch(epochParam)
{
	var epoch = parseInt(epochParam) / 1000;
	var localDate = new Date(0);
	localDate.setUTCSeconds(epoch);
	
	var hours = localDate.getHours();
	if (hours < 10)
		hours = '0' + hours;
	var minutes = localDate.getMinutes();
	if (minutes < 10)
		minutes = '0' + minutes;
	var seconds = localDate.getSeconds();
	if (seconds < 10)
		seconds = '0' + seconds;
	
	return hours + ":" + minutes + ":" + seconds;
}

function getTimeDifferenceFromEpoch(epochParam)
{
	var epoch = parseInt(epochParam);
	var now = new Date().getTime();

	var mins = Math.ceil((epoch - now) / 60000);
	if (mins < 1)
		return 'due';
	if (mins == 1)
		return '1 min';
	return mins + ' mins';
}

function getDistanceFromLatLonInM(latitude,longitude) 
{
  var R = 6371000; 
  var dLatitude = (currentLatitude-latitude) * (Math.PI/180);  
  var dLongitude = (currentLongitude-longitude) * (Math.PI/180); 
  var a = 
    Math.sin(dLatitude/2) * Math.sin(dLatitude/2) +
    Math.cos(latitude * (Math.PI/180)) * Math.cos(currentLatitude * (Math.PI/180)) * 
    Math.sin(dLongitude/2) * Math.sin(dLongitude/2); 
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
}

function addFavourite(stopCode)
{
	var cookie = intel.xdk.cache.getCookie("favouriteStops");
	if (cookie === undefined)
	{
		intel.xdk.cache.setCookie("favouriteStops", stopCode.toString(), -1);
        sendStopFavouriteRequest();
		return;
	}
	
	var stops = cookie.split(',');
	var exists = stops.indexOf(stopCode.toString());

	if (exists != -1 && stops.length == 1)
		intel.xdk.cache.removeCookie("favouriteStops");
	else
	{
		if (exists == -1)
			stops.push(stopCode.toString());
		else
			stops.splice(exists, 1);
		intel.xdk.cache.setCookie("favouriteStops", stops.join(), -1);
	}
	
	sendStopFavouriteRequest();
}

function isFavourite(stopCode)
{
	var cookie = intel.xdk.cache.getCookie("favouriteStops");
	if (cookie === undefined)
		return false;
	var stops = cookie.split(',');
	var exists = stops.indexOf(stopCode.toString());
	if (exists != -1)
		return true;
	return false;		
}

function favouriteButtonText(stopCode)
{
	if (isFavourite(stopCode))
		return "-";
	return "+";
}

function crop(data)
{
	if (data.length <= 26)
		return data;
	return data.substring(0,23) + '...';
}

function cropSubtext(data)
{
	if (data.length <= 32)
		return data;
	return data.substring(0,29) + '...';
}
