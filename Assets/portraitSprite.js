#pragma strict
var x : int;
var y : int;
var width : int;
var height : int;


function Start () {

}

function Update () {

	if(Screen.orientation == ScreenOrientation.LandscapeLeft || Screen.orientation == ScreenOrientation.LandscapeRight) {
		//adjustElements();
	} else {
		#if UNITY_EDITOR
			//adjustElements();
		#else
			//adjustElements();
		#endif
	}

}

function adjustElements () {
	gameObject.transform.position.x = x;
	gameObject.transform.position.y = y;
	gameObject.GetComponent(UISprite).width = width;
	gameObject.GetComponent(UISprite).height = height;
}