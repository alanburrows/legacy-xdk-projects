/* jshint browser: true */
/*global $:false, intel:false */

function BusData(busDataFieldArray)
{
	this.StopPointName = busDataFieldArray[busDataFieldArray.length-11];//.slice(1, busDataFieldArray.length-10).join();//-9
	this.StopCode = busDataFieldArray[busDataFieldArray.length-10];//-9
	this.LineName = busDataFieldArray[busDataFieldArray.length-5];//-5
	this.Destination = busDataFieldArray[busDataFieldArray.length-4];//-4
	this.EstimatedTimeEpoch = busDataFieldArray[busDataFieldArray.length-2];//-2
	this.Towards = busDataFieldArray[busDataFieldArray.length-9];
}

BusData.prototype.EstimatedTime = function()
{
	return getTimeFromEpoch(this.EstimatedTimeEpoch);
};

BusData.ToHtml = function(busDataArray, showStops)
{
    busDataArray.sort(function(a,b){return a.EstimatedTimeEpoch - b.EstimatedTimeEpoch;});

	var html = '<table style="width:100%;padding:0px">';
	for (var i = 0; i < busDataArray.length-1; i++)
	{
		var busData = busDataArray[i];
		if (busData.StopCode != "null")
		{
			html += '<tr><td>' + busData.LineName + '</td><td>' + crop(busData.Destination) + '</td><td>' + getTimeDifferenceFromEpoch(busData.EstimatedTimeEpoch) + '</td></tr>';	
			if (showStops)
			{
				html += '<tr><td class="subText">&nbsp;</td><td class="subText" colspan="2">' + cropSubtext(busData.StopPointName);
				if (busData.Towards != "null")
					html += '<br/>' + ' (towards ' + cropSubtext(busData.Towards)  + ')';
				html += '</td></tr>';	
			}
		}
	}
	html += '</table>';
	return html;
};