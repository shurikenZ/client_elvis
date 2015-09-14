/**
Manages the visibility of all layers during experimentation.
The layers:
$('#layer_switchTo_'+type).show().hide();
$('#layer_settings_'+type).show().hide();
$('#layer_submit_'+type).show().hide();
$('#layer_noSubmit_'+type).show().hide();
$('#layer_runExp_'+type).show().hide();
$('#layer_video_'+type).show().hide();
**/

setLayer = {
	//opposite type
	getOppType: function(type) {
		if (type == 'd') {
			return 'h';
		} else {
			return 'd';
		}
	},
	init: function() {
		setLayer.initTab('d');
		setLayer.initTab('h');
	},
	initTab: function(type) {
		//Show
		$('#layer_switchTo_'+type).show();
		$('#layer_settings_'+type).show();
		$('#layer_submit_'+type).show();
		//Hide
		$('#layer_noSubmit_'+type).show().hide();
		$('#layer_runExp_'+type).show().hide();
		$('#layer_video_'+type).show().hide();
	},
	runExp: function(type) {
		oppType = setLayer.getOppType(type);
		//Show
		$('#layer_runExp_'+type).show();
		$('#layer_noSubmit_'+oppType).show();
		//Hide
		$('#layer_submit_'+type).show().hide();
		$('#layer_switchTo_'+type).show().hide();
		$('#layer_submit_'+oppType).show().hide();
	},
	cancel: function(type) {
		setLayer.retrvExp(type);
	},
	retrvExp: function(type) {
		oppType = setLayer.getOppType(type);
		//Show
		$('#layer_submit_'+type).show();
		$('#layer_submit_'+oppType).show();
		$('#layer_switchTo_'+type).show();
		//Hide
		$('#layer_runExp_'+type).show().hide();
		$('#layer_noSubmit_'+oppType).show().hide();
	},
	retrvExpWithVid: function(type) {
		oppType = setLayer.getOppType(type);
		//Show
		$('#layer_submit_'+type).show();
		$('#layer_submit_'+oppType).show();
		$('#layer_switchTo_'+type).show();
		$('#layer_video_'+type).show();
		//Hide
		$('#layer_runExp_'+type).show().hide();
		$('#layer_noSubmit_'+oppType).show().hide();
		$('#layer_settings_'+type).show().hide();
	},
	switchToSettings: function(type) {
		//Show
		$('#layer_settings_'+type).show();
		//Hide
		$('#layer_video_'+type).show().hide();
	},
	switchToVideo: function(type) {
		//Show
		$('#layer_video_'+type).show();
		//Hide
		$('#layer_settings_'+type).show().hide();
	},
};
