/*
Copytight and info blabla


ToDo:
- Get rid of imageLoad flickering (onHover)
	- http://stackoverflow.com/questions/3008635/html5-canvas-element-multiple-layers
	- https://www.ibm.com/developerworks/library/wa-canvashtml5layering/
*/

/*
function SetupCanvas(canvasId) {
//SetupCanvas = function(canvasId) {
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
}//*///;


Lab.prototype.init = function(canvasId) {
	//Get canvas element and context
	this.canvas = document.getElementById(canvasId);
	//if (canvas.getContext) --> probably not needed
	this.context = this.canvas.getContext('2d');
	//test
//	console.log('SetupCanvas.prototype.init');

	//set Scope
	instrumentTypes.canvasScope = this;
};


Lab.prototype.getMousePos = function(event) {
	var rect = this.canvas.getBoundingClientRect();
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
};


//https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
Lab.prototype.handleEvent = function(event) {
	switch(event.type) {
		case 'click':
			//this.test();
			//this.canvas.removeEventListener('mousemove', this, true);
			this.onClick(event);
			console.log('click activated');
			break;
		case 'mousemove':
			//console.log('mousemove activated');
			this.onHover(event);
			break;
	}
};


Lab.prototype.onHover = function(event) {
	//Get mouse position
	var mPos = this.getMousePos(event);
	//console.log(mPos);
	//Compare mouse position with each element
	//console.log(this.hover.onElement);
	
	this.hover.onElement = false;
	
	this.img.el.forEach(function(el) {
		if( mPos.x > el.pos.x && mPos.x <= (el.get.width + el.pos.x) && mPos.y > el.pos.y && mPos.y <= (el.get.height + el.pos.y) ) {
			if(el.fcn !== null) {
				this.hover.onElement = true;
			}
			if(el.fcn !== null && !this.hover.overlayDrawn) {
				this.hover.overlayDrawn = true;
				//Draw
				this.context.fillStyle = 'rgba(51, 187, 221, 0.3)';//#3bd
				this.context.fillRect(el.pos.x, el.pos.y, el.get.width, el.get.height);
			}
		}/* else {
			this.hover.onElement = false;
		}//*/
	}.bind(this));
	if(!this.hover.onElement && this.hover.overlayDrawn) {
		this.hover.overlayDrawn = false;
		//reDraw Scene
		//console.log('redrawThat()');
		this.draw(this.sources);
	}
};


Lab.prototype.onClick = function(event) {
	var mPos = this.getMousePos(event);
	this.img.el.forEach(function(el) {
		if( mPos.x > el.pos.x && mPos.x <= (el.get.width + el.pos.x) && mPos.y > el.pos.y && mPos.y <= (el.get.height + el.pos.y) ) {
			//console.log(el.name + ' clicked!');
			//console.log(el);
			if(el.fcn !== null) {
				el.fcn.init();
			}
		}
	});
};


Lab.prototype.getCenteringOffsets = function() {

	//Assign initial values
	var xMin = this.img.el[0].pos.x;
	var xMax = this.img.el[0].get.width;
	var yMin = this.img.el[0].pos.y;
	var yMax = this.img.el[0].get.height;

	for(var i = 0; i < this.img.el.length; i++) {
		//console.log('muuu ' + i);
		//horizontal
		xMin = (this.img.el[i].pos.x < xMin) ? this.img.el[i].pos.x : xMin;
		xMax = ( (this.img.el[i].pos.x + this.img.el[i].get.width) > xMax ) ? (this.img.el[i].pos.x + this.img.el[i].get.width) : xMax;
		//vertical
		yMin = (this.img.el[i].pos.y < yMin) ? this.img.el[i].pos.y : yMin;
		yMax = ( (this.img.el[i].pos.y + this.img.el[i].get.height) > yMax ) ? (this.img.el[i].pos.y + this.img.el[i].get.height) : yMax;
	}

	this.centerOffset.x = parseInt((this.canvas.width/2) - (((xMax - xMin) / 2) + xMin));
	this.centerOffset.y = parseInt((this.canvas.height/2) - (((yMax - yMin) / 2) + yMin));

};


Lab.prototype.test = function() {
	//ToDo: Delete if unused
};

Lab.prototype.writeCanvasMsg = function(msg) {
	//Note: Font attributes are "globally" set when using this.context
	this.context.font = '30pt Calibri';
	this.context.textAlign = 'center';
	this.context.fillStyle = '#000';
	this.context.fillText(msg, this.canvas.width/2, this.canvas.height/2);
};

//Lab.prototype.setEventListener = function() {}

Lab.prototype.draw = function(sources,newSetup) {


	//ToDo: Find a more elegant way
	if(newSetup) {//maybe not working in strict mode (http://www.w3schools.com/js/js_strict.asp)
		//console.log('newSetup = true');
		this.canvas.removeEventListener('mousemove', this, true);
		this.canvas.removeEventListener('click', this, true);
	}/* else {
		console.log('newSetup = false (or undefined)');
	}//*/
	
	//Load images
	//var that = this;//initially used to work inside anonymous function, before using .bind(this)
	//see: http://stackoverflow.com/questions/15455009/js-call-apply-vs-bind

	this.loadImages(sources, function() {

		//Clear rect
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);

		//console.log('loadImages callback worked.');
		//console.log(sources);
		//console.log(this.img.el);
		
		this.sources = sources;
		//console.log(this.sources);

		//calculate center offset
		this.getCenteringOffsets();

		for(var i = 0; i < this.img.el.length; i++) {
			//Test: Draw bg behind image
			//this.context.fillStyle = '#99FF66';
			//this.context.fillRect(xCenter + this.images.pos[i].x, yCenter + this.images.pos[i].y, this.images.get[i].width, this.images.get[i].height);

			//Set function
			this.img.el[i].fcn = sources[i].fcn;

			//Adjust position to center
			this.img.el[i].pos.x += this.centerOffset.x;
			this.img.el[i].pos.y += this.centerOffset.y;

			//Draw image
			this.context.drawImage(this.img.el[i].get, this.img.el[i].pos.x, this.img.el[i].pos.y);
		}

	}.bind(this));//*/


	//Add EventListener
	if(newSetup) {
		//jQuery might be better, because some browser don't support addEventListener. See:
		//http://stackoverflow.com/questions/19625334/range-slider-event-handler-javascript
		this.canvas.addEventListener('mousemove', this, true);
		this.canvas.addEventListener('click', this, true);
	}
};

/*
Note:
This function is unused because it does not work as intended. Instead, an anonymous function is called
inside the loadImages function. The reason why this function is not working might be the fact that it
is not anonymous any more and therefore the onload-attribute of Image() only gets a reference to the
function, which influences its behaviour.
Also: The proper functionality can only be tested, if the images are not already in the browsers cache.
In Firefox simply open a new private(!) window to test it.
*/
Lab.prototype.onloadCallback = function(callback) {
	if(++this.img.loaded >= this.img.number) {
		callback();
		//ToDo: Does not work if one or more images cannot be loaded, for example if the server is offline or the URL is wrong.
		//maybe this helps: http://www.html5canvastutorials.com/advanced/html5-canvas-load-image-data-url/
	}
};

/*
http://www.html5canvastutorials.com/tutorials/html5-canvas-image-loader/
*/
Lab.prototype.loadImages = function(sources,callback) {
	//Get number of sources
	this.img.number = sources.length;
	//(Re-)set number of loaded images
	this.img.loaded = 0;
	//Load each image
	for(var i = 0; i < sources.length; i++) {
		if(this.img.el[i] === undefined) {this.img.el[i] = {};}

		this.img.el[i].get = new Image();
		//this.img.el[i].get.onload = this.onloadCallback(callback);
		this.img.el[i].get.onload = function() {
			if(++this.img.loaded >= this.img.number) {
				callback();
			}
		}.bind(this);
		this.img.el[i].get.src = ( (sources[i].set || sources[i].fcn.set) ? sources[i].imgPaths.set : sources[i].imgPaths.not_set );

		this.img.el[i].pos = sources[i].pos;

		//var that = this;
		//onload function is defined. when image src is set, the image is loaded automatically and onload triggers.
		//console.log(sources[i]);
	}
};

