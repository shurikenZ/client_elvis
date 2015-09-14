/**
Retrieves and parses the ExperimentResults from Service Broker.
**/
function sb_RetrieveResult(expContainer, expHelper, client, myChart) {

	expHelper.ajaxExecRequest = true;

	var i = expHelper.curExpIndex;

	if (expContainer[i].state != 'Complete') {

	/* Perform Ajax Request */
	
	$.ajax({
		type:		'POST',
		url:		client.URL,
		data:		{
						coupon_id: expHelper.couponID,
						passkey: expHelper.passkey,
						operation: 'RetrieveResult',
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

		var statusCode = -1;
		if( $(xml).find('statusCode') ) {
			statusCode = $(xml).find('statusCode').text();
		}

		if( statusCode == '3' || statusCode == '4' ) {
		
			var res = $(xml).find('experimentResults').text();
			var $res = $($.parseXML(res));
			
			//disassemble XML and make an array
			$res.find('batch').each(function(){
				var $batch = $(this);
				
				/* If the type is already defined, the experiment was submitted recently and all other parameters are
					also already present. However, if type is undefined, the results from an older experiment are loaded.
					Thus, the settings need to be reloaded too. */
				/*if (typeof expContainer[i].type === 'undefined') { //TODO: strangely, this delivers an error

					//DEBUG
					console.log('RetrieveResults: type undefined');
					
					expContainer[i].type = $batch.find('experimentType');//.text();//TODO
					expContainer[i].recVideo = (($batch.find('recordVideo') == 'true') ? true : false);
					
					//settings
					$batch.find('settings').each(function(){
						var $set = $(this);
						expContainer[i].set = new Object();
						expContainer[i].set.lightsource = $set.find('lightsource');
						expContainer[i].set.sensor = $set.find('sensor');
						if(expContainer[i].type == 'd'){//distance
							expContainer[i].set.maxDistance = $set.find('maxdistance');
							expContainer[i].set.stepsize = $set.find('stepsize');
						} else {//history
							expContainer[i].set.duration = $set.find('duration');
						}
					});
				}//*/
				//recVideoURL
				//expContainer[i].recVideoURL = $batch.find('recordVideoURL'); //$batch not available outside
				//data
				//expContainer[i].data = new Object();
				
				//expContainer[i].type = $batch.find('experimentType').text();
				//expContainer[i].recVideo = $batch.find('recVideo').text();
				//expContainer[i].videoURL = $batch.find('videoURL').text();
				//expContainer[i].videoURL = 'vid/test_distance-meas.mp4';
				
				//recVideo
				//if (expContainer[i].recVideo) {
					expContainer[i].recVideoSuccess = ($batch.find('recVideoSuccess').text() == 'true') ? true : false;
				//}
				
				$batch.find('results').each(function(){
					var $data = $(this);
					$data.find('datavector').each(function(){
						var $datavector = $(this);
						
						if( expContainer[i].type == 'd' ) {//distance
							switch( $datavector.attr('name') ){
							case 'distance':
								expContainer[i].data.xAxis = $datavector.text().split(' ').map(Number);//ATTENTION: older browsers don't support map
								break;
							case 'amplitude':
								expContainer[i].data.value = $datavector.text().split(' ').map(Number);
								break;
							case 'time'://measurement time
								expContainer[i].data.mTime = $datavector.text().split(' ').map(Number);
								break;
							}
						} else { //history
							switch( $datavector.attr('name') ){
							case 'time':
								expContainer[i].data.xAxis = $datavector.text().split(' ').map(Number);
								break;
							case 'amplitude':
								expContainer[i].data.value = $datavector.text().split(' ').map(Number);
								break;
							}
						}
					});
				});
				
				//DEBUG//
				//$('#resultsDetailText').append( 'Experiment Type: ' + expContainer[i].type + '<br />' );
				
				//settings, reset and stop auto-update
				expContainer[i].success = true;
				expContainer[i].state = 'Complete';
				//expHelper.curExpIndex = -1;
				//clearInterval(expHelper.intervalID);

				//Update and refresh selectmenus
				updateSelectmenus(expContainer, expContainer[i].type);
				$('#sel_exp_'+expContainer[i].type).multiselect('refresh');
				$('#sel_vid_'+expContainer[i].type).multiselect('refresh');


				if (expContainer[i].recVideo && expContainer[i].recVideoSuccess) {
					//Load video and switch active layers on client
					myVideo[expContainer[i].type].load(expContainer[i], i, myChart[expContainer[i].type]);
					setLayer.retrvExpWithVid(expContainer[i].type);
				} else if (expContainer[i].recVideo) {
					//TODO: Write MessageBox: 'Video recording not successful'
					console.log('Video recording not successful');
					//Draw chart and switch active layers on client
					myChart[expContainer[i].type].addExp(expContainer[i], i);
					setLayer.retrvExp(expContainer[i].type);
				} else {
					//Draw chart and switch active layers on client
					myChart[expContainer[i].type].addExp(expContainer[i], i);
					setLayer.retrvExp(expContainer[i].type);
				}

			});//END OF $res.find('batch').each(function()
			
		} else { //Soap fault
			parseSoapFault(xml);
		}

	})
	.fail(function(xml) {
		//TODO: ?
		expHelper.ajaxErrorCounter += 1;
		//DEBUG
		console.log('RetrieveResult: ajax.fail');
	});

	}

	expHelper.ajaxExecRequest = false;

}
