#pragma strict

private var usr : JSONObject;
private var processFlag: boolean = false;
//private var csEngineFB : Facebook.Unity.EP.engineFB;

var startScene: GameObject;

var btnSubmit: GameObject;
var btnClose: GameObject;

//var fbFlag: boolean = false;

//var fbCreate: boolean = false;
//var fbUsername: String;
//var fbEmail: String;
//var fbId : String;

function Start () {

	UIEventListener.Get(btnSubmit).onClick = registerClick;
	UIEventListener.Get(btnClose).onClick = closeClick;

	//socket = GameObject.Find("SocketIO").GetComponent("SocketIOComponent");
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("createRsp", createRsp);
	//GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotLogin", gotLogin);

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username","");
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);
	usr.AddField("language",PlayerPrefs.GetString("playerLanguage"));
}

function registerClick() {
	if (processFlag)
		return; 

	var username = GameObject.Find("UI Root/pnlRoot/pnlHome/pnlSignup/txtCreateUsername").GetComponent(UIInput).value;
	var password = GameObject.Find("UI Root/pnlRoot/pnlHome/pnlSignup/txtCreatePassword").GetComponent(UIInput).value;
	var email = GameObject.Find("UI Root/pnlRoot/pnlHome/pnlSignup/txtCreateEmail").GetComponent(UIInput).value;

	usr.SetField("data", "&action=createplayer&user=" + username + "&password=" + password + "&deviceName=" + WWW.EscapeURL(SystemInfo.deviceName) + "&email=" + email + '&myTime=0&av=avatar1.jpg&facebookId=');
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("player_create", usr);

	processFlag = true;
}

function closeClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(startScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
}

/*
function gotLogin(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotLogin received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	try { 
	
		if(data["response"]["playerName"].ToString() == "NOUSER") {
			//var username = GameObject.Find("txtCreateUsername").GetComponent(UIInput).value;
			//var fbId = GameObject.Find("txtCreatePassword").GetComponent(UIInput).value;
			//var email = GameObject.Find("txtCreateEmail").GetComponent(UIInput).value;
			GameObject.Find("UI Root").GetComponent(enginepoker).playerName = "";
			GameObject.Find("UI Root").GetComponent(enginepoker).showNotify(data["response"]["error"].ToString());

			closeClick();

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
		
			Debug.Log("Response: " + data["response"]["playerName"].ToString());

			GameObject.Find("UI Root/pnlRoot/pnlProfile").GetComponent(profileController).showUp();
			
			GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
			GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = false;

			GameObject.Find("UI Root").GetComponent(enginepoker).totalNoticeNum = data["response"]["notice"].Count;
			GameObject.Find("UI Root").GetComponent(enginepoker).handleNotice(data["response"]["notice"]);
		}

		processFlag = false;
		
	} catch (err) {
		Debug.Log('Error in TRY');
	}
}  */


function createRsp(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] createRsp received: " + e.name + " " + e.data);

	if (e) {
		var data = LitJson.JsonMapper.ToObject(e.data.ToString());
		try { 
 			
 			
			if(data["response"]["playerName"].ToString() == "NA") {
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
 				PlayerPrefs.SetString("playerDealerId", data["response"]["playerDealerId"].ToString());
 				//PlayerPrefs.SetString("loadVocab", data["response"]["loadVocab"].ToString());
 				PlayerPrefs.SetString("playerGold", data["response"]["playerGold"].ToString());
 				PlayerPrefs.SetString("playerFbId", data["response"]["playerFbId"].ToString());

 				PlayerPrefs.SetString("clubId", "0");
 				PlayerPrefs.SetString("season", "0");

				//GameObject.Find("UI Root/pnlRoot/pnlProfile").GetComponent(profileController).showUp();
 				
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

				//PlayerPrefs.SetInt("NoticeNum", data["response"]["notice"].Count);
				//PlayerPrefs.SetString("Notices", notices);

				GameObject.Find("UI Root").GetComponent(enginepoker).handleNotice(notices);
				*/

				//GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(PlayerPrefs.GetString("playerAvatar").ToString(), GameObject.Find("imgPlayerAvatar"));
 			}
 			processFlag = false;
 			
 		} catch (err) {
 			Debug.Log('Error in TRY');
 
		}
		
	} else {
		Debug.Log('Empty data');	
 	}
}

/*
function fbLoggedIn() {

	if(csEngineFB.IsLoggedIn) {
		
		csEngineFB.getUser();
	} else {
		GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Login Facebook fail!");
		processFlag = false;
		closeClick();
	}
}

function fbGetUser(theFbId : String, theFbUsername : String, theFbEmail : String) {

	//fbUsername = theFbUsername.Replace(" ", "").Substring(0,7);
	//fbEmail = theFbEmail;
	//fbId = theFbId;

	//GameObject.Find("UI Root/pnlRoot/pnlHome/pnlSignup/txtCreateUsername").GetComponent(UIInput).value = fbUsername;
	//GameObject.Find("UI Root/pnlRoot/pnlHome/pnlSignup/txtCreateEmail").GetComponent(UIInput).value = theFbEmail;
	//GameObject.Find("UI Root/pnlRoot/pnlHome/pnlSignup/txtCreatePassword").GetComponent(UIInput).value = theFbId;
	if (processFlag) 
		return;
	var country = Application.systemLanguage.ToString();
	var language = PlayerPrefs.GetString("playerLanguage");

	usr.SetField("data", '&user=' + theFbUsername + '&password=' + theFbId + '&language=' + language +'&deviceName=' + WWW.EscapeURL(SystemInfo.deviceName) + '&email=' + theFbEmail + '&myTime=0&country=' + country + '&av=avatar1.jpg&facebookId='+theFbId);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_login", usr);

	processFlag = true;

	//usr.SetField("data", '&usr=' + fbUsername + '&facebookId=' + theFbId + '&deviceName=' + WWW.EscapeURL(SystemInfo.deviceName));
	//GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_login", usr);
}
*/

