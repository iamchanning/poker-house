#pragma strict

//var chipsScene: GameObject;

var btnSend: GameObject;
var btnBack: GameObject;
var btnSearch: GameObject;
var btnBuy: GameObject;


var uiGrid: GameObject;
var lastSelected: GameObject;

private var usr: JSONObject;

function Start () {

	UIEventListener.Get(btnSend).onClick = sendOutBtnClick;
	UIEventListener.Get(btnBack).onClick = claimbackBtnClick;
	UIEventListener.Get(btnSearch).onClick = searchBtnClick;
	UIEventListener.Get(btnBuy).onClick = buyBtnClick;

	//GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(chipsScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotClubMembers", gotClubMembers);
}


function buyBtnClick() {

	var prefab: GameObject = Resources.Load("Prefabs/pnlClubChips", GameObject);
	var newPnl: GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
	newPnl.GetComponent(prefabPnlClubChips).sceneFlag = 2;
	newPnl.GetComponent(prefabPnlClubChips).showUp();

}

function sendOutBtnClick(){
	if (lastSelected) {
		var prefab: GameObject = Resources.Load("Prefabs/pnlClubChips", GameObject);
		var newPnl: GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
		newPnl.GetComponent(prefabPnlClubChips).sceneFlag = 0;
		newPnl.GetComponent(prefabPnlClubChips).username = lastSelected.transform.GetComponent(gridRow).username;
		newPnl.GetComponent(prefabPnlClubChips).userId = lastSelected.transform.GetComponent(gridRow).userId;
		newPnl.GetComponent(prefabPnlClubChips).showUp();
		refreshTable();
	} else 
		return;
}

function claimbackBtnClick(){
	if (lastSelected) {
		var prefab: GameObject = Resources.Load("Prefabs/pnlClubChips", GameObject);
		var newPnl: GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
		newPnl.GetComponent(prefabPnlClubChips).sceneFlag = 1;
		newPnl.GetComponent(prefabPnlClubChips).username = lastSelected.transform.GetComponent(gridRow).username;
		newPnl.GetComponent(prefabPnlClubChips).userChips = lastSelected.transform.GetComponent(gridRow).userChips;
		newPnl.GetComponent(prefabPnlClubChips).userId = lastSelected.transform.GetComponent(gridRow).userId;
		newPnl.GetComponent(prefabPnlClubChips).showUp();
		refreshTable();
	} else 
		return;
	
}

function searchBtnClick(){
	var username = gameObject.Find("counterSearchBar").GetComponent(UIInput).value;

	usr.SetField("data", "&action=memberList&username=" + username + "&id=" + PlayerPrefs.GetString("clubId"));
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);
	
}

function showUp() {

	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	refreshTable();

	gameObject.Find("counterChips").GetComponent(UILabel).text = PlayerPrefs.GetString("clubChips");

	if (!usr) {
	    usr = new JSONObject(JSONObject.Type.OBJECT);
		usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
		usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
		usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
		usr.AddField("data","");	
		usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);
	}

	usr.SetField("data", "&action=memberList&id=" + PlayerPrefs.GetString("clubId"));
	//GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);	
		


}

function refreshTable() {
	
	for (var child : Transform in uiGrid.GetComponent(UIGrid).GetChildList()){
    	NGUITools.Destroy(child.gameObject);
	}
	//GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);	
}

function gotClubMembers(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotClubMembers received: " + e.name + " " + e.data);

	refreshTable();

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());


	try {

		for(var grid : LitJson.JsonData in data["response"]){
			
			var prefab : GameObject = Resources.Load("Prefabs/counterMemberRow", GameObject);


			var newRow : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(uiGrid,prefab);

			newRow.transform.localScale = new Vector3(0.95, 0.95);
		
			GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(grid["clubplayerAvatar"].ToString(), newRow.transform.Find("imgPlayerAvatar").gameObject, false);//playerProfile/

			newRow.transform.GetComponent(gridRow).username = grid["clubPlayerName"].ToString();
			newRow.transform.GetComponent(gridRow).userId = parseInt(grid["clubPlayerId"].ToString());
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
}


function selectPlayer(go: GameObject) {

	if (go.transform.Find("checkBox").gameObject.GetComponent(UISprite).spriteName.Contains("_on")) {
		lastSelected = null;
		go.transform.Find("checkBox").gameObject.GetComponent(UISprite).spriteName = go.transform.Find("checkBox").gameObject.GetComponent(UISprite).spriteName.Replace("_on","_off");
	} else {
		if (lastSelected) {
			lastSelected.transform.Find("checkBox").gameObject.GetComponent(UISprite).spriteName = lastSelected.transform.Find("checkBox").gameObject.GetComponent(UISprite).spriteName.Replace("_on","_off");
		}
		go.transform.Find("checkBox").gameObject.GetComponent(UISprite).spriteName = go.transform.Find("checkBox").gameObject.GetComponent(UISprite).spriteName.Replace("_off","_on");
		lastSelected = go;
	}
}
