/**
Handles video playback and synchronizes Chart draw with video.
**/

Video = function(type) {
	this.expIndex = -1;
	//this.colIndex = -1;
	this.newCol = null;
	this.type = type;
	this.el = {
		vid: null,
		mp4: null
	};
	this.intervalID = -1,
	this.stat = {
		curPt: -1,
		drawnPts: -1,
		nrOfPts: -1,
	};
}

Video.prototype.init = function() {
	//Get HTML elements
	this.el.vid = document.getElementById('vid_' + this.type);
	this.el.mp4 = document.getElementById('mp4_' + this.type);
}

Video.prototype.checkReadyState = function() {
	if ( this.el.vid.readyState == 4 ) {
		console.log('readyState: HAVE_ENOUGH_DATA');
	} else {
		console.log('not ready');
	}
}

Video.prototype.load = function(exp, expIndex, chart) {
	//Load video
	//this.el.mp4.src = 'http://' + exp.videoURL;
	this.el.mp4.src = 'vid/exp_' + exp.id + '.mp4';
	this.el.vid.load();
	//Add new column on chart
	//this.newCol = chart.newCol(exp, expIndex);//TODO: check if col already exists
	//Check if column already exits
	var idx = -1;
	//console.log('chart.map.length: ' + chart.map.length + ', Exp-ID: '+exp.id+', expIndex: '+expIndex);
	//console.log(chart.map);
	for (var i = 0; i < chart.map.length; i++) {
		//console.log('chart.map[i].expIndex: ' + chart.map[i].expIndex);
		if (chart.map[i].expIndex == expIndex) {
			idx = i;
			break;
		}
	}
	//console.log('idx: ' + idx);
	this.newCol = chart.newCol(exp, expIndex);
	//console.log(this.newCol);
	if (idx != -1) {//clear chart, if already exists
		chart.clearCol(this.newCol.colIndex);
	}
	
	//Update status and index
	this.stat.curPt = 0;
	this.stat.drawnPts = 0;
	this.stat.nrOfPts = exp.data.xAxis.length;
	this.expIndex = expIndex;
}

/** getTime():
When a video is finished, playback stops. If play is pressed again, it starts from beginning.
Therefore, if currentTime is equal to duration, the video finished playback and is actually
back at its starting point.
**/
Video.prototype.getTime = function() {
	if (this.el.vid.currentTime == this.el.vid.duration) {
		return 0;
	} else {
		return this.el.vid.currentTime;
	}
}

Video.prototype.calcTimeoutSpan = function(exp) {
	return ( ( exp.data.mTime[this.stat.curPt] - this.getTime() ) * 1000 );
}

Video.prototype.playPause = function(expContainer, myChart) {

	if (this.el.vid.paused) {

		var exp = expContainer[this.expIndex];
		var chart = myChart[this.type];

		//Initialize and reset status
		if (this.getTime() == 0) {
			this.stat.curPt = 0;
			this.stat.drawnPts = 0;
			//Make new Col (if not already exits) and clear chart
			//chart.data.removeColumn(this.newCol.colIndex);
			this.newCol = chart.newCol(exp, this.expIndex);
			chart.clearCol(this.newCol.colIndex);
			//chart.draw([]);
		}

		//immediately executes the function, but it's the only working solution
		var update = this.updateChart(exp, chart, this);//must be after init of status!

		//Checks position of video playback and sets current point to draw
		for (var i = 0; i < this.stat.nrOfPts; i++) {
			if (this.getTime() <= exp.data.mTime[i]) {
				this.stat.curPt = i;
				break;
			}
		}
		//Check if drawn Points(drawnPts) lag behind current Point(curPt)
		if (this.stat.drawnPts < this.stat.curPt) {
			for (var i = 0; i < this.stat.curPt; i++) {
				myChart[this.type].data.setCell(
					this.newCol.mapRows[i],
					this.newCol.colIndex,
					exp.data.value[i]
				);
			}
			myChart[this.type].draw([]);
			this.stat.drawnPts = this.stat.curPt;
		}
		//Set timeout
		if ( !(this.stat.curPt >= this.stat.nrOfPts) ) {
			//this.intervalID = setTimeout( function() {Video.updateChart(exp, chart, this)}, this.calcTimeoutSpan(exp) );//TODO: needs maybe update
			this.intervalID = setTimeout( update, this.calcTimeoutSpan(exp) );
		}
		//Play
		this.el.vid.play();
	} else {
		//Clear timeout and reset ID
		clearTimeout(this.intervalID);
		this.intervalID = -1;
		//Pause
		this.el.vid.pause();
	}

}

/**
The type is passed over as parameter because updateChart is always called inside an anonymous function of setTimeout.
**/
Video.prototype.updateChart = function(exp, chart, vid) {

	if(!(vid.el.vid.paused)){

		chart.data.setCell(
			vid.newCol.mapRows[vid.stat.curPt],
			vid.newCol.colIndex,
			exp.data.value[vid.stat.curPt]
		);
		chart.draw([]);
		vid.stat.drawnPts += 1;

		//Callback
		vid.stat.curPt += 1;
		if (vid.stat.curPt < vid.stat.nrOfPts) {
			vid.intervalID = setTimeout( function() {vid.updateChart(exp,chart,vid)}, vid.calcTimeoutSpan(exp) );
		}
	} else {
		vid.intervalID = setTimeout( function() {vid.updateChart(exp,chart,vid)}, vid.calcTimeoutSpan(exp) );
	}
}
