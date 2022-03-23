#pragma strict

private var usr: JSONObject;

var returnBtn: GameObject;
var leagueRuleBtn: GameObject;
var playBtn: GameObject;

var chipPlusBtn: GameObject;
var diamondPlusBtn: GameObject;

var rankBtn: GameObject;
var rewardBtn: GameObject;
var rankPnl: GameObject;
var rewardPnl: GameObject;

var topTable: GameObject;

var rankShow: boolean;
var resultShow: boolean = false;
var resultFlag: int;
var points: int;
var resultPoints: int;

var avatarChanged: boolean = false;

//var matching: boolean = false;

function Start () {
	UIEventListener.Get(returnBtn).onClick = returnBtnClick;
	UIEventListener.Get(leagueRuleBtn).onClick = leagueRuleBtnClick;
	UIEventListener.Get(playBtn).onClick = playBtnClick;

	UIEventListener.Get(chipPlusBtn).onClick = chipPlusBtnClick;
	UIEventListener.Get(diamondPlusBtn).onClick = diamondPlusBtnClick;

	UIEventListener.Get(rankBtn).onClick = rankBtnClick;
	UIEventListener.Get(rewardBtn).onClick = rewardBtnClick;

	GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(PlayerPrefs.GetString("playerAvatar").ToString(), GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague/profileBar/playerProfile/imgPlayerAvatar"), false);

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotSeasonPlayer", gotSeasonPlayer);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotSeasonList", gotSeasonList);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotSeasonInfo", gotSeasonInfo);

}

function returnBtnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = false;

	//GameObject.Find("pnlRoot/pnlClub").GetComponent(clubController).getClubInfo();
}

function leagueRuleBtnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	var prefab: GameObject = Resources.Load("Prefabs/pnlTxtField", GameObject);
	var newPnl: GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
	newPnl.GetComponent(prefabPnlTxtField).prefabType = "league game rules";
	newPnl.GetComponent(prefabPnlTxtField).showUp();
}

function chipPlusBtnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = false;
	GameObject.Find("UI Root").GetComponent(enginepoker).menuBtnClick(0);
	GameObject.Find("UI Root/pnlRoot/pnlShop").GetComponent(shopController).sceneFlag = 1;
	GameObject.Find("UI Root/pnlRoot/pnlShop").GetComponent(shopController).chipsBtnClick();
}

function diamondPlusBtnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = false;
	GameObject.Find("UI Root").GetComponent(enginepoker).menuBtnClick(0);
	GameObject.Find("UI Root/pnlRoot/pnlShop").GetComponent(shopController).sceneFlag = 0;
	GameObject.Find("UI Root/pnlRoot/pnlShop").GetComponent(shopController).diamondsBtnClick();
}

function showUp() {
	//matching = false;
	rankShow = false;

	PlayerPrefs.SetString("season", "0");

	GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague/profileBar/playerProfile/lblName").GetComponent(UILabel).text = PlayerPrefs.GetString("playerName");
	GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague/profileBar/playerProfile/lblRank").GetComponent(UILabel).text = PlayerPrefs.GetString("playerRank");
	//GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague/lblProfileName/lblRank").GetComponent(UILabel).text = PlayerPrefs.GetString("playerSeasonRank");

	GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague/header/chips/lblValue").GetComponent(UILabel).text = PlayerPrefs.GetString("playerBank");
	GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague/header/diamonds/lblValue").GetComponent(UILabel).text = PlayerPrefs.GetString("playerGold");

	if (avatarChanged) {
		GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(PlayerPrefs.GetString("playerAvatar").ToString(), GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague/profileBar/playerProfile/imgPlayerAvatar"), false);
		avatarChanged = false;
	}

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);


	if (resultShow) {
		if (GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague/pnlGameResult(Clone)") == null) {
			var prefab: GameObject = Resources.Load("Prefabs/pnlGameResult", GameObject);
			var newPnl: GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
			//newPnl.GetComponent(prefabPnlGameResult).prefabType = "league game result";
			newPnl.GetComponent(prefabPnlGameResult).resultFlag = resultFlag;
			newPnl.GetComponent(prefabPnlGameResult).points = points;
			newPnl.GetComponent(prefabPnlGameResult).resultPoints = resultPoints;
			newPnl.GetComponent(prefabPnlGameResult).showUp();
		}

		GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague/profileBar/experience/lblLv").GetComponent(UILabel).text = "Lv. " + (1 + points / 100);

		var fillAmount: float = points % 100;
		fillAmount /= 100;

		GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague/profileBar/experience/progress").GetComponent(UISprite).fillAmount = fillAmount;

		resultShow = false;
	} else {
		usr.SetField("data", "&action=playerInfo&dealerId=" + PlayerPrefs.GetString("playerDealerId") + "&playerId=" + PlayerPrefs.GetString("playerId"));
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_season", usr);
	}

	rankBtnClick();
}

function rankBtnClick(){

	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();

	if (!rankShow) {
		rankShow = true;

		GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(rankPnl);
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(rewardPnl);

		GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague/bgLeagueTable/description/Label").GetComponent(UILabel).text = "Ranking";

		rankBtn.GetComponent(UISprite).spriteName = rankBtn.GetComponent(UISprite).spriteName.Replace("_off","_on");
		rewardBtn.GetComponent(UISprite).spriteName = rewardBtn.GetComponent(UISprite).spriteName.Replace("_on","_off");
	}

	for (var child : Transform in topTable.GetComponent(UIGrid).GetChildList()){
    	NGUITools.Destroy(child.gameObject);
	}

	usr.SetField("data", "&action=ranklist&dealerId=" + PlayerPrefs.GetString("playerDealerId"));
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_season", usr);
}

function rewardBtnClick(){

	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();

	if (rankShow) {
		rankShow = false;

		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(rankPnl);
		GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(rewardPnl);

		GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague/bgLeagueTable/description/Label").GetComponent(UILabel).text = "Rewards";

		rankBtn.GetComponent(UISprite).spriteName = rankBtn.GetComponent(UISprite).spriteName.Replace("_on","_off");
		rewardBtn.GetComponent(UISprite).spriteName = rewardBtn.GetComponent(UISprite).spriteName.Replace("_off","_on");
	}

	usr.SetField("data", "&action=gotSeasonInfo&dealerId=" + PlayerPrefs.GetString("playerDealerId"));
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_season", usr);
}

function gotSeasonPlayer(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotSeasonPlayer received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	try { 
		
		GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague/profileBar/experience/lblLv").GetComponent(UILabel).text = "Lv. " + (1 + parseInt(data["response"]["points"].ToString()) / 100);

		var fillAmount: float = (parseInt(data["response"]["points"].ToString()) % 100);
		fillAmount /= 100;

		GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague/profileBar/experience/progress").GetComponent(UISprite).fillAmount = fillAmount;

		
	} catch (err) {
		Debug.Log('Error in TRY');
	}
}

function gotSeasonList(e : SocketIO.SocketIOEvent) {
	
	Debug.Log("[SocketIO] gotSeasonList received: " + e.name + " " + e.data);

	/*
	for (var child : Transform in topTable.GetComponent(UIGrid).GetChildList()){
    	NGUITools.Destroy(child.gameObject);
	} */

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());

	try {
		if (data["response"].Count == 0) {

			GameObject.Find("UI Root").GetComponent(enginepoker).showPnlEmptyMsg("New season started, please enter!", 1, new Vector3(0, -50, 0), new Vector3(1.3, 1.3));

		} else {
			for (var i: int = 0; i < data["response"].Count; i++) {

				var prefab : GameObject = Resources.Load("Prefabs/leagueRow", GameObject);
				var newRow : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(topTable,prefab);

				newRow.transform.localScale = new Vector3(0.95, 0.95);

				if (i == 0) {
					newRow.transform.GetComponent(UISprite).spriteName = "league_gold";
					newRow.transform.Find("imgRank").GetComponent(UISprite).alpha = 1;
					newRow.transform.Find("imgRank").GetComponent(UISprite).spriteName = "rank1";
					newRow.transform.Find("lblRank").GetComponent(UILabel).text = "";
					
				} else if (i == 1) {
					newRow.transform.GetComponent(UISprite).spriteName = "league_silver";
					newRow.transform.Find("imgRank").GetComponent(UISprite).alpha = 1;
					newRow.transform.Find("imgRank").GetComponent(UISprite).spriteName = "rank2";
					newRow.transform.Find("lblRank").GetComponent(UILabel).text = "";
				} else if (i == 2) {
					newRow.transform.GetComponent(UISprite).spriteName = "league_bronze";
					newRow.transform.Find("imgRank").GetComponent(UISprite).alpha = 1;
					newRow.transform.Find("imgRank").GetComponent(UISprite).spriteName = "rank3";
					newRow.transform.Find("lblRank").GetComponent(UILabel).text = "";
				} else {
					newRow.transform.GetComponent(UISprite).spriteName = "league_normal";
					newRow.transform.Find("imgRank").GetComponent(UISprite).alpha = 0;
					newRow.transform.Find("lblRank").GetComponent(UILabel).text = (i + 1).ToString();
				}

				GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(data["response"][i]["playerAvatar"].ToString(), newRow.transform.Find("imgPlayerAvatar").gameObject, false);

				newRow.transform.Find("playerProfile/lblName").GetComponent(UILabel).text = data["response"][i]["playerName"].ToString();
				newRow.transform.Find("rank").GetComponent(UILabel).text = data["response"][i]["playerRank"].ToString();
				//newRow.transform.Find("experience/level").GetComponent(UILabel).text = data["response"][i]["seasonLevel"].ToString();
				//newRow.transform.Find("experience/points").GetComponent(UILabel).text = data["response"][i]["seasonPoints"].ToString();
				newRow.transform.Find("experience/level").GetComponent(UILabel).text = "Lv. " + (1 + parseInt(data["response"][i]["seasonPoints"].ToString()) / 100);

				var fillAmount: float = (parseInt(data["response"][i]["seasonPoints"].ToString()) % 100);
				fillAmount /= 100;

				newRow.transform.Find("experience/progress").GetComponent(UISprite).fillAmount = fillAmount;

			}

			topTable.GetComponent(UIGrid).Reposition();
		}

	} catch(e) {
		Debug.Log('err in data received');
	}
} 

function gotSeasonInfo(e : SocketIO.SocketIOEvent) {
	
	Debug.Log("[SocketIO] gotSeasonInfo received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());

	try {
		if (data['response']['msg'].ToString() == "") {
			
			rewardPnl.transform.Find("title").GetComponent(UILabel).text = data['response']['title'].ToString() + " (S" + data['response']['seasonNo'].ToString() + ")";
			rewardPnl.transform.Find("entryfee").GetComponent(UILabel).text = data['response']['entryFee'].ToString();
			rewardPnl.transform.Find("time1").GetComponent(UILabel).text = data['response']['startDate'].ToString();
			rewardPnl.transform.Find("time2").GetComponent(UILabel).text = data['response']['finishDate'].ToString();
			var txt = "";
			for(var row : LitJson.JsonData in data["response"]["info"]){
				if (row['positionFrom'].ToString() == row['positionTo'].ToString()) {
					txt += "RANK " + row['positionFrom'].ToString() + " REWARDS: " + row["winpotReward"].ToString() + " CHIPS + " + row["diamondReward"].ToString() + " DIAMONDS.\n";
				} else {
					txt += "RANK " + row['positionFrom'].ToString() + "-" + row['positionTo'].ToString() + " REWARDS: " + row["winpotReward"].ToString() + " CHIPS + " + row["diamondReward"].ToString() + " DIAMONDS.\n";
				}
			}
			rewardPnl.transform.Find("reward").GetComponent(UILabel).text = txt;

		} else {
			rewardPnl.transform.Find("title").GetComponent(UILabel).text = data['response']['msg'].ToString();
			rewardPnl.transform.Find("reward").GetComponent(UILabel).text = "";
			rewardPnl.transform.Find("entryfee").GetComponent(UILabel).text = "0";
			rewardPnl.transform.Find("time1").GetComponent(UILabel).text = "NULL";
			rewardPnl.transform.Find("time2").GetComponent(UILabel).text = "NULL";
		}

	} catch(e) {
		Debug.Log('err in data received');
	}
}

function playBtnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	if (GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague/pnlMatchWaiting(Clone)") == null) {
		var prefab: GameObject = Resources.Load("Prefabs/pnlMatchWaiting", GameObject);
		GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
	}
	//var newPnl: GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
	//newPnl.GetComponent(prefabPnlTxtField).prefabType = "league game rules";
	//newPnl.GetComponent(prefabPnlTxtField).showUp();
} 






