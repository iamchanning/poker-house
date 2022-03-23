#pragma strict

private var usr: JSONObject;

var closeBtn: GameObject;

var timer: float;
var counter: int;

var timeEnds: boolean;
var matching: boolean;


function Start () {

	UIEventListener.Get(closeBtn).onClick = closeBtnClick;

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotSeasonMatch", gotSeasonMatch);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotSeasonMatchCancel", gotSeasonMatchCancel);

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);



	gameObject.transform.Find("progressBar").GetComponent(UIProgressBar).value = 0.0;

	timer = 0.0f;
	counter = 0;

	timeEnds = false;
	matching = false;
	
}

function Update(){

	timer += Time.deltaTime;

	if (gameObject.transform.Find("progressBar").GetComponent(UIProgressBar).value < 1.0) {
		gameObject.transform.Find("progressBar").GetComponent(UIProgressBar).value = timer / 20;

		if (Mathf.Round(timer) > counter) {
			counter += 2;
			if (!matching) {
				usr.SetField("data", "&action=match&dealerId=" + PlayerPrefs.GetString("playerDealerId") + "&playerId=" + PlayerPrefs.GetString("playerId"));
				GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_season", usr);
				matching = true;
			}

		}
	} 

	if (timer > 20.0f && !timeEnds) {
		timeEnds = true;
		closeBtnClick();
	}
}


function gotSeasonMatch(e : SocketIO.SocketIOEvent) {

	matching = false;
	
	Debug.Log("[SocketIO] gotSeasonMatch received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());

	try {
		if (data['response']['result'].ToString() == "1") {
			gameObject.transform.Find("progressBar").GetComponent(UIProgressBar).value = 1.0;

			PlayerPrefs.SetString("gameID", data['response']['gameID'].ToString());
			PlayerPrefs.SetString("season", "1");

			GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;	
			GameObject.Find("UI Root").GetComponent(enginepoker).enablePokerTable();

			NGUITools.Destroy(gameObject);
		} else if (data['response']['result'].ToString() == "0" && data['response']['msg'].ToString() != "") {
			NGUITools.Destroy(gameObject);
			GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague").GetComponent(leagueScene).resultShow = false;
			GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague").GetComponent(leagueScene).showUp();
			GameObject.Find("UI Root").GetComponent(enginepoker).showNotify(data['response']['msg'].ToString());
		} else {
			Debug.Log("not matching yet");
		}
			
	} catch(e) {
		Debug.Log('err in data received');
	}
}

function closeBtnClick() {
	usr.SetField("data", "&action=cancel&dealerId=" + PlayerPrefs.GetString("playerDealerId") + "&playerId=" + PlayerPrefs.GetString("playerId"));
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_season", usr);
}

function gotSeasonMatchCancel(e : SocketIO.SocketIOEvent) {
	matching = false;
	Debug.Log("[SocketIO] gotSeasonMatchCancel received: " + e.name + " " + e.data);

	NGUITools.Destroy(gameObject);
	GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague").GetComponent(leagueScene).resultShow = false;
	GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague").GetComponent(leagueScene).showUp();

	if (timeEnds) {
		GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Sorry, match failure");
	} else {
		GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Cancel matching");
	}
} 

