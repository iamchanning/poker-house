	#pragma strict

var btnReturn: GameObject;

var uiGrid: GameObject;

var prefabType: String;

var processFlag: boolean = true;

private var usr: JSONObject; 

function Start () {

}


function btnReturnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	if (prefabType == "New Member") {
		GameObject.Find("pnlRoot/pnlClub/pnlClubGame/pnlClubDetail").GetComponent(clubDetailScene).showUp();
	}
	NGUITools.Destroy(gameObject);
}

function getList() {
	UIEventListener.Get(btnReturn).onClick = btnReturnClick;

	GameObject.Find("header/pnlScrollListTitle").GetComponent(UILabel).text = prefabType;

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);

	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();

	if (prefabType == "New Member") {
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("clubJoinRsp", clubJoinRsp);
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotClubNewMember", gotClubNewMember);

		usr.AddField("data", "&action=newMemberList&id=" + PlayerPrefs.GetString("clubId"));
	}
	else if (prefabType == "Trade Record") {
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotTradeRecord", gotTradeRecord);

		usr.AddField("data", "&action=tradeRecord&id=" + PlayerPrefs.GetString("clubId"));
	}
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);	
}

function gotClubNewMember(e : SocketIO.SocketIOEvent) {
	
	Debug.Log("[SocketIO] gotClubNewMembers received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	 
	try {
		for (var child : Transform in uiGrid.GetComponent(UIGrid).GetChildList()){
	        NGUITools.Destroy(child.gameObject);
	    }
	    if (data["response"].Count == 0) {

			GameObject.Find("UI Root").GetComponent(enginepoker).showPnlEmptyMsg("No new member requests.", 1, new Vector3(0, 0, 0), new Vector3(1.3, 1.3));

		} else {
			for(var grid : LitJson.JsonData in data["response"]){
				var prefab : GameObject = Resources.Load("Prefabs/clubNewMemberRow", GameObject);
				
				var newRow : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(uiGrid,prefab);

				newRow.transform.localScale = new Vector3(0.95, 0.95);

				newRow.transform.GetComponent(gridRow).username = grid["clubPlayerName"].ToString();

				newRow.transform.Find("playerProfile/lblInfo").GetComponent(UILabel).text = grid["clubPlayerName"].ToString() + "\nID: " + grid["clubPlayerId"].ToString();
				GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(grid["clubplayerAvatar"].ToString(), newRow.transform.Find("imgPlayerAvatar").gameObject, false);

				UIEventListener.Get(newRow.transform.Find("btnAccept").gameObject).onClick = reqAccepted;
				UIEventListener.Get(newRow.transform.Find("btnDecline").gameObject).onClick = reqDeclined;
			}
			uiGrid.GetComponent(UIGrid).Reposition();
		}
	} catch(e) {
		Debug.Log('err in data received');
	}

}

function reqAccepted(btn: GameObject) {
	if (!processFlag)
		return;
	
	usr.SetField("data", "&action=joinRequest&id=" + PlayerPrefs.GetString("clubId") + "&username=" + btn.transform.parent.gameObject.GetComponent(gridRow).username + "&agreed=1");
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);	

	processFlag = false;
}

function reqDeclined(btn: GameObject) {
	if (!processFlag)
		return;

	usr.SetField("data", "&action=joinRequest&id=" + PlayerPrefs.GetString("clubId") + "&username=" + btn.transform.parent.gameObject.GetComponent(gridRow).username + "&agreed=0");
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);	

	processFlag = false;
}

function clubJoinRsp(e : SocketIO.SocketIOEvent) {

	Debug.Log("[SocketIO] clubJoinRsp received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	try { 
		if(data["response"]["joinResult"].ToString() == "0") {
			
			GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Club is full, could not add more players!");
		} else {
			//var curNum = parseInt(PlayerPrefs.GetString("clubCurNum")) + 1;
			//PlayerPrefs.SetString("clubCurNum", curNum.ToString());

			usr.SetField("data", "&action=newMemberList&id=" + PlayerPrefs.GetString("clubId"));
			GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);	
		}
		PlayerPrefs.SetString("clubCurNum", data["response"]["clubCurNum"].ToString());
		processFlag = true;
	} catch (err) {
		Debug.Log('Error in TRY');
	}

}

function gotTradeRecord(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotTradeRecord received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());

	for (var child : Transform in uiGrid.GetComponent(UIGrid).GetChildList()){
    	NGUITools.Destroy(child.gameObject);
	}

	try {

		for(var grid : LitJson.JsonData in data["response"]){
			
			var prefab : GameObject = Resources.Load("Prefabs/clubTradeRecordBig", GameObject);

			var newRow : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(uiGrid,prefab);

			newRow.transform.localScale = new Vector3(0.95, 0.95);

			if (grid["clubTradeDrt"].ToString() == "0") {
				newRow.transform.Find("lblTradeDescription").GetComponent(UILabel).text = "Send out to " + grid["clubTradePlayer"].ToString();
			} else {
				newRow.transform.Find("lblTradeDescription").GetComponent(UILabel).text = "Claim back from " + grid["clubTradePlayer"].ToString();
			}
			newRow.transform.Find("lblTradeTime").GetComponent(UILabel).text = "20" + grid["clubTradeY"].ToString() + "/" + grid["clubTradeM"].ToString() + "/" + grid["clubTradeD"].ToString();
			newRow.transform.Find("chips/lblValue").GetComponent(UILabel).text = grid["clubTradeChips"].ToString();

		}

		uiGrid.GetComponent(UIGrid).Reposition();

	} catch(e) {
		Debug.Log('err in data received');
	}
}

/*
function gotClubMembers(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotClubMembers received: " + e.name + " " + e.data);

	if (e) {
		for (var child : Transform in uiGrid.GetComponent(UIGrid).GetChildList()){
        	NGUITools.Destroy(child.gameObject);
    	}

		var data = LitJson.JsonMapper.ToObject(e.data.ToString());

		try {

			for(var grid : LitJson.JsonData in data["response"]){
				
				var prefab : GameObject = Resources.Load("Prefabs/counterMemberRow", GameObject);

				var newRow : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(uiGrid,prefab);
			
				GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(grid["clubplayerAvatar"].ToString(), newRow.transform.Find("playerProfile/imgPlayerAvatar").gameObject);

				newRow.transform.GetComponent(gridRow).username = grid["clubPlayerName"].ToString();
				//newRow.transform.GetComponent(gridRow).clubId = clubId;
				//newRow.transform.GetComponent(gridRow).clubChips = clubChips;
				newRow.transform.GetComponent(gridRow).userChips = parseFloat(grid["clubPlayerChips"].ToString());

				newRow.transform.Find("playerProfile/lblInfo").GetComponent(UILabel).text = grid["clubPlayerName"].ToString() + "\n" + "ID: " + grid["clubPlayerId"].ToString();
				newRow.transform.Find("chips/lblValue").GetComponent(UILabel).text = grid["clubPlayerChips"].ToString();
				if (parseInt(grid["clubAdmin"].ToString()) == 1) {
					newRow.transform.Find("playerProfile/admin").GetComponent(UISprite).spriteName = "online_icon";
				} else {
					newRow.transform.Find("playerProfile/admin").GetComponent(UISprite).spriteName = "";
				}

				UIEventListener.Get(newRow.transform.gameObject).onClick = selectPlayer;
			
			}

			uiGrid.GetComponent(UIGrid).Reposition();


		} catch(e) {
			Debug.Log('err in data received');
		}
	} else {
		Debug.Log('Empty data');
	}
}
*/

