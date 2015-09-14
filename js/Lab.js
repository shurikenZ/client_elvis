
/*
Description bla bla
*/


//copy of createMsgBox = function(msg,type,id,divParent)
function createMsgBox(msg,type,id,divParent) {
	//create close element
	var close = document.createElement('a');
	close.setAttribute('onclick', 'delMsg(\''+id+'\');');
	close.setAttribute('href', '#');
	close.appendChild(document.createTextNode('[close]'));
	//create Element
	var msgSpan = document.createElement('span');
	msgSpan.appendChild(document.createTextNode(msg+' '));//msg + ' ' + ;
	msgSpan.appendChild(close);
	//add Attributes
	msgSpan.setAttribute('id', id);
	msgSpan.setAttribute('class', 'messagebox ' + type);
	//append
	var parent = document.getElementById(divParent);
	parent.appendChild(msgSpan);
}


function Lab(canvasId) {
	this.intervalHandler = null;
//Lab = function() {
	//attributes
	this.configuration = {};
	this.resultBlob = {};
	this.experimentResults = {};
	this.canvasElements = [];
	this.GET = {};
	//Service Broker Communication
	//this.mySB = new SB();
	this.setupIndex = -1;
	this.initEstWait = -1;
	this.disableSubmit = false;
//SetupCanvas attributes
	this.canvas = null;
	this.context = null;
	this.sources = null; //ToDo: Sources needed for redraw; however bad programming, because some elements are in this.img.el as well...
	this.centerOffset = {
		x: 0,
		y: 0
	};
	this.img = {
		loaded: 0,
		number: 0,
		el: [] //el=element
	};
	this.hover = {
		onElement: false,
		overlayDrawn: false
	};
	//test
//	console.log('SetupCanvas');
//	console.log(this.img);
//	console.log(this.hover);
	
	this.init(canvasId);
	
}
//------------------------------------------------------

Lab.prototype.checkSBresponse = function(response) {
	var parent = 'divMessages';
	if(response.soapFault.faultstring.indexOf('The ticket has expired..') > -1) {
		this.createMsgBox('Your ticket from the iLab Service Broker has expired! Log in to get a new one.','error','msgTicketExpired',parent);
	}
};

/*
function(id) {
	var element = document.getElementById(id);
	element.parentNode.removeChild(element);
};
*/

Lab.prototype.createMsgBox = function(msg,type,id,divParent) {
	//create close element
	var close = document.createElement('a');
	close.setAttribute('onclick', 'delMsg(\''+id+'\');');
	close.setAttribute('href', '#');
	close.appendChild(document.createTextNode('[close]'));
	//create Element
	var msgSpan = document.createElement('span');
	msgSpan.appendChild(document.createTextNode(msg+' '));//msg + ' ' + ;
	msgSpan.appendChild(close);
	//add Attributes
	msgSpan.setAttribute('id', id);
	msgSpan.setAttribute('class', 'messagebox ' + type);
	//append
	var parent = document.getElementById(divParent);
	parent.appendChild(msgSpan);
};

//------------------------------------------------------

Lab.prototype.intervalDraw = function(operation,xmlRoot) {
	//console.log('sb');
	for(var i = 0; i < this.canvasElements.length; i++) {
		//console.log(this.canvasElements[i].instrNr);
		//console.log(this.canvasElements[i].fcn.set);
		//console.log(this.canvasElements[i].imgSetState);
		if(this.canvasElements[i].instrNr > -1 && this.canvasElements[i].fcn.set === true  && this.canvasElements[i].imgSetState === false) {
			this.canvasElements[i].imgSetState = true;
			console.log('intervalDraw');
			this.draw(this.sources);
		}
	}
};
//function SB(){}

/*/
SB.prototype.init = function() {
	//atm only for testing
	console.log('sb');
};//*/


Lab.prototype.intervalGetExperimentStatus = function() {
	console.log('intervalGetExperimentStatus');
	this.ajaxCall('GetExperimentStatus','nodes',{experimentID: this.expPar.experimentID});
};


Lab.prototype.checkExperimentStatus = function(status) {
	var code = status.statusReport.statusCode;
	console.log(code);
	if(code === '1') {//QUEUED
		//ToDo: Update Progressbar
		var percent = parseInt( (this.initEstWait - status.statusReport.wait.estWait) / this.initEstWait * 100 );
		this.updateProgressbar('divProgressbar',
				status.statusReport.wait.effectiveQueueLength + ' experiment(s) in queue. Wait: '+status.statusReport.wait.estWait+'s',
				percent);
	} else if(code === '2') {//IN PROGRESS
		//ToDo: Update Progressbar
	} else if(code === '3' || code === '4') {//COMPLETED
		clearInterval(this.ExperimentStatusIntervalHandler);
		this.retrieveResult();
	} else if(code === '5') {//CANCELLED
		clearInterval(this.ExperimentStatusIntervalHandler);
	}
};


Lab.prototype.retrieveResult = function() {
	this.ajaxCall('RetrieveResult','nodes',{experimentID: this.expPar.experimentID});
	this.disableSubmit = false;
};


Lab.prototype.cancel = function() {
	console.log('Try to Cancel!');
	this.ajaxCall('Cancel','nodes',{experimentID: this.expPar.experimentID});
};

Lab.prototype.updateProgressbar = function(id,text,percent) {
	//console.log('updateProgressbar');
	var node = document.getElementById(id);
	var TxtNode = document.getElementById(id+'Txt');
	TxtNode.innerHTML = text;
	if(percent !== undefined) {
		node.style.width = percent + '%';
	} else {
		console.log('updateProgressbar - percent undefined');
	}
};

Lab.prototype.ajaxCall = function(operation,xmlRoot,parameters) {
	/* Perform Ajax Request */
	$.ajax({
		async:		true,
		type:		'POST',
		url:		'index.php', //Todo: make dynamic, e.g. like var client.URL in blackbody client
		data:		{
						coupon_id: this.GET.coupon_id,//expHelper.couponID,
						passkey: this.GET.passkey,//expHelper.passkey,
						operation: operation,
						expSpec: parameters//((parameters !== undefined) ? parameters : '')
					},
		//dataType:	'xml'
	})
	.done(function(xml) {
		//console.log('XML: ' + xml);
		if(operation === 'GetLabConfiguration') {
			this.configuration = this.parseXML2Json(xml,xmlRoot);
		} else if(operation === 'Submit') {
			console.log('XML: ' + xml);
			var submit = this.parseXML2Json(xml,xmlRoot);
			if(submit.vReport.accepted == 1) {
				//Success
				this.expPar = submit;
				this.initEstWait = parseInt(this.expPar.wait.estWait);
				console.log(this.expPar);
				//start interval
				this.ExperimentStatusIntervalHandler = setInterval(this.intervalGetExperimentStatus.bind(this),3000);
				//Update Progressbar
				this.updateProgressbar('divProgressbar','Experiment submitted! Wait...',100);
				//Set Layer
				$('#divSubmit').show().hide();
				$('#divCancel').show();
			} else {
				console.log('Submit - Wrong node!');
				this.createMsgBox('Submit request not accepted.','error','msgSubmitError','divMessages');
				$('#divCancel').show().hide();
				$('#divSubmit').show();
			}
		} else if(operation === 'GetExperimentStatus') {
			console.log(this.parseXML2Json(xml,xmlRoot));
			this.checkExperimentStatus(this.parseXML2Json(xml,xmlRoot));
		} else if(operation === 'RetrieveResult') {
			console.log('ajax done: retrieve result');
			this.resultBlob = this.parseXML2Json(xml,xmlRoot);
			console.log(this.resultBlob);
			this.experimentResultsStr = this.decodeHTMLEntities(this.resultBlob.experimentResults);
			console.log(this.experimentResultsStr);
			this.experimentResults = this.parseXML2Json(this.experimentResultsStr,'experimentResult');
			console.log(this.experimentResults);
			//Draw Highchart
			myHighchart.series = this.setExpResults();
			$('#highchart').highcharts(myHighchart);
			//Allow to start next exp
			this.disableSubmit = false;
			//Set Layer
			$('#divCancel').show().hide();
			$('#divSubmit').show();
		} else if(operation === 'Cancel') {
			//ToDo
			console.log('Canceled successfully!');
			this.disableSubmit = false;
			//Set Layer
			$('#divCancel').show().hide();
			$('#divSubmit').show();
		}
		
		
		console.log('ajax: ' + operation + ' done!');
		//this.configuration = this.parseXML2Json(xml,xmlRoot);
	}.bind(this))
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('ajax: ' + operation + ' failed!');
		console.error('Data request failed (' + textStatus + '): ' + errorThrown);
		console.debug(jqXHR.responseText);
		//ToDo: MessageBox: Not possible to retrieve Lab Setups (try again: refresh client by pressing F5)
    });
};

Lab.prototype.parseXML2Json = function(xml,root) {//Json or Js Object ?
	var dom = parseXml(xml);
	//console.log(dom);
	var jsonString = xml2json(dom,'');
	//console.log(jsonString);
	var json = JSON.parse(jsonString);
	//console.log(json);
	if(root === undefined) {
		return json;
	} else if(json[root] === undefined) {
		return json;
	} else {
		return json[root];
	}
	//return (root === undefined) ? json : json[root];
	//return json[root];
};
/*/
Lab.prototype.GetLabConfiguration = function(lab) {
	this.ajaxCall(lab,'GetLabConfiguration','labConfiguration');
};//*/


/*
http://stackoverflow.com/questions/5796718/html-entity-decode
*/
Lab.prototype.decodeHTMLEntities = function(str) {
	if(str && typeof str === 'string') {
		return str.replace(/&apos;/g, "'")
					.replace(/,/g, '.') //new: decimal points
					//.replace(/''/g, "'")
					.replace(/&quot;/g, '"')
					.replace(/&gt;/g, '>')
					.replace(/&lt;/g, '<')
					.replace(/&amp;/g, '&');
	}
};

//------------------------------------------------------


Lab.prototype.fillSetupMenu = function() {
	//ToDo: Could get rid of jQuery
	//remove placeholder
	$('#optNoSetup').remove();
	//add options
	for(var i = 0; i < this.configuration.setup.length; i++) {
		$('#selSetupMenu').append( new Option(this.configuration.setup[i].name,this.configuration.setup[i]['@id']) );
	}
	//enable select
	$('#selSetupMenu').removeAttr('disabled');
	//onChange
	$('#selSetupMenu').on('change', function(event) {
		//console.log('event.currentTarget.value: ' + event.currentTarget.value);
		this.setupIndex = this.getSetupIndexFromSetupID(event.currentTarget.value);
		this.setCanvasElements(this.setupIndex);
		this.draw(this.canvasElements,true);
	}.bind(this));
};

Lab.prototype.getSetupIndexFromSetupID = function(id) {
	for(var i = 0; i < this.configuration.setup.length; i++) {
		if( this.configuration.setup[i]['@id'] == id ) { //ToDo: @id not an Integer
			return i;
		}
	}
	return -1;//not found
};

Lab.prototype.loadSetups = function() {
	//ToDo: Make first a check if coupon_id and passkey are not undefined.
	//sb_GetLabConfiguration(this);
	//this.mySB.GetLabConfiguration(this);
	this.ajaxCall('GetLabConfiguration','labConfiguration');
};

//returns true if all parameters are set
Lab.prototype.submit = function() {
	//
	console.log('Submit started! Nr. of Elements: ' + this.canvasElements.length);
	var parameters = [];
	var allSet = true;
	
	
	for(var i = 0; i < this.canvasElements.length; i++) {
		if(this.canvasElements[i].instrNr > -1) {
			if(this.canvasElements[i].fcn.values !== null && this.canvasElements[i].fcn.values !== undefined) {
				parameters.push({
					instrumentNumber: this.canvasElements[i].instrNr,
					instrumentName: this.canvasElements[i].name,
					instrumentValues: this.canvasElements[i].fcn.values
				});
			} else {
				//Instrument not set
				allSet = false;
				console.log('One Instrument not set!');//ToDo: Write warning msg
			}
		}
	}
	//QuickFix! Since I changed the input fields of FGEN and SCOPE the for-loop above does not recognize when instruments are not set any more
	allSet = ( instrumentTypes.FGEN.fcn.set && instrumentTypes.SCOPE.fcn.set ) ? true : false;
	
	console.log(parameters);
	console.log(allSet);
	if(allSet) {
		this.initEstWait = -1;
		this.ajaxCall('Submit','nodes',{setupID: this.configuration.setup[this.setupIndex]['@id'], parameters: parameters});
		return true;
	} else {
		this.createMsgBox('You haven\'t set all instruments.','info','msgSetInstruments','divMessages');
		return false;
	}
};

Lab.prototype.pushCanvasElement = function(name,fcn,imgPaths,pos,nr,set) {
	this.canvasElements.push(
		{
			name:		name,
			fcn:		fcn,
			imgPaths:	imgPaths,
			pos:		{
							x:	parseInt(pos.x),
							y:	parseInt(pos.y)
						},
			imgSetState: set,
			set:		set, //Initial state of instruments is always false, i.e. not_set. Setup is always true.
			//values:		null,
			instrNr:	nr
		}
	);
};

Lab.prototype.setCanvasElements = function(index) {

	//Add instruments
	var terminals = this.configuration.setup[index].terminal;
	//Reset canvasElements
	this.canvasElements = [];

	for(var i = 0; i < terminals.length; i++) {
		var instrumentName = terminals[i]['@instrumentType'];

		if( instrumentTypes[instrumentName] !== undefined ) {
			//console.log('instrumentType defined.');
			this.pushCanvasElement(instrumentName, instrumentTypes[instrumentName].fcn,
					instrumentTypes[instrumentName].imgPaths, terminals[i].pixelLocation, terminals[i]['@instrumentNumber'], false);
		} else {
			//console.log('instrumentType NOT defined.');
			//ToDo: Handle error
		}
	}

	//Add setup first
	this.pushCanvasElement('Setup',null,{set:(this.configuration.setup[index].imageURL).replace('http://exp04.cti.ac.at/LabServer/images/setups/','img_setup/')},{x:25,y:0},-1,true); //ToDo: DEBUG Mode, remove replace function
	//this.pushCanvasElement('Setup',null,{set:'img_setup/107OpAmp_C01.gif'},{x:25,y:0},-1,true);//ToDo: Image ist nur ein Platzhalter
	//x: offset; ToDo: Change positions of instruments in LabConfiguration so that x can be set to 0.

};


Lab.prototype.setExpResults = function() {
	var dv = this.experimentResults.datavector;
	var expResults = {};
	for(var i = 0; i < dv.length; i++) {
		//The trim() method removes whitespace from both sides of a string. (Does not work with IE8.)
		expResults[ dv[i]['@name'] ] = dv[i]['#text'].trim().split(' ').map(Number);//ATTENTION: older browsers don't support map
	}
	return this.createHighchartSeries( expResults, ['VIN','VOUT'], [ ['TIME', 'VIN'], ['TIME', 'VOUT'] ] );
};

//function getDummyResults() {
Lab.prototype.getDummyResults = function() {
	var expResults = {};
	var xml = "<?xml version='1.0' encoding='utf-8' standalone='no' ?><!DOCTYPE experimentResult SYSTEM 'http://exp01.cti.ac.at/elvis/xml/experimentResult.dtd'><experimentResult lab='MIT NI-ELVIS Weblab' specversion='0.1'><datavector name='TIME'>0.000000 0.002000 0.004000 0.006000 0.008000 0.010000 0.012000 0.014000 0.016000 0.018000 0.020000 0.022000 0.024000 0.026000 0.028000 0.030000 0.032000 0.034000 0.036000 0.038000 0.040000 0.042000 0.044000 0.046000 0.048000 0.050000 </datavector><datavector name='VOUT'>-0.019584 -0.016041 -0.016041 -0.017651 -0.020229 -0.022001 -0.023611 -0.023289 -0.020712 -0.021195 -0.022967 -0.024900 -0.026028 -0.028605 -0.028766 -0.026672 -0.026189 -0.027961 -0.029571 -0.031182 -0.032632 -0.033115 -0.031021 -0.030055 -0.031826 -0.033437 </datavector><datavector name='VIN'>0.055157 0.057734 0.061600 0.063533 0.065305 0.066755 0.068849 0.070621 0.072715 0.075131 0.078192 0.081413 0.082702 0.084635 0.085601 0.087534 0.089145 0.091561 0.093977 0.095749 0.097360 0.098649 0.100421 0.101548 0.103481 0.105736 </datavector></experimentResult>";
	//console.log(xml);
	var json = this.parseXML2Json(xml,'experimentResult');
	//console.log(json);
	//Process...
	for(var i = 0; i < json.datavector.length; i++) {
		//console.log( json.datavector[i]['@name'] );
		//The trim() method removes whitespace from both sides of a string. (Does not work with IE8.)
		expResults[ json.datavector[i]['@name'] ] = json.datavector[i]['#text'].trim().split(' ').map(Number);//ATTENTION: older browsers don't support map
		//var array = json.datavector[i]['#text'].trim().split(' ');
		//console.log(array);
	}
	console.log(expResults);
	//...
	return this.createHighchartSeries( expResults, ['VIN','VOUT'], [ ['TIME', 'VIN'], ['TIME', 'VOUT'] ] );
};

//function array2dimConcat(a1,a2) {
Lab.prototype.array2dimConcat = function(a1,a2) {
	//console.log(a1);
	//console.log(a2);
	var length = (a1.length > a2.length) ? a1.length : a2.length;
	//console.log('length: ' + length);
	var array = [];
	for(var i = 0; i < length; i++) {
		array.push( [ a1[i], a2[i] ] );
	}
	//console.log(array);
	return array;
};

//gives expResults a new structure
//function createHighchartSeries(values, names, data) {
Lab.prototype.createHighchartSeries = function(values, names, data) {
	//console.log(names);
	//console.log(data);
	var series = [];
	
	for(var i = 0; i < names.length; i++) {
		var el = {};
		el.name = names[i];
		//console.log(values[data[i][0]]);
		el.data = this.array2dimConcat( values[data[i][0]], values[data[i][1]] );
		series.push(el);
	}
	//console.log(values[names[0]].length);
	console.log(series);
	return series;
};
