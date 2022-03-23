#pragma strict

private var usr : JSONObject;

var selectedItem: GameObject = null;

var avatarChanged: boolean = false;


function Start () {
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("avatarChangeRsp", avatarChangeRsp);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("updatedFb", updatedFb);

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString ("playerName"));
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);

	
    UIEventListener.Get(gameObject.transform.Find("header/return").gameObject).onClick = btnReturnClick; 
    UIEventListener.Get(gameObject.transform.Find("btnConfirm").gameObject).onClick = btnConfirmClick; 

    //GameObject.Find("UI Root").GetComponent(enginepoker).csEngineFB.OnLoggedIn = fbLoggedIn;
	//GameObject.Find("UI Root").GetComponent(enginepoker).csEngineFB.OnGetUser = fbGetUser;
  
}

function showUp() {
	var i: int = 0;
	if (!avatarChanged) {
		for (i = 0; i < 10; i++) {

			if (i == 0) {
				if (PlayerPrefs.GetString("playerFbId") != "") {
					GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(PlayerPrefs.GetString("playerFbId"), gameObject.transform.Find("options/btnAvatar0/imgAvatar").gameObject, false);
				} else {
					GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar("avatar0.jpg", gameObject.transform.Find("options/btnAvatar" + i + "/imgAvatar").gameObject, false);
				}
			}
	    			
	    	GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar("avatar" + i + ".jpg", gameObject.transform.Find("options/btnAvatar" + i + "/imgAvatar").gameObject, false);
	    	//gameObject.transform.Find("options/btnAvatar" + i + "/selected").GetComponent(UISprite).alpha = 0;
	    	UIEventListener.Get(gameObject.transform.Find("options/btnAvatar" + i).gameObject).onClick = selectAvatar;
		}
		avatarChanged = true;
	}

	selectedItem = null;
	for (i = 0; i < 10; i++) {
		gameObject.transform.Find("options/btnAvatar" + i + "/selected").GetComponent(UISprite).alpha = 0;
	}		
}

function selectAvatar(item: GameObject) {
	if (selectedItem)
		selectedItem.transform.Find("selected").GetComponent(UISprite).alpha = 0;

	item.transform.Find("ButtonPress").GetComponent.<ParticleSystem>().Play(true);

	item.transform.Find("selected").GetComponent(UISprite).alpha = 1;
	selectedItem = item;

	if (PlayerPrefs.GetString("playerFbId") == "" && selectedItem.GetComponent(menuButtonController).position == 0) {
		GameObject.Find("UI Root").GetComponent(enginepoker).csEngineFB.login();
	}
}


function btnConfirmClick() {

	if (selectedItem) {

		if (selectedItem.GetComponent(menuButtonController).position > 0) 
			usr.SetField("data", "&avatar=avatar" + selectedItem.GetComponent(menuButtonController).position + ".jpg");
		else 
			usr.SetField("data", "&avatar=" + PlayerPrefs.GetString("playerFbId"));
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("avatar_change", usr);
	}
}


function btnReturnClick() {

	selectedItem = null;
	//processFlag = false;
	
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = false;
}

function avatarChangeRsp(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] avatarChangeRsp received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	try { 

		//GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Your avatar has updated!");

		if (PlayerPrefs.GetString("playerAvatar") != data["playerAvatar"].ToString()) {
			PlayerPrefs.SetString("playerAvatar", data["playerAvatar"].ToString());	
			//GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(PlayerPrefs.GetString("playerAvatar").ToString(), GameObject.Find("UI Root/pnlRoot/pnlProfile/avatar/imgPlayerAvatar"));

			GameObject.Find("UI Root").GetComponent(enginepoker).avatarChanged();
		}

		btnReturnClick();
		GameObject.Find("UI Root/pnlRoot/pnlProfile").GetComponent(profileController).showUp();
		
	} catch (err) {
		Debug.Log('Error in TRY');
	}
}

function updatedFb(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] updatedFb received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	try { 

		if (data["msg"].ToString() == "") {
			PlayerPrefs.SetString("playerFbId", data["playerFbId"].ToString());	
			GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(PlayerPrefs.GetString("playerFbId"), gameObject.transform.Find("options/btnAvatar0/imgAvatar").gameObject, false);
		} else {
			GameObject.Find("UI Root").GetComponent(enginepoker).showNotify(data["msg"].ToString());
		}

		GameObject.Find("UI Root").GetComponent(enginepoker).fbProcessFlag = false;
	} catch (err) {
		Debug.Log('Error in TRY');
	}
}



