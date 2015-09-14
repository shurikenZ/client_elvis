/**
Submits the settings to Service Broker to start experiment.
**/
function sb_Submit(expContainer, expHelper, client, btnID, myChart) {


	/* Create an object for a new experiment */
	
	var i = expContainer.length;

	expContainer[i] = {
		id: -1,
		success: false,
		state: 'Submit',
		set: new Object(),
		data: {
			xAxis: 0,
			value: 0,
			mTime: 0
		}
	};

	console.log(expContainer);


	/* Collect settings information */
	
	//Check measurement type and collect type-specific settings
	switch (btnID) {
		case 'btn_submit_d':
			expContainer[i].type = 'd';
			expContainer[i].set.maxDistance = $('#sldr_distance').slider('values', 0);
			expContainer[i].set.stepsize = $('#sldr_stepsize').slider('value');
			break;
		case 'btn_submit_h':
			expContainer[i].type = 'h';
			expContainer[i].set.duration = $('#sldr_duration').slider('value');
			break;
	}

	//Collect other settings information
		//Lightsource
		if     ( $('#src_rad_bulb_' + expContainer[i].type).prop('checked') ) { expContainer[i].set.lightsource = 'Bulb'; }
		else if( $('#src_rad_heat_' + expContainer[i].type).prop('checked') ) { expContainer[i].set.lightsource = 'Heater'; }
		else if( $('#src_rad_esav_' + expContainer[i].type).prop('checked') ) { expContainer[i].set.lightsource = 'Energy Saver'; }
		else if( $('#src_rad_halg_' + expContainer[i].type).prop('checked') ) { expContainer[i].set.lightsource = 'Halogen'; }
		else { expContainer[i].set.lightsource = 'LED'; }
		//Sensor
		if     ( $('#sen_rad_s130vc_' + expContainer[i].type).prop('checked') ) { expContainer[i].set.sensor = 'S130VC'; }
		else if( $('#sen_rad_s132c_'  + expContainer[i].type).prop('checked') ) { expContainer[i].set.sensor = 'S132C';  }
		else { expContainer[i].set.sensor = 'S310C'; }

	//Set Record Video (is not a jQuery-Element)
	var recVideo = document.getElementById('chk_recVideo_' + expContainer[i].type);
	if ( recVideo.checked ) { expContainer[i].recVideo = true; }
		else { expContainer[i].recVideo = false; }


	/* Update Progressbar */
	updateProgressbar(expContainer[i].type, 'Submit', '');


	/* Switch active layers on client */
	setLayer.runExp(expContainer[i].type);


	/* Perform Ajax Request */

	$.ajax({
		async:		true,
		type:		'POST',
		url:		client.URL,
		data:		{
						coupon_id: expHelper.couponID,
						passkey: expHelper.passkey,
						operation: 'Submit',
						expSpec: {
							experimentType: expContainer[i].type,
							recordVideo: expContainer[i].recVideo,
							parameters: expContainer[i].set
						}
					},
		//dataType:	'xml'
	})
	.done(function(xml) {
		console.log('sb_Submit: done');
		parseSubmit(xml, i, expContainer, expHelper, client, btnID, myChart);

	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.error('Data request failed (' + textStatus + '): ' + errorThrown);
		console.debug(jqXHR.responseText);
    });
/*	.fail(function(xml, i, expContainer, expHelper, client, btnID, myChart) {
		console.log('sb_Submit: fail');
		console.log(xml.responseText, i, expContainer, expHelper, client, btnID, myChart);
		
		parseSubmit(xml.responseText);
		//Delete Array element
		expContainer.splice(i,1);

		expHelper.ajaxErrorCounter += 1;
	});*/

}// END OF function sb_Submit()

function parseSubmit(xml, i, expContainer, expHelper, client, btnID, myChart) {

		//DEBUG: Write XML-response to textarea
		var xmlstr = 'not available';//xml.xml ? xml.xml : (new XMLSerializer()).serializeToString(xml);
		var $xml = $(xml.xml);
		//console.log(xml);
		//console.log(xmlstr);
		//var dataDisp = $xml.split('><').join('>\n<');
		console.log(client);
		if (client.debug == true) {
			$('#SBresponse').html( '<strong>SBresponse-String:</strong><br /><textarea rows="10" cols="80">' + xmlstr + '</textarea>' );
		}
		//END DEBUG

		//Get Experiment-ID and test if it is valid
		var expID = $(xml).find('experimentID').text();
		var accepted = $(xml).find('accepted').text();
		console.log(expID);
		//console.log($.isNumeric(expID));
		//console.log(accepted);
		if( $.isNumeric(expID) && accepted == 'true' ) {
			//Update Experiment
			expContainer[i].id = expID;
			expContainer[i].state = 'GetExperimentStatus';
			//Start Auto-Update
			expHelper.curExpIndex = i;
			expHelper.intervalID = setInterval( function() { ajaxUpdate(expContainer, expHelper, client, myChart); }, 3000);
		} else {
			//Delete Array element
			expContainer.splice(i,1);
			
			parseSoapFault(xml);
			//TODO: msg: 'Request failed. Try again!' + switch layers back
		}

}
