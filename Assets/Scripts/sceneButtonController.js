#pragma strict

var portraitWidth : int = 120;
var landscapeWidth : int = 292;

var pinLeft : boolean = false;
var pinRight : boolean = false;

function Start () {

}

function scaleHeight(newW: float, currW : float, currH : float){

	var ratio = currH / currW;

	currH = newW * ratio;

	return currH;
}