#pragma strict

//var socket : SocketIO.SocketIOComponent;
private var usr : JSONObject;

var startScene: GameObject;
var signupScene: GameObject;

var btnSignup: GameObject;
var btnSubmit: GameObject;
var btnClose: GameObject;

private var processFlag: boolean = false;

function Start () {
	//socket = GameObject.Find("SocketIO").GetComponent("SocketIOComponent");
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotLogin", gotLogin);

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username","");
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);
	usr.AddField("language",PlayerPrefs.GetString("playerLanguage"));

	UIEventListener.Get(btnSubmit).onClick = loginClick;
	UIEventListener.Get(btnSignup).onClick = signupClick;
	UIEventListener.Get(btnClose).onClick = closeClick;

}


function loginClick() {
	if (processFlag)
		return;

	var username = gameObject.Find("txtEmailLogin").GetComponent(UIInput).value;
	var password = gameObject.Find("txtPasswordLogin").GetComponent(UIInput).value;

	usr.SetField("data", '&user=' + username + '&password=' + password + '&deviceName=' + WWW.EscapeURL(SystemInfo.deviceName));
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_login", usr);

	processFlag = true;
}

function signupClick(){
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(signupScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
}

function closeClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(startScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
}

function gotLogin(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotLogin received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	try { 
	
		if(data["response"]["playerName"].ToString() == "NOUSER") {
			GameObject.Find("UI Root").GetComponent(enginepoker).playerName = "";
			GameObject.Find("UI Root").GetComponent(enginepoker).showNotify(data["response"]["error"].ToString());
		} else {
			GameObject.Find("UI Root").GetComponent(enginepoker).playerName = data["response"]["playerName"].ToString();
			PlayerPrefs.SetString("playerId", data["response"]["playerId"].ToString());
			PlayerPrefs.SetString("playerName", data["response"]["playerName"].ToString());
			PlayerPrefs.SetString("playerBank", data["response"]["playerBank"].ToString());
			PlayerPrefs.SetString("playerBankAmount", data["response"]["playerBankAmount"].ToString());
			PlayerPrefs.SetString("playerRank", data["response"]["playerRank"].ToString());
			PlayerPrefs.SetString("playerAvatar", data["response"]["playerAvatar"].ToString());
			//PlayerPrefs.SetString("loadVocab", data["response"]["loadVocab"].ToString());
			PlayerPrefs.SetString("playerGold", data["response"]["playerGold"].ToString());
			PlayerPrefs.SetString("playerDealerId", data["response"]["playerDealerId"].ToString());
			PlayerPrefs.SetString("playerFbId", data["response"]["playerFbId"].ToString());

			PlayerPrefs.SetString("clubId", "0");
			PlayerPrefs.SetString("season", "0");
			
			GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
			GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = false;

			//GameObject.Find("UI Root").GetComponent(enginepoker).totalNoticeNum = data["response"]["notice"].Count;
			//GameObject.Find("UI Root").GetComponent(enginepoker).handleNotice(data["response"]["notice"]);

			/*
			var notices = "";
			for (var i: int = 0; i < data["response"]["notice"].Count; i++) { 
				notices += (data["response"]["notice"][i]['id'] + "," + data["response"]["notice"][i]['title'] + ((i == data["response"]["notice"].Count - 1) ? "" : " "));
			}

			Debug.Log(notices); 
			*/

			//PlayerPrefs.SetInt("NoticeNum", data["response"]["notice"].Count);
			//PlayerPrefs.SetString("Notices", notices);

			//GameObject.Find("UI Root").GetComponent(enginepoker).handleNotice(notices);
		}
		
	} catch (err) {
		Debug.Log('Error in TRY');
	}

	processFlag = false;
}

