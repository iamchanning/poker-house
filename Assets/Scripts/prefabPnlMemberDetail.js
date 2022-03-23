#pragma strict

var memberName: String;
var memberId: int;
var memberHands: int;
//var memberRake: int;
var memberChips: int;
var memberBuyin: int;
var memberSendback: int;
var memberWinnings: int;
var memberAdmin: int;
var memberManager: int;
var memberAvatar: String;

var btnReturn: GameObject;
var btnDelete: GameObject;
var btnSwitch: GameObject;

private var usr: JSONObject;

function Start () {
	
}

function btnSwitchClick() {
	if (btnSwitch.GetComponent(UISprite).spriteName.Contains("_on")) {
		usr.SetField("data", "&action=setManager&clubId=" + PlayerPrefs.GetString("clubId") + "&player=" + memberName + "&manager=0");
	} else {
		usr.SetField("data", "&action=setManager&clubId=" + PlayerPrefs.GetString("clubId") + "&player=" + memberName + "&manager=1");
	}
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);		
}

function btnReturnClick() {
	GameObject.Find("UI Root/pnlRoot/pnlClub/pnlClubGame/pnlClubDetail/pnlMemberList").GetComponent(clubMemberList).showUp(); 
	NGUITools.Destroy(gameObject);
}

function btnDeleteClick() {
	usr.SetField("data", "&action=quit&id=" + PlayerPrefs.GetString("clubId") + "&username=" + memberName);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);
}

function gotClubQuit(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotClubQuit received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());

	PlayerPrefs.SetString("clubCurNum", data['response']['clubCurNum'].ToString());

	GameObject.Find("pnlRoot/pnlClub/pnlClubGame/pnlClubDetail/pnlMemberList").GetComponent(clubMemberList).showUp();
	btnReturnClick();
}

function showUp() {
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotClubQuit", gotClubQuit);

	UIEventListener.Get(btnReturn).onClick = btnReturnClick;
	UIEventListener.Get(btnSwitch).onClick = btnSwitchClick;

	if ((memberAdmin != 1 && PlayerPrefs.GetString("clubAdmin") == "1") || (PlayerPrefs.GetString("clubManager") == "1" && memberManager != 1 && memberAdmin != 1)) {
		btnDelete.GetComponent(UISprite).alpha = 1;
		UIEventListener.Get(btnDelete).onClick = btnDeleteClick;
	} else {
		//btnDelete.GetComponent(UISprite).color = Color.grey;
		//btnDelete.GetComponent(UISprite).color = Color32(55,55,55,255);
		btnDelete.GetComponent(UISprite).alpha = 0;
	}

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);

	GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(memberAvatar, gameObject.transform.Find("avatar/imgPlayerAvatar").gameObject, false);

	gameObject.transform.Find("lblDescription").GetComponent(UILabel).text = memberName + "\nID: " + memberId;
	//gameObject.transform.Find("lblrake").GetComponent(UILabel).text = memberRake + "\nRake";
	gameObject.transform.Find("lblhands").GetComponent(UILabel).text = memberHands + "\nHands";
	gameObject.transform.Find("winnings").GetComponent(UILabel).text = memberWinnings + "\nWinnings";
	gameObject.transform.Find("sendback").GetComponent(UILabel).text = memberSendback + "\nSend-back";
	gameObject.transform.Find("buyin").GetComponent(UILabel).text = memberBuyin + "\nBuy-in";
	gameObject.transform.Find("chips/lblChips").GetComponent(UILabel).text = memberChips.ToString();

	if (PlayerPrefs.GetString("clubAdmin") == "1" && memberAdmin != 1) {
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotManagerSetting", gotManagerSetting);
		btnSwitch.GetComponent(UISprite).alpha = 1;
		gameObject.transform.Find("label").GetComponent(UILabel).text = "Set as Manager:";
		if (memberManager)
			btnSwitch.GetComponent(UISprite).spriteName = "switch_on";
		else
			btnSwitch.GetComponent(UISprite).spriteName = "switch_off";
	} else {
		btnSwitch.GetComponent(UISprite).alpha = 0;
		gameObject.transform.Find("label").GetComponent(UILabel).text = "";
	}
}

function gotManagerSetting(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotManagerSetting received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());

	if (data['msg'].ToString() == "") {
		if (btnSwitch.GetComponent(UISprite).spriteName.Contains("_on")) {
			btnSwitch.GetComponent(UISprite).spriteName = "switch_off";
		} else {
			btnSwitch.GetComponent(UISprite).spriteName = "switch_on";
		}
	} else {
		GameObject.Find("UI Root").GetComponent(enginepoker).showNotify(data['msg'].ToString());
	}
}