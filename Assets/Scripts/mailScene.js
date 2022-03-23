#pragma strict

var returnBtn: GameObject;
var btnMail: GameObject;
var btnHistory: GameObject;

var mailPnl: GameObject;
var historyPnl: GameObject;

var mailGrid: GameObject;
var historyGrid: GameObject;

var mailshow: boolean;

private var usr: JSONObject;

function Start () {
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotMail", gotMail);
	UIEventListener.Get(returnBtn).onClick = returnBtnClick;
	UIEventListener.Get(btnMail).onClick = mailBtnClick;
	UIEventListener.Get(btnHistory).onClick = historyBtnClick;

}

function returnBtnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = false;

}

function showUp() {
	

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);

	mailshow = false;

	mailBtnClick();
}

function mailBtnClick(){
	if (!mailshow) {
		mailshow = true;

		GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(mailPnl);
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(historyPnl);

		btnMail.GetComponent(UISprite).spriteName = btnMail.GetComponent(UISprite).spriteName.Replace("_off","_on");
		btnHistory.GetComponent(UISprite).spriteName = btnHistory.GetComponent(UISprite).spriteName.Replace("_on","_off");
	}

	for (var child : Transform in mailGrid.GetComponent(UIGrid).GetChildList()){
    	NGUITools.Destroy(child.gameObject);
	} 
	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg(); 
	usr.SetField("data", "&action=look&playerId=" + PlayerPrefs.GetString("playerId").ToString() + "&mark=0");
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_mail", usr);
}

function historyBtnClick(){
	if (mailshow) {
		mailshow = false;

		GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(historyPnl);
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(mailPnl);

		btnMail.GetComponent(UISprite).spriteName = btnMail.GetComponent(UISprite).spriteName.Replace("_on","_off");
		btnHistory.GetComponent(UISprite).spriteName = btnHistory.GetComponent(UISprite).spriteName.Replace("_off","_on");
	}
	/*
	for (var child : Transform in historyGrid.GetComponent(UIGrid).GetChildList()){
    	NGUITools.Destroy(child.gameObject);
	} */
	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	usr.SetField("data", "&action=look&playerId=" + PlayerPrefs.GetString("playerId").ToString() + "&mark=1");
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_mail", usr);
}

/*
function cleanList() {
	

	if (mailshow) {
		
		usr.SetField("data", "&action=look&playerId=" + PlayerPrefs.GetString("playerId").ToString() + "&mark=0");
	}
	else {
		
		usr.SetField("data", "&action=look&playerId=" + PlayerPrefs.GetString("playerId").ToString() + "&mark=1");
	}
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_mail", usr);
} */

function gotMail(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotMail received: " + e.name + " " + e.data);


	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	if (mailshow) {
		for (var child : Transform in mailGrid.GetComponent(UIGrid).GetChildList()){
	    	NGUITools.Destroy(child.gameObject);
		}
	} else {
		for (var child : Transform in historyGrid.GetComponent(UIGrid).GetChildList()){
	    	NGUITools.Destroy(child.gameObject);
		}
	} 


	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	 
	try {

		if (data["response"].Count == 0) {

			var txt = mailshow ? "No new mails to read!" : "No history mails!";
			GameObject.Find("UI Root").GetComponent(enginepoker).showPnlEmptyMsg(txt, 1, new Vector3(0, -50, 0), new Vector3(1.2, 1.2));

		} else {
			for(var grid : LitJson.JsonData in data["response"]){
				
				var prefab : GameObject = Resources.Load("Prefabs/mailRow", GameObject);
				var newRow : GameObject;
				if (mailshow) {
					newRow  = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(mailGrid,prefab);
					newRow.transform.Find("icon").GetComponent(UISprite).spriteName = "email_icon";
				} else {
					newRow  = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(historyGrid,prefab);
					newRow.transform.Find("icon").GetComponent(UISprite).spriteName = "icon-email";
				}

				newRow.transform.localScale = new Vector3(0.95, 0.95);

				newRow.transform.GetComponent(gridRow).mailTitle = grid["title"].ToString();
				newRow.transform.GetComponent(gridRow).mailBody = grid["body"].ToString();
				newRow.transform.GetComponent(gridRow).readFlag = parseInt(grid["mark"].ToString());
				newRow.transform.GetComponent(gridRow).mailId = parseInt(grid["mailId"].ToString());

				newRow.transform.Find("title").GetComponent(UILabel).text = grid["title"].ToString();
				newRow.transform.Find("date").GetComponent(UILabel).text = "20" + grid["mailY"].ToString() + "/" + grid["mailM"].ToString() + "/" + grid["mailD"].ToString();
				UIEventListener.Get(newRow).onClick = mailRead;
			}

			if (mailshow)
				mailGrid.GetComponent(UIGrid).Reposition();
			else
				historyGrid.GetComponent(UIGrid).Reposition();
		}
		
	} catch(e) {
		Debug.Log('err in data received');
	}
} 

function mailRead(item: GameObject) {
	
	var prefab : GameObject = Resources.Load("Prefabs/pnlMailDetail", GameObject);
	var newPnl: GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
	newPnl.GetComponent(prefabPnlMailDetail).readFlag = item.GetComponent(gridRow).readFlag;
	newPnl.GetComponent(prefabPnlMailDetail).mailTitle = item.GetComponent(gridRow).mailTitle;
	newPnl.GetComponent(prefabPnlMailDetail).mailBody = item.GetComponent(gridRow).mailBody;
	newPnl.GetComponent(prefabPnlMailDetail).mailId = item.GetComponent(gridRow).mailId;
	newPnl.GetComponent(prefabPnlMailDetail).showUp();
}