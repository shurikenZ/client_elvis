/**
All functions to draw chart.
Contains DataTable of chart.
**/


/* Google Charts Init */
google.load('visualization', '1', {packages:['corechart']});
//google.setOnLoadCallback( -- function -- );


Chart = function(type, hAxisTitle, lineWidth, pointSize) {
	this.data = null;
	this.type = type;

	//Options
	this.hAxisTitle = hAxisTitle;
	this.lineWidth = lineWidth;
	this.pointSize = pointSize;

	this.element = null;
	//nrOfExp oder countExp
	this.map = new Array();
}

Chart.prototype.addExp = function(exp, expIndex) {

	var newCol = this.newCol(exp, expIndex);

	for(var i = 0; i < exp.data.xAxis.length; i++){
		this.data.setCell(
			newCol.mapRows[i],//rowIndex
			newCol.colIndex,//columnIndex
			exp.data.value[i]//value
		);
	}

	this.draw([]);
}

Chart.prototype.clearTable = function() {
	//Overwrite DataTable
	this.data = new google.visualization.DataTable();
	//Add initial column
	this.data.addColumn('number', this.hAxisTitle);
	//Init map
	this.map = new Array();
}

Chart.prototype.init = function() {
	//Get HTML element
	this.element = document.getElementById('chart_' + this.type);
	//Draw empty chart
	this.drawArray( [['Time', 'no data'],['', 0]] );
	//Create DataTable and add initial column
	this.clearTable();
}

Chart.prototype.getDrawOpt = function() {
	return {
		title: 'Output Graph',
		vAxis: {title: 'amplitude [mW]', maxValue: 0.002},
		hAxis: {title: this.hAxisTitle},
		lineWidth: this.lineWidth,
		pointSize: this.pointSize,
		width: 500,
		height: 300,
		/*series: {
			0: { color: '#e2431e' },
			1: { color: '#e7711b' },
			2: { color: '#f1ca3a' },
			3: { color: '#6f9654' },
			4: { color: '#1c91c0' },
			5: { color: '#43459d' },
		},*/
	};
}

Chart.prototype.draw = function(array) {
	var LineChart = new google.visualization.LineChart(this.element);
	//if (array == []) {
		LineChart.draw(this.data, this.getDrawOpt());
	//} else {
	//	var dataTable = new google.visualization.arrayToDataTable(array);
	//	LineChart.draw(dataTable, this.getDrawOpt());
	//}
}


Chart.prototype.drawArray = function(array) {
	var LineChart = new google.visualization.LineChart(this.element);
	var dataTable = new google.visualization.arrayToDataTable(array);
	LineChart.draw(dataTable, this.getDrawOpt());
}

/**
 * newRowNullArray:
 *
 * Example:
 * newRowNullArray(350,2) returns [350,null,null]
**/
Chart.prototype.newRowNullArray = function(zeroIndexValue,nulls) {
	var array = [zeroIndexValue];
	for(var i = 1; i <= nulls; i++){
		array[i] = null;
	}
	return array;
}

/**
 * newCol: (former name: setNewColForExperiment)
 * Prepares the DataTable for adding experiment data synchronized with the video.
 * Features:
 *  - Adds a new column.
 *  - Adds rows where needed and fills them with null.
 *  - Returns array (mapRows) with array indices of xAxis position on DataTable for mapping.
 * Number of array elements equals data elements(xAxis,value,mTime) of expContainer.
 * Example of use:
 * var mapRows = setNewColForExperiment(expContainer[0]);
**/
//TODO: Is not addapted to new usage inside Chart...
Chart.prototype.newCol = function(exp, expIndex) {
	//Check if column already exits
	var idx = this.compCols(expIndex);
	var colIndex = -1;
	if (idx == -1) {
		//Add new column
		colIndex = this.data.addColumn('number', 'Exp. ' + exp.id
			+ ' (' + exp.set.lightsource + ', ' + exp.set.sensor + ')');

		//Map colIndex with expIndex to keep track of the experiments displayed on the chart
		this.map[this.map.length] = {
			colIndex: colIndex,
			expIndex: expIndex
		};
		//Define new index
		idx = this.map.length; //+1
	} else {
		colIndex = this.map[idx].colIndex;
	}
	//console.log('idx: ' + idx);
	//Add rows and fill with null
	var mapRows = [];
	var tmpFilteredRows = [];
	for(var i = 0; i < exp.data.xAxis.length; i++){
		tmpFilteredRows = this.data.getFilteredRows([{ column: 0 , value: exp.data.xAxis[i] }]);
		if (tmpFilteredRows.length == 0) {
			var RowIndex = this.data.addRow( this.newRowNullArray( exp.data.xAxis[i], idx ) );
			mapRows[i] = RowIndex;
		} else {
			mapRows[i] = tmpFilteredRows[0];
		}
	}
	return {colIndex: colIndex, mapRows: mapRows};
}

Chart.prototype.compCols = function(expIndex) {
	for (var i = 0; i < this.map.length; i++) {
		if (this.map[i].expIndex === expIndex) {
			return i;
		}
	}
	return -1;
}

Chart.prototype.clearCol = function(colIndex) {
	var rows = this.data.getFilteredRows([{column:0}]);//column 0 contains xAxis values
	//console.log('rows: ' + rows);
	for (var i = 0; i < rows.length; i++) {
		this.data.setCell(i,colIndex,null);
	}
	this.draw([]);
}
