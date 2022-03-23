#pragma strict

var btnReturn: GameObject;
var btnConfirm: GameObject;
var btnAvatar: GameObject;

//var crtSrchScene: GameObject;
//var clubScene: GameObject;

var prefabType: String;

var editedAvatar: String;

private var usr: JSONObject;

function Start () {
	UIEventListener.Get(btnReturn).onClick = returnBtnClick;
	UIEventListener.Get(btnConfirm).onClick = btnConfirmClick;
	UIEventListener.Get(btnAvatar).onClick = btnAvatarClick;
}


function showUp() {
	

	GameObject.Find("header/pnlClubCETitle").GetComponent(UILabel).text = prefabType;
	editedAvatar = "";

	if (prefabType == "Create a Club") {
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotClubCreate", gotClubCreate);
		GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar("avatar0.jpg", gameObject.transform.Find("imgClubAvatar").gameObject, true);
		gameObject.Find("btnConfirmCE/Label").GetComponent(UILabel).text = "Create";
	} else {
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotClubEdit", gotClubEdit);
		GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(PlayerPrefs.GetString("clubAvatar"), gameObject.transform.Find("imgClubAvatar").gameObject, true);
		gameObject.Find("txtClubName/Label").GetComponent(UILabel).text = PlayerPrefs.GetString("clubName");
		gameObject.Find("txtClubNotice/Label").GetComponent(UILabel).text = PlayerPrefs.GetString("clubNotice");
		gameObject.Find("txtClubName").GetComponent(UIInput).label = null;
		gameObject.Find("txtClubName").GetComponent(UIInput).enabled = false;

		gameObject.Find("btnConfirmCE/Label").GetComponent(UILabel).text = "Confirm";
	}

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);
}

function returnBtnClick() {
	NGUITools.Destroy(gameObject);
	//GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	//GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;
	if (prefabType != "Create a Club") {
		GameObject.Find("UI Root/pnlRoot/pnlClub/pnlClubGame/pnlClubDetail").GetComponent(clubDetailScene).showUp();
	}
}

function btnConfirmClick() {
	var clubNotice: String = gameObject.Find("txtClubNotice").GetComponent(UIInput).value;
	var clubAvatar: String;

	if (prefabType == "Create a Club") {
		var clubName = gameObject.Find("txtClubName").GetComponent(UIInput).value;
		//clubNotice = gameObject.Find("txtClubNotice").GetComponent(UIInput).value;

		if (clubName.Length > 20 || clubName.Length == 0) {
			GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Club Name length should in between 1 to 20");
			gameObject.Find("txtClubName").GetComponent(UIInput).value = "";
			return;
		}

		if (clubNotice.Length > 10) {
			GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Club Notice length should in between 0 to 100");
			gameObject.Find("txtClubNotice").GetComponent(UIInput).value = "";
			return;
		}

		clubAvatar = (editedAvatar == "") ? "avatar0.jpg" : editedAvatar;

		usr.SetField("data", "&action=create&name=" + clubName + "&notice=" + clubNotice + "&avatar=" + clubAvatar);
	} else {

		if (clubNotice.Length > 100) {
			GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Club Notice length should in between 0 to 100");
			gameObject.Find("txtClubNotice").GetComponent(UIInput).value = "";
			return;
		}

		clubAvatar = (editedAvatar == "") ? PlayerPrefs.GetString("clubAvatar") : editedAvatar;

		PlayerPrefs.SetString("clubNotice", clubNotice);
		usr.SetField("data", "&action=edit&id=" + PlayerPrefs.GetString("clubId") + "&notice=" + clubNotice + "&avatar=" + clubAvatar);
	}
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);	
}

function gotClubCreate(e: SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotClubCreate received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
		 
	try { 
		if(data["response"]["clubId"].ToString() == "") {

			GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("One account could only create one club!");
		} else {
			GameObject.Find("pnlRoot/pnlClub/pnlClubCrtSrch").GetComponent(clubCrtSrchScene).returnClick();
			GameObject.Find("pnlRoot/pnlClub").GetComponent(clubController).getClubInfo();
			returnBtnClick();
		}

	} catch(e) {
		Debug.Log('err in data received');
	}
}

function gotClubEdit(e: SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotClubCreate received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());

	PlayerPrefs.SetString("clubAvatar", data["clubAvatar"].ToString());
	GameObject.Find("pnlRoot/pnlClub/pnlClubGame/pnlClubDetail").GetComponent(clubDetailScene).showUp();
	returnBtnClick();
}

function btnAvatarClick() {
	
	var prefab: GameObject = Resources.Load("Prefabs/pnlClubAvatar", GameObject);
	var newPnl: GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);

	newPnl.GetComponent(prefabPnlClubAvatar).showUp(); 
}

function reloadAvatar() {
	if (editedAvatar) {
		GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(editedAvatar, gameObject.transform.Find("imgClubAvatar").gameObject, true);
	}
}
