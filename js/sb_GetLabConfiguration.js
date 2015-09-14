/**
Copyright info and description etc.





Wird nicht mehr benötigt !!






**/

function sb_GetLabConfiguration(lab) { //(expContainer, expHelper, client, btnID, myChart) {


	/* Perform Ajax Request */
	$.ajax({
		async:		true,
		type:		'POST',
		url:		'index.php', //Todo: make dynamic, e.g. like var client.URL in blackbody client
		data:		{
						coupon_id: lab.GET.coupon_id,//expHelper.couponID,
						passkey: lab.GET.passkey,//expHelper.passkey,
						operation: 'GetLabConfiguration'
					},
		//dataType:	'xml'
	})
	.done(function(xml) {
		//console.log(xml);
		console.log('sb_GetLabConfiguration: done!');
		lab.configuration = parseXML2Json(xml,'labConfiguration');
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log('sb_GetLabConfiguration: failed!');
		console.error('Data request failed (' + textStatus + '): ' + errorThrown);
		console.debug(jqXHR.responseText);
		//ToDo: MessageBox: Not possible to retrieve Lab Setups (try again: refresh client by pressing F5)
    });


}//END OF sb_GetLabConfiguration


function parseXML2Json(xml,root) {//Json or Js Object ?
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
}//END OF parseXML2Json
