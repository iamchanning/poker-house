#pragma strict

var btnStart: GameObject;

private var usr: JSONObject;

private var playerNum: int;
private var speed: int;
private var startTime: String;

private var entrybuyin: int;
private var startChips: int;
private var blindup: int;
private var structure: int;

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

	playerNum = 9;
	EventDelegate.Add(gameObject.Find("tournament/playerNum/dropDownBar").GetComponent(UIPopupList).onChange, maxPlayerNumChange); 
	startTime = "Immediately";
	EventDelegate.Add(gameObject.Find("tournament/playerNum/dropDownBar2").GetComponent(UIPopupList).onChange, startTimeChange); 

	speed = 15;
	gameObject.Find("tournament/speed/quick").GetComponent(UISprite).spriteName = "checkBox_on";
	gameObject.Find("tournament/speed/standard").GetComponent(UISprite).spriteName = "checkBox_off";
	gameObject.Find("tournament/speed/professional").GetComponent(UISprite).spriteName = "checkBox_off";
	UIEventListener.Get(gameObject.Find("tournament/speed/quick")).onClick = btnQuickClick;
	UIEventListener.Get(gameObject.Find("tournament/speed/standard")).onClick = btnStandardClick;
	UIEventListener.Get(gameObject.Find("tournament/speed/professional")).onClick = btnProfessionClick;
	
	gameObject.Find("entry/entrybuyinSlider").GetComponent(UISlider).value = 0;
	gameObject.Find("entry/startChipSlider/Label").GetComponent(UILabel).text = "Buy-in: 10(9+1)";
	entrybuyin = 9;
	EventDelegate.Add(gameObject.Find("entry/entrybuyinSlider").GetComponent(UISlider).onChange, entrybuyinChange);

	gameObject.Find("entry/startChipSlider").GetComponent(UISlider).value = 0;
	gameObject.Find("entry/startChipSlider/Label").GetComponent(UILabel).text = "Starting chips: 1000";
	startChips = 1000;
	EventDelegate.Add(gameObject.Find("entry/startChipSlider").GetComponent(UISlider).onChange, startChipChange);

	gameObject.Find("blind/blindupSlider").GetComponent(UISlider).value = 0;
	gameObject.Find("blind/blindupSlider/Label").GetComponent(UILabel).text = "Blinds up: 2 min";
	blindup = 1;
	EventDelegate.Add(gameObject.Find("blind/blindupSlider").GetComponent(UISlider).onChange, blindupChange);

	structure = 0;
	gameObject.Find("blind/structure/standard").GetComponent(UISprite).spriteName = "checkBox_on";
	gameObject.Find("blind/structure/turbo").GetComponent(UISprite).spriteName = "checkBox_off";
	UIEventListener.Get(gameObject.Find("blind/structure/standard")).onClick = btnstruct1Click;
	UIEventListener.Get(gameObject.Find("blind/structure/turbo")).onClick = btnstruct2Click;
}

function btnStartClick() {

	var tournamentName = gameObject.Find("tournament/playerNum").GetComponent(UIInput).value;
	if (tournamentName == "") {
		GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Please input the tournament name!");
		return;
	}

	//var tournamentName = gameObject.Find("tournament/playerNum").GetComponent(UIInput).value ? gameObject.Find("tournament/playerNum").GetComponent(UIInput).value : "Unnamed Tournament";
	usr.SetField("data", "&action=gameCreate&type=1&title=" + tournamentName + "&maxPlayers=" + playerNum + "&speed=" + speed + "&buyin=" + (entrybuyin * 0.9) + "&entryfee=" + (entrybuyin * 0.1) + "&startChips=" + startChips + "&blindup=" + blindup + "&struct=" + structure + "&clubId=" + PlayerPrefs.GetString("clubId") + "&dearlerId=" + PlayerPrefs.GetString("playerDealerId") + "&startTime=" + startTime);

	Debug.Log("&action=gameCreate&type=1&title=" + tournamentName + "&maxPlayers=" + playerNum + "&speed=" + speed + "&buyin=" + (entrybuyin * 0.9) + "&entryfee=" + (entrybuyin * 0.1) + "&startChips=" + startChips + "&blindup=" + blindup + "&struct=" + structure + "&clubId=" + PlayerPrefs.GetString("clubId") + "&dearlerId=" + PlayerPrefs.GetString("playerDealerId") + "&startTime=" + startTime);

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);	
}

function entrybuyinChange() {
	var value: float = gameObject.Find("entry/entrybuyinSlider").GetComponent(UISlider).value;
	if (value == 0)
		entrybuyin = 10;
	else if (0 < value && value < 0.1)
		entrybuyin = 20;
	else if (0.1 < value && value < 0.2)
		entrybuyin = 50;
	else if (0.2 < value && value < 0.3)
		entrybuyin = 100;
	else if (0.3 < value && value < 0.4)
		entrybuyin = 200;
	else if (0.4 < value && value < 0.5)
		entrybuyin = 300;
	else if (0.5 < value && value < 0.6)
		entrybuyin = 400;
	else if (0.6 < value && value < 0.7)
		entrybuyin = 500;
	else if (0.7 < value && value < 0.8)
		entrybuyin = 600;
	else if (0.8 < value && value < 0.9)
		entrybuyin = 800;
	else if (0.9 < value && value < 1)
		entrybuyin = 1000;
	else if (value == 1)
		entrybuyin = 3000;

	gameObject.Find("entry/entrybuyinSlider/Label").GetComponent(UILabel).text = "Buy-in: " + entrybuyin + "(" + (entrybuyin * 0.9) + "+" + (entrybuyin * 0.1) + ")";
} 

function startChipChange() {
	var value: float = gameObject.Find("entry/startChipSlider").GetComponent(UISlider).value;
	if (value == 0)
		startChips = 1000;
	else if (0 < value && value < 0.1)
		startChips = 1500;
	else if (0.1 < value && value < 0.2)
		startChips = 2000;
	else if (0.2 < value && value < 0.3)
		startChips = 3000;
	else if (0.3 < value && value < 0.4)
		startChips = 5000;
	else if (0.4 < value && value < 0.5)
		startChips = 7500;
	else if (0.5 < value && value < 0.6)
		startChips = 10000;
	else if (0.6 < value && value < 0.7)
		startChips = 12000;
	else if (0.7 < value && value < 0.8)
		startChips = 15000;
	else if (0.8 < value && value < 0.9)
		startChips = 20000;
	else if (0.9 < value && value < 1)
		startChips = 30000;
	else if (value == 1)
		startChips = 50000;

	gameObject.Find("entry/startChipSlider/Label").GetComponent(UILabel).text = "Starting chips: " + startChips;
}

function blindupChange() {
	var value: float = gameObject.Find("blind/blindupSlider").GetComponent(UISlider).value;
	var blindupTime = 2;
	if (value == 0) {
		blindup = 1;
		blindupTime = 2;
	}
	else if (0 < value && value < 0.1) {
		blindup = 2;
		blindupTime = 3;
	}
	else if (0.1 < value && value < 0.2) {
		blindup = 3;
		blindupTime = 4;
	}
	else if (0.2 < value && value < 0.3) {
		blindup = 4;
		blindupTime = 5;
	}
	else if (0.3 < value && value < 0.4) {
		blindup = 5;
		blindupTime = 6;
	}
	else if (0.4 < value && value < 0.5) {
		blindup = 6;
		blindupTime = 7;
	}
	else if (0.5 < value && value < 0.6) {
		blindup = 7;
		blindupTime = 8;
	}
	else if (0.6 < value && value < 0.7) {
		blindup = 8;
		blindupTime = 10;
	}
	else if (0.7 < value && value < 0.8) {
		blindup = 9;
		blindupTime = 12;
	}
	else if (0.8 < value && value < 0.9) {
		blindup = 10;
		blindupTime = 15;
	}
	else if (0.9 < value && value < 1) {
		blindup = 11;
		blindupTime = 20;
	}
	else if (value == 1) {
		blindup = 12;
		blindupTime = 30;
	}

	gameObject.Find("blind/blindupSlider/Label").GetComponent(UILabel).text = "Blinds up: " + blindupTime + " min";
}

function btnstruct1Click() {
	if (structure == 0) {
		return;
	} else {
		structure = 0;
		gameObject.Find("blind/structure/standard").GetComponent(UISprite).spriteName = "checkBox_on";
		gameObject.Find("blind/structure/turbo").GetComponent(UISprite).spriteName = "checkBox_off";
	}
}

function btnstruct2Click() {
	if (structure == 1) {
		return;
	} else {
		structure = 1;
		gameObject.Find("blind/structure/turbo").GetComponent(UISprite).spriteName = "checkBox_on";
		gameObject.Find("blind/structure/standard").GetComponent(UISprite).spriteName = "checkBox_off";
	}
}

function maxPlayerNumChange() {
	switch(gameObject.Find("tournament/playerNum/dropDownBar").GetComponent(UIPopupList).current.value) {
		case "9":
			playerNum = 2; break;
		case "18":
		    playerNum = 18; break;
		case "36":
			playerNum = 36; break;
		case "72":
			playerNum = 72; break;
		case "144":
			playerNum = 144; break;
	}
}


function startTimeChange() {
	startTime = gameObject.Find("tournament/playerNum/dropDownBar2").GetComponent(UIPopupList).current.value;
} 

function btnQuickClick() {
	if (speed == 15)
		return;

	if (speed == 20) {
		speed = 15;
		gameObject.Find("tournament/speed/standard").GetComponent(UISprite).spriteName = "checkBox_off";
		gameObject.Find("tournament/speed/quick").GetComponent(UISprite).spriteName = "checkBox_on";
	} else {
		speed = 15;
		gameObject.Find("tournament/speed/professional").GetComponent(UISprite).spriteName = "checkBox_off";
		gameObject.Find("tournament/speed/quick").GetComponent(UISprite).spriteName = "checkBox_on";
	}
}

function btnStandardClick() {
	if (speed == 20)
		return;

	if (speed == 15) {
		speed = 20;
		gameObject.Find("tournament/speed/quick").GetComponent(UISprite).spriteName = "checkBox_off";
		gameObject.Find("tournament/speed/standard").GetComponent(UISprite).spriteName = "checkBox_on";
	} else {
		speed = 20;
		gameObject.Find("tournament/speed/professional").GetComponent(UISprite).spriteName = "checkBox_off";
		gameObject.Find("tournament/speed/standard").GetComponent(UISprite).spriteName = "checkBox_on";
	}
}

function btnProfessionClick() {
	if (speed == 30)
		return;

	if (speed == 15) {
		speed = 30;
		gameObject.Find("tournament/speed/quick").GetComponent(UISprite).spriteName = "checkBox_off";
		gameObject.Find("tournament/speed/professional").GetComponent(UISprite).spriteName = "checkBox_on";
	} else {
		speed = 30;
		gameObject.Find("tournament/speed/standard").GetComponent(UISprite).spriteName = "checkBox_off";
		gameObject.Find("tournament/speed/professional").GetComponent(UISprite).spriteName = "checkBox_on";
	}
}
