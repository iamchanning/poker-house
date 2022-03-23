#pragma strict

var returnBtn: GameObject;
var clubdetailBtn: GameObject;
var counterBtn: GameObject;
var clubRatingBtn: GameObject;

var detailScene: GameObject;
var counter: GameObject;
var newTableScene: GameObject;
var gameInfoScene: GameObject;
var tableScene: GameObject;
var tnmInfoScene: GameObject;
var ratingScene: GameObject;

var uiGrid: GameObject;

private var usr: JSONObject;

function Start () {

	UIEventListener.Get(returnBtn).onClick = returnBtnClick;
	UIEventListener.Get(clubdetailBtn).onClick = clubdetailBtnClick;
	UIEventListener.Get(counterBtn).onClick = counterClick;


	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotClubTables", gotClubTables);

	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(detailScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(counter);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(newTableScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameInfoScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(tnmInfoScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(ratingScene);

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("data","");
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);
}


function returnBtnClick() {
	CancelInvoke("tableRefresh");

	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = false;

	GameObject.Find("pnlRoot/pnlClub").GetComponent(clubController).getClubInfo();
}

function clubdetailBtnClick() {
	CancelInvoke("tableRefresh");

	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(detailScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

	detailScene.GetComponent(clubDetailScene).showUp();
}

function showUp() {
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotTnmInfo", gotTnmInfo);
	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();

	GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(PlayerPrefs.GetString("clubAvatar"), gameObject.transform.Find("btnClubItem/imgClubAvatar").gameObject, true);
	
	gameObject.transform.Find("btnClubItem/lblclubName").GetComponent(UILabel).text = PlayerPrefs.GetString("clubName");
	gameObject.transform.Find("bgItem/lblClubIntro").GetComponent(UILabel).text = PlayerPrefs.GetString("clubNotice");
	gameObject.transform.Find("btnClubItem/personBalance/lblChips").GetComponent(UILabel).text = PlayerPrefs.GetString("clubPersonChips");

	for (var i : int = 0; i < 5; i++) {
		if (i < parseInt(PlayerPrefs.GetString("clubRating")))
			gameObject.Find("SelectClubStar" + i.ToString()).GetComponent(UISprite).spriteName = "star_on";
		else 
			gameObject.Find("SelectClubStar" + i.ToString()).GetComponent(UISprite).spriteName = "star_off";
	}

	if (parseInt(PlayerPrefs.GetString("clubAdmin")) == 1 || parseInt(PlayerPrefs.GetString("clubManager")) == 1) {

		if (parseInt(PlayerPrefs.GetString("clubAdmin")) == 1) {
			UIEventListener.Get(clubRatingBtn).onClick = clubRatingBtnClick;
		}

		gameObject.transform.Find("btnCounter").GetComponent(UIButton).isEnabled = true;
		gameObject.transform.Find("btnClubItem/clubBalance").GetComponent(UISprite).alpha = 1;
		gameObject.transform.Find("btnClubItem/clubBalance/lblClubChips").GetComponent(UILabel).text = PlayerPrefs.GetString("clubChips");

	} else {
		gameObject.transform.Find("btnCounter").GetComponent(UIButton).isEnabled = false;
		gameObject.transform.Find("btnClubItem/clubBalance").GetComponent(UISprite).alpha = 0;
	}

	CancelInvoke("tableRefresh");
	InvokeRepeating("tableRefresh", 0, 10F);

	/*
	for (var child : Transform in uiGrid.GetComponent(UIGrid).GetChildList()){
        NGUITools.Destroy(child.gameObject);
    }

	usr.SetField("data", "&action=clubTable&id=" + PlayerPrefs.GetString("clubId"));
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);
	*/
}

function counterClick() {

	CancelInvoke("tableRefresh");

	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(counter);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

	counter.GetComponent(counterScene).tradeBtnClick();
}


function gotClubTables(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotClubTables received: " + e.name + " " + e.data);

	var prefabNew : GameObject = Resources.Load("Prefabs/clubNewTable", GameObject);
	//var prefabN : GameObject = Resources.Load("Prefabs/clubNormalTable", GameObject);
	//var prefabT : GameObject = Resources.Load("Prefabs/clubTnmTable", GameObject);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	 
	try {

		for (var child : Transform in uiGrid.GetComponent(UIGrid).GetChildList()){
	        NGUITools.Destroy(child.gameObject);
	    }

		if (parseInt(PlayerPrefs.GetString("clubAdmin")) == 1 || parseInt(PlayerPrefs.GetString("clubManager")) == 1) {
			var newTable : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(uiGrid,prefabNew);
			UIEventListener.Get(newTable).onClick = newClubTable;
		} else {
			if (data["response"].Count == 0) {
				GameObject.Find("UI Root").GetComponent(enginepoker).showPnlEmptyMsg("Your club is too lazy to start a game!", 1, new Vector3(0, -175, 0), new Vector3(1.3, 1.3));
			}
		}

		for(var grid : LitJson.JsonData in data["response"]){
			
			var prefab : GameObject; 
			var newRow : GameObject; 


			if (parseInt(grid["clubTableTntId"].ToString()) == 0) {
				prefab = Resources.Load("Prefabs/clubNormalTable", GameObject);
				newRow = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(uiGrid,prefab);

				newRow.transform.localScale = new Vector3(0.95, 0.95);

				newRow.transform.Find("gameName").GetComponent(UILabel).text = grid["clubTableName"].ToString();
				newRow.transform.Find("info/boardlabel2").GetComponent(UILabel).text = grid["clubTableSeatsTaken"].ToString() + "/" + grid["clubTableSeats"].ToString();
				newRow.transform.GetComponent(gridRow).gameId = parseInt(grid["clubTableGameId"].ToString());
				newRow.transform.GetComponent(gridRow).seats = parseInt(grid["clubTableSeats"].ToString());
				newRow.transform.Find("boardlabel1").GetComponent(UILabel).text = "Blinds " + grid["clubTableSb"].ToString() + "/" + grid["clubTableBb"].ToString();
				newRow.transform.Find("lblBottom").GetComponent(UILabel).text = "";
				UIEventListener.Get(newRow).onClick = joinGame;
			} else {
				prefab = Resources.Load("Prefabs/clubTnmTable", GameObject);
				newRow = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(uiGrid,prefab);

				newRow.transform.localScale = new Vector3(0.95, 0.95);

				newRow.transform.Find("gameName").GetComponent(UILabel).text = grid["clubTableName"].ToString();
				newRow.transform.Find("info/boardlabel2").GetComponent(UILabel).text = grid["clubTableSeatsTaken"].ToString() + "/" + grid["clubTableSeats"].ToString();
				newRow.transform.GetComponent(gridRow).tournamentId = parseInt(grid["clubTableTntId"].ToString());
				newRow.transform.Find("boardlabel1").GetComponent(UILabel).text = "But-in: " + grid["clubTableBuyin"].ToString();
				newRow.transform.Find("info/boardlabel3").GetComponent(UILabel).text = grid["strStartsIn"].ToString();
				newRow.transform.Find("lblBottom").GetComponent(UILabel).text = "Tournament";
				UIEventListener.Get(newRow).onClick = clubTnmInfo;
			}

			//newRow.transform.localScale = new Vector3(0.95, 0.95);

			//newRow.transform.Find("gameName").GetComponent(UILabel).text = grid["clubTableName"].ToString();
			//newRow.transform.Find("info/boardlabel2").GetComponent(UILabel).text = grid["clubTableSeatsTaken"].ToString() + "/" + grid["clubTableSeats"].ToString();
		}

		uiGrid.GetComponent(UIGrid).Reposition();
		
	} catch(e) {
		Debug.Log('err in data received');
	}
}



function newClubTable () {
	CancelInvoke("tableRefresh");

	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(newTableScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;
}

function joinGame(item: GameObject) {

	CancelInvoke("tableRefresh");
	PlayerPrefs.SetString("gameID", item.GetComponent(gridRow).gameId.ToString());
	PlayerPrefs.SetString("seats", item.GetComponent(gridRow).seats.ToString());
	
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(tableScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

	tableScene.GetComponent(pokerTable).showUp();	
}

function clubTnmInfo(item: GameObject) {

	CancelInvoke("tableRefresh");

	usr.SetField("data", "&action=Info&clubId=" + PlayerPrefs.GetString("clubId").ToString() + "&dealerId=" + PlayerPrefs.GetString("playerDealerId").ToString() + "&tnmId=" + item.GetComponent(gridRow).tournamentId);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_tournament", usr);
}

function gotTnmInfo(e : SocketIO.SocketIOEvent) {

	Debug.Log("[SocketIO] gotTnmInfo received: " + e.name + " " + e.data);

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Off("gotTnmInfo", gotTnmInfo);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());

	try {

		for (var child : Transform in uiGrid.GetComponent(UIGrid).GetChildList()){
	        NGUITools.Destroy(child.gameObject);
	    }

		for(var grid : LitJson.JsonData in data["response"]){

			GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(tnmInfoScene); 
			GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

			/*
			var prefab: GameObject = Resources.Load("Prefabs/pnlTnmInfo", GameObject);
			var newPnl: GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
			*/

			tnmInfoScene.GetComponent(tournamentInfoScene).tournamentId = parseInt(grid["tnmId"].ToString());
			tnmInfoScene.GetComponent(tournamentInfoScene).tournamentName = grid["tnmName"].ToString();
			tnmInfoScene.GetComponent(tournamentInfoScene).maxPlayers = parseInt(grid["maxPlayers"].ToString());
			tnmInfoScene.GetComponent(tournamentInfoScene).registeredPlayers = parseInt(grid["registeredPlayers"].ToString());
			tnmInfoScene.GetComponent(tournamentInfoScene).prizePool = parseInt(grid["prizePool"].ToString());
			tnmInfoScene.GetComponent(tournamentInfoScene).buyIn = parseInt(grid["buyIn"].ToString());
			tnmInfoScene.GetComponent(tournamentInfoScene).entryFee = parseInt(grid["entryFee"].ToString());
			tnmInfoScene.GetComponent(tournamentInfoScene).startingChips = parseInt(grid["startingChips"].ToString());
			tnmInfoScene.GetComponent(tournamentInfoScene).stakes = grid["stakes"].ToString();
			tnmInfoScene.GetComponent(tournamentInfoScene).status = grid["status"].ToString();
			tnmInfoScene.GetComponent(tournamentInfoScene).myGameId = grid["myGameId"].ToString();
			tnmInfoScene.GetComponent(tournamentInfoScene).myStatus = grid["myStatus"].ToString();
			tnmInfoScene.GetComponent(tournamentInfoScene).structureId = parseInt(grid["structureId"].ToString());
			tnmInfoScene.GetComponent(tournamentInfoScene).blindLevel = parseInt(grid["currentLevel"].ToString());

			tnmInfoScene.GetComponent(tournamentInfoScene).lateEntry = parseInt(grid["lateEntry"].ToString());
			tnmInfoScene.GetComponent(tournamentInfoScene).lateEntryStatus = parseInt(grid["lateEntryStatus"].ToString());
			tnmInfoScene.GetComponent(tournamentInfoScene).lateEntry = parseInt(grid["lateEntryExpireMins"].ToString());

			tnmInfoScene.GetComponent(tournamentInfoScene).rebuys = parseInt(grid["rebuys"].ToString());
			tnmInfoScene.GetComponent(tournamentInfoScene).rebuysStatus = parseInt(grid["rebuysStatus"].ToString());
			tnmInfoScene.GetComponent(tournamentInfoScene).rebuyPrice = parseInt(grid["rebuyPrice"].ToString());
			tnmInfoScene.GetComponent(tournamentInfoScene).rebuyChips = parseInt(grid["rebuyChips"].ToString());

			tnmInfoScene.GetComponent(tournamentInfoScene).addOn = parseInt(grid["addOn"].ToString());
			tnmInfoScene.GetComponent(tournamentInfoScene).addOnChips = parseInt(grid["addOnChips"].ToString());
			tnmInfoScene.GetComponent(tournamentInfoScene).addOnPrice = parseInt(grid["addOnPrice"].ToString());

			tnmInfoScene.GetComponent(tournamentInfoScene).registrationOpens = parseInt(grid["registrationOpens"].ToString());	
			tnmInfoScene.GetComponent(tournamentInfoScene).startTime = grid["timeLabel"].ToString();
			tnmInfoScene.GetComponent(tournamentInfoScene).startIn = grid["strStartsIn"].ToString();

			tnmInfoScene.GetComponent(tournamentInfoScene).sceneFlag = -1;
			tnmInfoScene.GetComponent(tournamentInfoScene).btnDetailClick();
		}
	} catch(e) {
		Debug.Log('err in data received');
	}
}

function tableRefresh() {
	/*
	for (var child : Transform in uiGrid.GetComponent(UIGrid).GetChildList()){
        NGUITools.Destroy(child.gameObject);
    }
    */

    usr.SetField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.SetField("data", "&action=clubTable&id=" + PlayerPrefs.GetString("clubId"));
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);
}

function clubRatingBtnClick() {

	CancelInvoke("tableRefresh");

	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(ratingScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

	ratingScene.GetComponent(clubRatingScene).showUp();
}
