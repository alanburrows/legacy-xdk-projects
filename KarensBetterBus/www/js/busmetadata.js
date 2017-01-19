/* jshint browser: true */
/*global $:false, intel:false */

function BusMetaData(busDataFieldArray)
{
	this.QueryTimeStampEpoch = busDataFieldArray[2];
}

BusMetaData.prototype.QueryTimeStamp = function()
{
	return getTimeFromEpoch(this.QueryTimeStampEpoch);
};

BusMetaData.prototype.ToHtml = function()
{
	return '<table><tr><td align="center">Data as of: ' + this.QueryTimeStamp() +'</td></tr></table>';
};

