#pragma strict

var clubId: int;

var uiGrid: GameObject;

private var usr: JSONObject;

function Start () {
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotTradeRecord", gotTradeRecord);
}

function showUp() {

    usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);	

	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();

	usr.SetField("data", "&action=tradeRecord&id=" + PlayerPrefs.GetString("clubId"));
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);	
}

function gotTradeRecord(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotTradeRecord received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());

	for (var child : Transform in uiGrid.GetComponent(UIGrid).GetChildList()){
    	NGUITools.Destroy(child.gameObject);
	}

	try {
		if (data["response"].Count == 0) {

			GameObject.Find("UI Root").GetComponent(enginepoker).showPnlEmptyMsg("No trade record yet!", 1, new Vector3(0, -60, 0), new Vector3(1.3,1.3));

		} else {

			for(var grid : LitJson.JsonData in data["response"]){
				
				var prefab : GameObject = Resources.Load("Prefabs/clubTradeRecord", GameObject);

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
		}

	} catch(e) {
		Debug.Log('err in data received');
	}
}