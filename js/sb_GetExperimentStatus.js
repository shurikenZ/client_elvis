/**
Asks the Service Broker for the status of experiment.
**/
function sb_GetExperimentStatus(expContainer, expHelper, client, myChart, myVideo) {

	expHelper.ajaxExecRequest = true;

	var i = expHelper.curExpIndex;

	//Check, if experiment isn't already cancelled
	if (i != -1) {
	/* Perform Ajax Request */

	$.ajax({
		type:		'POST',
		url:		client.URL,
		data:		{
						coupon_id: expHelper.couponID,
						passkey: expHelper.passkey,
						operation: 'GetExperimentStatus',
						experimentID: expContainer[i].id
					},
		//dataType:	'xml'
	})
	.done(function(xml) {
		/*/DEBUG: Write XML-response to textarea
		var xmlstr = xml.xml ? xml.xml : (new XMLSerializer()).serializeToString(xml);
		var $xml = $(xml.xml);
		//console.log(xml);
		//console.log(xmlstr);
		//var dataDisp = $xml.split('><').join('>\n<');
		if (client.debug) {
			$('#SBresponse').html( '<strong>SBresponse-String:</strong><br /><textarea rows="10" cols="80">' + xmlstr + '</textarea>' );
		}
		//END DEBUG //*/

		if( $(xml).find('statusCode') ) {
			var statusCode = $(xml).find('statusCode').text();
			var status = 'unknown';
			var queueLength = '';

			switch(statusCode){
				case '1':
					status = 'QUEUED';
					queueLength = $(xml).find('effectiveQueueLength').text();
					break;
				case '2':
					status = 'IN PROGRESS';
					break;
				case '3':
					status = 'COMPLETE';
					expContainer[i].state = 'RetrieveResult';
					//stop Auto-Update
					clearInterval(expHelper.intervalID);
					//Retrieve Result
					sb_RetrieveResult(expContainer, expHelper, client, myChart, myVideo);
					break;
				case '4':
					status = 'COMPLETE w/ errors';
					expContainer[i].state = 'RetrieveResult';
					//stop Auto-Update
					clearInterval(expHelper.intervalID);
					//Retrieve Result
					sb_RetrieveResult(expContainer, expHelper, client, myChart, myVideo);
					//TODO: warning-message einbauen...
					break;
				case '5':
					status = 'CANCELLED';
					expContainer[i].state = 'Cancel';
					//Switch active layers on client
					setLayer.cancel(expContainer[i].type);
					break;
				case '6':
					status = '__invalid__';
					//TODO: stop and write error message
					break;
				default:
					status = 'soapFault';
					break;
			}
			//Update Progressbar
			updateProgressbar(expContainer[i].type, status, queueLength);
			console.log('Status: ' + status);
		} else { //soap error
			parseSoapFault(xml);
			//msg

		}
	})
	.fail(function(xml) {
		//TODO: ?
		expHelper.ajaxErrorCounter += 1;
		//DEBUG
		console.log('GetExperimentStatus: ajax.fail');
	});

	}
	
	expHelper.ajaxExecRequest = false;


}//END OF sb_GetExperimentStatus()
