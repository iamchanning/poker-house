#pragma strict

var btnFbSignup: GameObject;
var btnMailSignup: GameObject;
var btnLogin: GameObject;

//var processFlag: boolean = false;

var loginScene: GameObject;
var signupPnl: GameObject;

//private var csEngineFB : Facebook.Unity.EP.engineFB;
private var usr : JSONObject;

/*
function Awake() {

	#if !UNITY_STANDALONE && !UNITY_WEBGL


	csEngineFB = new Facebook.Unity.EP.engineFB();
	csEngineFB.init();

	#endif

	csEngineFB.OnLoggedIn = fbLoggedIn;
	csEngineFB.OnGetUser = fbGetUser;
} */

function Start () {

	//processFlag = false;

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("createRsp", createRsp);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotLogin", gotLogin);

	UIEventListener.Get(btnFbSignup).onClick = fbSignupClick;
	UIEventListener.Get(btnMailSignup).onClick = mailSignupClick;
	UIEventListener.Get(btnLogin).onClick = loginClick;
}

function fbSignupClick() {
	//signupPnl.GetComponent(signupScene).fbFlag = true;
	//GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(signupPnl);
	//GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	//signupPnl.GetComponent(signupScene).showUp();
	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username","");
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);
	usr.AddField("language",PlayerPrefs.GetString("playerLanguage"));

	GameObject.Find("UI Root").GetComponent(enginepoker).csEngineFB.login();
}

function mailSignupClick() {
	//signupPnl.GetComponent(signupScene).fbFlag = false;
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(signupPnl);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	//signupPnl.GetComponent(signupScene).showUp();
}

function loginClick(){

	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(loginScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
}

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

			//PlayerPrefs.SetInt("NoticeNum", data["response"]["notice"].Count);
			//PlayerPrefs.SetString("Notices", notices);

			GameObject.Find("UI Root").GetComponent(enginepoker).handleNotice(notices);
			*/

		}

		GameObject.Find("UI Root").GetComponent(enginepoker).fbProcessFlag = false;
		
	} catch (err) {
		Debug.Log('Error in TRY');
	}
} 


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

				//GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(PlayerPrefs.GetString("playerAvatar").ToString(), GameObject.Find("imgPlayerAvatar"));
				*/
 			}
 			GameObject.Find("UI Root").GetComponent(enginepoker).fbProcessFlag = false;
 			
 		} catch (err) {
 			Debug.Log('Error in TRY');
 
		}
		
	} else {
		Debug.Log('Empty data');	
 	}
}

/*
function fbLoggedIn() {

	if(!csEngineFB.IsLoggedIn) {
		csEngineFB.getUser();
	} else {
		GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Login Facebook fail!");
		processFlag = false;
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

