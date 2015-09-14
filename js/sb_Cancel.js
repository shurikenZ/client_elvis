/**
Instructs the Service Broker to cancel the experiment.
**/
function sb_Cancel(expContainer, expHelper, client) {

	expHelper.ajaxExecRequest = true;

	if (expContainer[expHelper.curExpIndex].state != 'RetrieveResult') {

	/* Perform Ajax Request */

	$.ajax({
		type:		'POST',
		url:		client.URL,
		data:		{
						coupon_id: expHelper.couponID,
						passkey: expHelper.passkey,
						operation: 'Cancel',
						experimentID: expContainer[expHelper.curExpIndex].id
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
	
		if( $(xml).find('CancelResult') ) {
			var CancelResult = $(xml).find('CancelResult').text();
			if (CancelResult) {
				//Switch active layers on client
				setLayer.cancel(expContainer[expHelper.curExpIndex].type);
				//reset //TODO: splice can lead to errors
				expContainer.splice(expHelper.curExpIndex,1);
				expHelper.curExpIndex = -1;
			} else {
				//do nothing; try again
			}
		} else { //soapfault
			parseSoapFault(xml);
		}

		//stop Auto-Update
		clearInterval(expHelper.intervalID);
	
	})
	.fail(function(xml) {
		//TODO: ?
		expHelper.ajaxErrorCounter += 1;
		//DEBUG
		console.log('Cancel: ajax.fail');
	});

	}

	expHelper.ajaxExecRequest = false;

}//END OF sb_Cancel()
