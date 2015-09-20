/**
Main script of ELVIS Lab Client. Contains jQuery .ready() method.
**/

//-------------------------------------------------------------------------------------------------------------------

function delMsg(id) {
	var element = document.getElementById(id);
	element.parentNode.removeChild(element);
	return false;
}


	//SCOPE
		function checkScopeTime() {
			var maxRecordLength = 100000;
			var sampleRate = parseFloat(document.getElementById('FGEN_freq').value)*10;
			//console.log('sampleRate: ' + sampleRate);
			var sampleTime = parseFloat(document.getElementById('SCOPE_time').value);
			//console.log('sampleTime: ' + sampleTime);
			//if( sampleTime > (sampleRate/maxRecordLength) ) {
			if( (sampleRate*sampleTime) > maxRecordLength ) {
				//console.log('Sample time exceeded');
				document.getElementById('SCOPE_time').value = (maxRecordLength/sampleRate);
				$('#msg_SCOPE_maxRecLength').show();
				return true;
			} else {
				//console.log('Sample time NOT exceeded');
				$('#msg_SCOPE_maxRecLength').show().hide();
				return false;
			}
		}


//QUERY DOCUMENT READY
$(function(){



//Set pre-defined values from input fields and dropdown (for the Young Science Award)
//FGEN
instrumentTypes.FGEN.fcn.values.waveformType = $('#FGEN_selWaveformType').val();
instrumentTypes.FGEN.fcn.values.frequency = parseFloat($('#FGEN_freq').val());//getFreq();
instrumentTypes.FGEN.fcn.values.amplitude = parseFloat( ($('#FGEN_amp').val() === '' )? 1 : $('#FGEN_amp').val() );
instrumentTypes.FGEN.fcn.values.offset = parseFloat( ($('#FGEN_off').val() === '' )? 0 : $('#FGEN_off').val() );
instrumentTypes.FGEN.fcn.set = true;
//SCOPE
instrumentTypes.SCOPE.fcn.values.samplingRate = parseFloat(document.getElementById('FGEN_freq').value)*10;
instrumentTypes.SCOPE.fcn.values.samplingTime = parseFloat(document.getElementById('SCOPE_time').value)
instrumentTypes.SCOPE.fcn.set = true;



	//FGEN
	function checkFgenAmpRange() {
		var amp = parseFloat(document.getElementById('FGEN_amp').value);
		var off = parseFloat(document.getElementById('FGEN_off').value);
		if( (amp+off) > 10 ) {
			document.getElementById('FGEN_off').value = 10-amp;
			$('#msg_FGEN_OutOfRange').show();
		} else {
			$('#msg_FGEN_OutOfRange').show().hide();
		}
	}
	
	document.getElementById('FGEN_amp').addEventListener('input', function(event) {
		if(document.getElementById('FGEN_amp').value < 0.05) {
			document.getElementById('FGEN_amp').value = 0.05;
		} else if(document.getElementById('FGEN_amp').value > 10) {
			document.getElementById('FGEN_amp').value = 10;
		}
		checkFgenAmpRange();
	}, false);

	document.getElementById('FGEN_off').addEventListener('input', function(event) {
		checkFgenAmpRange();
	}, false);
	

	
	document.getElementById('SCOPE_time').addEventListener('input', function(event) {
		if(document.getElementById('SCOPE_time').value < 0.05) {
			document.getElementById('SCOPE_time').value = 0.05;
		} else if(document.getElementById('SCOPE_time').value > 5) {
			document.getElementById('SCOPE_time').value = 5;
		}
		checkScopeTime();
	}, false);
	
	/*document.getElementById('FGEN_outFreq').innerHTML = document.getElementById('FGEN_inFreq').value;

	document.getElementById('FGEN_inFreq').addEventListener('input', function(event) {
		document.getElementById('FGEN_outFreq').innerHTML = document.getElementById('FGEN_inFreq').value;
	}, false);//*/

	//document.addEventListener('mousemove', this, true);
	//var FGEN_freq = document.getElementById('FGEN_inFreq').value

	//Attributes
	var myLab = new Lab('canvasSetup');
	//test
	//myLab.mySB.init();
	//GET parameters
	myLab.GET.coupon_id = $.getUrlVars()['coupon_id'];
	myLab.GET.passkey = $.getUrlVars()['passkey'];
	//test highchart
	myHighchart.series = [];//myLab.getDummyResults();
	$('#highchart').highcharts(myHighchart);
	//console.log(myHighchart);
	
	//Init
	myLab.loadSetups();
	console.log(myLab);
	
	//DEBUG
	$('#btnStopIntervallCalls').click(function(event){
		//Test
		myLab.updateProgressbar('divProgressbar','hello world',80);

		//myLab.stopIntervallCalls = true;
		clearInterval(myLab.ExperimentStatusIntervalHandler);
		console.log('myLab.stopIntervallCalls = true;');
	});

	//var mySetupCanvas = new SetupCanvas('canvasSetup');
	myLab.writeCanvasMsg('Loading Setup...');
	//console.log(mySetupCanvas);

	/*/Button and remove envet listenter test
	$('#btnRemoveEventListener').click(function(event){
		//mySetupCanvas.removeEvent
		mySetupCanvas.test();
	});//*/



	//Activate Submit Button
	$('#btnSubmit').click(function(event){
		//if SBresponse is defined we have a SOAP error
		if(myLab.configuration.SBresponse === undefined && myLab.configuration.setup !== undefined) {
			if(!myLab.disableSubmit) {//maybe rename to ExpRunning
				myLab.disableSubmit = myLab.submit();//true, if all Instruments are set
				console.log(myLab.disableSubmit);
			} else {
				myLab.createMsgBox('Wait until other experiment is finished or cancel!','info','msgWaitForExp','divMessages');
			}
		} else {
			myLab.createMsgBox('Wait for Setups to load first!','warning','msgWaitForLabConf','divMessages');
		}
	});//no binding... -> this = myLab

	$('#btnCancel').click(function(event){
		//check if an experiment was started
		if(myLab.disableSubmit) {
			console.log('this.disableSubmit: true');
			myLab.cancel();
		} else {
			console.log('this.disableSubmit: false');
		}
	});


$(document).ajaxComplete(function(event, xhr, settings) {
	//if(settings.url === 'index.php')

	if(settings.data.indexOf('operation=GetLabConfiguration') > -1) {

		//ToDo: needs somehow to check, if 'done' or 'fail'
		//(just change url in sb_GetLabConfiguration to for example index2.php to simulate a fail)
		//console.log(myLab);
		//console.log(myLab.configuration.setup);
		

		if(myLab.configuration.SBresponse === undefined) {//if SBresponse is defined we have a SOAP error
			if(myLab.configuration.setup.length > 0) {
				myLab.fillSetupMenu();
				
				//Take first setup in list as init value (arrayIndex = 0)
				myLab.setupIndex = 0;
				myLab.setCanvasElements(myLab.setupIndex);

				//console.log(myLab.canvasElements);
				//Draw setup
				myLab.draw(myLab.canvasElements,true);
				
				//setIntervalHandler
				myLab.intervalHandler = setInterval(myLab.intervalDraw.bind(myLab),500);
				
				//test
				//myLab.canvasElements[0].set = true;
				

			} else {
				//ToDo: Error message
			}
		} else {
			myLab.checkSBresponse(myLab.configuration.SBresponse);
			//console.log('soapFault');
			//ToDo: Deal with SOAPfault -> check faultString and create msgBox
		}
		//Draw
		//for(var i in lab.configuration.setup) {
			//console.log(lab.configuration.setup[i]);
		//}

	}

});//*/


});//END OF .ready() method
