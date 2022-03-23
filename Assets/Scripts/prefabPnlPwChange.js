#pragma strict

var btnReturn: GameObject;
var btnConfirm: GameObject;

private var processFlag: boolean = false;
private var usr: JSONObject;

function Start () {
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("pwChangeRsp", pwChangeRsp);

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);

	UIEventListener.Get(btnReturn).onClick = btnReturnClick;
	UIEventListener.Get(btnConfirm).onClick = btnConfirmClick;
}

function btnReturnClick() {
	NGUITools.Destroy(gameObject);
}

function btnConfirmClick() {
	if (processFlag)
		return;

	var password1 = gameObject.transform.Find("txtPasswordNew").GetComponent(UIInput).value;
	var password2 = gameObject.transform.Find("txtPasswordAgain").GetComponent(UIInput).value;

	usr.SetField("data", '&pw1=' + password1 + '&pw2=' + password2);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("pw_change", usr);

	processFlag = true;
}

function pwChangeRsp(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] pwChangeRsp received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	try { 

		GameObject.Find("UI Root").GetComponent(enginepoker).showNotify(data["response"]["info"].ToString());
		
	} catch (err) {
		Debug.Log('Error in TRY');
	}

	processFlag = false;
}

