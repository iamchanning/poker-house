#pragma strict

var sceneFlag: int;

var processFlag: boolean = false;
var socketbind: boolean = false;

var btnReturn: GameObject;
var btnDetail: GameObject;
var btnEntries: GameObject;
var btnBlinds: GameObject;

var btnAction: GameObject;

var detailPnl: GameObject;
var entriesPnl: GameObject;
var blindsPnl: GameObject;

var entriesGrid: GameObject;
var blindsGrid: GameObject;

//Info
var tournamentId: int;
var tournamentName: String;
var maxPlayers: int;
var registeredPlayers: int;
var prizePool: int;
var buyIn: int;
var entryFee: int;
var startingChips: int;
var myGameId: String;
var myStatus: String;
var status: String;
var stakes: String;
var structureId: int;
var blindLevel: int;

var lateEntry: int;
var lateEntryStatus: int;
var lateEntryExpireMins: int;

var rebuys: int;
var rebuysStatus: int;
var rebuyPrice: int;
var rebuyChips: int;

var addOn: int;
var addOnChips: int;
var addOnPrice: int;

var registrationOpens: int;
var startTime: String;
var startIn: String;


private var usr: JSONObject;


function Start () {
	UIEventListener.Get(btnReturn).onClick = btnReturnClick;
	UIEventListener.Get(btnDetail).onClick = btnDetailClick;
	UIEventListener.Get(btnEntries).onClick = btnEntriesClick;
	UIEventListener.Get(btnBlinds).onClick = btnBlindsClick;
	UIEventListener.Get(btnAction).onClick = btnActionClick;


}

function unbindSocket() {
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Off("gotTnmEntries", gotTnmEntries);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Off("gotTnmBlinds", gotTnmBlinds);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Off("gotTnmRegister", gotTnmRegister);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Off("gotTnmUnRegister", gotTnmUnRegister);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Off("gotTnmRebuy", gotTnmRebuy);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Off("gotTnmInfo", gotTnmInfo);
}

function showUp(){

	if (!socketbind) {
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotTnmEntries", gotTnmEntries);
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotTnmBlinds", gotTnmBlinds);
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotTnmRegister", gotTnmRegister);
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotTnmUnRegister", gotTnmUnRegister);
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotTnmRebuy", gotTnmRebuy);
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotTnmInfo", gotTnmInfo);
		socketbind = true;
	}

	if (!usr) {
		usr = new JSONObject(JSONObject.Type.OBJECT);
		usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
		usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
		usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
		usr.AddField("data","");	
		usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);
	}

	if(status == "P" || status == "F") {
		gameObject.transform.Find("btnEntries/Label").GetComponent(UILabel).text = "Results";
	} else {
		gameObject.transform.Find("btnEntries/Label").GetComponent(UILabel).text = "Entries";
	}

	processFlag = false;

	detailPnl.transform.Find("name").GetComponent(UILabel).text = tournamentName;
	detailPnl.transform.Find("startTime").GetComponent(UILabel).text = startTime;
	detailPnl.transform.Find("startIn").GetComponent(UILabel).text = startIn;
	detailPnl.transform.Find("buyin").GetComponent(UILabel).text =  "($" + buyIn + " + $" + entryFee + ")";
	detailPnl.transform.Find("startChips").GetComponent(UILabel).text = "$" + startingChips;
	detailPnl.transform.Find("prizePool").GetComponent(UILabel).text = "$" + prizePool;
	detailPnl.transform.Find("entries").GetComponent(UILabel).text = registeredPlayers + "/" + ((maxPlayers == 0) ? "Unlimited" : "0");
	detailPnl.transform.Find("blindLvl").GetComponent(UILabel).text = "" + blindLevel;
	detailPnl.transform.Find("stakes").GetComponent(UILabel).text = stakes;

	detailPnl.transform.Find("lateRegister").GetComponent(UILabel).text = lateEntry ? ("In " + lateEntryExpireMins + " mins") : "Unavailable";
	detailPnl.transform.Find("rebuy").GetComponent(UILabel).text = rebuys ? ("$" + rebuyPrice + " = $" + rebuyChips) : "Unavailable";
	detailPnl.transform.Find("addon").GetComponent(UILabel).text = addOn ? ("$" + addOnPrice + " = $" + addOnChips) : "Unavailable";

	if (status == "R") {
		gameObject.transform.Find("btnAction").GetComponent(UISprite).alpha = 1;
		gameObject.transform.Find("btnAction").GetComponent(UISprite).color = myGameId ? Color.red : Color.green;
		gameObject.transform.Find("btnAction/Label").GetComponent(UILabel).text = myGameId ? "Unregister" : "Register";
	} else if (status == "P") {
		if (myGameId && parseInt(myGameId) > 0 && myStatus != "F") {
			gameObject.transform.Find("btnAction").GetComponent(UISprite).alpha = 1;
			gameObject.transform.Find("btnAction").GetComponent(UISprite).color = Color.blue;
			gameObject.transform.Find("btnAction/Label").GetComponent(UILabel).text = "Play";
		} else if (myGameId && parseInt(myGameId) < 0) {
			gameObject.transform.Find("btnAction").GetComponent(UISprite).alpha = 1;
			gameObject.transform.Find("btnAction").GetComponent(UISprite).color = Color.grey;
			gameObject.transform.Find("btnAction/Label").GetComponent(UILabel).text = "Waiting";
		} else if (myGameId == "" && lateEntry && lateEntryStatus) {
			gameObject.transform.Find("btnAction").GetComponent(UISprite).alpha = 1;
			gameObject.transform.Find("btnAction").GetComponent(UISprite).color = Color.green;
			gameObject.transform.Find("btnAction/Label").GetComponent(UILabel).text = "Register";
		} else if (myGameId && parseInt(myGameId) > 0 && myStatus == "F" && rebuys && rebuysStatus) {
			gameObject.transform.Find("btnAction").GetComponent(UISprite).alpha = 1;
			gameObject.transform.Find("btnAction").GetComponent(UISprite).color = Color.cyan;
			gameObject.transform.Find("btnAction/Label").GetComponent(UILabel).text = "Rebuy";
		} else {
			gameObject.transform.Find("btnAction").GetComponent(UISprite).alpha = 0;
			gameObject.transform.Find("btnAction/Label").GetComponent(UILabel).text = "";
		}
	} else {
		gameObject.transform.Find("btnAction").GetComponent(UISprite).alpha = 0;
		gameObject.transform.Find("btnAction/Label").GetComponent(UILabel).text = "";
	}

	CancelInvoke("refreshInvoke");
	InvokeRepeating("refreshInvoke", 10, 10F);
}

function btnReturnClick() {
	//GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;
	//NGUITools.Destroy(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	CancelInvoke("refreshInvoke");
	//unbindSocket();

	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);

	if(PlayerPrefs.GetString("clubId") == "0")
		GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLobby").GetComponent(lobbyScene).tnmBtnClick();
	else
		GameObject.Find("UI Root/pnlRoot/pnlClub/pnlClubGame").GetComponent(clubGameScene).showUp();
}

function btnDetailClick() {
	if (sceneFlag == 0)
		return;
	else {
		GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(detailPnl);
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(entriesPnl);
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(blindsPnl);

		sceneFlag = 0;
		btnDetail.GetComponent(UISprite).spriteName = "btnTab_on";
		btnEntries.GetComponent(UISprite).spriteName = "btnTab_off";
		btnBlinds.GetComponent(UISprite).spriteName = "btnTab_off";

		GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
		showUp();

		//usr.SetField("data", "&action=tnmInfo&tnmId=" + tournamentId);
		//GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);	
	}	
}
/*
function gotTnmInfo(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotTnmInfo received: " + e.name + " " + e.data);

	if (e) {
		var data = LitJson.JsonMapper.ToObject(e.data.ToString());
		try { 
			structureId = parseInt(data["response"]["tnmStructureId"].ToString());   //tnmPlayerMax    tnmNumEntries

			gameObject.Find("gameDetail/info1/name").GetComponent(UILabel).text = "Club: " + PlayerPrefs.GetString("clubName") + "\nTournament: " + data["response"]["tnmName"].ToString();
			gameObject.Find("gameDetail/info1/players").GetComponent(UILabel).text = "Total prize pool: " + parseInt(data["response"]["tnmNumEntries"].ToString()) * parseInt(data["response"]["tnmbuyIn"].ToString()) + "\nEntries: " 
																					+ data["response"]["tnmNumEntries"].ToString() + "/" + data["response"]["tnmPlayerMax"].ToString();
			gameObject.Find("gameDetail/info2/buyin").GetComponent(UILabel).text = "Buy-in: (" + data["response"]["tnmbuyIn"].ToString() + " + " + parseInt(data["response"]["tnmbuyIn"].ToString())/9 + ")";
			gameObject.Find("gameDetail/info2/startChips").GetComponent(UILabel).text = "Starting chips: " + data["response"]["tnmStartChips"].ToString();
			//gameObject.Find("gameDetail/info2/blindup").GetComponent(UILabel).text = "Blinds up: " + compute_blindupTime() + " min";
 			
 		} catch (err) {
 			Debug.Log('Error in TRY');
		}
		
	} else {
		Debug.Log('Empty data');
	}
} */

function btnEntriesClick() {
	if (sceneFlag == 1)
		return;
	else {
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(detailPnl);
		GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(entriesPnl);
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(blindsPnl);

		sceneFlag = 1;
		btnDetail.GetComponent(UISprite).spriteName = "btnTab_off";
		btnEntries.GetComponent(UISprite).spriteName = "btnTab_on";
		btnBlinds.GetComponent(UISprite).spriteName = "btnTab_off";

		GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();

		usr.SetField("data", "&action=entries&tnmId=" + tournamentId);
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_tournament", usr);	
	}
}

function gotTnmEntries(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotTnmEntries received: " + e.name + " " + e.data);

	for (var child : Transform in entriesGrid.GetComponent(UIGrid).GetChildList()){
    	NGUITools.Destroy(child.gameObject);
	}
	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	 
	try {
		if (data["response"].Count == 0) {

			GameObject.Find("UI Root").GetComponent(enginepoker).showPnlEmptyMsg("Nobody register yet!", 1, new Vector3(0, -30, 0), new Vector3(1.2, 1.2));

		} else {
			for(var grid : LitJson.JsonData in data["response"]){
				
				var prefab : GameObject = Resources.Load("Prefabs/tnmEntryRow", GameObject);
				var newRow : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(entriesGrid,prefab);

				newRow.transform.localScale = new Vector3(0.95, 0.95);


				GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(grid["tnmplayerAvatar"].ToString(), newRow.transform.Find("imgPlayerAvatar").gameObject, false);
				newRow.transform.Find("playerName").GetComponent(UILabel).text = grid["tnmPlayerName"].ToString();
				newRow.transform.Find("playerPosition").GetComponent(UILabel).text = "";
				if(status == "R")
					newRow.transform.Find("playerStatus").GetComponent(UILabel).text = "Registered";

				if(status == "P")
					newRow.transform.Find("playerStatus").GetComponent(UILabel).text = "Playing";

				if(status == "F") {
					newRow.transform.Find("playerStatus").GetComponent(UILabel).text = GameObject.Find("UI Root").GetComponent(enginepoker).CurrencyFormat(parseFloat(grid["tnmWinPot"].ToString()));
					newRow.transform.Find("playerPosition").GetComponent(UILabel).text = GameObject.Find("UI Root").GetComponent(enginepoker).ranking(parseInt(grid["tnmPosition"].ToString()));
				}
			}

			entriesGrid.GetComponent(UIGrid).Reposition();
		}
		
	} catch(e) {
		Debug.Log('err in data received ' + e);
	}
} 

function btnBlindsClick() {
	if (sceneFlag == 2)
		return;
	else {
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(detailPnl);
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(entriesPnl);
		GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(blindsPnl);

		sceneFlag = 2;
		btnDetail.GetComponent(UISprite).spriteName = "btnTab_off";
		btnEntries.GetComponent(UISprite).spriteName = "btnTab_off";
		btnBlinds.GetComponent(UISprite).spriteName = "btnTab_on";

    	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg(); 

		usr.SetField("data", "&action=blindsInfo&structureId=" + structureId);
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_tournament", usr);

		/*
		if (structureId/12 == 0)
			gameObject.Find("gameBlinds/title/type").GetComponent(UILabel).text = "Standard";
		else 
			gameObject.Find("gameBlinds/title/type").GetComponent(UILabel).text = "Turbo";
		*/
	}
}

function gotTnmBlinds(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotTnmBlinds received: " + e.name + " " + e.data);

	for (var child : Transform in blindsGrid.GetComponent(UIGrid).GetChildList()){
    	NGUITools.Destroy(child.gameObject);
	} 

	var totalMins = 0;
	var lastBlindMins = 0;

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	 
	try {

		for(var grid : LitJson.JsonData in data["response"]){
			
			var prefab : GameObject = Resources.Load("Prefabs/blindRow", GameObject);
			var newRow : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(blindsGrid,prefab);

			newRow.transform.localScale = new Vector3(0.95, 0.95);
			
			newRow.transform.Find("level").GetComponent(UILabel).text = grid["blindLvl"].ToString();
			newRow.transform.Find("sb").GetComponent(UILabel).text = grid["blindsb"].ToString();
			newRow.transform.Find("bb").GetComponent(UILabel).text = grid["blindbb"].ToString();

			if(totalMins == 0) {
				totalMins = parseInt(grid["blindmins"].ToString());
				lastBlindMins = totalMins;
				newRow.transform.Find("mins").GetComponent(UILabel).text = grid["blindmins"].ToString() + " mins";
			} else {
				totalMins += parseInt(grid["blindmins"].ToString());
				newRow.transform.Find("mins").GetComponent(UILabel).text = (parseInt(grid["blindmins"].ToString()) - lastBlindMins).ToString() + " mins";
				lastBlindMins = parseInt(grid["blindmins"].ToString());
			}
		}

		blindsGrid.GetComponent(UIGrid).Reposition();
		
	} catch(e) {
		Debug.Log('err in data received ' + e);
	}
} 

function btnActionClick() {

	if (processFlag)
		return;

	processFlag = true;

	switch(gameObject.transform.Find("btnAction/Label").GetComponent(UILabel).text) {
		case "Register": 
			usr.SetField("data", "&action=register&tnmId=" + tournamentId + "&playerId=" + PlayerPrefs.GetString("playerId") + "&clubId=" + PlayerPrefs.GetString("clubId")); break;
		case "Unregister":
			usr.SetField("data", "&action=unregister&tnmId=" + tournamentId + "&playerId=" + PlayerPrefs.GetString("playerId") + "&clubId=" + PlayerPrefs.GetString("clubId")); break;
		case "Play":
			PlayerPrefs.SetString("gameID", myGameId);
			PlayerPrefs.SetString("seats", "9");

			if (addOn) {
				PlayerPrefs.SetInt("addOnChips", addOnChips);
				PlayerPrefs.SetInt("addOnPrice", addOnPrice);
			}

			GameObject.Find("UI Root").GetComponent(enginepoker).enablePokerTable();
			GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;
			btnReturnClick();
			break;
		case "Rebuy":
			usr.SetField("data", "&action=rebuy&tnmId=" + tournamentId + "&playerId=" + PlayerPrefs.GetString("playerId") + "&clubId=" + PlayerPrefs.GetString("clubId")); break;
			break;
		case "Waiting":
			break;
	}

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_tournament", usr);	
}


function gotTnmRegister(e: SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotTnmRegister received: " + e.name + " " + e.data);

	processFlag = false;

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	try { 
		if(data["response"]["title"].ToString() == "Registration Successful") {
			/*
			if (data["response"]["lateEntry"].ToString() == "0") {
				gameObject.transform.Find("btnAction").GetComponent(UISprite).alpha = 1;
				gameObject.transform.Find("btnAction").GetComponent(UISprite).color = Color.red;
				gameObject.transform.Find("btnAction/Label").GetComponent(UILabel).text = "Unregister";
			} else {
				gameObject.transform.Find("btnAction").GetComponent(UISprite).alpha = 1;
				gameObject.transform.Find("btnAction").GetComponent(UISprite).color = Color.grey;
				gameObject.transform.Find("btnAction/Label").GetComponent(UILabel).text = "Waiting";
			} */
			if (status == "R") {
				gameObject.transform.Find("btnAction").GetComponent(UISprite).alpha = 1;
				gameObject.transform.Find("btnAction").GetComponent(UISprite).color = Color.red;
				gameObject.transform.Find("btnAction/Label").GetComponent(UILabel).text = "Unregister";
			} else if (status == "P") {
				gameObject.transform.Find("btnAction").GetComponent(UISprite).alpha = 1;
				gameObject.transform.Find("btnAction").GetComponent(UISprite).color = Color.grey;
				gameObject.transform.Find("btnAction/Label").GetComponent(UILabel).text = "Waiting";
			}
		} 
		GameObject.Find("UI Root").GetComponent(enginepoker).showNotify(data["response"]["msg"].ToString());
	} catch (err) {
		Debug.Log('Error in TRY');
	}
}

function gotTnmUnRegister(e: SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotTnmUnRegister received: " + e.name + " " + e.data);

	processFlag = false;

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	try {
		if(data["response"]["title"].ToString() == "Unregister Successful") {
			/*
			if (data["response"]["expired"].ToString() == "0") {
				gameObject.transform.Find("btnAction").GetComponent(UISprite).alpha = 1;
				gameObject.transform.Find("btnAction").GetComponent(UISprite).color = Color.green;
				gameObject.transform.Find("btnAction/Label").GetComponent(UILabel).text = "Register";
			} else {
				gameObject.transform.Find("btnAction").GetComponent(UISprite).alpha = 0;
				gameObject.transform.Find("btnAction/Label").GetComponent(UILabel).text = "";
			} */
			if (status == "R") {
				gameObject.transform.Find("btnAction").GetComponent(UISprite).alpha = 1;
				gameObject.transform.Find("btnAction").GetComponent(UISprite).color = Color.green;
				gameObject.transform.Find("btnAction/Label").GetComponent(UILabel).text = "Register";
			} else {
				gameObject.transform.Find("btnAction").GetComponent(UISprite).alpha = 0;
				gameObject.transform.Find("btnAction/Label").GetComponent(UILabel).text = "";
			}
		} 
		GameObject.Find("UI Root").GetComponent(enginepoker).showNotify(data["response"]["msg"].ToString());
	} catch (err) {
		Debug.Log('Error in TRY');
	}
}

function gotTnmRebuy(e: SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotTnmRebuy received: " + e.name + " " + e.data);

	processFlag = false;

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	try { 
		if(data["msg"].ToString() == "") {
			gameObject.transform.Find("btnAction").GetComponent(UISprite).alpha = 1;
			gameObject.transform.Find("btnAction").GetComponent(UISprite).color = Color.grey;
			gameObject.transform.Find("btnAction/Label").GetComponent(UILabel).text = "Waiting";
		} else {
			GameObject.Find("UI Root").GetComponent(enginepoker).showNotify(data["msg"].ToString());
		}
	} catch (err) {
		Debug.Log('Error in TRY');
	}
}

function gotTnmInfo(e : SocketIO.SocketIOEvent) {

	Debug.Log("[SocketIO] gotTnmInfo received: " + e.name + " " + e.data);


	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	 
	try {
		for(var grid : LitJson.JsonData in data["response"]){

			tournamentId = parseInt(grid["tnmId"].ToString());
			tournamentName = grid["tnmName"].ToString();
			maxPlayers = parseInt(grid["maxPlayers"].ToString());
			registeredPlayers = parseInt(grid["registeredPlayers"].ToString());
			prizePool = parseInt(grid["prizePool"].ToString());
			buyIn = parseInt(grid["buyIn"].ToString());
			entryFee = parseInt(grid["entryFee"].ToString());
			startingChips = parseInt(grid["startingChips"].ToString());
			stakes = grid["stakes"].ToString();
			status =  grid["status"].ToString();
			myGameId = grid["myGameId"].ToString();
			myStatus = grid["myStatus"].ToString();
			structureId = parseInt(grid["structureId"].ToString());
			blindLevel = parseInt(grid["currentLevel"].ToString());

			lateEntry = parseInt(grid["lateEntry"].ToString());
			lateEntryStatus = parseInt(grid["lateEntryStatus"].ToString());
			lateEntryExpireMins = parseInt(grid["lateEntryExpireMins"].ToString());

			rebuys = parseInt(grid["rebuys"].ToString());
			rebuysStatus = parseInt(grid["rebuysStatus"].ToString());
			rebuyPrice = parseInt(grid["rebuyPrice"].ToString());
			rebuyChips = parseInt(grid["rebuyChips"].ToString());

			addOn = parseInt(grid["addOn"].ToString());
			addOnPrice = parseInt(grid["addOnPrice"].ToString());
			addOnChips = parseInt(grid["addOnChips"].ToString());

			registrationOpens = parseInt(grid["registrationOpens"].ToString());
			startTime = grid["timeLabel"].ToString();

			showUp();
		}

	} catch(e) {
		Debug.Log('err in data received');
	}
} 

function refreshInvoke() {

	usr.SetField("data", "&action=Info&clubId=" + PlayerPrefs.GetString("clubId") + "&dealerId=" + PlayerPrefs.GetString("playerDealerId") + "&tnmId=" + tournamentId);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_tournament", usr);
}

/*

function compute_blindupTime() {
	var time: int = 0;
	switch (structureId % 12) {
		case 1: time = 2; break;
		case 2: time = 3; break;
		case 3: time = 4; break;
		case 4: time = 5; break;
		case 5: time = 6; break;
		case 6: time = 7; break;
		case 7: time = 8; break;
		case 8: time = 10; break;
		case 9: time = 12; break;
		case 10: time = 15; break;
		case 11: time = 20; break;
		case 0: time = 30; break;
	}
	return time;
}
*/

