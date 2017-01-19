// Thanks to http://mandoliny.republika.pl/beta/metronom.html

var beat = 11;
var firstBeat = 11;
var beats = 12;
var maxBeats = 12;
var beatsPerMinute = 120;

var vol = 10;

// http://www.compas-flamenco.com/en/palos.html
var pattern = [2,2,1,2,2,1,2,1,2,1,2,1];
var compasBasicPattern = [2,2,1,2,2,1,2,1,2,1,2,1]; // Compás Basico
var soleaCantePattern = [0,3,1,0,3,1,2,1,2,3,2,1]; // Soleá Cante
var soleaEscobillasPattern = [2,2,1,2,2,1,2,1,2,1,2,1]; // Soleá Escobillas
var alegriaCantePattern = [2,2,1,2,2,1,2,1,2,1,2,1]; // Alegría Cante
var alegriaPalermosPattern = [2,2,1,2,2,1,2,1,2,1,2,1]; // Alegría Palmeros
var buleriasPattern = [2,2,1,2,2,1,2,1,2,1,2,1]; // Bulerias por 12
var buleriasPalmerosPattern = [2,2,1,2,2,1,2,1,2,1,2,1]; // Bulerias Palmeros por 12
var buleriasCortePattern = [2,2,1,2,2,1,2,1,2,1,2,1]; // Bulerias por 12 Corte
var buleriasPor6Pattern = [2,1,2,1,2,1]; // Bulerias por 6 2nd beat
//var buleriasPattern = [2,2,1,2,2,1]; // Bulerias por 6 3rd beat
var seguiriyasPattern = [2,2,1,2,2,1,2,1,2,1,2,1]; // Seguiriyas
var tangoPattern = [2,2,1,2]; // Tangos, Tarantos, Tientos
var fandangoHuelvaPattern = [2,2,1,2,2,1,2,1,2,1,2,1]; // Fandango de Huelva

var url = ["audio/low.ogg", "audio/snare.ogg", "audio/clap.ogg"];
var myAudioBuffer = new Array();
var audioContext;
var soundSource = new Array();
var soundCount = 0;

var isPlaying = 0;	
var functionTimeout;

function showTempo(newValue)
{
	document.getElementById("tempo").innerHTML = newValue;
	beatsPerMinute = newValue;
}

function showVolume(newValue)
{
	document.getElementById("volume").innerHTML = newValue;
	vol = newValue;
}

function changeSound(selectedFromList) 
{
    var element = document.getElementById(selectedFromList.toString());
	if (element.options[element.selectedIndex].value == "-") 
        pattern[selectedFromList] = 0;
	if (element.options[element.selectedIndex].value == "Low")
        pattern[selectedFromList] = 1;
	if (element.options[element.selectedIndex].value == "Snare")
        pattern[selectedFromList] = 2;
	if (element.options[element.selectedIndex].value == "Clap")
        pattern[selectedFromList] = 3;
    
    document.getElementById("beatPattern").selectedIndex = 0;
}

function changeBeats(newValue)
{
    beats = newValue;
    currentFirstBeat = firstBeat+1;
    if (newValue < currentFirstBeat)
    {
        firstBeat = 0;
        document.getElementById("firstBeat").selectedIndex = 0;
    }
    for (j = 0; j < document.getElementById("firstBeat").options.length ; j++)
    {
        document.getElementById("firstBeat").options[j].disabled = (parseInt(newValue) < parseInt(document.getElementById("firstBeat").options[j].value));
    }
    for (k = 0; k < maxBeats ; k++)
    {
        document.getElementById(k.toString()).disabled = (k >= parseInt(newValue));
    }
}

function changeFirstBeat(newValue)
{    
    firstBeat = (newValue-1) % beats;
    beat = firstBeat; 
}

function changeRhythm(newValue)
{
    var defaultBeats = 12;
    var defaultFirstBeat = 12;
    switch(newValue)
    {
            case 1: pattern = compasBasicPattern; break;
            case 2: pattern = soleaCantePattern; defaultFirstBeat = 1; break;
            case 3: pattern = alegriaCantePattern; defaultFirstBeat = 1; break;
            case 4: pattern = buleriasPor6Pattern; defaultBeats = 6; defaultFirstBeat = 6; break;
            case 5: pattern = tangoPattern; defaultBeats = 4;  defaultFirstBeat = 1; break;
            case 6: pattern = fandangoHuelvaPattern; defaultFirstBeat = 1; break;
            default: pattern = compasBasicPattern; break;
    }
    changeBeats(defaultBeats);
    changeFirstBeat(defaultFirstBeat);
    for (j = 0; j < document.getElementById("beats").options.length ; j++)
        if (defaultBeats == document.getElementById("beats").options[j].value)
            document.getElementById("beats").selectedIndex = j;
    for (j = 0; j < document.getElementById("firstBeat").options.length ; j++)
        if (defaultFirstBeat == document.getElementById("firstBeat").options[j].value)
            document.getElementById("firstBeat").selectedIndex = j;
    
    updateSelect();
}

function enableUiComponents()
{
    document.getElementById("beats").disabled = (isPlaying == 1);
    document.getElementById("firstBeat").disabled = (isPlaying == 1);
    document.getElementById("beatPattern").disabled = (isPlaying == 1);
}

window.onload = init;
function init(){
	initContext();
	loadSound(url);
};

function initContext(){
	if (typeof AudioContext != "undefined") 
		audioContext = new AudioContext();
	else if (typeof webkitAudioContext != "undefined") 
		audioContext = new webkitAudioContext();
	else 
		throw new Error('No Web Audio Api');
}

function loadSound() 
{	
	var odpServ = null;	
	if(soundCount < url.length) 
    {
		var request = new XMLHttpRequest();
		request.open('GET', url[soundCount], true);
		request.responseType = 'arraybuffer';
		request.onload = function() {
			audioContext.decodeAudioData(request.response, function(buffer) {
			odpServ = buffer;
			loadSoundHandler();
			});
		};
		request.send();
	}

	function loadSoundHandler() 
    { 
		myAudioBuffer.push(odpServ);		
		++soundCount;
		loadSound();
	}
}

function createSource(index) {
	soundSource[index] = audioContext.createBufferSource();
	soundSource[index].buffer = myAudioBuffer[index];
	
	var gainNode = audioContext.createGain(); 
	gainNode.gain.value = vol/100;

	soundSource[index].connect(gainNode);
	gainNode.connect(audioContext.destination);
}

function playSound()
{
	var delay;

	if(isPlaying == 0)
    {
		isPlaying = 1;
        enableUiComponents();
		
        var timeStart  = audioContext.currentTime;
		var timeNext = timeStart;
		
		function schedule()
        {
			delay = 60/beatsPerMinute;
			timeStart  = audioContext.currentTime;
			
			if((timeStart - timeNext) > delay)
				timeNext = timeStart;
			
            if(timeNext < timeStart + 0.1)
            {
				switch(pattern[beat]) 
                {
					case 0:
						if(soundSource[0]) soundSource[0].stop(0);
						if(soundSource[1]) soundSource[1].stop(0);
						if(soundSource[2]) soundSource[2].stop(0);
						break;
                    default:
						createSource(pattern[beat]-1);
						soundSource[pattern[beat]-1].start(timeNext, 0);
						break;
				}	
				timeNext += delay;

                ++beat;
                beat = beat % beats;
			}

			functionTimeout = setTimeout(schedule,25);
		}
		schedule();
	} 
}

function stopSound() 
{
	if (isPlaying == 1) 
    {
		clearTimeout(functionTimeout);
		
		if(soundSource[0]) soundSource[0].stop(0);
		if(soundSource[1]) soundSource[1].stop(0);
		if(soundSource[2]) soundSource[2].stop(0);
		
		isPlaying = 0;
        enableUiComponents();
		beat = firstBeat; 
	}
}

function updateSelect() {
	for (var s = 0; s < beats; s++)
		document.getElementById(s.toString()).selectedIndex = pattern[s];
	//for (var s = beats; s < maxbeats; s++)
	//	document.getElementById(s.toString()).selectedIndex = 0;
}