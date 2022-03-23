#pragma strict

var btnCreate: GameObject;
var btnSearch: GameObject;
var btnReturn: GameObject;

var searchScene: GameObject;

private var usr: JSONObject;

function Start () {
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(searchScene);

	UIEventListener.Get(btnCreate).onClick = clubCreate;
	UIEventListener.Get(btnSearch).onClick = clubSearch;
	UIEventListener.Get(btnReturn).onClick = returnClick;

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotClubSearch", gotClubSearch);

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);
}

function clubCreate() {
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;
	var prefab: GameObject = Resources.Load("Prefabs/pnlClubCE", GameObject);
	var newPnl: GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
	newPnl.GetComponent(prefabPnlClubCE).prefabType = "Create a Club";
	newPnl.GetComponent(prefabPnlClubCE).showUp();
}

function clubSearch() {
	var searchId = gameObject.Find("txtSearchClubId").GetComponent(UIInput).value;

	usr.SetField("data", "&action=search&id=" + searchId);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);	
}

function gotClubSearch(e: SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotClubSearch received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	 
	try { 
		if(data["response"]["clubId"].ToString() == "") {
			
			GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Club is not existed");
		} else {
			GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(searchScene);
			GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

			searchScene.GetComponent(clubSrchDetailScene).showUp(data["response"]["clubId"].ToString(), data["response"]["clubName"].ToString(), data["response"]["clubNotice"].ToString(), data["response"]["clubCurNum"].ToString(), 
														     data["response"]["clubMaxNum"].ToString(), parseInt(data["response"]["clubRating"].ToString()));
		}

	} catch(e) {
		Debug.Log('err in data received');
	}
}

function returnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = false;
}