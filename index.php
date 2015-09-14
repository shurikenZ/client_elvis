<?php


/**
 *
 * It is basically the same as the Blackbody-Client, but the GetLabConfiguration is modified, because the lab server does not work atm.
 *
 *
**/



// Debugging mode
ini_set('display_errors', 'On');
error_reporting(E_ALL);//*/


//Store GET-parameter as Session variables //TODO: Abfrage, ob parameter ueberhaupt vorhanden...
if (isset($_POST['coupon_id'])){
	$SBcouponID = htmlspecialchars(trim($_POST['coupon_id']));
} else if (isset($_GET['coupon_id'])) {
	$SBcouponID = htmlspecialchars(trim($_GET['coupon_id']));
} else {
	$SBcouponID = 0;
}
if (isset($_POST['passkey'])){
	$SBpasskey = htmlspecialchars(trim($_POST['passkey']));
} else if (isset($_GET['passkey'])) {
	$SBpasskey = htmlspecialchars(trim($_GET['passkey']));
} else {
	$SBpasskey = 0;
}
//TODO: check if couponID and passkey are working with GetLabStatus (and check if lab is online)


/** Generate Experiment Specification **/
function genExpSpec2($expSpec){
$header =
//'<?xml version="1.0" encoding="utf-8" standalone="no"\
//<!DOCTYPE experimentSpecification SYSTEM "http://olid.mit.edu/xml/ExperimentSpecification.dtd">
'<experimentSpecification lab="MIT NI-ELVIS Weblab" specversion="0.1">';

$footer =
PHP_EOL.'</experimentSpecification>';

$generalInfo =
PHP_EOL.'<setupID>'.$expSpec['setupID'].'</setupID>';

$parameters = '';

foreach($expSpec['parameters'] as $terminal) {
	$parameters .= PHP_EOL.'<terminal instrumentType="'.$terminal['instrumentName'].'" instrumentNumber="'.$terminal['instrumentNumber'].'">'.PHP_EOL;
	$val = $terminal['instrumentValues'];
	if($terminal['instrumentName'] == 'FGEN') {
		$parameters .= '<vname download="true">Vin</vname>'.PHP_EOL.'<function type="WAVEFORM">'.PHP_EOL;
		$parameters .= '<waveformType>'.$val['waveformType'].'</waveformType><frequency>'.$val['frequency'].'</frequency><amplitude>'.$val['amplitude'].'</amplitude><offset>'.$val['offset'].'</offset>';
	} else if($terminal['instrumentName'] == 'SCOPE') {
		$parameters .= '<vname download="true">Vout</vname>'.PHP_EOL.'<function type="SAMPLING">'.PHP_EOL;
		$parameters .= '<samplingRate>'.$val['samplingRate'].'</samplingRate><samplingTime>'.$val['samplingTime'].'</samplingTime>';
	}
	$parameters .= PHP_EOL.'</function>'.PHP_EOL.'</terminal>';
}

return $header.$generalInfo.$parameters.$footer;
}


/** Generate Experiment Specification **/
function genExpSpec($expSpec){

$header =
'<?xml version="1.0" encoding="utf-8" standalone="no"?>
<experimentSpecification lab="CUAS Blackbody Radiation Lab" specversion="1.0">
<batch>';

$footer =
PHP_EOL.'</batch></experimentSpecification>';

$generalInfo =
PHP_EOL.'<experimentType>'.$expSpec['experimentType'].'</experimentType>
<recordVideo>'.$expSpec['recordVideo'].'</recordVideo>';

//parameters
$parameters = PHP_EOL.'<parameters>';
if($expSpec['experimentType'] == 'd'){
	//distance
	$parameters .= '
	<lightsource>'.$expSpec['parameters']['lightsource'].'</lightsource>
	<sensor>'.$expSpec['parameters']['sensor'].'</sensor>
	<stepsize>'.$expSpec['parameters']['stepsize'].'</stepsize>
	<maxdistance>'.$expSpec['parameters']['maxDistance'].'</maxdistance>';
}else{
	//history
	$parameters .= '
	<lightsource>'.$expSpec['parameters']['lightsource'].'</lightsource>
	<sensor>'.$expSpec['parameters']['sensor'].'</sensor>
	<duration>'.$expSpec['parameters']['duration'].'</duration>';
}
$parameters .= PHP_EOL.'</parameters>';

return $header.$generalInfo.$parameters.$footer;

}//END OF function genExpSpec()



//operation
if( isset($_POST['operation']) && (!empty($_POST['operation'])) ){

	//Set header to XML
	//header('Content-Type: text/xml');

	$operation = htmlspecialchars(trim($_POST['operation']));
	
	require_once(dirname(__FILE__).'/SBproxy.class.php');


$labConfiguration = "<?xml version='1.0' encoding='utf-8' standalone='no' ?>
<!DOCTYPE labConfiguration SYSTEM 'http://ilab-labview.mit.edu/labserver/xml/labConfiguration.dtd'>
<labConfiguration lab='MIT ELVIS Weblab' specversion='0.1'>

	<setup id='2'>
		<name>Inverting Amplifier 1</name>
		<description>Inverting Amplifier</description>
		<imageURL>img_setup/107OpAmp_C01.gif</imageURL>
		<terminal instrumentType='FGEN' instrumentNumber='1'><label>FGEN</label><pixelLocation><x>12</x><y>78</y></pixelLocation></terminal>
		<terminal instrumentType='SCOPE' instrumentNumber='2'><label>SCOPE</label><pixelLocation><x>245</x><y>86</y></pixelLocation></terminal>
	</setup>

	<setup id='3'>
		<name>Inverting Amplifier 2</name>
		<description>Inverting Amplifier 2</description>
		<imageURL>img_setup/107OpAmp_C02.gif</imageURL>
		<terminal instrumentType='FGEN' instrumentNumber='1'><label>FGEN</label><pixelLocation><x>12</x><y>78</y></pixelLocation></terminal>
		<terminal instrumentType='SCOPE' instrumentNumber='2'><label>SCOPE</label><pixelLocation><x>245</x><y>86</y></pixelLocation></terminal>
	</setup>

	<setup id='4'>
		<name>Inverting Amplifier 3</name>
		<description>Inverting Amplifier 3</description>
		<imageURL>img_setup/107OpAmp_C03.gif</imageURL>
		<terminal instrumentType='FGEN' instrumentNumber='1'><label>FGEN</label><pixelLocation><x>12</x><y>78</y></pixelLocation></terminal>
		<terminal instrumentType='SCOPE' instrumentNumber='2'><label>SCOPE</label><pixelLocation><x>245</x><y>86</y></pixelLocation></terminal>
	</setup>

	<setup id='5'>
		<name>Inverting Amplifier 4</name>
		<description>Inverting Amplifier 4</description>
		<imageURL>img_setup/107OpAmp_C04.gif</imageURL>
		<terminal instrumentType='FGEN' instrumentNumber='1'><label>FGEN</label><pixelLocation><x>12</x><y>78</y></pixelLocation></terminal>
		<terminal instrumentType='SCOPE' instrumentNumber='2'><label>SCOPE</label><pixelLocation><x>245</x><y>86</y></pixelLocation></terminal>
	</setup>

</labConfiguration>";



	try{
		$client = new SBproxy($SBcouponID, $SBpasskey);


		switch($operation){

			case 'Cancel':
			case 'GetExperimentStatus':
			case 'RetrieveResult':
				if ( isset($_POST['expSpec']['experimentID']) ) {
					$parameters = array( 'experimentID' => htmlspecialchars( trim($_POST['expSpec']['experimentID']) ) );
					echo $client->soapCall($operation, $parameters);
				} else {
					//exception
					echo $client->soapCall($operation);
				}
				break;
			case 'GetLabConfiguration'://normalerweise fall-through zu GetLabStatus
				//echo $labConfiguration;
				//break;
			case 'GetLabStatus':
				echo $client->soapCall($operation);
				break;

			case 'Submit':
			//echo '<root><submit>php Submit</submit><var_dump_expSpec>';
			//var_dump($_POST['expSpec']);
			//echo '</var_dump_expSpec><xml_ExpSpec>'.PHP_EOL.genExpSpec2($_POST['expSpec']).PHP_EOL.'</xml_ExpSpec></root>';
				//
				if ( isset($_POST['expSpec']) ) {
					//$_POST['expSpec'] = array_map('trim', $_POST['expSpec']);
					//$_POST['expSpec'] = array_map('htmlspecialchars', $_POST['expSpec']);

					$parameters = array( 'experimentSpecification' => genExpSpec2($_POST['expSpec']) );
					echo $client->soapCall($operation, $parameters);
				} else {
					//exception
					echo $client->soapCall($operation);
				}//*/
				break;

			default:
				echo $client->soapCall($operation);//returns an exception in XML format
				break;
		}

	} catch(Exception $e) {
		return '__'.$e.'__';//TODO: check
	}//*/
}else{
	//display client
	require_once(dirname(__FILE__).'/interface.html.php');
}//*/

?>
