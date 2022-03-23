#pragma strict

var btnReturn: GameObject;
var btnConfirm: GameObject;

var prefabType: String;

var purchaseClubLvl: int;

var myPos: int;

private var usr: JSONObject;

function Start () {
	UIEventListener.Get(btnReturn).onClick = btnReturnClick;
	UIEventListener.Get(btnConfirm).onClick = btnConfirmClick;


}


function btnReturnClick() {
	NGUITools.Destroy(gameObject);
}

function showUp(){
	if(prefabType == "quit club") {
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotClubQuit", gotClubQuit);
		gameObject.transform.Find("header/title").GetComponent(UILabel).text = "Tips";
		gameObject.transform.Find("description").GetComponent(UILabel).text = "Sure to quit the club?";

	} else if (prefabType == "upgrade club level") {
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotClubRatingUpgrade", gotClubRatingUpgrade);
		gameObject.transform.Find("header/title").GetComponent(UILabel).text = "Tips";
		gameObject.transform.Find("description").GetComponent(UILabel).text = "Sure to become level " + purchaseClubLvl + " club?";
	} else if (prefabType == "add on") {
		gameObject.transform.Find("header/title").GetComponent(UILabel).text = "Add On";
		gameObject.transform.Find("description").GetComponent(UILabel).text = "Add On Price: " + PlayerPrefs.GetInt("addOnPrice") + "\nAdd On Chips: " + PlayerPrefs.GetInt("addOnChips") + "\n";
	} else {
		gameObject.transform.Find("header/title").GetComponent(UILabel).text = "League Game Rule";
		gameObject.transform.Find("description").GetComponent(UILabel).text = "Welcome to League Game Mode!\n\n";
	}
}

function btnConfirmClick() {
	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);
	usr.AddField("gameID", PlayerPrefs.GetString("gameID"));

	if (prefabType == "quit club") {
		usr.AddField("data", "&action=quit&id=" + PlayerPrefs.GetString("clubId"));
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);	
	} else if (prefabType == "upgrade club level") {
		usr.AddField("data", "&action=upgradeRating&clubId=" + PlayerPrefs.GetString("clubId") + "&rating=" + purchaseClubLvl);
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);
	} else if (prefabType == "add on") {
		usr.SetField("data", "&action=addon&pos=" + myPos + "&playerId=" + PlayerPrefs.GetString("playerId") + "&clubId=" + PlayerPrefs.GetString("clubId")); 
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_tournament", usr);

		btnReturnClick();
	} else {
		btnReturnClick();
	}
}

function gotClubQuit(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotClubQuit received: " + e.name + " " + e.data);

	GameObject.Find("pnlRoot/pnlClub/pnlClubGame/pnlClubDetail").GetComponent(clubDetailScene).returnBtnClick();
	GameObject.Find("pnlRoot/pnlClub/pnlClubGame").GetComponent(clubGameScene).returnBtnClick();

	btnReturnClick();
}

function gotClubRatingUpgrade(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotClubRatingUpgrade received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());

	if (data["msg"].ToString() != "") {
		GameObject.Find("UI Root").GetComponent(enginepoker).showNotify(data["msg"].ToString());
	} else {
		GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Your club now upgrade to level " + data["clubRating"].ToString() + "!");
		PlayerPrefs.SetString("playerGold", data["diamonds"].ToString());
		PlayerPrefs.SetString("clubRating", data["clubRating"].ToString());
		GameObject.Find("pnlRoot/pnlClub/pnlClubGame/pnlClubRating").GetComponent(clubRatingScene).showUp();
	}

	btnReturnClick();
}