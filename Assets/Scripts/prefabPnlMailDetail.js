#pragma strict

var readFlag: int;
var mailTitle: String;
var mailBody: String;
var mailId: int;

var returnBtn: GameObject;
var mailBtn: GameObject;

private var usr: JSONObject;

function Start () {
	UIEventListener.Get(returnBtn).onClick = btnReturnClick;
	UIEventListener.Get(mailBtn).onClick = btnMailClick;


}

function showUp() {
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotMailAction", gotMailAction);

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);

	gameObject.Find("mailTitle").GetComponent(UILabel).text = mailTitle;
	gameObject.Find("mailBody/Label").GetComponent(UILabel).text = mailBody;
	gameObject.Find("mailBtn/Label").GetComponent(UILabel).text = !readFlag ? "Confirm" : "Delete";
}

function btnReturnClick() {
	unbind();

	NGUITools.Destroy(gameObject);

}

function btnMailClick() {
	if (readFlag) {
		usr.SetField("data", "&action=delete&mailId=" + mailId);
	} else {
		usr.SetField("data", "&action=mark&mailId=" + mailId);
	}
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_mail", usr);
}

function gotMailAction(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotMailAction received: " + e.name + " " + e.data);

	//unbind();
	/*
	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	if (!readFlag) {
		for (var child : Transform in GameObject.Find("UI Root/pnlRoot/pnlProfile/pnlMail").GetComponent(mailScene).mailGrid.GetComponent(UIGrid).GetChildList()){
	    	NGUITools.Destroy(child.gameObject);
		}
	} else {
		for (var child : Transform in GameObject.Find("UI Root/pnlRoot/pnlProfile/pnlMail").GetComponent(mailScene).historyGrid.GetComponent(UIGrid).GetChildList()){
	    	NGUITools.Destroy(child.gameObject);
		}
	} */

	if (!readFlag) {
		//usr.SetField("data", "&action=look&playerId=" + PlayerPrefs.GetString("playerId").ToString() + "&mark=0");
		GameObject.Find("UI Root/pnlRoot/pnlProfile/pnlMail").GetComponent(mailScene).mailshow = false;
		GameObject.Find("UI Root/pnlRoot/pnlProfile/pnlMail").GetComponent(mailScene).mailBtnClick();
	} else {
		//usr.SetField("data", "&action=look&playerId=" + PlayerPrefs.GetString("playerId").ToString() + "&mark=1");
		GameObject.Find("UI Root/pnlRoot/pnlProfile/pnlMail").GetComponent(mailScene).mailshow = true;
		GameObject.Find("UI Root/pnlRoot/pnlProfile/pnlMail").GetComponent(mailScene).historyBtnClick();
	}
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_mail", usr);

	btnReturnClick();
	
}

function unbind() {
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Off("gotMailAction", gotMailAction);
} 