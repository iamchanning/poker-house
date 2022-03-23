#pragma strict

var tableScene: GameObject;
var tnmInfoScene: GameObject;

var rgPnl: GameObject;
var tnmPnl: GameObject;

var btnRg: GameObject;
var btnTnm: GameObject;

var btnReturn: GameObject;
var chipPlusBtn: GameObject;
var diamondPlusBtn: GameObject;

var rgTable: GameObject;
var tnmTable: GameObject;

private var usr: JSONObject;

var rgShow: boolean;

function Start () {
	UIEventListener.Get(btnReturn).onClick = btnReturnClick;
	UIEventListener.Get(chipPlusBtn).onClick = chipPlusBtnClick;
	UIEventListener.Get(diamondPlusBtn).onClick = diamondPlusBtnClick;

	UIEventListener.Get(btnRg).onClick = rgBtnClick;
	UIEventListener.Get(btnTnm).onClick = tnmBtnClick;

	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(tnmInfoScene);

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotLobby", gotLobby);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotAllTnmInfo", gotAllTnmInfo);
}


function showUp() {
	GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLobby/header/pinRight/chips/lblShopChips").GetComponent(UILabel).text = PlayerPrefs.GetString("playerBank");
	GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLobby/header/pinRight/diamonds/lblShopDiamonds").GetComponent(UILabel).text = PlayerPrefs.GetString("playerGold");

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);

	rgShow = false;

	rgBtnClick();
}

function rgBtnClick(){

	if (!rgShow) {
		rgShow = true;

		GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(rgPnl);
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(tnmPnl);

		btnRg.GetComponent(UISprite).spriteName = btnRg.GetComponent(UISprite).spriteName.Replace("_off","_on");
		btnTnm.GetComponent(UISprite).spriteName = btnTnm.GetComponent(UISprite).spriteName.Replace("_on","_off");
	}

	CancelInvoke("rgInvoke");
	CancelInvoke("tnmInvoke");
	InvokeRepeating("rgInvoke", 0, 10F);

	/*
	for (var child : Transform in rgTable.GetComponent(UIGrid).GetChildList()){
    	NGUITools.Destroy(child.gameObject);
	} */
	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();

	/*
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_lobby", usr);
	*/
}

function tnmBtnClick(){

	if (rgShow) {
		rgShow = false;

		GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(tnmPnl);
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(rgPnl);

		btnRg.GetComponent(UISprite).spriteName = btnRg.GetComponent(UISprite).spriteName.Replace("_on","_off");
		btnTnm.GetComponent(UISprite).spriteName = btnTnm.GetComponent(UISprite).spriteName.Replace("_off","_on");
	}

	CancelInvoke("rgInvoke");
	CancelInvoke("tnmInvoke");
	InvokeRepeating("tnmInvoke", 0, 10F);

	/*
	for (var child : Transform in tnmTable.GetComponent(UIGrid).GetChildList()){
    	NGUITools.Destroy(child.gameObject);
	} */
	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();

	/*
	usr.SetField("data", "&action=Info&clubId=0&dealerId=" + PlayerPrefs.GetString("playerDealerId"));
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_tournament", usr);
	*/
}

function btnReturnClick() {

	CancelInvoke("rgInvoke");
	CancelInvoke("tnmInvoke");

	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = false;
}

function chipPlusBtnClick() {
	CancelInvoke("rgInvoke");
	CancelInvoke("tnmInvoke");

	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = false;
	GameObject.Find("UI Root").GetComponent(enginepoker).menuBtnClick(0);
	GameObject.Find("UI Root/pnlRoot/pnlShop").GetComponent(shopController).sceneFlag = 1;
	GameObject.Find("UI Root/pnlRoot/pnlShop").GetComponent(shopController).chipsBtnClick();
}

function diamondPlusBtnClick() {

	CancelInvoke("rgInvoke");
	CancelInvoke("tnmInvoke");

	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = false;
	GameObject.Find("UI Root").GetComponent(enginepoker).menuBtnClick(0);
	GameObject.Find("UI Root/pnlRoot/pnlShop").GetComponent(shopController).sceneFlag = 0;
	GameObject.Find("UI Root/pnlRoot/pnlShop").GetComponent(shopController).diamondsBtnClick();
}

function gotLobby(e : SocketIO.SocketIOEvent) {

	Debug.Log("[SocketIO] gotLobby received: " + e.name + " " + e.data);

	for (var child : Transform in rgTable.GetComponent(UIGrid).GetChildList()){
    	NGUITools.Destroy(child.gameObject);
	} 

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
		 
	try {
		if (data["response"].Count == 0) {

			GameObject.Find("UI Root").GetComponent(enginepoker).showPnlEmptyMsg("No ring games yet!", 1, new Vector3(0, -50, 0), new Vector3(1.5, 1.5));

		} else {
			for(var grid : LitJson.JsonData in data["response"]){
				
				var prefab : GameObject = Resources.Load("Prefabs/ringGameRow", GameObject);
				var newRow : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(rgTable,prefab);

				newRow.transform.GetComponent(gridRow).gameId = parseInt(grid["gameID"].ToString());
				newRow.transform.GetComponent(gridRow).seats = parseInt(grid["seats"].ToString());
				//newRow.transform.GetComponent(gridRow).socketSpeed = parseFloat(grid["socketSpeed"].ToString());

				newRow.transform.localScale = new Vector3(0.95, 0.95);
				newRow.transform.Find("lblname").GetComponent(UILabel).text = grid["tablename"].ToString();
				newRow.transform.Find("lblplayer").GetComponent(UILabel).text = grid["seatsTaken"].ToString() + "/" + grid["seats"].ToString();
				newRow.transform.Find("lblstake").GetComponent(UILabel).text = grid["sb"].ToString() + "/" + grid["bb"].ToString();
				newRow.transform.Find("chips/lblminBuyin").GetComponent(UILabel).text = grid["tablelow"].ToString();
			
				UIEventListener.Get(newRow).onClick = joinRg;
			}

			rgTable.GetComponent(UIGrid).Reposition();
		}	
	} catch(e) {
		Debug.Log('err in data received');
	}
} 

function joinRg(item: GameObject) {

	CancelInvoke("rgInvoke");
	CancelInvoke("tnmInvoke");

	PlayerPrefs.SetString("gameID", item.GetComponent(gridRow).gameId.ToString());
	PlayerPrefs.SetString("seats", item.GetComponent(gridRow).seats.ToString());
	//PlayerPrefs.SetFloat ("socketSpeed", item.GetComponent(gridRow).socketSpeed);

	GameObject.Find("UI Root").GetComponent(enginepoker).enablePokerTable();
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;
}


function gotAllTnmInfo(e : SocketIO.SocketIOEvent) {

	Debug.Log("[SocketIO] gotAllTnmInfo received: " + e.name + " " + e.data);

	for (var child : Transform in tnmTable.GetComponent(UIGrid).GetChildList()){
    	NGUITools.Destroy(child.gameObject);
	} 

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	 
	try {
		if (data["response"].Count == 0) {

			GameObject.Find("UI Root").GetComponent(enginepoker).showPnlEmptyMsg("Tournaments are not announced yet!", 1, new Vector3(0, -50, 0), new Vector3(1.5, 1.5));

		} else {
			for(var grid : LitJson.JsonData in data["response"]){

				if(grid["status"].ToString() == 'C')
					continue;
				
				var prefab : GameObject = Resources.Load("Prefabs/tournamentRow", GameObject);
				var newRow : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(tnmTable,prefab);

				newRow.transform.GetComponent(gridRow).tournamentId = parseInt(grid["tnmId"].ToString());
				newRow.transform.GetComponent(gridRow).tournamentName = grid["tnmName"].ToString();
				newRow.transform.GetComponent(gridRow).maxPlayers = parseInt(grid["maxPlayers"].ToString());
				newRow.transform.GetComponent(gridRow).registeredPlayers = parseInt(grid["registeredPlayers"].ToString());
				newRow.transform.GetComponent(gridRow).prizePool = parseInt(grid["prizePool"].ToString());
				newRow.transform.GetComponent(gridRow).buyIn = parseInt(grid["buyIn"].ToString());
				newRow.transform.GetComponent(gridRow).entryFee = parseInt(grid["entryFee"].ToString());
				newRow.transform.GetComponent(gridRow).startingChips = parseInt(grid["startingChips"].ToString());
				newRow.transform.GetComponent(gridRow).myGameId = grid["myGameId"].ToString();
				newRow.transform.GetComponent(gridRow).myStatus = grid["myStatus"].ToString();
				newRow.transform.GetComponent(gridRow).status = grid["status"].ToString();
				newRow.transform.GetComponent(gridRow).stakes = grid["stakes"].ToString();
				newRow.transform.GetComponent(gridRow).structureId = parseInt(grid["structureId"].ToString());
				newRow.transform.GetComponent(gridRow).blindLevel = parseInt(grid["currentLevel"].ToString());

				newRow.transform.GetComponent(gridRow).lateEntry = parseInt(grid["lateEntry"].ToString());
				newRow.transform.GetComponent(gridRow).lateEntryStatus = parseInt(grid["lateEntryStatus"].ToString());
				newRow.transform.GetComponent(gridRow).lateEntry = parseInt(grid["lateEntryExpireMins"].ToString());

				newRow.transform.GetComponent(gridRow).rebuys = parseInt(grid["rebuys"].ToString());
				newRow.transform.GetComponent(gridRow).rebuysStatus = parseInt(grid["rebuysStatus"].ToString());
				newRow.transform.GetComponent(gridRow).rebuyPrice = parseInt(grid["rebuyPrice"].ToString());
				newRow.transform.GetComponent(gridRow).rebuyChips = parseInt(grid["rebuyChips"].ToString());

				newRow.transform.GetComponent(gridRow).addOn = parseInt(grid["addOn"].ToString());
				newRow.transform.GetComponent(gridRow).addOnChips = parseInt(grid["addOnChips"].ToString());
				newRow.transform.GetComponent(gridRow).addOnPrice = parseInt(grid["addOnPrice"].ToString());

				newRow.transform.GetComponent(gridRow).registrationOpens = parseInt(grid["registrationOpens"].ToString());
				newRow.transform.GetComponent(gridRow).startTime = grid["timeLabel"].ToString();
				newRow.transform.GetComponent(gridRow).startIn = grid["strStartsIn"].ToString();

				newRow.transform.localScale = new Vector3(0.95, 0.95);
				newRow.transform.Find("lblname").GetComponent(UILabel).text = grid["tnmName"].ToString();
				newRow.transform.Find("lblplayer").GetComponent(UILabel).text = grid["registeredPlayers"].ToString() + "/" + grid["maxPlayers"].ToString();
				newRow.transform.Find("lblstake").GetComponent(UILabel).text = grid["stakes"].ToString();
				newRow.transform.Find("chips/lblminBuyin").GetComponent(UILabel).text = grid["buyIn"].ToString();
				newRow.transform.Find("lbltimeLabel").GetComponent(UILabel).text = grid["timeLabel"].ToString();
				newRow.transform.Find("lblstartIn").GetComponent(UILabel).text = grid["strStartsIn"].ToString();

				switch(grid["status"].ToString()) {
					case 'A': 
						newRow.transform.Find("lblstatus").GetComponent(UILabel).text = "Announced";
						break;
					case 'F': 
						newRow.transform.Find("lblstatus").GetComponent(UILabel).text = "Finished"; 
						break;
					case 'R': 
						newRow.transform.Find("lblstatus").GetComponent(UILabel).text = "Open"; 
						break;
					case 'P': 
						newRow.transform.Find("lblstatus").GetComponent(UILabel).text = "Running"; 
						break;
				}

				newRow.transform.Find("lblregister").GetComponent(UILabel).text = grid["myGameId"].ToString() ? "Registered" : "";

				UIEventListener.Get(newRow).onClick = tnmInfo;
			}

			tnmTable.GetComponent(UIGrid).Reposition(); 
		}
	} catch(e) {
		Debug.Log('err in data received');
	}
} 

function tnmInfo(item: GameObject) {

	CancelInvoke("rgInvoke");
	CancelInvoke("tnmInvoke");
	//GameObject.Find("UI Root").GetComponent(enginepoker).socket.Off("gotTnmInfo", gotTnmInfo);

	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(tnmInfoScene); 
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;
	/*
	var prefab: GameObject = Resources.Load("Prefabs/pnlTnmInfo", GameObject);
	var newPnl: GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab); 
	*/

	tnmInfoScene.GetComponent(tournamentInfoScene).tournamentId = item.GetComponent(gridRow).tournamentId;
	tnmInfoScene.GetComponent(tournamentInfoScene).tournamentName = item.GetComponent(gridRow).tournamentName;
	tnmInfoScene.GetComponent(tournamentInfoScene).maxPlayers = item.GetComponent(gridRow).maxPlayers;
	tnmInfoScene.GetComponent(tournamentInfoScene).registeredPlayers = item.GetComponent(gridRow).registeredPlayers;
	tnmInfoScene.GetComponent(tournamentInfoScene).prizePool = item.GetComponent(gridRow).prizePool;
	tnmInfoScene.GetComponent(tournamentInfoScene).buyIn = item.GetComponent(gridRow).buyIn;
	tnmInfoScene.GetComponent(tournamentInfoScene).entryFee = item.GetComponent(gridRow).entryFee;
	tnmInfoScene.GetComponent(tournamentInfoScene).startingChips = item.GetComponent(gridRow).startingChips;
	tnmInfoScene.GetComponent(tournamentInfoScene).stakes = item.GetComponent(gridRow).stakes;
	tnmInfoScene.GetComponent(tournamentInfoScene).status = item.GetComponent(gridRow).status;
	tnmInfoScene.GetComponent(tournamentInfoScene).myGameId = item.GetComponent(gridRow).myGameId;
	tnmInfoScene.GetComponent(tournamentInfoScene).myStatus = item.GetComponent(gridRow).myStatus;
	tnmInfoScene.GetComponent(tournamentInfoScene).structureId = item.GetComponent(gridRow).structureId;
	tnmInfoScene.GetComponent(tournamentInfoScene).blindLevel = item.GetComponent(gridRow).blindLevel;

	tnmInfoScene.GetComponent(tournamentInfoScene).lateEntry = item.GetComponent(gridRow).lateEntry;
	tnmInfoScene.GetComponent(tournamentInfoScene).lateEntryStatus = item.GetComponent(gridRow).lateEntryStatus;
	tnmInfoScene.GetComponent(tournamentInfoScene).lateEntry = item.GetComponent(gridRow).lateEntryExpireMins;

	tnmInfoScene.GetComponent(tournamentInfoScene).rebuys = item.GetComponent(gridRow).rebuys;
	tnmInfoScene.GetComponent(tournamentInfoScene).rebuysStatus = item.GetComponent(gridRow).rebuysStatus;
	tnmInfoScene.GetComponent(tournamentInfoScene).rebuyPrice = item.GetComponent(gridRow).rebuyPrice;
	tnmInfoScene.GetComponent(tournamentInfoScene).rebuyChips = item.GetComponent(gridRow).rebuyChips;

	tnmInfoScene.GetComponent(tournamentInfoScene).addOn = item.GetComponent(gridRow).addOn;
	tnmInfoScene.GetComponent(tournamentInfoScene).addOnChips = item.GetComponent(gridRow).addOnChips;
	tnmInfoScene.GetComponent(tournamentInfoScene).addOnPrice = item.GetComponent(gridRow).addOnPrice;

	tnmInfoScene.GetComponent(tournamentInfoScene).registrationOpens = item.GetComponent(gridRow).registrationOpens;
	tnmInfoScene.GetComponent(tournamentInfoScene).startTime = item.GetComponent(gridRow).startTime;
	tnmInfoScene.GetComponent(tournamentInfoScene).startIn = item.GetComponent(gridRow).startIn;

	tnmInfoScene.GetComponent(tournamentInfoScene).sceneFlag = -1;
	tnmInfoScene.GetComponent(tournamentInfoScene).btnDetailClick();
	
}

function rgInvoke() {

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_lobby", usr);
}

function tnmInvoke() {
	

	usr.SetField("data", "&action=Info&clubId=0&dealerId=" + PlayerPrefs.GetString("playerDealerId"));
	//usr.SetField("data", "&action=Info&clubId=0&dealerId=74");
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_tournament", usr);
}
