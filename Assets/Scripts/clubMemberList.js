#pragma strict

var btnSearch: GameObject;
var btnReturn: GameObject;
var btnChips: GameObject;

var uiGrid: GameObject;
var popList: GameObject;

private var usr: JSONObject;
private var chipsOrder: int;
private var popSelection: String;


function Start () {
	UIEventListener.Get(btnSearch).onClick = btnSearchClick;
	UIEventListener.Get(btnReturn).onClick = btnReturnClick;

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotClubMembers", gotClubMembers);
}

function btnSearchClick() {
	var username = gameObject.Find("txtSearchMember").GetComponent(UIInput).value;

	usr.SetField("data", "&action=memberList&username=" + username + "&id=" + PlayerPrefs.GetString("clubId"));
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);
}

function btnReturnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

	GameObject.Find("UI Root/pnlRoot/pnlClub/pnlClubGame/pnlClubDetail").GetComponent(clubDetailScene).showUp(); 
}

function showUp() {
	gameObject.Find("descriptionBar/lblNumMember").GetComponent(UILabel).text = "Member:" + PlayerPrefs.GetString("clubCurNum");

	chipsOrder = 0;
	popSelection = "Winnings";

	if (parseInt(PlayerPrefs.GetString("clubAdmin")) == 1 || parseInt(PlayerPrefs.GetString("clubManager")) == 1) {
		gameObject.Find("descriptionBar/btnChips").GetComponent(UIButton).isEnabled = true;
		UIEventListener.Get(btnChips).onClick = btnChipsClick;
		gameObject.Find("descriptionBar/dropDownBar").GetComponent(UIButton).isEnabled = true;
		EventDelegate.Add(popList.GetComponent(UIPopupList).onChange, poplistChange); 
	} else {
		gameObject.Find("descriptionBar/btnChips").GetComponent(UIButton).isEnabled = false;
		gameObject.Find("descriptionBar/dropDownBar").GetComponent(UIButton).isEnabled = false;
	}

    if (!usr){
	    usr = new JSONObject(JSONObject.Type.OBJECT);
		usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
		usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
		usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
		usr.AddField("data","");	
		usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);
	}

	usr.SetField("data", "&action=memberList&id=" + PlayerPrefs.GetString("clubId"));
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);	
}

function btnChipsClick() {

	if (chipsOrder == 0)
		chipsOrder = 1;
	else
		chipsOrder = 0;
	
	var username = gameObject.Find("txtSearchMember").GetComponent(UIInput).value;

	usr.SetField("data", "&action=memberList&username=" + username + "&id=" + PlayerPrefs.GetString("clubId") + "&chips=" + chipsOrder);
	//GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);

	refreshTable();

}

function refreshTable() {
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);
}

function gotClubMembers(e: SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotClubMembers received: " + e.name + " " + e.data);

	for (var child : Transform in uiGrid.GetComponent(UIGrid).GetChildList()){
    	NGUITools.Destroy(child.gameObject);
	}

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());

	try {

		for(var grid : LitJson.JsonData in data["response"]){
			
			var prefab : GameObject = Resources.Load("Prefabs/clubMemberRow", GameObject);

			var newRow : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(uiGrid,prefab);

			newRow.transform.localScale = new Vector3(0.95, 0.95);
		
			GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(grid["clubplayerAvatar"].ToString(), newRow.transform.Find("imgPlayerAvatar").gameObject, false);

			newRow.transform.GetComponent(gridRow).username = grid["clubPlayerName"].ToString();
			newRow.transform.GetComponent(gridRow).userId = parseInt(grid["clubPlayerId"].ToString());
			newRow.transform.GetComponent(gridRow).userHands = parseInt(grid["clubplayerhands"].ToString());
			newRow.transform.GetComponent(gridRow).userChips = parseInt(grid["clubPlayerChips"].ToString());
			newRow.transform.GetComponent(gridRow).userBuyin = parseInt(grid["clubplayerbuyin"].ToString());
			newRow.transform.GetComponent(gridRow).userWinnings = parseInt(grid["clubplayerwinnings"].ToString());
			newRow.transform.GetComponent(gridRow).userSendback = parseInt(grid["clubplayersendback"].ToString());
			newRow.transform.GetComponent(gridRow).userAdmin = parseInt(grid["clubAdmin"].ToString());
			newRow.transform.GetComponent(gridRow).userManager = parseInt(grid["clubManager"].ToString());
			newRow.transform.GetComponent(gridRow).userAvatar = grid["clubplayerAvatar"].ToString();

			newRow.transform.Find("playerProfile/lblInfo").GetComponent(UILabel).text = grid["clubPlayerName"].ToString() + "\n" + "ID: " + grid["clubPlayerId"].ToString();
			if (parseInt(grid["clubAdmin"].ToString()) == 1) {
				newRow.transform.Find("playerProfile/admin").GetComponent(UISprite).spriteName = "online_icon";
			} else if (parseInt(grid["clubManager"].ToString()) == 1) {
				newRow.transform.Find("playerProfile/admin").GetComponent(UISprite).spriteName = "online_icon";
			} else {
				newRow.transform.Find("playerProfile/admin").GetComponent(UISprite).spriteName = "";
			}

			newRow.transform.Find("chips/lblChips").GetComponent(UILabel).text = grid["clubPlayerChips"].ToString();

			if (parseInt(PlayerPrefs.GetString("clubAdmin")) == 1 || parseInt(PlayerPrefs.GetString("clubManager")) == 1) {
				UIEventListener.Get(newRow.transform.gameObject).onClick = selectPlayer;

				if (popSelection == "Winnings") {
					newRow.transform.Find("winnings").GetComponent(UILabel).text = grid["clubplayerwinnings"].ToString();
				} else {
					newRow.transform.Find("winnings").GetComponent(UILabel).text = grid["clubplayerhands"].ToString();
				}
			} 
		}

		uiGrid.GetComponent(UIGrid).Reposition();


	} catch(e) {
		Debug.Log('err in data received');
	}
}

function poplistChange() {
	popSelection = popList.GetComponent(UIPopupList).current.value;
	for (var child : Transform in uiGrid.GetComponent(UIGrid).GetChildList()){
		if (popSelection == "Winnings") {
			child.gameObject.transform.Find("winnings").GetComponent(UILabel).text = child.gameObject.transform.GetComponent(gridRow).userWinnings.ToString();
		} else {
			child.gameObject.transform.Find("winnings").GetComponent(UILabel).text = child.gameObject.transform.GetComponent(gridRow).userHands.ToString();
		}
	}
}

function selectPlayer(item: GameObject) {
	var prefab = Resources.Load("Prefabs/pnlMemberDetail", GameObject);
	var newPnl: GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);

	newPnl.GetComponent(prefabPnlMemberDetail).memberName = item.GetComponent(gridRow).username;
	newPnl.GetComponent(prefabPnlMemberDetail).memberId = item.GetComponent(gridRow).userId;
	newPnl.GetComponent(prefabPnlMemberDetail).memberHands = item.GetComponent(gridRow).userHands;
	newPnl.GetComponent(prefabPnlMemberDetail).memberChips = item.GetComponent(gridRow).userChips;
	newPnl.GetComponent(prefabPnlMemberDetail).memberBuyin = item.GetComponent(gridRow).userBuyin;
	newPnl.GetComponent(prefabPnlMemberDetail).memberSendback = item.GetComponent(gridRow).userSendback;
	newPnl.GetComponent(prefabPnlMemberDetail).memberWinnings = item.GetComponent(gridRow).userWinnings;
	newPnl.GetComponent(prefabPnlMemberDetail).memberAdmin = item.GetComponent(gridRow).userAdmin;
	newPnl.GetComponent(prefabPnlMemberDetail).memberManager = item.GetComponent(gridRow).userManager;
	newPnl.GetComponent(prefabPnlMemberDetail).memberAvatar = item.GetComponent(gridRow).userAvatar;
	newPnl.GetComponent(prefabPnlMemberDetail).showUp();
}
