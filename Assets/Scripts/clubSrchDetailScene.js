#pragma strict

var returnBtn: GameObject;
var btnApply: GameObject;

var clubId: String;

private var usr: JSONObject;

function Start () {
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("clubApplyRsp", clubApplyRsp);

	UIEventListener.Get(returnBtn).onClick = returnBtnClick;
	UIEventListener.Get(btnApply).onClick = applyBtnClick;
}


function returnBtnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;
}

function showUp(id: String, name: String, notice: String, curNum: String, maxNum: String, rating: int) {
	gameObject.Find("srchClubDetailName").GetComponent(UILabel).text = name;
	gameObject.Find("srchClubDetailIntro").GetComponent(UILabel).text = notice;
	//gameObject.Find("clubDetailNum").GetComponent(UILabel).text = curNum + "/" + maxNum;

	for (var i : int = 0; i < 5; i++) {
		if (i < rating)
			gameObject.Find("srchDetailStar" + i.ToString()).GetComponent(UISprite).spriteName = "star_on";
		else 
			gameObject.Find("srchDetailStar" + i.ToString()).GetComponent(UISprite).spriteName = "star_off";
	}

	clubId = id;
}

function applyBtnClick() {
	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);	
	usr.AddField("data", "&action=apply&id=" + clubId);

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);
}

function clubApplyRsp(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] clubApplyRsp received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	try { 
		if(data["response"]["applyResult"].ToString() == "0") {
			
			GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Player has already in this club");
		} else {
			returnBtnClick();
		}
		
	} catch (err) {
		Debug.Log('Error in TRY');
	}
}