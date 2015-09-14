function parseXml(xml) {
	var dom = null;
	if (window.DOMParser) {
		try {
			dom = (new DOMParser()).parseFromString(xml,'text/xml');
		}
		catch (e) { dom = null; }
	} else if (window.ActiveXObject) {
		try {
			dom = new ActiveXObject('Microsoft.XMLDOM');
			dom.async = false;
			if (!dom.loadXML(xml)) {
				//parse error
				console.log(dom.parseError.reason + dom.parseError.srcText);
			}
		}
		catch (e) { dom = null; }
	} else {
		console.log('Cannot parse xml string!');
	}
	return dom;
}
