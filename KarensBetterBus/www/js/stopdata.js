/* jshint browser: true */
/*global $:false, intel:false */

function StopData(busDataFieldArray)
{
	this.StopPointName = busDataFieldArray[busDataFieldArray.length-8];
	this.StopCode = busDataFieldArray[busDataFieldArray.length-7];//-6
	this.Latitude = busDataFieldArray[busDataFieldArray.length-2];//-2
	this.Longitude = busDataFieldArray[busDataFieldArray.length-1];//-1
	this.Towards = busDataFieldArray[busDataFieldArray.length-5];
}

StopData.prototype.Distance = function()
{
    if(!geolocationSuccess)
        return "";
	return Math.floor(getDistanceFromLatLonInM(this.Latitude, this.Longitude));
};

StopData.prototype.DistanceString = function()
{
    if(!geolocationSuccess)
        return "";
	return Math.floor(getDistanceFromLatLonInM(this.Latitude, this.Longitude)).toString() + "m";
};

StopData.ToHtml = function(busDataArray)
{
	busDataArray.sort(function(a,b){return a.Distance() - b.Distance();});

	var html = '<table style="width:100%;padding:0px">';
	for (var i=0;i<busDataArray.length-1;i++)
	{
		var busData = busDataArray[i];
		var quotedName = "'" + crop(busData.StopPointName) + "'";

		if (busData.StopCode != "null")
		{
			html += '<tr><td>' + crop(busData.StopPointName) + '</td><td>' + busData.DistanceString() + '</td><td><button onclick="sendBusStopRequest(' + busData.StopCode + ',' + quotedName + ');">Buses</button></td><td><button onclick="addFavourite(' + busData.StopCode +');">' + favouriteButtonText(busData.StopCode) + '</button></td></tr>';
			if (busData.Towards != "null")
				html += '<tr><td class="subText" colspan="4">(towards ' + cropSubtext(busData.Towards) + ')</td></tr>';
			else
				html += '<tr><td class="subText" colspan="4">(towards n/a)</td></tr>';
		}
	}
	html += '</table>';
	return html;
};