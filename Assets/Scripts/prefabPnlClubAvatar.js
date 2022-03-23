#pragma strict

private var usr : JSONObject;

var selectedItem: GameObject = null;

//var avatarChanged: boolean = false;


function Start () {
	//GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("avatarChangeRsp", avatarChangeRsp);
	//GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("updatedFb", updatedFb);

	UIEventListener.Get(gameObject.transform.Find("header/return").gameObject).onClick = btnReturnClick; 
   	UIEventListener.Get(gameObject.transform.Find("btnConfirm").gameObject).onClick = btnConfirmClick; 
  
}


function showUp() {

	selectedItem = null;	

	if (!usr) {
		usr = new JSONObject(JSONObject.Type.OBJECT);
		usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
		usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
		usr.AddField("username",PlayerPrefs.GetString ("playerName"));
		usr.AddField("data","");	
		usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);	
	}
	
	for (var i: int = 0; i < 10; i++) {
		GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar("avatar" + i + ".jpg", gameObject.transform.Find("options/btnAvatar" + i + "/imgAvatar").gameObject, true);
    	gameObject.transform.Find("options/btnAvatar" + i + "/selected").GetComponent(UISprite).alpha = 0;
    	UIEventListener.Get(gameObject.transform.Find("options/btnAvatar" + i).gameObject).onClick = selectAvatar;
	}


}

function selectAvatar(item: GameObject) {
	if (selectedItem)
		selectedItem.transform.Find("selected").GetComponent(UISprite).alpha = 0;

	item.transform.Find("ButtonPress").GetComponent.<ParticleSystem>().Play(true);

	item.transform.Find("selected").GetComponent(UISprite).alpha = 1;
	selectedItem = item;
}


function btnConfirmClick() {

	if (selectedItem) {
		var selectedAvatar = "avatar" + selectedItem.GetComponent(menuButtonController).position + ".jpg";
		gameObject.transform.parent.GetComponent(prefabPnlClubCE).editedAvatar = selectedAvatar;
		gameObject.transform.parent.GetComponent(prefabPnlClubCE).reloadAvatar();
		//GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(selectedAvatar, gameObject.transform.parent.Find("imgClubAvatar").gameObject, true);
	}
	btnReturnClick();
}


function btnReturnClick() {

	//selectedItem = null;
	NGUITools.Destroy(gameObject);

	//GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	//GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = false;
}



