<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title>ELVIS</title>
	<!-- CSS -->
	<link rel="stylesheet" href="interface.css" />
	<!-- JS vendor -->
	<script type="text/javascript" src="vendor/goessner-jsonxml/parseXml.js"></script>
	<script type="text/javascript" src="vendor/goessner-jsonxml/xml2json.js"></script>
	<!-- <script type="text/javascript" src="vendor/goessner-jsonxml/json2xml.js"></script> -->
	<!-- Because of https Firefox complains about the SHA-1 Certificate, when using googleapis...
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script> -->
	<script type="text/javascript" src="vendor/jQuery/jquery-1.11.3.min.js"></script>
	<script src="http://code.highcharts.com/highcharts.js"></script>
	<script src="http://code.highcharts.com/modules/exporting.js"></script>
	<!-- JS -->
	<script type="text/javascript" src="js/sb_GetLabConfiguration.js"></script>
	
	<script type="text/javascript" src="js/Highchart.js"></script>
	<script type="text/javascript" src="js/instrumentTypes.js"></script>
	<script type="text/javascript" src="js/Lab.js"></script>
	<script type="text/javascript" src="js/SetupCanvas.js"></script>
	<script type="text/javascript" src="js/jquery.getUrlVars.js"></script>
	<script type="text/javascript" src="js/main.js"></script>
</head>

<body>
<!-- BEGIN CONTENT -->
<div id="header">
<div id="headerInner">
<span>ELVIS Lab</span>
<select id="selLang" disabled>
	<option value="en" selected>English</option>
	<option value="de">Deutsch</option>
</select>
</div>
</div>

<!-- noscript -->
<noscript>
<div id="divNoJSerror" style="text-align:center; margin-bottom:20px;">
	<span class="messagebox error">JavaScript is deactivated in your browser! Please activate it for this client and also for Highcharts.</span>
</div>
</noscript>

<!--  -->
<div id="divMessages" style="text-align:center; margin-bottom:20px;">

</div>


<div id="divSetupMenu" style="text-align:center; margin-bottom:20px;">
	<label for="selSetupMenu">Select Setup:</label>
	<select id="selSetupMenu" disabled>
		<option id="optNoSetup" value="-1" selected>No setup available!</option>
	</select>
</div>

<div id="divCanvas">
	<canvas id="canvasSetup" width="600" height="400"></canvas>
</div>


<div id="divSubmit" class="divButtons" style="text-align:center;">
	<button type="button" id="btnSubmit">Start Experiment</button>
	<!--<span class="messagebox success">Experiment in queue!</span>-->
</div>

<div id="divCancel" class="divButtons" style="text-align:center;display:none;">
	<button type="button" id="btnCancel">Cancel Experiment</button>
	<div id="divProgress" class="progress">
		<div id="divProgressbar" class="progressbar" style="width:100%;"></div>
		<div id="divProgressbarTxt" style="position:absolute;padding-left:5px;font-size:12px;line-height:18px;">50%</div>
	</div>

</div>

<!--
<div id="divDebug" class="divButtons" style="text-align:center;">
	<div>
		<button type="button" id="btnStopIntervallCalls" style="clear:both;">DEBUG Stop Interval Calls</button>
	</div>
</div>
-->

<div id="divInstr">
<!-- Maybe rename to FGEN_divInstr -->
<div id="divInstrFGEN" style="text-align:center;background-color:#DDD;display:none;">

<fieldset>
	<h3>FGEN</h3>
	<p>
	<label for="FGEN_selWaveformType" class="field">Select Waveform:</label>
	<select id="FGEN_selWaveformType">
		<option value="SINE">SINE</option>
		<option value="SQUARE">SQUARE</option>
		<option value="TRIANGULAR">TRIANGULAR</option>
	</select>
	</p>
	<p>
	<label for="FGEN_freq" class="field">Frequency:</label>
	<select id="FGEN_freq">
		<!-- 10Hz, 20, 50, 100, 200, 500, 1k, 2k, 5k, 10k -->
		<option value="10">10Hz</option>
		<option value="20">20Hz</option>
		<option value="50">50Hz</option>
		<option value="100">100Hz</option>
		<option value="200">200Hz</option>
		<option value="500">500Hz</option>
		<option value="1000">1kHz</option>
		<option value="2000">2kHz</option>
		<option value="5000">5kHz</option>
		<option value="10000">10kHz</option>
	</select>
	</p>
	<!--<p>
	<label class="field">Frequency:</label>
	<input id="FGEN_inFreq" type="range" min="1" max="500" step="0.1" value="250"/>
	<span id="FGEN_outFreq">100</span>
	<select id="FGEN_freqRange">
		<option value="hz">Hz</option>
		<option value="khz">kHz</option>
		<option value="Mhz">MHz</option>
	</select>
	</p>-->
	<p>
	<label class="field">Amplitude[V]:</label>
	<input type="number" id="FGEN_amp" value="2" step="any" min="0" max="10"/>
	</p>
	<p>
	<label class="field">Offset[V]:</label>
	<input type="number" id="FGEN_off" value="0" step="any" min="0" max="5"/>
	</p>
	<div id="msg_FGEN_OutOfRange" class="messagebox error" style="display:none;">Amplitude and Offset are not allowed to exceed 10V.</div>
	<p>
	<button type="button" id="FGEN_btnOK">OK</button>
	<button type="button" id="FGEN_btnCancel">Cancel</button>
	</p>
</fieldset>

</div>


<div id="divInstrSCOPE" style="text-align:center;background-color:#DDD;display:none;">

<fieldset>
	<h3>SCOPE</h3>
	<!--<p>
	<label class="field">Sampling rate:</label>
	<input id="SCOPE_rate"/>
	</p>-->
	<p>
	<label class="field">Sampling time[s]:</label>
	<input type="number" id="SCOPE_time" value="0.50" step="0.05" min="0.05" max="5"/>
	</p>
	<div id="msg_SCOPE_maxRecLength" class="messagebox error" style="display:none;">Sampling Time limit reached, due to the high FGEN frequency.</div>
	<p>
	<button type="button" id="SCOPE_btnOK">OK</button>
	<button type="button" id="SCOPE_btnCancel">Cancel</button>
	</p>
</fieldset>
</div>

</div>


<div id="divChart">
	<div id="highchart" style="min-width: 310px; height: 400px; margin: 0 auto"></div>
</div>

<!-- END CONTENT -->
</body>
</html>
