/**
Main script of Blackbody Client. Contains jQuery .ready() method.
**/

$(function(){



/* Init Layers */
setLayer.init();



/* Init Client Variables */

var client = {
	debug: false,
	lang: 'en', //not used
	URL: 'index.php', //TODO: get file name dynamically
};

var expContainer = new Array();

var expHelper = { //expHelper provides necessary information in the experiment execution process
	couponID: $.getUrlVars()['coupon_id'],
	passkey: $.getUrlVars()['passkey'],
	curExpIndex: -1,
	intervalID: -1,
	ajaxErrorCounter: 0,
	ajaxErrorLimit: 10,
	ajaxExecRequest: false //For Ajax-Functions which are called on an interval
};



/* Google Charts Init */

var myChart = new Array();

myChart['d'] = new Chart('d','distance [mm]',0,3);
myChart['d'].init();
//console.log(myChart['d'].map);
myChart['h'] = new Chart('h','time [s]',2,0);
myChart['h'].init();

//console.log(myChart);
/*/Debug //###################################################
	expContainer[0] = {
		id: 500,
		type: 'd',
		recVideo: false,
		success: true,
		state: 'Complete',
		set: {
			lightsource: 'LED',
			sensor: 'S132C',
			stepsize: 100,
			maxDistance: 400
		},
		data: {
			xAxis: [200,300,400],
			value: [2.9,1.8,0.7],
			mTime: [1.0,2.0,3.0]
		}
	};
	expContainer[1] = {
		id: 501,
		type: 'd',
		recVideo: true,
		videoURL: 'vid/exp_501.mp4', //actually, a videoURL is not needed, because it's always: static_URL + exp_ + id + .mp4
		success: true,
		state: 'Complete',
		set: { lightsource: 'Bulb', sensor: 'S310C', stepsize: 50, maxDistance: 350 },
		data: { xAxis: [200, 250, 300, 350], value: [4.9, 3.6, 2.5, 1.9], mTime: [2.4, 3.4, 4.6, 5.9]// Times from /vid/test_distance-meas.mp4
		}
	};
	expContainer[2] = {
		id: 502,
		type: 'd',
		recVideo: true,
		videoURL: 'vid/exp_502.mp4', //actually, a videoURL is not needed, because it's always: static_URL + exp_ + id + .mp4
		success: true,
		state: 'Complete',
		set: { lightsource: 'Bulb', sensor: 'S310C', stepsize: 50, maxDistance: 350 },
		data: { xAxis: [200, 250, 300, 350], value: [5.9, 4.6, 3.5, 2.9], mTime: [2.4, 3.4, 4.6, 5.9]// Times from /vid/test_distance-meas.mp4
		}
	};

	console.log(expContainer);
	updateSelectmenus(expContainer, 'd');//needs maybe refresh...

//-------------------//*/
//myChart['d'].addExp(expContainer[0]);
//myChart['d'].addExp(expContainer[1]);
//DEBUG END ###################################################



/* Video Init */

var myVideo = new Array();

myVideo['d'] = new Video('d');
myVideo['d'].init();
myVideo['h'] = new Video('h');
myVideo['h'].init();
//console.log(myVideo['d']);

//myChart['d'].addExp(expContainer[0], 0);
//myVideo['d'].load(expContainer[1], 1, myChart['d']);
//console.log(expHelper);
//console.log(myChart);



/* Create jQuery UI Widgets */

//Tabs
$('#tabs').tabs();

//Button Sets
$('#lightsources_d').buttonset();
$('#lightsources_h').buttonset();
$('#sensors_d').buttonset();
$('#sensors_h').buttonset();

//Buttons
$('#btn_submit_d, #btn_submit_h').button().click(function(event){
	sb_Submit( expContainer, expHelper, client, $(this).button().attr('id'), myChart );
});
$('#btn_cancel_d, #btn_cancel_h').button().click(function(event){
	sb_Cancel( expContainer, expHelper, client );
});
$('#btn_exportAll_d, #btn_exportGraph_d, #btn_exportAll_h, #btn_exportGraph_h').button().click(function(event){
	export2csv( expContainer, myChart, $(this).button().attr('id') );
});
$('#btn_playPause_d, #btn_playPause_h').button().click(function(event){
	var type = ($(this).button().attr('id') == 'btn_playPause_d') ? 'd' : 'h';
	myVideo[type].playPause(expContainer, myChart);
});
$('#btn_showExp_d, #btn_showExp_h').button().click(function(event){
	var type = ($(this).button().attr('id') == 'btn_showExp_d') ? 'd' : 'h';
	var multi = $('#sel_exp_'+type).val() || [];
	myChart[type].init();
	for (var i = 0; i < multi.length; i++) {
		var idx = parseInt(multi[i]);
		myChart[type].addExp(expContainer[idx], idx);
	}
});
$('#btn_layer_settings_d, #btn_layer_settings_h').click(function(event){
	var type = ($(this).attr('id') == 'btn_layer_settings_d') ? 'd' : 'h';
	setLayer.switchToSettings(type);
});
$('#btn_layer_vid_d, #btn_layer_vid_h').click(function(event){
	var type = ($(this).attr('id') == 'btn_layer_vid_d') ? 'd' : 'h';
	setLayer.switchToVideo(type);
});

//Sliders

	//Set Distance
	$('#sldr_distance').slider({
		range: 'min', min:200, max: 1000, step:20, value: 400,
		slide: function( event, ui ) { $('#txt_distance').val( '200mm - ' + ui.value + 'mm' ); }
	});
	$('#txt_distance').val( '200mm - ' + $('#sldr_distance').slider('values',0) + 'mm' );

	//Set Stepsize
	$('#sldr_stepsize').slider({
		min: 20, max: 100, step: 20, value: 50,
		slide: function( event, ui ) { $('#txt_stepsize').val( ui.value + 'mm' ); }
	});
	$('#txt_stepsize').val( $('#sldr_stepsize').slider('value') + 'mm' );

	//Set Duration
	$('#sldr_duration').slider({
		min: 10, max: 30, step: 5, value: 15,
		slide: function( event, ui ) { $('#txt_duration').val( ui.value + 's' ); }
	});
	$('#txt_duration').val( $('#sldr_duration').slider('value') + 's' );

//Multiselect Widget
var select_exp_d = $('#sel_exp_d').multiselect({
	minWidth: 200,
});
var select_exp_h = $('#sel_exp_h').multiselect({
	minWidth: 200,
});
$('#sel_vid_d, #sel_vid_h').multiselect({
	multiple: false,
	header: 'Select a Video',
	noneSelectedText: 'Select a Video',
	selectedList: 1,
	click: function(event,ui) {
		console.log('ID: ' + $(this).attr('id'));
		console.log(ui);
		//Load video
		var idx = parseInt(ui.value);
		myVideo[expContainer[idx].type].load(expContainer[idx], idx, myChart[expContainer[idx].type]);
		//Update label
		$('#lbl_vid_'+expContainer[idx].type).text('Video of Experiment #' + expContainer[idx].id + ':');
	},
});

//Progressbars
$('#expProgressbar_d, #expProgressbar_h').progressbar({
	value: false,
});



});//END OF .ready() method
