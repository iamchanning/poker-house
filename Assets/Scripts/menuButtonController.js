#pragma strict
private var csNGUITools : NGUITools; 

var position : int;




/*
function changeRotation() {
	var orientation : UIAtlas;
	var portrait : UIAtlas = Resources.Load("Atlases/portrait",GameObject).GetComponent(UIAtlas);
	var landscape : UIAtlas = Resources.Load("Atlases/landscape",GameObject).GetComponent(UIAtlas);


	Debug.Log('Screen is ' + Screen.orientation);

	if(Screen.orientation == ScreenOrientation.LandscapeLeft || Screen.orientation == ScreenOrientation.LandscapeRight) {
		Debug.Log('Landscape');
		orientation = landscape;
	} else {
		Debug.Log('Portrait');
		orientation = portrait;
	}

	#if UNITY_EDITOR
		if(GameObject.Find("UI Root (3D)").GetComponent(enginepoker).forcePortrait) {
			orientation = portrait;
		} else {
			orientation = landscape;
		}
	#endif

	var allChildren = scene.GetComponentsInChildren(Transform);

    for (var child : Transform in allChildren) {
   
		if(child.GetComponent(UISprite)) {

			if(child.GetComponent(UISprite).atlas == portrait || child.GetComponent(UISprite).atlas == landscape) {
				if(child.GetComponent(UISprite).atlas != orientation) {
					child.GetComponent(UISprite).atlas = orientation.GetComponent(UIAtlas);
				}
			}
		}	

	}

    	
}
*/