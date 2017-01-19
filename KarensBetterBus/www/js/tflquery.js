/* jshint browser: true */
/*global $:false, intel:false */

var url = "http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1";

// buses listed from stop ids
var postDataBusByStop =            "StopCode1={0}&ReturnList=StopPointName,StopCode1,StopPointIndicator,Latitude,Longitude,LineName,DestinationText,RegistrationNumber,EstimatedTime,ExpireTime,Towards";
// buses listed within radius of a point
var postDataBusByLocation =            "Circle={0},{1},{2}&ReturnList=StopPointName,StopCode1,StopPointIndicator,Latitude,Longitude,LineName,DestinationText,RegistrationNumber,EstimatedTime,ExpireTime,Towards";
// stops listed within radius of a point
var postDataStopByLocation =            "Circle={0},{1},{2}&ReturnList=StopPointName,StopCode1,Bearing,StopPointIndicator,Latitude,Longitude,StopPointType,Towards";
// stops listed from stop ids
var postDataStopByFavourite =            "StopCode1={0}&ReturnList=StopPointName,StopCode1,Bearing,StopPointIndicator,Latitude,Longitude,StopPointType,Towards";

var showStops = false;

function sendUrlRequest(data, isBusHandler)
{
    $.ajax({
        type:'POST',
        url:url,
        crossDomain:true,
        data:data,
        success:(isBusHandler ? bus_success_handler : stop_success_handler),
        error:error_handler
    });
//    $.ajax({
//        type:'POST',
//        url:url + '?' + data,
//        crossDomain:true,
//        success:(isBusHandler ? bus_success_handler : stop_success_handler),
//        error:error_handler
//    });
}

function sendBusRadiusRequest(radius)
{	
    if(!geolocationSuccess)
    {
        pleaseWaitGeolocationMessage("Nearby buses");
        setTimeout(sendBusRadiusRequest(radius), 500);
        return;
    }
	pleaseWaitMessageWithTime('Nearby buses');
	showStops = true;
	var postData = postDataBusByLocation.replace("{0}",currentLatitude).replace("{1}",currentLongitude).replace("{2}",radius);	
    sendUrlRequest(postData, true);
}

function sendStopRadiusRequest(radius)
{	
    if(!geolocationSuccess)
    {
        pleaseWaitGeolocationMessage("Nearby bus stops");
        setTimeout(sendStopRadiusRequest(radius), 500);
        return;
    }
	pleaseWaitMessage('Nearby bus stops');
	var postData = postDataStopByLocation.replace("{0}",currentLatitude).replace("{1}",currentLongitude).replace("{2}",radius);	
    sendUrlRequest(postData, false);
}

function sendBusStopRequest(stopCode, stopName)
{	
	pleaseWaitMessageWithTime('Buses from ' + stopName);
	showStops = false;
	var postData = postDataBusByStop.replace("{0}",stopCode);	
    sendUrlRequest(postData, true);
}

function sendStopFavouriteRequest()
{
	var stops = intel.xdk.cache.getCookie("favouriteStops");
    if (stops === undefined)
	{
		noFavouritesMessage();
		return;
	}

	pleaseWaitMessage('Favourite bus stops');

	var postData = postDataStopByFavourite.replace("{0}",stops);	
    sendUrlRequest(postData, false);
}

// Callbacks
function bus_success_handler (data) 
{
    var resultsAsLines = dataToArray(data);

	var busMetaData = new BusMetaData(resultsAsLines[0]);
	var busDataArray = new Array(resultsAsLines.length-1);
	for (var i = 1; i < resultsAsLines.length-1; i++)
    {
		busDataArray[i-1] = new BusData(resultsAsLines[i]);
    }
    displayHeader();
	displayMain(BusData.ToHtml(busDataArray, showStops));

	markLocation();
}

function stop_success_handler (data) 
{
    var resultsAsLines = dataToArray(data);
	var busMetaData = new BusMetaData(resultsAsLines[0]);
	var stopDataArray = new Array(resultsAsLines.length-1);
    for (var i = 1; i < resultsAsLines.length-1; i++)
    {
		stopDataArray[i-1] = new StopData(resultsAsLines[i]);
    }
    displayHeader();
	displayMain(StopData.ToHtml(stopDataArray));

	markLocation();
	for (var i = 0; i < stopDataArray.length; i++)	
	{
		if (stopDataArray[i].StopCode != "null")
			addMarker(stopDataArray[i].Latitude, stopDataArray[i].Longitude, stopDataArray[i].StopPointName);
	}
}

function error_handler(data) 
{
	errorMessage();	
}

function dataToArray(data)
{
    var result = data.replace(/\[/g, "");
    var resultArray = result.split("]");
    var returnArray = new Array(resultArray.length);
    
    for (var i=0;i<returnArray.length-1;i++)
        returnArray[i] = csvToArray(resultArray[i].trim());

    return returnArray;
}

function csvToArray(data)
{
    var result = data;
    strDelimiter = ",";

    var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );
    
    var arrData = [[]];
    var arrMatches = null;

    while (arrMatches = objPattern.exec(result))
    {
        var strMatchedDelimiter = arrMatches[ 1 ];

        if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter)
            arrData.push([]);

        var strMatchedValue;
        if (arrMatches[ 2 ])
            strMatchedValue = arrMatches[ 2 ].replace(new RegExp( "\"\"", "g" ), "\"");
        else
            strMatchedValue = arrMatches[ 3 ];
        arrData.push( strMatchedValue );
    }
    return arrData;
}