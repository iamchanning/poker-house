#pragma strict

var btnReturnLandscape: GameObject;

function Awake () {
	//Debug.Log("Awake");
	UIEventListener.Get(btnReturnLandscape).onClick = returnLandscape;
}

function Start () {
/*
	if (PlayerPrefs.GetString("orientation") == "" || PlayerPrefs.GetString("orientation") == "landscape")
		Application.LoadLevel("landscape");
	else
		Screen.orientation = ScreenOrientation.Portrait;
*/
	//Debug.Log("Start");
	//UIEventListener.Get(btnReturnLandscape).onClick = returnLandscape;

}

function Update () {

}

function returnLandscape() {
	PlayerPrefs.SetString("orientation", 'landscape');
	Application.LoadLevel("landscape");
}