/* jshint browser: true */
/*global $:false, intel:false, google:false */

var options = {timeout: 25000, maximumAge: 30000, enableHighAccuracy: true};
var coarseOptions = {timeout: 25000, maximumAge: 30000, enableHighAccuracy: false};
var _map = null;
var showMap = false;

function drawMap()
{
	var latlng = new google.maps.LatLng(currentLatitude,currentLongitude);
	var mapOptions = {
		zoom: 16,
		center: latlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		zoomControl: true,
		zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.LEFT_TOP
		},
	};

	_map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
}

function markLocation() 
{
	showLocation();
}

function toggleShowMap()
{
	showMap	= !showMap;
	showLocation();
}

function showLocation() 
{
	var height = $("#content").height();
	
	if (showMap)
	{
		document.getElementById("map_canvas").style.height = (height - 100) + "px";
		document.getElementById("bus_canvas").style.height = "150px";
		document.getElementById("map_canvas").style.visibility = 'visible';
		document.getElementById("map_canvas_splitter").style.visibility = 'visible';
		document.getElementById("show_map_button").innerHTML = 'Hide map';
		drawMap();
		addHereMarker();
	}
	else
	{
		_map = null;
		document.getElementById("map_canvas").style.visibility = 'collapse';
		document.getElementById("map_canvas_splitter").style.visibility = 'collapse';
		document.getElementById("bus_canvas").style.height = (height - 35) + "px";
		document.getElementById("show_map_button").innerHTML = 'Show map';
	}
}
  
function addMarker(latitude, longitude, text)
{
	var myLatLng = new google.maps.LatLng(latitude, longitude);
	var beachMarker = new google.maps.Marker({
        position: myLatLng,
        map: _map,
        title: text
	});
}

function addHereMarker()
{
	var myLatLng = new google.maps.LatLng(currentLatitude, currentLongitude);
	var beachMarker = new google.maps.Marker({
        position: myLatLng,
        map: _map,
        title: 'You are here',
        icon: 'css/images/blue-dot.png'
	});
}