/*
InstrumentTypes moved to separate file to keep clarity in code.
*/


var instrumentTypes = {
	//canvasScope: null,
	FGEN: {
		fcn: {
			isInit: false,
			init: null,
			clickEvent: null,
			values: {},
			set: false
		},
		imgPaths: {
			not_set:	'img/instrument_FGEN.gif',
			set:		'img/instrument_VariableVoltageSource.gif'
		}
	},
	SCOPE: {
		fcn: {
			isInit: false,
			init: null,
			clickEvent: null,
			values: {},
			set: false
		},
		imgPaths: {
			not_set:	'img/instrument_SCOPE.gif',
			set:		'img/instrument_Oscilloscope.gif'
		}
	}
};
console.log(instrumentTypes);


//FGEN
instrumentTypes.FGEN.fcn.init = function(name) {
	
	if(!this.isInit) {
		console.log('FGEN_init();');
		this.clickEvent();
		this.isInit = true;

	}

	console.log('_x_clickFGEN - name: ' + name);//this is a placeholder
	//Show
	$('#divInstrFGEN').show();
};

instrumentTypes.FGEN.fcn.clickEvent = function() {

	//OK
	$('#FGEN_btnOK').click(function(event){
		//Check vals

		this.values = {
			waveformType:	null,
			frequency:		null,
			amplitude:		null,
			offset:			null
		};
		
		function getFreq() {
			var freq = parseFloat( $('#FGEN_inFreq').val() );
			var multiplier = 1;
			var rangeString = $('#FGEN_freqRange').val();
			switch(rangeString) {
				case 'hz':
					multiplier = 1;
					break;
				case 'khz':
					multiplier = 1000;
					break;
				case 'mhz':
					multiplier = 1000000;
					break;
				default:
					console.log('rangeString: ' + rangeString);
			}
			return ( freq * multiplier );
		}

		this.values.waveformType = $('#FGEN_selWaveformType').val();
		this.values.frequency = parseFloat($('#FGEN_freq').val());//getFreq();
		this.values.amplitude = parseFloat( ($('#FGEN_amp').val() === '' )? 1 : $('#FGEN_amp').val() );
		this.values.offset = parseFloat( ($('#FGEN_off').val() === '' )? 0 : $('#FGEN_off').val() );

		instrumentTypes.SCOPE.fcn.values.samplingRate = this.values.frequency * 10;
		if( checkScopeTime() ) {
			createMsgBox('Sample Time was reduced, due to higher FGEN frequency.','warning','msgAdjustedSampleTime','divMessages');
		}

		
		//Set Image
		this.set = true;

		//myLab.canvasElements[0].set = true;
		//console.log(this.imgPaths);
		//redraw
		//this.draw(this.sources);
		//mySetupCanvas.draw(myLab.canvasElements,false);
		//this.canvasScope.draw(this.canvasScope.sources,false);
		
		//console.log($('#FGEN_amp').val());
		console.log(this.values);
		
		$('#divInstrFGEN').show().hide();
	}.bind(this));

	//CANCEL
	$('#FGEN_btnCancel').click(function(event){
		$('#divInstrFGEN').show().hide();
	});
};


instrumentTypes.SCOPE.fcn.init = function(name) {
	
	if(!this.isInit) {
		console.log('SCOPE_init();');
		this.clickEvent();
		this.isInit = true;

	}

	console.log('_x_clickSCOPE - name: ' + name);//this is a placeholder
	//Show
	$('#divInstrSCOPE').show();
};

instrumentTypes.SCOPE.fcn.clickEvent = function(name) {
	console.log('scopeclick');
	//OK
	$('#SCOPE_btnOK').click(function(event){
		//Check vals

		this.values = {
			samplingRate:	parseFloat(document.getElementById('FGEN_freq').value)*10,
			samplingTime:	parseFloat(document.getElementById('SCOPE_time').value)
		};
		
		this.set = true;
		
		console.log(this.values);
		
		$('#divInstrSCOPE').show().hide();

	}.bind(this));	
}

/*/SCOPE
instrumentTypes.SCOPE.fcn = function(name) {
	$('#SCOPE_btnOK, #SCOPE_btnCancel').click(function(event){
		$('#divInstrSCOPE').show().hide();
	});
	console.log('_x_clickSCOPE - name: ' + name);//this is a placeholder
	$('#divInstrSCOPE').show();
};//*/
