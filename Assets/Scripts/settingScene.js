#pragma strict

private var usr: JSONObject;

var loginScene: GameObject;

var CloseSettingBtn : GameObject;
var musicSwitchBtn : GameObject;
var orientationSwitch : GameObject;
var logoutBtn: GameObject;


function Start () {
	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName"));
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);
	usr.AddField("language",PlayerPrefs.GetString("playerLanguage"));


	if (PlayerPrefs.GetString("orientation") == "" || PlayerPrefs.GetString("orientation") == "landscape")
		orientationSwitch.GetComponent(UISprite).spriteName = "switch_on";
	else
		orientationSwitch.GetComponent(UISprite).spriteName = "switch_off";

	if(PlayerPrefs.GetInt("Sound") == 0) {
		musicSwitchBtn.GetComponent(UISprite).spriteName = "switch_on";
	} else {
		musicSwitchBtn.GetComponent(UISprite).spriteName = "switch_off";
	}
	
	UIEventListener.Get(CloseSettingBtn).onClick = closeBtnClick;
	UIEventListener.Get(musicSwitchBtn).onClick = musicBtnClick;
	UIEventListener.Get(logoutBtn).onClick = logoutClick;
	//UIEventListener.Get(orientationSwitch).onClick = orientationChange;
	UIEventListener.Get(gameObject.transform.Find("Table/btnItem1").gameObject).onClick = pwChangeClick;
	UIEventListener.Get(gameObject.transform.Find("Table/btnItem3").gameObject).onClick = serviceClick;
	UIEventListener.Get(gameObject.transform.Find("Table/btnItem4").gameObject).onClick = policyClick;
}


function orientationChange() {
	if (orientationSwitch.GetComponent(UISprite).spriteName.Contains("_on")) {
		PlayerPrefs.SetString("orientation", 'portrait');
		Application.LoadLevel("portrait");

	} else {
		PlayerPrefs.SetString("orientation", 'landscape');
		Application.LoadLevel("landscape");

	}
}

function closeBtnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = false;
}

function musicBtnClick() {

	if (musicSwitchBtn.GetComponent(UISprite).spriteName == "switch_on") {
		musicSwitchBtn.GetComponent(UISprite).spriteName = "switch_off";
		PlayerPrefs.SetInt("Sound",1);
	} else {
		musicSwitchBtn.GetComponent(UISprite).spriteName = "switch_on";
		PlayerPrefs.SetInt("Sound",0);
	}
}

function logoutClick() {
	usr.SetField("data", "");
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_loginOut", usr);

	PlayerPrefs.SetString("playerId", "");
	PlayerPrefs.SetString("playerName", "");
	PlayerPrefs.SetString("playerBank", "");
	PlayerPrefs.SetString("playerBankAmount", "");
	PlayerPrefs.SetString("playerRank", "");
	PlayerPrefs.SetString("playerAvatar", "");
	PlayerPrefs.SetString("playerDealerId", "");
	//PlayerPrefs.SetString("loadVocab", "");
	PlayerPrefs.SetString("playerGold", "");
	PlayerPrefs.SetString("playerFbId", "");

	GameObject.Find("UI Root").GetComponent(enginepoker).avatarChanged();
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = false;
	GameObject.Find("UI Root").GetComponent(enginepoker).menuBtnClick(2);
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(loginScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

}

function pwChangeClick() {
	var prefab: GameObject = Resources.Load("Prefabs/pnlPwChange", GameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
}

function serviceClick() {
	var prefab : GameObject = Resources.Load("Prefabs/pnlEvent", GameObject);
	var newPnl : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);

	newPnl.GetComponent(eventScene).noticeId = 0;
	newPnl.GetComponent(eventScene).title = "Terms of Service";
	newPnl.GetComponent(eventScene).showUp();
}

function policyClick() {
	var prefab : GameObject = Resources.Load("Prefabs/pnlEvent", GameObject);
	var newPnl : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);

	newPnl.GetComponent(eventScene).noticeId = 0;
	newPnl.GetComponent(eventScene).title = "Policy Pravicy";
	newPnl.GetComponent(eventScene).showUp();
}

