#pragma strict

var username: String;
var userChips: float;
var userId: int;

var btnReturn: GameObject;
var btnConfirm: GameObject;

var sceneFlag: int;

private var usr: JSONObject;

function Start () {
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotClubTrade", gotClubTrade);

	UIEventListener.Get(btnReturn).onClick = btnReturnClick;
	UIEventListener.Get(btnConfirm).onClick = btnConfirmClick;
}


function btnReturnClick() {
	//GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);

	if (sceneFlag != 3)
		GameObject.Find("pnlRoot/pnlClub/pnlClubGame/pnlCounter/gridTrade").GetComponent(clubTradeGrid).showUp();
	else
		GameObject.Find("pnlRoot/pnlClub/pnlClubGame/pnlClubDetail").GetComponent(clubDetailScene).showUp();

	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;
	NGUITools.Destroy(gameObject);
}

function btnConfirmClick() {
	var amount = gameObject.Find("txtCounterInput").GetComponent(UIInput).value;

	if(sceneFlag == 0) {
		usr.SetField("data", "&action=sendOut&username=" + username + "&id=" + PlayerPrefs.GetString("clubId") + "&amount=" + amount);
	} else if (sceneFlag == 1){
		usr.SetField("data", "&action=claimBack&username=" + username + "&id=" + PlayerPrefs.GetString("clubId") + "&amount=" + amount);
	} else {
		usr.SetField("data", "&action=buyChips&id=" + PlayerPrefs.GetString("clubId") + "&amount=" + amount);
	}
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);
}

function gotClubTrade(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotClubTrade received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	try { 
		if(data["response"]["clubTradeResult"].ToString() == "0") {
			var txt: String = "";
			if (sceneFlag == 0) 
				txt = "Club chips is not enough!";
			else if (sceneFlag == 1)
				txt = "Could not claim back more than player's chips!";
			else 
				txt = "Not enough diamonds!";

			GameObject.Find("UI Root").GetComponent(enginepoker).showNotify(txt);
		} else {

			var body = "";
			var title = "";

			if (sceneFlag == 0) {
				PlayerPrefs.SetString("clubChips", data["response"]["clubChips"].ToString());

				if (parseInt(data["response"]["personChips"].ToString()) > 0) 
					PlayerPrefs.SetString("clubPersonChips", data["response"]["personChips"].ToString());

				title = "You have received chips from your club " + PlayerPrefs.GetString("clubName") + "!";
				body = "Club: " + PlayerPrefs.GetString("clubName") + ", clubId: " + PlayerPrefs.GetString("clubId") + " had sent out " + data["response"]["amount"].ToString() + " chips to you";

				usr.SetField("data", "&action=insert&playerId=" + userId + "&title=" + title + "&body=" + body + "&date=" + data["response"]["date"].ToString());
				GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_mail", usr);
			} else if (sceneFlag == 1) {
				PlayerPrefs.SetString("clubChips", data["response"]["clubChips"].ToString());

				if (parseInt(data["response"]["personChips"].ToString()) > 0) 
					PlayerPrefs.SetString("clubPersonChips", data["response"]["personChips"].ToString());


				title = "You club " + PlayerPrefs.GetString("clubName") + " claimed back chips from you!";
				body = "Club: " + PlayerPrefs.GetString("clubName") + ", clubId: " + PlayerPrefs.GetString("clubId") + " had claim back club chips " + data["response"]["amount"].ToString() + " from you";

				usr.SetField("data", "&action=insert&playerId=" + userId + "&title=" + title + "&body=" + body + "&date=" + data["response"]["date"].ToString());
				GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_mail", usr);
			} else {
				PlayerPrefs.SetString("clubChips", data["response"]["clubChips"].ToString());
				PlayerPrefs.SetString("playerGold", data["response"]["diamonds"].ToString());
			}

			btnReturnClick();
		}
		
	} catch (err) {
		Debug.Log('Error in TRY' + err);
	}
}

function showUp() {

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("playerMove","");
	usr.AddField("joinGame","");
	usr.AddField("msg","");
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);
	usr.AddField("language",PlayerPrefs.GetString("playerLanguage"));
	usr.AddField("gameID","");


	if (sceneFlag == 0) {
		gameObject.Find("header/txtHeaderTitle").GetComponent(UILabel).text = "Send Out";
		gameObject.Find("clubChips/lblDescription").GetComponent(UILabel).text = "Club:";
		gameObject.Find("clubChips/lblValue").GetComponent(UILabel).text = PlayerPrefs.GetString("clubChips");
		gameObject.Find("clubChips").GetComponent(UISprite).spriteName = "coin_balance";
		gameObject.Find("lblClubExchangeInfo").GetComponent(UILabel).text = "";
	} else if (sceneFlag == 1){
		gameObject.Find("header/txtHeaderTitle").GetComponent(UILabel).text = "Claim Back";
		gameObject.Find("clubChips/lblDescription").GetComponent(UILabel).text = username + ":";
		gameObject.Find("clubChips/lblValue").GetComponent(UILabel).text = userChips.ToString();
		gameObject.Find("clubChips").GetComponent(UISprite).spriteName = "coin_balance";
		gameObject.Find("lblClubExchangeInfo").GetComponent(UILabel).text = "";
	} else {
		gameObject.Find("header/txtHeaderTitle").GetComponent(UILabel).text = "Exchanging Chips";
		gameObject.Find("clubChips/lblDescription").GetComponent(UILabel).text = "Diamonds:";
		gameObject.Find("clubChips/lblValue").GetComponent(UILabel).text = PlayerPrefs.GetString("playerGold");
		gameObject.Find("clubChips").GetComponent(UISprite).spriteName = "diamond_balance";
		gameObject.Find("lblClubExchangeInfo").GetComponent(UILabel).text = "1 Diamond = " + PlayerPrefs.GetString("clubExRate") + " Chips";
	}
}