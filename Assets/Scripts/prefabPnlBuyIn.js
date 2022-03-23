#pragma strict

var btnCloseBuyIn: GameObject;
var btnBuyInCancel: GameObject;
var btnBuyInOK: GameObject;
var sldBuyIn: GameObject;
var lblStatic: GameObject;

var maxBuyIn = 0.0f;
var minBuyIn = 0.0f;
var buyInAmount = 0.0f;
var seat = -1;

private var usr : JSONObject;

function Start () {
	EventDelegate.Add(sldBuyIn.GetComponent(UISlider).onChange, setBuyInAmount);
	
	UIEventListener.Get(btnCloseBuyIn).onClick = btnCloseBuyInClick;
	UIEventListener.Get(btnBuyInCancel).onClick = btnCloseBuyInClick;
	UIEventListener.Get(btnBuyInOK).onClick = btnBuyInOKClick;

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotJoinGame", gotJoinGame);
}

function gotJoinGame( e : SocketIO.SocketIOEvent) {

	Debug.Log("[SocketIO] gotJoinGame received: " + e.name + " " + e.data);


	var data = LitJson.JsonMapper.ToObject(e.data.ToString());

	if (data["response"]["error"].ToString() != "") {
		GameObject.Find("UI Root").GetComponent(enginepoker).showNotify(data["response"]["error"].ToString());
	}
}

function btnBuyInOKClick() {
	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString ("playerName"));
	usr.AddField("joinGame","");
	usr.AddField("socketId",GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);
	usr.AddField("language",PlayerPrefs.GetString("playerLanguage"));
	usr.AddField("gameID",parseInt(PlayerPrefs.GetString("gameID")));

	if (seat > -1)
		usr.SetField("joinGame", "&buyin=" + buyInAmount + "&clubId=" + PlayerPrefs.GetString("clubId") + "&seat=" + (seat + 1));
	else
		usr.SetField("joinGame", "&buyin=" + buyInAmount + "&clubId=" + PlayerPrefs.GetString("clubId"));
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_joingame", usr);

	GameObject.Find("UI Root/pnlPokerTable").GetComponent(pokerTable).btnSitPlayEffect(seat);
	btnCloseBuyInClick();
	
}

function btnCloseBuyInClick() {
	NGUITools.Destroy(gameObject);
}

function setBuyInAmount() {
	
	var myMax = maxBuyIn;
	
	if(parseFloat(PlayerPrefs.GetString("playerBankAmount")) < maxBuyIn) {
		myMax = parseFloat(PlayerPrefs.GetString("playerBankAmount"));
	}

	buyInAmount = Mathf.Round(sldBuyIn.GetComponent(UISlider).current.value * myMax);

	if(buyInAmount < minBuyIn) buyInAmount = minBuyIn;

	lblStatic.GetComponent(UILabel).text = "$" + buyInAmount.ToString( "n0" );
	
}