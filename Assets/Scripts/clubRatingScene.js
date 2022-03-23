#pragma strict

private var usr: JSONObject;

var returnBtn: GameObject;


var uiGrid: GameObject;

function Start () {
	UIEventListener.Get(returnBtn).onClick = returnBtnClick;
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotClubRating", gotClubRating);
}

function returnBtnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

	GameObject.Find("pnlRoot/pnlClub/pnlClubGame").GetComponent(clubGameScene).showUp();
}

function showUp() {
	
	//GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotClubRatingUpgrade", gotClubRatingUpgrade);

	if (!usr){
		usr = new JSONObject(JSONObject.Type.OBJECT);
		usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
		usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
		usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());	
		usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);
	}

	for (var i : int = 0; i < 5; i++) {
		if (i < parseInt(PlayerPrefs.GetString("clubRating")))
			gameObject.transform.Find("clubLvl/ratingStar" + i.ToString()).GetComponent(UISprite).spriteName = "star_on";
		else 
			gameObject.transform.Find("clubLvl/ratingStar" + i.ToString()).GetComponent(UISprite).spriteName = "star_off";
	}
	gameObject.transform.Find("clubLvl/diamonds/lbldiamonds").GetComponent(UILabel).text = PlayerPrefs.GetString("playerGold");

	if (uiGrid.transform.childCount == 0) {
		usr.AddField("data", "&action=rating");
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);
	}
}

function gotClubRating(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotClubRating received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	var i = 1;
	 
	try {

		for(var grid : LitJson.JsonData in data["response"]){
			var prefab : GameObject = Resources.Load("Prefabs/clubLevelRow", GameObject);
			var newRow : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(uiGrid,prefab);

			newRow.transform.localScale = new Vector3(0.95, 0.95);

			newRow.transform.Find("title").GetComponent(UILabel).text = grid["clubRatingName"].ToString();
			newRow.transform.Find("valid").GetComponent(UILabel).text = "(valid for " + grid["clubExpireDate"].ToString() + " days)";
			newRow.transform.Find("member").GetComponent(UILabel).text = grid["clubMemberNum"].ToString();
			newRow.transform.Find("manager").GetComponent(UILabel).text = grid["clubManagerNum"].ToString();
			newRow.transform.Find("diamonds/lbldiamonds").GetComponent(UILabel).text = grid["clubRatingPrice"].ToString();
			newRow.transform.Find("lblclubLvl").GetComponent(UILabel).text = i.ToString();
			i++;

			newRow.transform.GetComponent(gridRow).clubRating = grid["clubRating"].ToString();

			UIEventListener.Get(newRow).onClick = purchase;
		}
		uiGrid.GetComponent(UIGrid).Reposition();
	} catch(e) {
		Debug.Log('err in data received');
	}
}

function purchase(item: GameObject) {
	var prefab : GameObject = Resources.Load("Prefabs/pnlTxtField", GameObject);
	var newPnl : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
	newPnl.GetComponent(prefabPnlTxtField).prefabType = "upgrade club level";
	newPnl.GetComponent(prefabPnlTxtField).purchaseClubLvl = parseInt(item.GetComponent(gridRow).clubRating);
	newPnl.GetComponent(prefabPnlTxtField).showUp();
}

