#pragma strict

//var socket: SocketIO.SocketIOComponent;
var startScene: GameObject;
private var usr: JSONObject;

function Awake() {

	//GameObject.Find('Panel/pnlHome/pnlLogin')


}

function Start () {
	//socket = GameObject.Find("SocketIO").GetComponent("SocketIOComponent");
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("autologinRsp", autologinRsp);

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("playerMove","");
	usr.AddField("joinGame","");
	usr.AddField("msg","");
	usr.AddField("data","");	
	usr.AddField("language",PlayerPrefs.GetString("playerLanguage"));
	usr.AddField("gameID","");
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);

	yield WaitForSeconds(1); // waiting for socket connection setup
	Connect();
}


function autologinRsp(e : SocketIO.SocketIOEvent) {
	
	if (e) {
		Debug.Log("[SocketIO] autologinRsp received: " + e.name + " " + e.data);
		
		var data = LitJson.JsonMapper.ToObject(e.data.ToString());
		
		try {
 			if(data["response"]["playerName"].ToString() == "NOUSER") {
 				PlayerPrefs.SetString("playerName", "");
 				GameObject.Find("UI Root").GetComponent(enginepoker).playerName = "";

 				GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(startScene);
 				GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
			} else {
				if (!data["response"]["playerEmail"].ToString().Contains("guest.com")) {
 					PlayerPrefs.SetInt("guest",0);
 				} 
 				GameObject.Find("UI Root").GetComponent(enginepoker).playerName = data["response"]["playerName"].ToString();

 				PlayerPrefs.SetString("playerId", data["response"]["playerId"].ToString());
 				PlayerPrefs.SetString("playerName", data["response"]["playerName"].ToString());
 				PlayerPrefs.SetString("playerBank", data["response"]["playerBank"].ToString());
 				PlayerPrefs.SetString("playerBankAmount", data["response"]["playerBankAmount"].ToString());
 				PlayerPrefs.SetString("playerRank", data["response"]["playerRank"].ToString());
 				PlayerPrefs.SetString("playerAvatar", data["response"]["playerAvatar"].ToString());
 				PlayerPrefs.SetString("playerGold", data["response"]["playerGold"].ToString());

 				//PlayerPrefs.SetString("playerLevel", Mathf.Floor(parseInt(data["response"]["playerLevel"].ToString()) / 100).ToString());
 				//PlayerPrefs.SetString("playerLevelPrg", data["response"]["playerLevel"].ToString());
 				PlayerPrefs.SetString("playerDealerId", data["response"]["playerDealerId"].ToString());
				//PlayerPrefs.SetString("loadVocab", data["response"]["loadVocab"].ToString());
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

				//GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(PlayerPrefs.GetString("playerAvatar").ToString(), GameObject.Find("imgPlayerAvatar"));
			}

		} catch (err) {

			//GameObject.Find("btnRetry").GetComponent(UIButton).isEnabled = true;
			
 			Debug.Log("Err " + err.Message);
 			
		}
	}
	else {
		//GameObject.Find("btnRetry").GetComponent(UIButton).isEnabled = true;
		Debug.Log("No data");
	}		
}


function Connect() {
	usr.SetField("data", '');
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("auto_login", usr);
}