#pragma strict

var btnStart: GameObject;

private var usr: JSONObject;

private var playerNum: int;
private var speed: int;

private var rake: int;
private var cap: int;
private var buyinAmount: int;
private var sb: int;

function Start () {
	UIEventListener.Get(btnStart).onClick = btnStartClick;

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);	


}

function showUp() {
	playerNum = 5;
	UIEventListener.Get(gameObject.Find("ringGame/playerNum/btn")).onClick = btnPlayerNumClick;

	speed = 15;
	gameObject.Find("ringGame/speed/quick").GetComponent(UISprite).spriteName = "checkBox_on";
	gameObject.Find("ringGame/speed/standard").GetComponent(UISprite).spriteName = "checkBox_off";
	gameObject.Find("ringGame/speed/professional").GetComponent(UISprite).spriteName = "checkBox_off";
	UIEventListener.Get(gameObject.Find("ringGame/speed/quick")).onClick = btnQuickClick;
	UIEventListener.Get(gameObject.Find("ringGame/speed/standard")).onClick = btnStandardClick;
	UIEventListener.Get(gameObject.Find("ringGame/speed/professional")).onClick = btnProfessionClick;

	rake = 2;
	cap = 1;
	EventDelegate.Add(gameObject.Find("rakeCap/dropDownBar0").GetComponent(UIPopupList).onChange, rakePopupChange); 
	EventDelegate.Add(gameObject.Find("rakeCap/dropDownBar1").GetComponent(UIPopupList).onChange, capPopupChange);

	gameObject.Find("playerBuyin/buyinSlider").GetComponent(UISlider).value = 0;
	gameObject.Find("playerBuyin/buyinSlider/Label").GetComponent(UILabel).text = "40 Buy-in";
	buyinAmount = 40;
	EventDelegate.Add(gameObject.Find("playerBuyin/buyinSlider").GetComponent(UISlider).onChange, buyinChange);

	gameObject.Find("playerBuyin/sbbbSlider").GetComponent(UISlider).value = 0;
	gameObject.Find("playerBuyin/sbbbSlider/Label").GetComponent(UILabel).text = "1/2 Small/Big Blind";
	sb = 1;
	EventDelegate.Add(gameObject.Find("playerBuyin/sbbbSlider").GetComponent(UISlider).onChange, sbbbChange);
}

function btnStartClick() {
	var tableName = gameObject.Find("ringGame/playerNum").GetComponent(UIInput).value;
	if (tableName == "") {
		GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Please input the table name!");
		return;
	}
	//var tableName = gameObject.transform.Find("ringGame/playerNum").GetComponent(UIInput).value ? gameObject.Find("ringGame/playerNum").GetComponent(UIInput).value : "Unnamed Table";

	usr.SetField("data", "&action=gameCreate&type=0&tablename=" + tableName + "&seats=" + playerNum + "&speed=" + speed + "&rake=" + rake + "&cap=" + cap + "&buyinAmount=" + buyinAmount + "&sb=" + sb + "&clubId=" + PlayerPrefs.GetString("clubId") + "&dearlerId=" + PlayerPrefs.GetString("playerDealerId"));

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);	
}

function btnPlayerNumClick() {
	if (playerNum == 5) {
		playerNum = 9;
		gameObject.Find("ringGame/playerNum/btn").GetComponent(UISprite).spriteName = "select_9_player";
	} else {
		playerNum = 5;
		gameObject.Find("ringGame/playerNum/btn").GetComponent(UISprite).spriteName = "select_5_player";
	}
}

function btnQuickClick() {
	if (speed == 15)
		return;

	if (speed == 20) {
		speed = 15;
		gameObject.Find("ringGame/speed/standard").GetComponent(UISprite).spriteName = "checkBox_off";
		gameObject.Find("ringGame/speed/quick").GetComponent(UISprite).spriteName = "checkBox_on";
	} else {
		speed = 15;
		gameObject.Find("ringGame/speed/professional").GetComponent(UISprite).spriteName = "checkBox_off";
		gameObject.Find("ringGame/speed/quick").GetComponent(UISprite).spriteName = "checkBox_on";
	}
}

function btnStandardClick() {
	if (speed == 20)
		return;

	if (speed == 15) {
		speed = 20;
		gameObject.Find("ringGame/speed/quick").GetComponent(UISprite).spriteName = "checkBox_off";
		gameObject.Find("ringGame/speed/standard").GetComponent(UISprite).spriteName = "checkBox_on";
	} else {
		speed = 20;
		gameObject.Find("ringGame/speed/professional").GetComponent(UISprite).spriteName = "checkBox_off";
		gameObject.Find("ringGame/speed/standard").GetComponent(UISprite).spriteName = "checkBox_on";
	}
}

function btnProfessionClick() {
	if (speed == 30)
		return;

	if (speed == 15) {
		speed = 30;
		gameObject.Find("ringGame/speed/quick").GetComponent(UISprite).spriteName = "checkBox_off";
		gameObject.Find("ringGame/speed/professional").GetComponent(UISprite).spriteName = "checkBox_on";
	} else {
		speed = 30;
		gameObject.Find("ringGame/speed/standard").GetComponent(UISprite).spriteName = "checkBox_off";
		gameObject.Find("ringGame/speed/professional").GetComponent(UISprite).spriteName = "checkBox_on";
	}
}

function rakePopupChange() {
	switch(gameObject.Find("rakeCap/dropDownBar0").GetComponent(UIPopupList).current.value) {
		case "2%":
			rake = 2; break;
		case "3%":
		    rake = 3; break;
		case "5%":
			rake = 5; break;
	}
}

function capPopupChange() {
	switch(gameObject.Find("rakeCap/dropDownBar1").GetComponent(UIPopupList).current.value) {
		case "1BB":
			cap = 1; break;
		case "2BBs":
		    cap = 2; break;
		case "3BBs":
			cap = 3; break;
	}
}

function buyinChange() {
	var value: float = gameObject.Find("playerBuyin/buyinSlider").GetComponent(UISlider).value;
	if (value == 0)
		buyinAmount = 40;
	else if (0 < value && value < 0.1)
		buyinAmount = 100;
	else if (0.1 < value && value < 0.2)
		buyinAmount = 160;
	else if (0.2 < value && value < 0.3)
		buyinAmount = 200;
	else if (0.3 < value && value < 0.4)
		buyinAmount = 300;
	else if (0.4 < value && value < 0.5)
		buyinAmount = 400;
	else if (0.5 < value && value < 0.6)
		buyinAmount = 500;
	else if (0.6 < value && value < 0.7)
		buyinAmount = 600;
	else if (0.7 < value && value < 0.8)
		buyinAmount = 700;
	else if (0.8 < value && value < 0.9)
		buyinAmount = 800;
	else if (0.9 < value && value < 1)
		buyinAmount = 900;
	else if (value == 1)
		buyinAmount = 1000;

	buyinAmount *= sb;
	gameObject.Find("playerBuyin/buyinSlider/Label").GetComponent(UILabel).text = buyinAmount + " Buy-in";
}

function sbbbChange() {
	var value: float = gameObject.Find("playerBuyin/sbbbSlider").GetComponent(UISlider).value;
	switch(value) {
		case 0: 	sb = 1;   break;
		case 0.125: sb = 2;   break;
		case 0.25:  sb = 5;   break;
		case 0.375: sb = 10;  break;
		case 0.5: 	sb = 25;   break;
		case 0.625: sb = 50;   break;
		case 0.75:  sb = 100;  break;
		case 0.875: sb = 250;  break;
		case 1:     sb = 500;  break;
	}
	gameObject.Find("playerBuyin/sbbbSlider/Label").GetComponent(UILabel).text = sb + "/" + (sb * 2) + " Small/Big Blind";
	buyinChange();
}
