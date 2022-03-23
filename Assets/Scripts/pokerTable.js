#pragma strict

import LostPolygon.System.Net;
import LostPolygon.System.Net.Sockets; 

private var csNGUITools : NGUITools; 
private var csNGUIMath : NGUIMath; 
//private var csEngineFB : Facebook.Unity.EP.engineFB;

private var csEasyTTSUtil : EasyTTSUtil; 

var usr : JSONObject;
var speed = 0.05f;
	
var playerPanel : GameObject[] = null;
var playerAction : GameObject[]= null;
var playerDealCard1 : GameObject[]= null;
var playerDealCard2 : GameObject[]= null;

var tournamentStarted = 0;

//var gameID = 0;
var lastGameID = 0;
var activePlayer = 0;
var activePlayerPanel = "";
var activePlayerName = "";
//var playerActive = 0;
var tableType = "";

var myPos = -1;
var shift =0;
var hand = 0;
var lasthand = 0;
var callamount = 0.0;
var autoCall = 0.0;
var tablebet = 0.0;
var playerbet = 0.0;
var mypot = 0.0;
var mraise = 0.0;
var winpot = 0.0;
var smallBlind = 0.0;
var bigBlind = 0.0;
//var myCard1 = "";
//var myCard2 = "";
var myBetAmount =  0.0;
var action = "";
var myAction = "";
var dealer = 0;

var lastPoints = 0;
var points = 0;
//var levelUp = false;

var betAction = "";
var winners;
var winnerCount = 0;
var winCards;
var winPots = new Array ();
var winTypes = new Array ();

var displayedWinners = false;
var dealtCards = 0;
var dealtFlop = false;
var dealtTurn = false;
var dealtRiver = false;

var waitTime = 0;
var resetWaitTime = 0;

var serialNumber = "";
var lastSerialNumber = "";
var timeNow : long; 
var latency : long;

var timeLastAction : long;

var standUp = false;
var leaveGame = false;
var jumpTable = false;


var lastStatus = "";
var timeLastStatus : long;

var language = "en";
var gameRunning = false;
var errorRetry = 0;

var serverTime = 0;


//var gameSpeed = 10; //10 is slow

var maxBuyIn = 0.0f;
var minBuyIn = 0.0f;

var pnlTableInitMark: boolean;
var shiftedMark: boolean = false;

var voicePos: int;
var sitoutStatus: boolean;

//var aSources = GetComponents(AudioSource);

function Awake() {
	
}

function Start() {
		
}

function initPnlTable() {
	
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnBack").GetComponent(UISprite).alpha = 1;
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgLatency").GetComponent(UISprite).alpha = 1;

	GameObject.Find("UI Root/pnlPokerTable/pnlTable/lblLoading").GetComponent(UILabel).text = "";

	playerPanel = new GameObject[9];
   	playerAction = new GameObject[9];
 	playerDealCard1 = new GameObject[9];
 	playerDealCard2 = new GameObject[9];

 	for (var i: int = 0; i < 9; i++) {
 		//GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(UISprite).alpha = 1;

 		var prefabPlayer: GameObject = Resources.Load("Prefabs/pokerPlayer", GameObject);
 		playerPanel[i] = csNGUITools.AddChild(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i), prefabPlayer);
 		TweenAlpha.Begin(playerPanel[i].transform.Find("pnlBlerb").gameObject, 0.3, 0);
 		playerPanel[i].name = 'pnlPlayer' + i;

 		playerPanel[i].GetComponent(UIPanel).alpha = 0;
		playerPanel[i].transform.Find("WinnerEffectHalo").GetComponent.<ParticleSystem>().Stop();
		playerPanel[i].transform.Find("SideEffectHalo").GetComponent.<ParticleSystem>().Stop();
		playerPanel[i].transform.Find("SplitEffectHalo").GetComponent.<ParticleSystem>().Stop();
			
		playerPanel[i].GetComponent(UIPanel).transform.position.x += 0.2;
		playerPanel[i].GetComponent(UIPanel).transform.position.y -= 0.1;
		
		playerPanel[i].transform.Find("imgDealer").GetComponent(UISprite).alpha = 0;
		playerPanel[i].transform.Find("btnProfile").GetComponent(UIButton).isEnabled = false;
		playerPanel[i].transform.Find("pnlCards").GetComponent(UIPanel).alpha = 0;
		playerPanel[i].transform.Find("pnlCards/cardA/win").GetComponent(UISprite).alpha = 0;
		playerPanel[i].transform.Find("pnlCards/cardB/win").GetComponent(UISprite).alpha = 0;
		playerPanel[i].transform.Find("imgWinner").GetComponent(UISprite).alpha = 0;
		playerPanel[i].transform.Find("talking").GetComponent(UISprite).alpha = 0;
		playerPanel[i].transform.Find("btnMute").GetComponent(UISprite).alpha = 0;
		//playerPanel[i].transform.Find("imgFold/btnReturn").GetComponent(UISprite).alpha = 0;
		playerPanel[i].transform.Find("imgFold/Status").GetComponent(UILabel).text = "";
		
		UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i + "/" + playerPanel[i].name + "/btnProfile")).onClick = btnProfile;
		UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i + "/" + playerPanel[i].name + "/btnMute")).onClick = btnMute;

		var prefabAction: GameObject = Resources.Load("Prefabs/pokerAction", GameObject);
		playerAction[i] = csNGUITools.AddChild(GameObject.Find("UI Root/pnlPokerTable/pnlTable"), prefabAction);
 		playerAction[i].name = 'pnlAction' + i;
 		playerAction[i].GetComponent(UIPanel).alpha = 0;
 			

 		var prefabDealCard1: GameObject = Resources.Load("Prefabs/pokerDealCard", GameObject);
 		playerDealCard1[i] = csNGUITools.AddChild(GameObject.Find("UI Root/pnlPokerTable/pnlTable"), prefabDealCard1);
		playerDealCard1[i].name = 'playerDealCard1' + i;
		//playerDealCard1[i].transform.GetComponent(UIPanel).alpha = 0;
		playerDealCard1[i].GetComponent(UIPanel).alpha = 0;

		var prefabDealCard2: GameObject = Resources.Load("Prefabs/pokerDealCard", GameObject);
		playerDealCard2[i] = csNGUITools.AddChild(GameObject.Find("UI Root/pnlPokerTable/pnlTable"), prefabDealCard2);
		playerDealCard2[i].name = 'playerDealCard2' + i;
		//playerDealCard1[i].transform.GetComponent(UIPanel).alpha = 0;
		playerDealCard2[i].GetComponent(UIPanel).alpha = 0;

		if(PlayerPrefs.GetString("seats") == "5" && (i == 1 || i == 3 || i == 5 || i == 7)) {
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(UISprite).alpha = 0;
		} else {
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(UISprite).alpha = 1;
		}

		//UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i)).onClick = btnSit(i);
		if (GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).x == 0 && GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).y == 0) {

			GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).transform.localPosition.x = GameObject.Find("UI Root/pnlPokerTable/pnlTable/pos" + i).transform.localPosition.x;
            GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).transform.localPosition.y = GameObject.Find("UI Root/pnlPokerTable/pnlTable/pos" + i).transform.localPosition.y;

			GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).x = GameObject.Find("UI Root/pnlPokerTable/pnlTable/pos" + i).transform.localPosition.x;
            GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).y = GameObject.Find("UI Root/pnlPokerTable/pnlTable/pos" + i).transform.localPosition.y;
			
			//GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).x = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(UIButton).transform.localPosition.x;
			//GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).y = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(UIButton).transform.localPosition.y;

		}

		GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).setRelativePos();

		if (shiftedMark) {
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).shiftBack();
		}
		//ResetAction(i);

	}

	shiftedMark = false;

	if (SystemInfo.deviceModel.ToString().IndexOf("iPad") > -1 || Application.isWebPlayer) {
	 	GameObject.Find("UI Root/pnlPokerTable/pnlTable").GetComponent(UIPanel).SetRect(-(1024/2)- 100,-250,1024 + 200,650);	
	 	
	 	TweenScale.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable"),0.0, Vector3(0.8f, 0.8f, 0.8f));															
	} 

	for (var j: int = 1; j < 6; j++) {
		
		if (GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard" + j).GetComponent(UISprite).spriteName != 'facedown') {
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard" + j).GetComponent(UISprite).alpha = 1;
			//GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard" + j + "/win").GetComponent(UISprite).alpha = 1;
		}
	}

	voicePos = 0; 

	GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSitout").GetComponent(UISprite).alpha = 0;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSitout")).onClick = btnPlayerSitout;

	//GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_sync", usr); 

}

function showUp () {
	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString ("playerName"));
	usr.AddField("level","0");
	usr.AddField("playerMove","");
	usr.AddField("joinGame","");
	usr.AddField("msg","");
	usr.AddField("data","");	
	usr.AddField("socketId",GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);
	usr.AddField("language",PlayerPrefs.GetString("playerLanguage"));
	usr.AddField("gameID",strToInt(PlayerPrefs.GetString("gameID")));

	GameObject.Find("UI Root/pnlPokerTable").GetComponent(voiceQueue).voiceQueue.Clear();
	GameObject.Find("UI Root/pnlPokerTable").GetComponent(voiceQueue).processFlag = false;

	pnlTableInitMark = false;
	//shiftedMark = false;

	GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu").GetComponent(UIPanel).alpha = 0;
	TweenHeight.Begin(GameObject.Find("UI Root/pnlPokerTable/wdgMenu").GetComponent(UIWidget),0.3,0);
	
	//GameObject.Find("UI Root/pnlPokerTable/pnlDebug").GetComponent(UIPanel).alpha = 0;

    GameObject.Find("UI Root/pnlPokerTable/pnlTable/pnlWinner").GetComponent(UIPanel).alpha = 0;

	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting").GetComponent(UIPanel).alpha = 0;

	if(PlayerPrefs.GetInt("Vibrate") != 1) {
		GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/chkVibrate").GetComponent(UIToggle).value = true;
	} else {
		GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/chkVibrate").GetComponent(UIToggle).value = false;
	}
   	
   	if(PlayerPrefs.GetInt("Voice") != 1) {
		GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/chkVoice").GetComponent(UIToggle).value = true;
	} else {
		GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/chkVoice").GetComponent(UIToggle).value = false;
	}

	if(PlayerPrefs.GetInt("TableVoice") != 1) {
		GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/chkTableVoice").GetComponent(UIToggle).value = true;
	} else {
		GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/chkTableVoice").GetComponent(UIToggle).value = false;
	}
	
	//speed = PlayerPrefs.GetFloat("socketSpeed");
 
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotPoker", gotPoker);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("seasonTableResult", seasonTableResult);
	//GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("voicesNotify", voicesHandle);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("sitoutRsp", sitoutRsp);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotNewGameID", gotNewGameID);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("closeTable", closeTable);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotTnmAddon", gotTnmAddon);
	//socket.On("gotChat", gotChat);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotRank", gotRank);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotHeartbeat", gotHeartbeat);

	GameObject.Find("UI Root/pnlPokerTable/pnlTable/pnlWinPot").GetComponent(UIPanel).alpha = 0;

	GameObject.Find("UI Root/pnlPokerTable/pnlTable/lblLoading").GetComponent(UILabel).text = "Loading please wait";

	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCheckAction").GetComponent(UIPanel).alpha = 0;
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction").GetComponent(UIPanel).alpha = 0;
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlBetAction").GetComponent(UIPanel).alpha = 0;
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlAllinAction").GetComponent(UIPanel).alpha = 0;

	latency = 0;
	timeNow = System.DateTime.Now.Ticks;
	gameRunning = true;

	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/btnCancel")).onClick = btnCancelBack;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/btnCancelBack")).onClick = btnCancelBack;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/btnBackNow")).onClick = btnBackNow;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/btnStandUp")).onClick = btnStandUp;
	//UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/btnJump")).onClick = btnJump;
	
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlAllinAction/btnAllinFold")).onClick = btnFold;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCheckAction/btnCheckFold")).onClick = btnFold;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction/btnCallFold")).onClick = btnFold;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCheckAction/btnCheck")).onClick = btnCheck;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction/btnCallCheck")).onClick = btnCheck;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlAllinAction/btnAllin")).onClick = btnAllin;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction/btnCallAllin")).onClick = btnAllin;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCheckAction/btnBet")).onClick = btnBet;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCheckAction/btnCheckAllin")).onClick = btnAllin;
	
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction/btnCall")).onClick = btnCall;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction/btnRaise")).onClick = btnRaise;
	
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlBetAction/btnBetCancel")).onClick = btnBetCancel;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlBetAction/btnBetConfirm")).onClick = btnBetConfirm;


	EventDelegate.Add(GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/chkVibrate").GetComponent(UIToggle).onChange, setVibrate);
	EventDelegate.Add(GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/chkVoice").GetComponent(UIToggle).onChange, setVoice);
	EventDelegate.Add(GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/chkTableVoice").GetComponent(UIToggle).onChange, setTableVoice);
	
	EventDelegate.Add(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlBetAction/sldBetAmount").GetComponent(UISlider).onChange, setBetAmount);

	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoFold")).onClick = btnWaitFold;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCheckFold")).onClick = btnWaitCheckFold;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall")).onClick = btnWaitCall;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCallAny")).onClick = btnWaitCallAny;

	csEasyTTSUtil.Initialize (csEasyTTSUtil.UnitedStates,null);

	//GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_sync", usr);

	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnBack")).onClick = btnBack;

	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit0")).onClick = btnSit0;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit1")).onClick = btnSit1;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit2")).onClick = btnSit2;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit3")).onClick = btnSit3;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit4")).onClick = btnSit4;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit5")).onClick = btnSit5;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit6")).onClick = btnSit6;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit7")).onClick = btnSit7;
	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit8")).onClick = btnSit8;

	var i: int;
	for (i = 1; i < 10; i++) {
		
		if (i < 6) {
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard" + i).GetComponent(UISprite).alpha = 0;
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard" + i + "/win").GetComponent(UISprite).alpha = 0;
		}

		//GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + (i - 1)).GetComponent(UISprite).alpha = 0;
	}

	GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnBack").GetComponent(UISprite).alpha = 0;
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgLatency").GetComponent(UISprite).alpha = 0;
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/microphone").GetComponent(UISprite).alpha = 0;
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnAddon").GetComponent(UISprite).alpha = 0;

	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnAddon")).onClick = btnAddon;

	// -------

	/*

	GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnBack").GetComponent(UISprite).alpha = 1;
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgLatency").GetComponent(UISprite).alpha = 1;

	GameObject.Find("UI Root/pnlPokerTable/pnlTable/lblLoading").GetComponent(UILabel).text = "";

	playerPanel = new GameObject[9];
   	playerAction = new GameObject[9];
 	playerDealCard1 = new GameObject[9];
 	playerDealCard2 = new GameObject[9];

 	for (i = 0; i < 9; i++) {
 		//GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(UISprite).alpha = 1;

 		var prefabPlayer: GameObject = Resources.Load("Prefabs/pokerPlayer", GameObject);
 		playerPanel[i] = csNGUITools.AddChild(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i), prefabPlayer);
 		TweenAlpha.Begin(playerPanel[i].transform.Find("pnlBlerb").gameObject, 0.3, 0);
 		playerPanel[i].name = 'pnlPlayer' + i;

 		playerPanel[i].GetComponent(UIPanel).alpha = 0;
		playerPanel[i].transform.Find("WinnerEffectHalo").GetComponent.<ParticleSystem>().Stop();
		playerPanel[i].transform.Find("SideEffectHalo").GetComponent.<ParticleSystem>().Stop();
		playerPanel[i].transform.Find("SplitEffectHalo").GetComponent.<ParticleSystem>().Stop();
			
		playerPanel[i].GetComponent(UIPanel).transform.position.x += 0.2;
		playerPanel[i].GetComponent(UIPanel).transform.position.y -= 0.1;
		
		playerPanel[i].transform.Find("imgDealer").GetComponent(UISprite).alpha = 0;
		playerPanel[i].transform.Find("btnProfile").GetComponent(UIButton).isEnabled = false;
		playerPanel[i].transform.Find("pnlCards").GetComponent(UIPanel).alpha = 0;
		playerPanel[i].transform.Find("pnlCards/cardA/win").GetComponent(UISprite).alpha = 0;
		playerPanel[i].transform.Find("pnlCards/cardB/win").GetComponent(UISprite).alpha = 0;
		playerPanel[i].transform.Find("imgWinner").GetComponent(UISprite).alpha = 0;
		playerPanel[i].transform.Find("talking").GetComponent(UISprite).alpha = 0;
		playerPanel[i].transform.Find("btnMute").GetComponent(UISprite).alpha = 0;
		//playerPanel[i].transform.Find("imgFold/btnReturn").GetComponent(UISprite).alpha = 0;
		playerPanel[i].transform.Find("imgFold/Status").GetComponent(UILabel).text = "";
		
		
		UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i + "/" + playerPanel[i].name + "/btnProfile")).onClick = btnProfile;
		UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i + "/" + playerPanel[i].name + "/btnMute")).onClick = btnMute;

		var prefabAction: GameObject = Resources.Load("Prefabs/pokerAction", GameObject);
		playerAction[i] = csNGUITools.AddChild(GameObject.Find("UI Root/pnlPokerTable/pnlTable"), prefabAction);
 		playerAction[i].name = 'pnlAction' + i;



 		var prefabDealCard1: GameObject = Resources.Load("Prefabs/pokerDealCard", GameObject);
 		playerDealCard1[i] = csNGUITools.AddChild(GameObject.Find("UI Root/pnlPokerTable/pnlTable"), prefabDealCard1);
		playerDealCard1[i].name = 'playerDealCard1' + i;
		//playerDealCard1[i].transform.GetComponent(UIPanel).alpha = 0;

		var prefabDealCard2: GameObject = Resources.Load("Prefabs/pokerDealCard", GameObject);
		playerDealCard2[i] = csNGUITools.AddChild(GameObject.Find("UI Root/pnlPokerTable/pnlTable"), prefabDealCard2);
		playerDealCard2[i].name = 'playerDealCard2' + i;
		//playerDealCard1[i].transform.GetComponent(UIPanel).alpha = 0;

		if(PlayerPrefs.GetString("seats") == "5" && (i == 1 || i == 3 || i == 5 || i == 7)) {
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(UISprite).alpha = 0;
		} else {
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(UISprite).alpha = 1;
		}

		//UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i)).onClick = btnSit(i);
		if (GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).x == 0 && GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).y == 0) {

			GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).transform.localPosition.x = GameObject.Find("UI Root/pnlPokerTable/pnlTable/pos" + i).transform.localPosition.x;
            GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).transform.localPosition.y = GameObject.Find("UI Root/pnlPokerTable/pnlTable/pos" + i).transform.localPosition.y;

			GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).x = GameObject.Find("UI Root/pnlPokerTable/pnlTable/pos" + i).transform.localPosition.x;
            GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).y = GameObject.Find("UI Root/pnlPokerTable/pnlTable/pos" + i).transform.localPosition.y;
			
			//GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).x = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(UIButton).transform.localPosition.x;
			//GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).y = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(UIButton).transform.localPosition.y;

		}

		GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).setRelativePos();

		if (shiftedMark) {
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).shiftBack();
		}
		//ResetAction(i);

	}

	shiftedMark = false;

	if (SystemInfo.deviceModel.ToString().IndexOf("iPad") > -1 || Application.isWebPlayer) {
	 	GameObject.Find("UI Root/pnlPokerTable/pnlTable").GetComponent(UIPanel).SetRect(-(1024/2)- 100,-250,1024 + 200,650);	
	 	
	 	TweenScale.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable"),0.0, Vector3(0.8f, 0.8f, 0.8f));															
	} 

	for (var j: int = 1; j < 6; j++) {
		
		if (GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard" + j).GetComponent(UISprite).spriteName != 'facedown') {
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard" + j).GetComponent(UISprite).alpha = 1;
			//GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard" + j + "/win").GetComponent(UISprite).alpha = 1;
		}
	}

	voicePos = 0; 

	UIEventListener.Get(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSitout")).onClick = btnPlayerSitout; */

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_sync", usr);  
	
}

function Update () {

	checkLatency();
	
}

function ResetAction(i) {

	//return;


	if(displayedWinners) return;
	/*
	var i: int = (myPos > -1) ? GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + p).GetComponent(tableObjPosController).tarPos : p;

	var x = playerPanel[i].GetComponent(UIPanel).transform.position.x;
	var y = playerPanel[i].GetComponent(UIPanel).transform.position.y;

	if(i == 0) {
		x += 0.12;
		y += -0.45;
	} else if(i == 1) {
		x += -0.15;
		y += -0.35;
	} else if(i == 2) {
		x += -0.2;
		y += -0.2;
	} else if(i == 3) {
		x += -0.2;
		y += -0.05;
	} else if(i == 4) {
		x += 0.36;
		y += 0.06;
	} else if(i == 5) {
		x += 0.4;
		y += 0;
	} else if(i == 6) {
		x += 0.45;
		y += -0.2;
	} else if(i == 7) {
		x += 0.4;
		y += -0.35;
	} else if(i == 8) {
		x += 0.12;
		y += -0.45;
	}

	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(UIPanel).transform.position.x = x;
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(UIPanel).transform.position.y = y; 
	*/
	//GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(UIPanel).transform.position.x = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).actionx;
	//GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(UIPanel).transform.position.y = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).actiony; 
	try {
		TweenPosition.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name),0.01,Vector3(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).actionx,GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).actiony,0));
	} catch (e) {
		Debug.Log(e);
	}
	//GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(UIPanel).alpha = 0;
}

function btnBuyIn(i) {

	if (tournamentStarted || PlayerPrefs.GetString("season") == "1") 
		return;

	if (GameObject.Find("UI Root/pnlPokerTable/pnlPokerBuyIn(Clone)") == null) {

		var prefab: GameObject = Resources.Load("Prefabs/pnlPokerBuyIn", GameObject);
		var newPnl: GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
		newPnl.GetComponent(prefabPnlBuyIn).maxBuyIn = maxBuyIn;
		newPnl.GetComponent(prefabPnlBuyIn).minBuyIn = minBuyIn;
		newPnl.GetComponent(prefabPnlBuyIn).seat = i;
	}
}

function btnBack() {
	PlaySoundFile("button2");
	TweenHeight.Begin(GameObject.Find("UI Root/pnlPokerTable/wdgMenu").GetComponent(UIWidget),0.3,822);
	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu"), 0.5, 1);
}


function btnBackNow() {
	PlaySoundFile("button2");
 	standUp = true;
	leaveGame = true;
	sendAction('fold',0);
}

function btnCancelBack() {

	PlaySoundFile("button2");
	TweenHeight.Begin(GameObject.Find("UI Root/pnlPokerTable/wdgMenu").GetComponent(UIWidget),0.5,0);
	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu"), 0.3, 0);

}



function btnStandUp() {

 	PlaySoundFile("button2");		
	standUp = true;
	
	sendAction('fold',0);

	btnCancelBack();
	
}
/*
function btnJump() {
	PlaySoundFile("button2");
	btnCancelBack();
 				
	standUp = true;
	jumpTable = true;
	
	sendAction('fold',0);
	
}
*/

function btnFold() {

	PlaySoundFile("button2");
	sendAction('fold',0);
	
}

function btnCheck() {
	PlaySoundFile("button3");
	sendAction('check',0);
	
}

function btnCall() {

	PlaySoundFile("button3");
	sendAction('call',0);
	
}

function btnBet() {
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlBetAction/sldBetAmount").GetComponent(UISlider).value = 0.02;
	
	betAction = 'Bet';
	showControls("pnlBetAction");
	
	PlaySoundFile("button3");
	showBetAmount(0);


}

function btnAllin() {
	PlaySoundFile("button3");
	myBetAmount = mypot;
	sendAction('bet',myBetAmount);
}

function btnRaise() {
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlBetAction/sldBetAmount").GetComponent(UISlider).value = 0.02;
	
	betAction = 'Raise';
	showControls("pnlBetAction");

	PlaySoundFile("button3");
	showBetAmount(0);
	
}

function btnBetCancel() {

	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlBetAction").GetComponent(UIPanel).alpha = 0;

	PlaySoundFile("button2");
	if(betAction == 'Bet') {
		showControls("pnlCheckAction");
	} else {
		showControls("pnlCallAction");
	}
	
}

function btnBetConfirm() {

	PlaySoundFile("button3");
	sendAction('bet',myBetAmount);
	
}

function sendAction(action : String, amount : float) {

	//Debug.Log("SendAction " + action);

	hideControls(true);

	resetWaitControls();
	
	//stopTimer(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit4/pnlPlayer4"));
	if (myPos > -1)
		stopTimer(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + (myPos - 1) + "/pnlPlayer" + (myPos - 1)));
	
	
	waitTime = 0;
	
	var append = "";
	
	if(action == 'bet') {
		append = "action=bet&betamount=" + amount.ToString() + "&type=" + betAction + "&c=" + (tablebet-playerbet);
	} else {
		append = 'action='+action;
	}
	/*
	var url = 'player_move.php?' + append;
	
	if(action == "leave") {
		url = 'sitout.php?' + append + "&leaveGame=" + leaveGame;
	}
	
	if(action == "jump") {
	
		append = "action=process&type=s&budget=" + PlayerPrefs.GetString("JumpBudget");
			
		if(PlayerPrefs.GetInt("CashGameSeats") == 0) {
			append += "&players=9";
		} else {
			append += "&players=5";
		}
		if(PlayerPrefs.GetInt("CashGameSpeed") == 0) {
			append += "&speed=10";
		} else {
			append += "&speed=5";
		}
		
		var JumpedTables = PlayerPrefs.GetString("JumpedTables");
		JumpedTables += gameID + ",";
		PlayerPrefs.SetString("JumpedTables", JumpedTables);
		
		append += "&jump=" + JumpedTables;
		
		url = 'play.php?' + append;
		
		Debug.Log(url);
	}
	*/
	
	//Debug.Log("TEST " + url);
	
	if(action != "leave" && action != "jump") {
		
		usr.SetField("playerMove", "&" + append);
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_playermove", usr);
	} 
	/*
	if(action == "jump") {
		
		var data = LitJson.JsonMapper.ToObject(poker.data.ToString());
		
		jumpTable = false;
		
		if(data["gameID"].ToString() == "") {
			PlayerPrefs.SetString("JumpedTables","");
			jumpNow();
		} else if(parseInt(data["gameID"].ToString()) != gameID) {
			//unbindSocket();
			//socket.Close();
			//Application.LoadLevel ("Poker");
			Debug.Log("jump game id different");
		} else {
			//TweenAlpha.Begin(GameObject.Find("pnlNotify"),0.3,0);
		}
		
 	}
 	*/
	if(standUp == true) {
		standUp = false;
		leaveNow();
		return;
	}
	
	if(action == "leave") {
		if(jumpTable) {
			jumpNow();
			return;
		} else {
			Debug.Log("A");
			usr.SetField("data", "&leaveGame=" + leaveGame + "&clubId=" + PlayerPrefs.GetString("clubId"));
			GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("sitout", usr);
		}
	}
	/*
	if(leaveGame && action == "leave" && !jumpTable) {
		
		for (var i: int = 0; i < 9; i++) {
			NGUITools.Destroy(playerPanel[i]);
			NGUITools.Destroy(playerAction[i]);
			NGUITools.Destroy(playerDealCard1[i]);
			NGUITools.Destroy(playerDealCard2[i]);
		}
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.Off("gotPoker", gotPoker);
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
		return;
	} */

	callamount = 0;
	tablebet = 0;
	playerbet = 0;

	resetWaitControls();
}

function jumpNow() {
	sendAction('jump',0);
}

function leaveNow() {
	sendAction('leave',0);
}

function trySocket() {
	try {

		if(errorRetry > 3) {
			Debug.Log("errorRetry > 3");
		} else {
			latency = 0;
			timeNow = System.DateTime.Now.Ticks;
			errorRetry += 1;
			GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_sync", usr);
		}
	
	} catch (err) {
		Debug.Log('ERROR: ' + err);
		
	}	
}

function checkLatency() {

	latency = (System.DateTime.Now.Ticks - timeNow) / System.TimeSpan.TicksPerSecond;
	
	if(!gameRunning) {
		latency = 0;
	}
	
	if(latency <= 30) {
		GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgLatency").GetComponent(UISprite).spriteName = 'signalExcellent';
	} else if(latency <= 35) {
		GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgLatency").GetComponent(UISprite).spriteName = 'signalGood';
	} else if(latency <= 40) {
		GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgLatency").GetComponent(UISprite).spriteName = 'signalPoor';
	} else {
		GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgLatency").GetComponent(UISprite).spriteName = 'signalConnecting';
	}
	
	
	if(latency > 40) {
		trySocket();
	}
}


function gotPoker( e : SocketIO.SocketIOEvent){

	//Debug.Log("[SocketIO] Poker received: " + e.name + " " + e.data);



	if (!pnlTableInitMark) {
		
		pnlTableInitMark = true;
		initPnlTable();
	}  



	
	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	
	try {

		//if(gameID == 0) TweenAlpha.Begin(GameObject.Find("pnlNotify"),0.3,0);
		
		if(data["gameID"].ToString() != "0") {

			if(serverTime > strToInt(data["time"].ToString())) return;

			PlayerPrefs.SetString("gameNo", data["gameNo"].ToString());

			tournamentStarted = strToInt(data["tournamentStarted"].ToString());

			if(data["languageKey"].ToString() == "GAME_TOURNAMENT_PAUSED" || data["languageKey"].ToString() == "GAME_TOURNAMENT_MOVINGPLAYERS" || data["languageKey"].ToString() == "GAME_TOURNAMENT_STARTS" || data["languageKey"].ToString() == "GAME_TOURNAMENT_FINISHED") {
				//
				//
				if(data["languageKey"].ToString() == "GAME_TOURNAMENT_MOVINGPLAYERS") {
					gameRunning = false;

					usr.SetField("data", data["linkedId"].ToString());
					GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_newgameid", usr);
				}
				
				if(data["languageKey"].ToString() == "GAME_TOURNAMENT_FINISHED") {
					gameRunning = false;
					//show tournament results
				}
			} 

			timeNow = System.DateTime.Now.Ticks;

			serverTime = strToInt(data["time"].ToString());
			
			//Set static stuff
			GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/lblTableName").GetComponent(UILabel).text = data["tablename"].ToString();
			
			shift = strToInt(data["shift"].ToString());
			myPos = strToInt(data["iam"].ToString());
			//gameID = strToInt(data["gameID"].ToString());			
			hand = strToInt(data["hand"].ToString());

			if (myPos > -1) {
				if(parseInt(data["p" + (myPos - 1) + "status"].ToString()) > 0) {
					sitoutStatus = true;
					//resetWaitControls();
					playerPanel[myPos - 1].transform.Find("imgFold").GetComponent(UISprite).alpha = 1;
					//playerPanel[myPos - 1].transform.Find("imgFold/btnReturn").GetComponent(UISprite).alpha = 1;
					GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSitout").GetComponent(UISprite).alpha = 1;
					GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSitout/Label").GetComponent(UILabel).text = "I'm Back";
					playerPanel[myPos - 1].transform.Find("imgFold/Status").GetComponent(UILabel).text = "Sit Out";
				} else {
					GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSitout").GetComponent(UISprite).alpha = 1;
					GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSitout/Label").GetComponent(UILabel).text = "Sit Out";
					playerPanel[myPos - 1].transform.Find("imgFold/Status").GetComponent(UILabel).text = "";
					sitoutStatus = false;
				}
			} else {
				GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSitout").GetComponent(UISprite).alpha = 0;
				sitoutStatus = false;
			}

			if (data.Keys.Contains("addon") && parseInt(data["addon"].ToString()) > 0 && myPos > -1) {
				GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnAddon").GetComponent(UISprite).alpha = 1;
			} else {
				GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnAddon").GetComponent(UISprite).alpha = 0;
			}

			if (hand == 1) {
				voicePos = 0;
			}

			if (GameObject.Find("UI Root/pnlPokerTable/pnlTable/microphone").GetComponent(UISprite).alpha == 0 && myPos > -1) {
				TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/microphone"),0.5,1);
			} else if (GameObject.Find("UI Root/pnlPokerTable/pnlTable/microphone").GetComponent(UISprite).alpha == 1 && myPos == -1) { 
				TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/microphone"),0.5,0);
			}

			var loop: int;

			if (shiftedMark && myPos == -1) {
				for  (loop = 0; loop < 9; loop++) {
					playerPanel[loop].GetComponent(UIPanel).transform.localPosition.x = 72;
					playerPanel[loop].GetComponent(UIPanel).transform.localScale = new Vector3(1.0f, 1.0f, 1.0f);
					GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + loop).GetComponent(tableObjPosController).shiftBack();
				}
				shiftedMark = false;
			} else if (!shiftedMark && myPos > -1) {
				for  (loop = 0; loop < 9; loop++) {
					playerPanel[loop].GetComponent(UIPanel).transform.localPosition.x = 72;
					playerPanel[loop].GetComponent(UIPanel).transform.localScale = new Vector3(1.0f, 1.0f, 1.0f);
					GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + loop).GetComponent(tableObjPosController).shift();
				}

				playerPanel[myPos - 1].GetComponent(UIPanel).transform.localScale = new Vector3(1.3f, 1.3f, 1.3f);
				playerPanel[myPos - 1].GetComponent(UIPanel).transform.localPosition.x = 110;
				playerPanel[myPos - 1].GetComponent(UIPanel).transform.localPosition.y = -8.1;
				
				playerPanel[myPos - 1].transform.Find("imgWinner").GetComponent(UISprite).transform.localScale = new Vector3(1.3f, 1.3f, 1.3f);
				playerPanel[myPos - 1].transform.Find("imgWinner").GetComponent(UISprite).transform.localPosition.y = 46;
				playerPanel[myPos - 1].transform.Find("lblBank").GetComponent(UILabel).transform.localPosition.y = -73;
				
				playerPanel[myPos - 1].transform.Find("WinnerEffectHalo").GetComponent.<ParticleSystem>().startSize = 0.8;
				playerPanel[myPos - 1].transform.Find("SideEffectHalo").GetComponent.<ParticleSystem>().startSize = 0.8;
				playerPanel[myPos - 1].transform.Find("SplitEffectHalo").GetComponent.<ParticleSystem>().startSize = 0.8;
				
				playerPanel[myPos - 1].transform.Find("AllInEffectHalo").GetComponent.<ParticleSystem>().startSize = 1;
				playerPanel[myPos - 1].transform.Find("fire").GetComponent.<ParticleSystem>().startSize = 1;
				
				//playerPanel[i].transform.Find("pnlCards").GetComponent(UIPanel).alpha = 0;
				playerPanel[myPos - 1].transform.Find("pnlCards/cardA").GetComponent(UISprite).transform.localPosition.y = -41;
				playerPanel[myPos - 1].transform.Find("pnlCards/cardB").GetComponent(UISprite).transform.localPosition.y = -41;
				playerPanel[myPos - 1].transform.Find("pnlCards/cardA").GetComponent(UISprite).transform.localScale = new Vector3(1.3f, 1.3f, 1.3f);
				playerPanel[myPos - 1].transform.Find("pnlCards/cardB").GetComponent(UISprite).transform.localScale = new Vector3(1.3f, 1.3f, 1.3f);

				shiftedMark = true;
			} 


			activePlayer = strToInt(data["tomove"].ToString());

			if(hand == 14 || activePlayer < 0) {
				stopAllPlayers();
			}
			
			activePlayerName = data["shifttomove"].ToString();
		
			
			dealer = strToInt(data["dealer"].ToString());
			//points = strToInt(data["points"].ToString());
			tableType = "table" + data["tableColour"].ToString();
			
			minBuyIn = parseFloat(data["tablelow"].ToString());
			maxBuyIn = parseFloat(data["tablelimit"].ToString());


			//Debug.Log("hand => " + hand + " activePlayerName => " + activePlayerName + " activePlayer => " + activePlayer);


			// Auto take a seat
			if(strToInt(PlayerPrefs.GetString("gameID")) != lastGameID) {
				//usr.SetField("gameID",gameID);

				resetWaitControls();

				var playerNum: int = 0;
				for  (loop = 0; loop < 9; loop++) {
					if (data["names" + loop].ToString() != '')
						playerNum++;
				}

				//GameObject.Find("pnlJackpot/btnJackpotLow/Label").GetComponent(UILabel).text = CurrencyFormat(parseFloat(data["jackpotLow"].ToString()));
				//GameObject.Find("pnlJackpot/btnJackpotMed/Label").GetComponent(UILabel).text = CurrencyFormat(parseFloat(data["jackpotMed"].ToString()));
				//GameObject.Find("pnlJackpot/btnJackpotHi/Label").GetComponent(UILabel).text = CurrencyFormat(parseFloat(data["jackpotHi"].ToString()));
				if(myPos == -1 && playerNum < parseInt(data["seats"].ToString())) {
					Debug.Log(lastGameID + " " + PlayerPrefs.GetString("gameID"));
					btnBuyIn(-1);
				}
			}
			
			/*
			if(myPos == -1) {
				GameObject.Find("btnChat").GetComponent(UIButton).isEnabled = false;
			} else {
				GameObject.Find("btnChat").GetComponent(UIButton).isEnabled = true;
			} */
			
			lastGameID = strToInt(PlayerPrefs.GetString("gameID"));
			/*
			if(tableType != GameObject.Find("pnlTable/imgTable").GetComponent(UISprite).spriteName) {
				GameObject.Find("pnlTable/imgTable").GetComponent(UISprite).spriteName = tableType;
			} */

			/*
			if(points != lastPoints && lastPoints != 0) {

				if(GameObject.Find("pnlInfo/lblLevel").GetComponent(UILabel).text != data["level"].ToString() && GameObject.Find("pnlInfo/lblLevel").GetComponent(UILabel).text != "") {
					levelUp = true;
				}
				
				AnimatePoints();

			}
			
			lastPoints = points; */
			
			
			if(hand < 3) {
				dealtCards = 0;
				//GameObject.Find("pnlJackpot/lblJackpot").GetComponent(UILabel).text = "Buy into Jackpot for this round?";
			} else {
				//GameObject.Find("pnlJackpot/lblJackpot").GetComponent(UILabel).text = "Buy into Jackpot for next round?";
			}
			
			
			//GameObject.Find("pnlJackpot/lblJackpotAmount").GetComponent(UILabel).text = CurrencyFormat(parseInt(data["payoutBank"].ToString()));
			
			
			if(hand <= 2 || hand >= 14) {
            
                //Hide pot
                TweenAlpha.Begin(GameObject.Find('UI Root/pnlPokerTable/pnlTable/pnlWinPot'), 0.5, 0);
                
            } else {
                
                TweenAlpha.Begin(GameObject.Find('UI Root/pnlPokerTable/pnlTable/pnlWinPot'), 0.5, 1);
                
            }
            
            
            /*
			
			if(hand == 3) {
				
				if(GameObject.Find("pnlJackpot/btnJackpotLow").GetComponent(UISprite).spriteName == "buttonCheckSmallOn") {
					buyIntoJackpot("low");
				} else if(GameObject.Find("pnlJackpot/btnJackpotMed").GetComponent(UISprite).spriteName == "buttonCheckSmallOn") {
					buyIntoJackpot("med");
				} else if(GameObject.Find("pnlJackpot/btnJackpotHi").GetComponent(UISprite).spriteName == "buttonCheckSmallOn") {
					buyIntoJackpot("hi");
				}
				
			}
			
			*/

			//--> This is used to identify new changes in game state to avoid duplicate sounds and actions
			lastSerialNumber = serialNumber;
			serialNumber = data["dealertxt"].ToString();
			//<--

			if(data["shifttomove"].ToString() == "" && activePlayerPanel != "") {
				//stopActiveTimer
				var pos: String = activePlayerPanel.Substring(activePlayerPanel.Length - 1);
				stopTimer(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + activePlayerPanel));
				
			}

			//GameObject.Find("UI Root/pnlPokerTable/pnlDebug/lblDebug").GetComponent(UILabel).text = data["debug"].ToString();
			//GameObject.Find("pnlInfo/lblLevel").GetComponent(UILabel).text = data["level"].ToString();
			//GameObject.Find("pnlInfo/prgLevel").GetComponent(UISlider).value = strToFloat(data["levelPrg"].ToString());

			tablebet = strToFloat(data["tablebet"].ToString());
			playerbet = strToFloat(data["playerbet"].ToString());
			mypot = strToFloat(data["mypot"].ToString());

			/*
			if(myPos >= 0) {
				if(data["p4bet"].ToString().Contains("F")) {
					myAction = 'fold';
				} else {
					myAction = data["p4action"].ToString();
				}
			} else {
				myAction = "";
			} */

			if(myPos >= 0) {
				if(data["p" + (myPos - 1) + "bet"].ToString().Contains("F")) {
					myAction = 'fold';
				} else {
					myAction = data["p" + (myPos - 1) + "action"].ToString();
				}

			} else {
				myAction = "";
			}

			//myCard1 = data["cards4a"].ToString();
            //myCard2 = data["cards4b"].ToString();


			winpot = strToFloat(data["winpot"].ToString());
            mraise = strToFloat(data["mraise"].ToString());
			smallBlind = parseFloat(data["sb"].ToString()); 
            bigBlind = parseFloat(data["bb"].ToString());




            //" + (myPos - 1) + "
            /*
            if(myPos != -1 && playerPanel[myPos - 1].GetComponent(UIPanel).transform.localPosition.x < 80) {
				//SetPlayer4();
				
				playerPanel[myPos - 1].GetComponent(UIPanel).transform.localScale = new Vector3(1.3f, 1.3f, 1.3f);
				playerPanel[myPos - 1].GetComponent(UIPanel).transform.localPosition.x = 110;
				playerPanel[myPos - 1].GetComponent(UIPanel).transform.localPosition.y = -8.1;
				
				playerPanel[myPos - 1].transform.Find("imgWinner").GetComponent(UISprite).transform.localScale = new Vector3(1.3f, 1.3f, 1.3f);
				playerPanel[myPos - 1].transform.Find("imgWinner").GetComponent(UISprite).transform.localPosition.y = 46;
				playerPanel[myPos - 1].transform.Find("lblBank").GetComponent(UILabel).transform.localPosition.y = -73;
				
				playerPanel[myPos - 1].transform.Find("WinnerEffectHalo").GetComponent.<ParticleSystem>().startSize = 0.8;
				playerPanel[myPos - 1].transform.Find("SideEffectHalo").GetComponent.<ParticleSystem>().startSize = 0.8;
				playerPanel[myPos - 1].transform.Find("SplitEffectHalo").GetComponent.<ParticleSystem>().startSize = 0.8;
				
				playerPanel[myPos - 1].transform.Find("AllInEffectHalo").GetComponent.<ParticleSystem>().startSize = 1;
				playerPanel[myPos - 1].transform.Find("fire").GetComponent.<ParticleSystem>().startSize = 1;
				
				//playerPanel[i].transform.Find("pnlCards").GetComponent(UIPanel).alpha = 0;
				playerPanel[myPos - 1].transform.Find("pnlCards/cardA").GetComponent(UISprite).transform.localPosition.y = -41;
				playerPanel[myPos - 1].transform.Find("pnlCards/cardB").GetComponent(UISprite).transform.localPosition.y = -41;
				playerPanel[myPos - 1].transform.Find("pnlCards/cardA").GetComponent(UISprite).transform.localScale = new Vector3(1.3f, 1.3f, 1.3f);
				playerPanel[myPos - 1].transform.Find("pnlCards/cardB").GetComponent(UISprite).transform.localScale = new Vector3(1.3f, 1.3f, 1.3f);
				
				
			} */ /* else if(playerPanel[myPos - 1].GetComponent(UIPanel).transform.localPosition.x != 72 && myPos == -1) {

				
				playerPanel[myPos - 1].GetComponent(UIPanel).transform.localScale = new Vector3(1.0f, 1.0f, 1.0f);
				playerPanel[myPos - 1].GetComponent(UIPanel).transform.localPosition.x = 72;
				playerPanel[myPos - 1].GetComponent(UIPanel).transform.localPosition.y = -8.1;
				
				playerPanel[myPos - 1].transform.Find("imgWinner").GetComponent(UISprite).transform.localScale = new Vector3(1.0f, 1.0f, 1.0f);
				playerPanel[myPos - 1].transform.Find("imgWinner").GetComponent(UISprite).transform.localPosition.y = 346;
				playerPanel[myPos - 1].transform.Find("lblBank").GetComponent(UILabel).transform.localPosition.y = -49;
				
				playerPanel[myPos - 1].transform.Find("WinnerEffectHalo").GetComponent.<ParticleSystem>().startSize = 0.6;
				playerPanel[myPos - 1].transform.Find("SideEffectHalo").GetComponent.<ParticleSystem>().startSize = 0.6;
				playerPanel[myPos - 1].transform.Find("SplitEffectHalo").GetComponent.<ParticleSystem>().startSize = 0.6;
				
				playerPanel[myPos - 1].transform.Find("AllInEffectHalo").GetComponent.<ParticleSystem>().startSize = 0.65;
				playerPanel[myPos - 1].transform.Find("fire").GetComponent.<ParticleSystem>().startSize = 0.66;
				
				playerPanel[myPos - 1].transform.Find("pnlCards").GetComponent(UIPanel).alpha = 0;
				playerPanel[myPos - 1].transform.Find("pnlCards/cardA").GetComponent(UISprite).transform.localPosition.y = 30;
				playerPanel[myPos - 1].transform.Find("pnlCards/cardB").GetComponent(UISprite).transform.localPosition.y = 30;
				playerPanel[myPos - 1].transform.Find("pnlCards/cardA").GetComponent(UISprite).transform.localScale = new Vector3(1.0f, 1.0f, 1.0f);
				playerPanel[myPos - 1].transform.Find("pnlCards/cardB").GetComponent(UISprite).transform.localScale = new Vector3(1.0f, 1.0f, 1.0f);

			} */

			//if(gameSpeed != parseInt(data["speed"].ToString())) {
				//Must be fast
				for (var j: int = 0; j < 9; j++){
					playerPanel[j].transform.Find("timer").GetComponent(CircularProgress).timeToComplete = parseInt(data["speed"].ToString());
					playerPanel[j].transform.Find("timer").GetComponent(TweenColor).duration = 5;
					playerPanel[j].transform.Find("tracker").GetComponent(Orbit).speed = 360 / parseInt(data["speed"].ToString());
				}
			//}

			if (data["voices"].ToString() != "") {
				var voiceItem: String[] = data["voices"].ToString().Split(" "[0]);

				var voiceCurPos = (voicePos == 0) ? (voiceItem.Length - 1) : voicePos;

				for (var m: int = voiceCurPos; m < voiceItem.Length; m++) {
					var voiceInfo: String[] = voiceItem[m].Split(","[0]);
					GameObject.Find("UI Root/pnlPokerTable").GetComponent(voiceQueue).addVoices(data["names" + (parseInt(voiceInfo[0]) - 1)].ToString(), parseInt(voiceInfo[1]), parseInt(voiceInfo[0]));
				}

				voicePos = voiceItem.Length;
			}
			
            /*		

			if(chats[0] != data["p0chat"].ToString()) {
				playerPanel[0].transform.Find("pnlBlerb/lblStatic").GetComponent(UILabel).text = data["p0chat"].ToString();
				if(data["p0chat"].ToString() == "") {
					TweenAlpha.Begin(GameObject.Find(playerPanel[0].name +"/pnlBlerb"),0.3,0);
				} else {
					TweenAlpha.Begin(GameObject.Find(playerPanel[0].name +"/pnlBlerb"),0.3,1);
					
					Invoke("CloseChatWindow0", 4);
					
				}
			}
		

			if(chats[1] != data["p1chat"].ToString()) {
				playerPanel[1].transform.Find("pnlBlerb/lblStatic").GetComponent(UILabel).text = data["p1chat"].ToString();
				if(data["p1chat"].ToString() == "") {
					TweenAlpha.Begin(GameObject.Find(playerPanel[1].name +"/pnlBlerb"),0.3,0);
				} else {
					TweenAlpha.Begin(GameObject.Find(playerPanel[1].name +"/pnlBlerb"),0.3,1);
					
					Invoke("CloseChatWindow1", 4);

				}
			}
			
			if(chats[2] != data["p2chat"].ToString()) {
				playerPanel[2].transform.Find("pnlBlerb/lblStatic").GetComponent(UILabel).text = data["p2chat"].ToString();
				if(data["p2chat"].ToString() == "") {
					TweenAlpha.Begin(GameObject.Find(playerPanel[2].name +"/pnlBlerb"),0.3,0);
				} else {
					TweenAlpha.Begin(GameObject.Find(playerPanel[2].name +"/pnlBlerb"),0.3,1);
					
					Invoke("CloseChatWindow2", 4);
					
				}
			}
				
			if(chats[3] != data["p3chat"].ToString()) {
				playerPanel[3].transform.Find("pnlBlerb/lblStatic").GetComponent(UILabel).text = data["p3chat"].ToString();
				if(data["p3chat"].ToString() == "") {
					
					TweenAlpha.Begin(GameObject.Find(playerPanel[3].name +"/pnlBlerb"),0.3,0);
				} else {
					
					TweenAlpha.Begin(GameObject.Find(playerPanel[3].name +"/pnlBlerb"),0.3,1);
					
					Invoke("CloseChatWindow3", 4);
					
				}
			}
		
			if(chats[4] != data["p4chat"].ToString()) {
				playerPanel[4].transform.Find("pnlBlerb/lblStatic").GetComponent(UILabel).text = data["p4chat"].ToString();
				if(data["p4chat"].ToString() == "") {
					
					TweenAlpha.Begin(GameObject.Find(playerPanel[4].name +"/pnlBlerb"),0.3,0);
				} else {
					
					TweenAlpha.Begin(GameObject.Find(playerPanel[4].name +"/pnlBlerb"),0.3,1);
					
					Invoke("CloseChatWindow4", 4);
					
				}
			}
			
					
			if(chats[5] != data["p5chat"].ToString()) {
				playerPanel[5].transform.Find("pnlBlerb/lblStatic").GetComponent(UILabel).text = data["p5chat"].ToString();
				if(data["p5chat"].ToString() == "") {
					
					TweenAlpha.Begin(GameObject.Find(playerPanel[5].name +"/pnlBlerb"),0.3,0);
				} else {
				
					TweenAlpha.Begin(GameObject.Find(playerPanel[5].name +"/pnlBlerb"),0.3,1);
					
					Invoke("CloseChatWindow5", 4);
					
				}
			}


			if(chats[6] != data["p6chat"].ToString()) {
				playerPanel[6].transform.Find("pnlBlerb/lblStatic").GetComponent(UILabel).text = data["p6chat"].ToString();
				if(data["p6chat"].ToString() == "") {
					
					TweenAlpha.Begin(GameObject.Find(playerPanel[6].name +"/pnlBlerb"),0.3,0);
				} else {
					
					TweenAlpha.Begin(GameObject.Find(playerPanel[6].name +"/pnlBlerb"),0.3,1);
					
					Invoke("CloseChatWindow6", 4);
					
				}
			}
			
			
			if(chats[7] != data["p7chat"].ToString()) {
				playerPanel[7].transform.Find("pnlBlerb/lblStatic").GetComponent(UILabel).text = data["p7chat"].ToString();
				if(data["p7chat"].ToString() == "") {
					
					TweenAlpha.Begin(GameObject.Find(playerPanel[7].name +"/pnlBlerb"),0.3,0);
				} else {
					
					TweenAlpha.Begin(GameObject.Find(playerPanel[7].name +"/pnlBlerb"),0.3,1);
					
					Invoke("CloseChatWindow7", 4);
					
				}
			}
		
		
			if(chats[8] != data["p8chat"].ToString()) {
				playerPanel[8].transform.Find("pnlBlerb/lblStatic").GetComponent(UILabel).text = data["p8chat"].ToString();
				if(data["p8chat"].ToString() == "") {
					
					TweenAlpha.Begin(GameObject.Find(playerPanel[8].name +"/pnlBlerb"),0.3,0);
				} else {
					
					TweenAlpha.Begin(GameObject.Find(playerPanel[8].name +"/pnlBlerb"),0.3,1);
					
					Invoke("CloseChatWindow8", 4);
					
				}
			}
			
		
			
			chats = [data["p0chat"].ToString(),
						data["p1chat"].ToString(), 
            			data["p2chat"].ToString(), 
            			data["p3chat"].ToString(), 
            			data["p4chat"].ToString(), 
            			data["p5chat"].ToString(), 
            			data["p6chat"].ToString(), 
            			data["p7chat"].ToString(), 
            			data["p8chat"].ToString()];
			*/
            if(hand == 14) {

            	

            	winners = new Array (data["winner1"].ToString(), 
            			data["winner2"].ToString(), 
            			data["winner3"].ToString(), 
            			data["winner4"].ToString(), 
            			data["winner5"].ToString());

           		winCards = new Array(data["win1"].ToString(), 
            			data["win2"].ToString(), 
            			data["win3"].ToString(), 
            			data["win4"].ToString(), 
            			data["win5"].ToString());
            	
            	winTypes = new Array(data["winType1"].ToString(), 
            			data["winType2"].ToString(), 
            			data["winType3"].ToString(), 
            			data["winType4"].ToString(), 
            			data["winType5"].ToString());
            				
            	winPots = new Array(data["p0potwin"].ToString(),
            			data["p1potwin"].ToString(), 
            			data["p2potwin"].ToString(), 
            			data["p3potwin"].ToString(), 
            			data["p4potwin"].ToString(), 
            			data["p5potwin"].ToString(),
            			data["p6potwin"].ToString(),
            			data["p7potwin"].ToString(),
            			data["p8potwin"].ToString());
            			
            	
            }
            
            GameObject.Find("UI Root/pnlPokerTable/pnlTable/lblNotify").GetComponent(UILabel).text = data["notify"].ToString();
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/lblStatus").GetComponent(UILabel).text = data["dealertxt"].ToString();
			
			TextToSpeech(data["dealertxt"].ToString());
     		
			if(data["hand"].ToString() == "") {
				btnStartGame();
			}
			
			if(data["tablecards0"].ToString() != "na")
				GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard1").GetComponent(UISprite).spriteName = data["tablecards0"].ToString();
			
			if(data["tablecards1"].ToString() != "na")
				GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard2").GetComponent(UISprite).spriteName = data["tablecards1"].ToString();
			
			if(data["tablecards2"].ToString() != "na")
				GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard3").GetComponent(UISprite).spriteName = data["tablecards2"].ToString();
				
			if(data["tablecards3"].ToString() != "na")
				GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard4").GetComponent(UISprite).spriteName = data["tablecards3"].ToString();
				
			if(data["tablecards4"].ToString() != "na")
				GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard5").GetComponent(UISprite).spriteName = data["tablecards4"].ToString();


			PlaySoundFile(data["sfx"].ToString());

			if (hand > 4 && hand < 14) {
				for  (loop = 0; loop < 9; loop++) {
					if(data["p" + loop + "bet"].ToString().IndexOf('F') == -1 && !String.IsNullOrEmpty(data["names" + loop].ToString())) {
			        	showCards(loop);
					} else {
						//GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerDealCard1[loop].name).GetComponent(UIPanel).alpha = 0;
	    				//GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerDealCard2[loop].name).GetComponent(UIPanel).alpha = 0;
					}
				}
			}
				
			//<-- Process each player
			for(var i : int = 0; i < 9; i++) {

		        var datName = "names" + i;
		        
		        var playerCardA = data["cards" + i + "a"].ToString();
		        var playerCardB = data["cards" + i + "b"].ToString();
				
		      	playerPanel[i].transform.Find("pnlCards/cardA").GetComponent(UISprite).spriteName = playerCardA;
            	playerPanel[i].transform.Find("pnlCards/cardB").GetComponent(UISprite).spriteName = playerCardB;
		       
		        if(playerCardA == "" || myPos == -1) {
		        	playerPanel[i].transform.Find("pnlCards/cardA/win").GetComponent(UISprite).alpha = 0;
					playerPanel[i].transform.Find("pnlCards/cardB/win").GetComponent(UISprite).alpha = 0;
				}
				

				if(hand < 3) {
					GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(gridRow).folded = false;
				}

				if(String.IsNullOrEmpty(data[datName].ToString())) {
		        	//Seat not active
		        	playerPanel[i].transform.Find("lblName").GetComponent(UILabel).text = "Loading";
		        	playerPanel[i].GetComponent(UIPanel).alpha = 0;
		        	
		        	ClearPlayer(i);
		        	/*
		        	if(tournamentStarted > 0) {
		        		GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(UIButton).isEnabled = false;
		        		GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(UISprite).alpha = 0;
					} */
		        } else {

		        	if(playerPanel[i].transform.Find("lblName").GetComponent(UILabel).text == "Loading" || playerPanel[i].transform.Find("lblName").GetComponent(UILabel).text != data[datName].ToString()) {
		        		//---> Clear the table of all elements for this player
		        		dealtCards = 0;
		        		ClearPlayer(i);
		        		//<---
		        		
		        		//---> Make player panel visible and set initial fields
			        	//GameObject.Find(playerPanel[i].name).GetComponent(UIPanel).alpha = 1;
			        	
			        	playerPanel[i].GetComponent(UIPanel).alpha = 1;
			        	
			        	playerPanel[i].transform.Find("lblName").GetComponent(UILabel).text = data[datName].ToString();

			        	if (activePlayerName == data[datName].ToString()) {
							activePlayerPanel = playerPanel[i].name;
						}

			        	datName = "pots" + i;
			        	playerPanel[i].transform.Find("lblBank").GetComponent(UILabel).text = CurrencyFormat(strToFloat(data[datName].ToString()));
			        	
			        	//<---
			        	datName = "avat" + i;
			        	GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(data[datName].ToString(), playerPanel[i].transform.Find("imgAvatar").gameObject, false);
						
						datName = "p" + i + "country";
						playerPanel[i].transform.Find("imgFlag").GetComponent(UISprite).spriteName = data[datName].ToString();
		  		
		  		
						playerPanel[i].transform.Find("imgFold").GetComponent(UISprite).alpha = 0;
						//playerPanel[i].transform.Find("imgFold/btnReturn").GetComponent(UISprite).alpha = 0;
						 
						
		        	} else {
		        	
		        		//Persistant changes to player

		        		if(activePlayerName == playerPanel[i].transform.Find("lblName").GetComponent(UILabel).text) {
		        			
		        			activePlayerPanel = playerPanel[i].name;
		   					
		        		} else {
							stopTimer(playerPanel[i]);
						}
		        		
		        		if(dealtCards <= 1 && hand >= 3 && hand < 5) {
							datName = "p" + i + "bet";
			        		if(data[datName].ToString().IndexOf('F') == -1 || data[datName].ToString().IndexOf('J') == -1) {
								DealCards(i);
							}
						}
		        		
		        		if(hand != lasthand) {
		        			//Do once

		        		}
			        	
		        		//---> Set player fields
			        	datName = "pots" + i;
			        	playerPanel[i].transform.Find("lblBank").GetComponent(UILabel).text = CurrencyFormat(strToFloat(data[datName].ToString()));
			        	
			        	datName = "level" + i;
			        	playerPanel[i].transform.Find("lblLevel").GetComponent(UILabel).text = data[datName].ToString();


			        	/*
			        	if(displayedWinners == false && hand >= 3) {
			        		datName = "p" + i + "action";
				        	action = data[datName].ToString();


				        	if(action != "" && GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text != data[datName].ToString()) {


				        		GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/imgAction").GetComponent(UISprite).spriteName = ('act' + action);
				        	
					        	switch (action) {

					        		case 'allin':

										GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text = action;
					        			playerPanel[i].transform.Find("AllInEffectHalo").GetComponent.<ParticleSystem>().Play(true);

					        			break;

					        		case 'fold': 

					        			GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text = action;

					        			if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(gridRow).folded == false) {

											GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(gridRow).folded = true;
											AnimateFoldCards(playerDealCard1[i].name);
											AnimateFoldCards(playerDealCard2[i].name);

										}

										break;

									case 'check': 
					        			
					        			GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text = action;
										break;

									case 'call': 
					        		case 'bet': 
					        		case 'raise': 	

					        			datName = "p" + i + "lbet";
					        			GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text = data[datName].ToString();
					        		
			
										break;


					        	   } 

					        	   ShowAction(i);

					        }
			        		

			        	} else {
			        		datName = "p" + i + "lbet";
			        		if(data[datName].ToString() != "0") {
			        			
			        			
			        			if(hand == 3) {
			        				GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/imgAction").GetComponent(UISprite).spriteName = 'smallblind';
			        		
			        			} else if(hand == 4) {
			        				if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/imgAction").GetComponent(UISprite).spriteName != 'smallblind') {
			        					GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/imgAction").GetComponent(UISprite).spriteName = 'bigblind';
			        				}
			        			}
			        			
			        			
			        			if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text != data[datName].ToString()) {
		        					GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text = data[datName].ToString();
									ShowAction(i);
								}
		        			}
		        		}

		        		*/



			        	
			        	if(displayedWinners == false && hand >= 3) {
				        	datName = "p" + i + "action";
				        	action = data[datName].ToString();


				        	if(data["p" + i + "bet"].ToString().IndexOf('J') > -1) {
				        		action = 'joined';
				        	} 

				        	/*
				        	if(action == 'fold' || action == 'joined') {
				        		playerPanel[i].transform.Find("imgFold").GetComponent(UISprite).alpha = 1;
				        		playerPanel[i].transform.Find("imgFold/btnReturn").GetComponent(UISprite).alpha = 0;
				        	}
				        	*/

				        	// show actions
				        	if(action == "sb" || action == "bb" || action == "call" || action == "bet" || action == "raise") {
				        		// an action with a value
				        		datName = "p" + i + "lbet";

			        			if(GameObject.Find(playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text != data[datName].ToString() || GameObject.Find(playerAction[i].name + "/imgAction").GetComponent(UISprite).spriteName != ('act' + action)) {
			        				GameObject.Find(playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text = data[datName].ToString();

			        				//Debug.Log('Bet => ' +data["names" + i].ToString() + ', ' + GameObject.Find(playerAction[i].name + "/imgAction").GetComponent(UISprite).spriteName + ', ' + GameObject.Find(playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text + ', ' + data[datName].ToString());

			        				ShowAction(i);
			        			} else {
			        				//Debug.Log('No Show Bet => ' + data["names" + i].ToString() + ', ' + GameObject.Find(playerAction[i].name + "/imgAction").GetComponent(UISprite).spriteName + ', ' + GameObject.Find(playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text + ', ' + data[datName].ToString());
			        			}
			        		} else if(GameObject.Find(playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text != action && action != '') {

				        		//Debug.Log('Check => ' + data["names" + i].ToString() + ', ' + GameObject.Find(playerAction[i].name + "/imgAction").GetComponent(UISprite).spriteName + ', ' + GameObject.Find(playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text + ', ' + data[datName].ToString());

	
		        				GameObject.Find(playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text = action;
		        				
								ShowAction(i);

								if(action == 'fold' && GameObject.Find(playerAction[i].name).GetComponent(gridRow).folded == false) {
									GameObject.Find(playerAction[i].name).GetComponent(gridRow).folded = true;
									AnimateFoldCards(playerDealCard1[i].name);
									AnimateFoldCards(playerDealCard2[i].name);
								}
								
								if(action == 'allin') {
									playerPanel[i].transform.Find("AllInEffectHalo").GetComponent.<ParticleSystem>().Play(true);
								}
			        	
			        		} else {
			        			//Debug.Log('No Show => ' + data["names" + i].ToString() + ', ' + GameObject.Find(playerAction[i].name + "/imgAction").GetComponent(UISprite).spriteName + ', ' + GameObject.Find(playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text + ', ' + data[datName].ToString());
			        		}

			        		// set small, big blind image or other action image
				        	if(action != ''){
		        				GameObject.Find(playerAction[i].name + "/imgAction").GetComponent(UISprite).spriteName = ('act' + action);
		        			}

		        			if (hand == 0 || hand > 13) AnimateAction(GameObject.Find(playerAction[i].name), 0.5, Vector3(-30, 150, 0));

		        			/*
				        	if(action != "" && GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text != data[datName].ToString()) {
				        		
				        		GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/imgAction").GetComponent(UISprite).spriteName = ('act' + action);
				        		
				        		datName = "p" + i + "lbet";
				        		if(action == "call" || action == "bet" || action == "raise") {
				        		
				        			if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text != data[datName].ToString()) {
				        				
				        				GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text = data[datName].ToString();
				        			
				        				ShowAction(i);
				        			}



				        		} else {


									if (action == 'joined') {
										GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/imgAction").GetComponent(UISprite).spriteName = ('act' + action);
									} 
				        			
				        			if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text != action) {
				        				
				        				GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text = action;
				        				
										ShowAction(i);


										if(action == 'fold' && GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(gridRow).folded == false) {
											GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(gridRow).folded = true;
											AnimateFoldCards(playerDealCard1[i].name);
											AnimateFoldCards(playerDealCard2[i].name);

										}
										
										if(action == 'allin') {
											playerPanel[i].transform.Find("AllInEffectHalo").GetComponent.<ParticleSystem>().Play(true);
										}

				        			}


				        		}



				        	} else {
				        		datName = "p" + i + "lbet";
				        		if(data[datName].ToString() != "0") {
				        			
				        			
				        			if(hand == 3) {
				        				GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/imgAction").GetComponent(UISprite).spriteName = 'smallblind';
				        		
				        			} else if(hand == 4) {
				        				if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/imgAction").GetComponent(UISprite).spriteName != 'smallblind') {
				        					GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/imgAction").GetComponent(UISprite).spriteName = 'bigblind';
				        				}
				        			}
				        			
				        			
				        			if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text != data[datName].ToString()) {
			        					GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text = data[datName].ToString();
										ShowAction(i);
									}
			        			} else {
			        				//All in
			        			}


				        	}
				        	*/

				        	//if (hand < 2 || hand > 12) AnimateAction(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name), 0.5, Vector3(-30, 150, 0));

				        	/*
				        	datName = "p" + i + "lbet";
			        	
				        	if(data[datName].ToString() == data['blankBet'].ToString() || hand < 2) {

								AnimateAction(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name), 0.5, Vector3(10, 163, 0));
				        	}  
				        	*/

			        	}


			        	datName = "p" + i + "streak";
			       		
			       		
			       		if(strToInt(data[datName].ToString()) >= 3) {
			       			playerPanel[i].transform.Find("fire").GetComponent.<ParticleSystem>().Play();
			       		} else {
			       			playerPanel[i].transform.Find("fire").GetComponent.<ParticleSystem>().Stop();
			       		}
			       		
			       		/*
			        	if(hand < 5) {
			        		playerPanel[i].transform.Find("imgFold").GetComponent(UISprite).alpha = 0;
			        		playerPanel[i].transform.Find("imgFold/btnReturn").GetComponent(UISprite).alpha = 0;
			        	}
			        	*/

			        	if(hand == 14 || hand < 3) {
			        		playerPanel[i].transform.Find("AllInEffectHalo").GetComponent.<ParticleSystem>().Stop();
			        		
			        		
			        		GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerDealCard1[i].name).GetComponent(UIPanel).alpha = 0;
			        		GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerDealCard2[i].name).GetComponent(UIPanel).alpha = 0;
			        	}
			        	
			        	/*
			        	datName = "p" + i + "bet";

			        	if(data[datName].ToString().IndexOf('F') != -1 || data[datName].ToString().IndexOf('J') != -1) {
			        		playerPanel[i].transform.Find("imgFold").GetComponent(UISprite).alpha = 1;
			        		playerPanel[i].transform.Find("imgFold/btnReturn").GetComponent(UISprite).alpha = 0;
			        	} else if (data[datName].ToString().IndexOf('S') != -1) {
			        		if(i != (myPos -1)) {
			        			playerPanel[i].transform.Find("imgFold").GetComponent(UISprite).alpha = 1;
			        			playerPanel[i].transform.Find("imgFold/Status").GetComponent(UILabel).text = "Sitting Out";
			        		}  
			        	} else {
			        		playerPanel[i].transform.Find("imgFold").GetComponent(UISprite).alpha = 0;
			        		playerPanel[i].transform.Find("imgFold/btnReturn").GetComponent(UISprite).alpha = 0;
			        		playerPanel[i].transform.Find("imgFold/Status").GetComponent(UILabel).text = "";
			        	}
			        	*/

			        	if (parseInt(data["p" + i + "status"].ToString()) > 0) {
			        		if(i != myPos - 1) {
			        			playerPanel[i].transform.Find("imgFold").GetComponent(UISprite).alpha = 1;
			        			playerPanel[i].transform.Find("imgFold/Status").GetComponent(UILabel).text = "Sitting Out";
			        		}
			        	} 

			        	if((data["p" + i + "bet"].ToString().IndexOf('F') != -1 || data["p" + i + "bet"].ToString().IndexOf('J') != -1) && parseInt(data["p" + i + "status"].ToString()) == 0) {
			        		playerPanel[i].transform.Find("imgFold").GetComponent(UISprite).alpha = 1;
			        		//playerPanel[i].transform.Find("imgFold/btnReturn").GetComponent(UISprite).alpha = 0;
			        		playerPanel[i].transform.Find("imgFold/Status").GetComponent(UILabel).text = "";
			        	}  

			        	if (data["p" + i + "bet"].ToString().IndexOf('F') == -1 && data["p" + i + "bet"].ToString().IndexOf('J') == -1 && parseInt(data["p" + i + "status"].ToString()) == 0) {
			        		playerPanel[i].transform.Find("imgFold").GetComponent(UISprite).alpha = 0;
			        		//playerPanel[i].transform.Find("imgFold/btnReturn").GetComponent(UISprite).alpha = 0;
			        		playerPanel[i].transform.Find("imgFold/Status").GetComponent(UILabel).text = "";
			        	}  


			        	//<---
	
		        	}
		        	
		        }
		        

		        if(dealer == i) {
		        	playerPanel[i].transform.Find("imgDealer").GetComponent(UISprite).alpha = 1;
		        } else {
		        	playerPanel[i].transform.Find("imgDealer").GetComponent(UISprite).alpha = 0;
		        }

		       	
		        if(hand < 5 || hand >= 13) {
		        	stopTimer(playerPanel[i]);
		        	resetWaitControls();
		        }
		        
		        if(hand == 14) {
            		TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i + "/" + playerPanel[i].name + "/pnlCards"),0.3,1);
            		
		        } else {
		        	
		        	if(hand < 5) {
		        		// Repeating #revisit
			        	for (var winner : String in winners) {
							unmarkWinner(winner);
						}
						winnerCount = 0;
						
						GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard1").GetComponent(UISprite).alpha = 0;
					    GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard2").GetComponent(UISprite).alpha = 0;
					    GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard3").GetComponent(UISprite).alpha = 0;
					    GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard4").GetComponent(UISprite).alpha = 0;
					    GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard5").GetComponent(UISprite).alpha = 0;
					    
					    GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard1/win").GetComponent(UISprite).alpha = 0;
					    GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard2/win").GetComponent(UISprite).alpha = 0;
					    GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard3/win").GetComponent(UISprite).alpha = 0;
					    GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard4/win").GetComponent(UISprite).alpha = 0;
					    GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard5/win").GetComponent(UISprite).alpha = 0;						    
					    // End revist
						
					    TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i + "/" + playerPanel[i].name + "/pnlCards"),0.3,0);
					}
		        	
		        }
		        
	
		    }
			//--> end process each player
			

			if(hand >= 3 && dealtCards != 2) dealtCards += 1;

			if(hand < 5) {
				dealtFlop = false;
				dealtTurn = false;
				dealtRiver = false;
				
				GameObject.Find("UI Root/pnlPokerTable/pnlTable/lblRake").GetComponent(UILabel).text = "";
				GameObject.Find("UI Root/pnlPokerTable/pnlTable/lblRake").GetComponent(UILabel).transform.position = Vector3(24,162,0);
				GameObject.Find("UI Root/pnlPokerTable/pnlTable/lblRake").GetComponent(UILabel).alpha = 1;
				
			}
			
			if(hand >= 5) {

				if(myPos != -1) {
	        		//GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerDealCard1[myPos - 1].name).GetComponent(UIPanel).alpha = 0;
	        		//GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerDealCard2[myPos - 1].name).GetComponent(UIPanel).alpha = 0;
					TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + (myPos - 1) + "/pnlPlayer" + (myPos - 1) + "/pnlCards"),0.3,1);
				}

	        }
	        
	        if(hand >= 6 && dealtFlop == false) {
	        	showFlop();

	        }
	        if(hand >= 8 && dealtTurn == false) {
	        	showTurn();
	        }
	        if(hand >= 10 && dealtRiver == false) {
	        	showRiver();
	        }
	        
			if(hand <= 1 || hand >= 13) {
				hideControls(false);
			}
				
			//tomove
        	if (hand >= 5 && hand <= 12 && activePlayer >= 0) {

        		startTimer(data["p" + activePlayer + "status"].ToString());
        	}
        	
        	if(data["winner1"].ToString() != "" && hand >= 14) {

				GameObject.Find("UI Root/pnlPokerTable/pnlTable/pnlWinner/Label").GetComponent(UILabel).text = data["dealertxt"].ToString();
				
				if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/lblRake").GetComponent(UILabel).text != data["rake"].ToString()) {
					
					var tweenPos : TweenPosition = TweenPosition.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/lblRake"),0.5,Vector3(0,0,0));
	
					tweenPos.delay = 0;
					tweenPos.duration = 2;
					tweenPos.from = Vector3(24,162,0);
					tweenPos.to = Vector3(24, 220,0);
					tweenPos.Play(true);
				
					GameObject.Find("UI Root/pnlPokerTable/pnlTable/lblRake").GetComponent(UILabel).text = data["rake"].ToString();
					
					var tweenAlp : TweenAlpha  = TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/lblRake"),0.3,0);
					tweenAlp.delay = 1.7f;
					tweenAlp.duration = 0.3;
					tweenAlp.Play(true);
					
				}
				

				
        		for (var winner : String in winners) {
        			
        			markWinner(winner);
						
				}
				
			
				
				displayedWinners = true;
				
				
				/*
				if(data["jackpotWin"].ToString() != "") {
					
					GameObject.Find("pnlJackpotWin/lblTitle").GetComponent(UILabel).text = CurrencyFormat(parseInt(data["jackpotWin"].ToString()));
					GameObject.Find("pnlJackpotWin/lblDetails").GetComponent(UILabel).text = data["jackpotKey"].ToString();
					
					serialNumber = "buychips";
					PlaySoundFile(serialNumber);
					serialNumber = "applause2";
					PlaySoundFile(serialNumber);
					
					TweenAlpha.Begin(GameObject.Find("pnlJackpotWin"),0.3,1);
					
					GameObject.Find("pnlJackpotWin/LevelUpEffect1").GetComponent.<ParticleSystem>().Play(true);
					GameObject.Find("pnlJackpotWin/LevelUpEffect2").GetComponent.<ParticleSystem>().Play(true);
					GameObject.Find("pnlJackpotWin/LevelUpEffect3").GetComponent.<ParticleSystem>().Play(true);
					GameObject.Find("pnlJackpotWin/LevelUpEffect4").GetComponent.<ParticleSystem>().Play(true);
	
				}
				*/
				
				

			}
			
			
			if(hand == 15) {

				/*
				TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard1"),1,0);
				TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard2"),1,0);
				TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard3"),1,0);
				TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard4"),1,0);
				TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard5"),1,0);
				*/
				for (var k: int = 1; k < 6; k++) {
					GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard" + k).GetComponent(UISprite).alpha = 0;
					GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard" + k + "/win").GetComponent(UISprite).alpha = 0;
				}
				TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/pnlWinner"),1,0);
			
				
				for(var a : int = 0; a < 9; a++) {
					
				
					GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + a + "/" + playerPanel[a].name + "/WinnerEffectHalo").GetComponent.<ParticleSystem>().Stop();
					GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + a + "/" + playerPanel[a].name + "/SideEffectHalo").GetComponent.<ParticleSystem>().Stop();
					GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + a + "/" + playerPanel[a].name + "/SplitEffectHalo").GetComponent.<ParticleSystem>().Stop();
		
					GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + a + "/" + playerPanel[a].name + "/WinnerEffectChips").GetComponent.<ParticleSystem>().Stop();

					TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + a + "/" + playerPanel[a].name + "/imgWinner"),1,0);
			
				}
				
			
			}
			
		
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/pnlWinPot/imgChip/lblPot").GetComponent(UILabel).text = data["tablepot"].ToString();

		} else {
			
		}

	} catch (err) {
			Debug.Log('ERROR: ' + err);
		//unbindSocket();
	}

	if (myPos != -1 && (data["cards" + (myPos - 1) + "a"].ToString()  == "" || cleanCard(data["tablecards0"].ToString()) == "")) {
		TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + (myPos - 1) + "/pnlPlayer" + (myPos - 1) + "/HandRank"),0.3,0);
	}

	if(hand != lasthand) {
		if (myPos != -1 && hand > 3 && data["cards" + (myPos - 1) + "a"].ToString()  != "" && cleanCard(data["tablecards0"].ToString()) != "") {
			var str = "'" + cleanCard(data["cards" + (myPos - 1) + "a"].ToString()) + "','" + cleanCard(data["cards" + (myPos - 1) + "b"].ToString()) + "','" + cleanCard(data["tablecards0"].ToString()) + "','" + cleanCard(data["tablecards1"].ToString()) + "','" + cleanCard(data["tablecards2"].ToString()) + "'";


			if(cleanCard(data["tablecards3"].ToString()) != "") {
				str = str + ",'" + cleanCard(data["tablecards3"].ToString()) + "'";
			}

			if(cleanCard(data["tablecards4"].ToString()) != "") {
				str = str + ",'" + cleanCard(data["tablecards4"].ToString()) + "'";
			}
		
			usr.SetField("data",str); //Split(","[0])
			GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_rank", usr);	
		}
		
		
		
		lasthand = hand;
		//playerActive = -1;
		timeLastAction = 0;
	}

	//GameObject.Find("UI Root/pnlPokerTable").GetComponent(voiceQueue).showQueue();
}

function cleanCard(card : String) {
	

	card = card.Replace("10","T");
	card = card.Replace("na","");
	card = card.Replace("facedown","");
	card = card.Replace("S","s");
	card = card.Replace("H","h");
	card = card.Replace("D","d");
	card = card.Replace("C","c");
	card = card.Replace("-","");
	
	return card;
}



function ClearPlayer(i :int) {
	
	stopTimer(playerPanel[i]);
	playerPanel[i].transform.Find("WinnerEffectHalo").GetComponent.<ParticleSystem>().Stop();
	playerPanel[i].transform.Find("SideEffectHalo").GetComponent.<ParticleSystem>().Stop();
	playerPanel[i].transform.Find("SplitEffectHalo").GetComponent.<ParticleSystem>().Stop();
						
	playerPanel[i].transform.Find("AllInEffectHalo").GetComponent.<ParticleSystem>().Stop();
	playerPanel[i].transform.Find("fire").GetComponent.<ParticleSystem>().Stop();
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(UIPanel).alpha = 0;
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerDealCard1[i].name).GetComponent(UIPanel).alpha = 0;
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerDealCard2[i].name).GetComponent(UIPanel).alpha = 0;
	playerPanel[i].transform.Find("imgFold").GetComponent(UISprite).alpha = 0;
	playerPanel[i].transform.Find("timer").GetComponent(UISprite).alpha = 0;
	//playerPanel[i].transform.Find("tracker").GetComponent.<ParticleSystem>().Stop();
	
	
}

function showCards(p: int) {

	if (myPos > -1 && p == myPos - 1) {
		GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerDealCard1[p].name).GetComponent(UIPanel).alpha = 0;
	    GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerDealCard2[p].name).GetComponent(UIPanel).alpha = 0;
	    return;
	}

	TweenPosition.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerDealCard1[p].name),0.01,Vector3(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + p).GetComponent(tableObjPosController).card1x,GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + p).GetComponent(tableObjPosController).card1y,0));
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerDealCard1[p].name).GetComponent(UIPanel).alpha = 1;
	TweenRotation.Begin	(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerDealCard1[p].name),0.01, Quaternion.AngleAxis((p * 33), Vector3.back));	

	TweenPosition.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerDealCard2[p].name),0.01,Vector3(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + p).GetComponent(tableObjPosController).card2x,GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + p).GetComponent(tableObjPosController).card2y,0));
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerDealCard2[p].name).GetComponent(UIPanel).alpha = 1;
	TweenRotation.Begin	(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerDealCard2[p].name),0.01, Quaternion.AngleAxis((p * 33), Vector3.back));
} 

function DealCards (p : int) {

	if(dealtCards >= 2) return;
	/*
	var i: int = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit"+p).GetComponent(tableObjPosController).tarPos == -1 ? p : GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit"+p).GetComponent(tableObjPosController).tarPos;
	
	//var x = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit"+p).GetComponent(UIButton).transform.localPosition.x;
	//var y = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit"+p).GetComponent(UIButton).transform.localPosition.y;

	var x = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit"+p).GetComponent(tableObjPosController).x;
	var y = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit"+p).GetComponent(tableObjPosController).y;
	
	if(i == 0) {
		x += -60 + (dealtCards * 10);
		y += -90;
	} else if(i == 1) {
		x += -110 + (dealtCards * 10);
		y -= 30;
	} else if(i == 2) {
		x += -95 + (dealtCards * 10);
		y += 30;
	} else if(i == 3) {
		x += -50 + (dealtCards * 10);
		y += 80;
	} else if(i == 4) {

		if(myPos != -1) {
			x += -70 + (dealtCards * 10);
			y += 110;
		} else {
			x += -50 + (dealtCards * 10);
			y += 80;
		}

	} else if(i == 5) {
		x += 50 + (dealtCards * 10);
		y += 60;
	} else if(i == 6) {
		x += 90 + (dealtCards * 10);
		y += 10;
	} else if(i == 7) {
		x += 90 + (dealtCards * 10);
		y += -50;
	} else if(i == 8) {
		x += 50 + (dealtCards * 10);
		y += -100;
	} */



	var card = playerDealCard1[p].name;
	var x = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit"+p).GetComponent(tableObjPosController).card1x;
	var y = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit"+p).GetComponent(tableObjPosController).card1y;
	
	if(dealtCards == 1) {
		card = playerDealCard2[p].name;
		x = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit"+p).GetComponent(tableObjPosController).card2x;
	    y = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit"+p).GetComponent(tableObjPosController).card2y;
	}
	
	
	var tweenPos : TweenPosition = TweenPosition.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + card),0.5,Vector3(x,y,0));
	
	if(hand >= 5) {
		tweenPos.delay = 0.0f;
		tweenPos.duration = 0.0;
	} else {
		tweenPos.delay = p * 0.1f;
		tweenPos.duration = 0.2;
	}
	
	tweenPos.from = Vector3(12,200,0);
	tweenPos.to = Vector3(x,y,0);
	tweenPos.Play(true);
	
	
	//Flip card
	//TweenRotation.Begin	(GameObject.Find(playerDealCard1[i].name),0.5, Quaternion.Euler(0, 90, 0));	


	var tweenRot : TweenRotation = TweenRotation.Begin	(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + card),0.5, Quaternion.AngleAxis((p * 33), Vector3.back));	
	
	if(hand >= 5) {
		tweenRot.delay = 0.0f;
		tweenRot.duration = 0.0;
	} else {
		tweenRot.delay = p * 0.1f;
		tweenRot.duration = 0.2;
	}
	tweenRot.Play(true);
	
	var tweenAlp : TweenAlpha  = TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + card),0.2,1);
	
	if(hand >= 5) {
		tweenAlp.delay = 0.0f;
		tweenAlp.duration = 0.0;
	} else {
		tweenAlp.delay = p * 0.1f;
		tweenAlp.duration = 0.2;
	}
	tweenAlp.Play(true);

	//GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + card).GetComponent(UIPanel).alpha = 1;
}


function AnimateFoldCards(card : String) {
/*
	var tweenPosA : TweenPosition = TweenPosition.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + card),0.5,Vector3(12,200,0));
	
	tweenPosA.delay = 0.3f;
	tweenPosA.duration = 0.5;
	//tweenPos.from = Vector3(12,200,0);
	tweenPosA.to = Vector3(12,200,0);
	tweenPosA.Play(true);
*/
	if (GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + card).GetComponent(UIPanel).alpha > 0) {
		
		TweenPosition.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + card),0.5,Vector3(12,200,0));

		yield WaitForSeconds(0.5);

		TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + card),0.3,0);
	}
	
	/*
	var tweenAlp : TweenAlpha  = TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + card),0.3,0);
	tweenAlp.delay = 0.3f;
	tweenAlp.duration = 0.3;
	tweenAlp.Play(true);
	*/
	//GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + card).GetComponent(UIPanel).alpha = 0;
}


function ShowAction(i : int) {

	if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(gridRow).folded == true) return;


	TweenPosition.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name),0.01,Vector3(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).actionx,GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).actiony,0));

	TweenWidth.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget").GetComponent(UIWidget),0.3,0);


	OpenAction(i);


}

function OpenAction(i : int) {

	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name),0.5, 1);

	yield WaitForSeconds(0.5);

	TweenWidth.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget").GetComponent(UIWidget),0.3, 80);
}

function AnimateAction(pnlAction : GameObject, speed : float, pos :Vector3) {

	TweenPosition.Begin(pnlAction,speed, pos);

	yield WaitForSeconds(speed);

	TweenAlpha.Begin(pnlAction,0.5,0);

}


function btnSit0() {
	PlaySoundFile("button2");
	btnSit(0);
	
}

function btnSit1() {
	PlaySoundFile("button2");
	btnSit(1);
	
}

function btnSit2() {
	PlaySoundFile("button2");
	btnSit(2);
	
}

function btnSit3() {
	PlaySoundFile("button2");
	btnSit(3);
	
}

function btnSit4() {
	PlaySoundFile("button2");
	btnSit(4);
	
}

function btnSit5() {
	PlaySoundFile("button2");
	btnSit(5);
	
}

function btnSit6() {
	PlaySoundFile("button2");
	btnSit(6);
	
}

function btnSit7() {
	PlaySoundFile("button2");
	btnSit(7);
	
}

function btnSit8() {
	PlaySoundFile("button2");
	btnSit(8);
	
}


function btnSit(pos) {	

	if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + playerPanel[pos].name + "/lblName").GetComponent(UILabel).text == "Loading") {
		if(myPos == -1) {
			btnBuyIn(pos);

		} else {
		/*
			#if !UNITY_STANDALONE
				if(csEngineFB.IsLoggedIn) {
					csEngineFB.CallAppRequestAsFriendSelector();
				} else {
					csEngineFB.login();
				}
			#endif
		*/
		}
		
	} else {
	
		PlayerPrefs.SetString("playerProfile",GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + playerPanel[pos].name + "/lblName").GetComponent(UILabel).text);
		
		if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + playerPanel[pos].name + "/imgAvatar").GetComponent(UITexture).alpha == 1) {
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + playerPanel[pos].name + "/imgAvatar").GetComponent(UITexture).alpha = 0;
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + playerPanel[pos].name + "/btnProfile").GetComponent(UIButton).isEnabled = true;
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + playerPanel[pos].name + "/btnMute").GetComponent(UISprite).alpha = 1;
		} else {
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + playerPanel[pos].name + "/imgAvatar").GetComponent(UITexture).alpha = 1;
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + playerPanel[pos].name + "/btnProfile").GetComponent(UIButton).isEnabled = false;
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + playerPanel[pos].name + "/btnMute").GetComponent(UISprite).alpha = 0;
		}
	
	}
	
	
	
}

function btnProfile() {
	PlaySoundFile("button2");
	// not implement at this moment
}

function btnMute(go: GameObject) {
	
	if (go.GetComponent(UISprite).spriteName == "notice_on") {
		go.GetComponent(UISprite).spriteName = go.GetComponent(UISprite).spriteName.Replace("_on","_off");
	} else {
		go.GetComponent(UISprite).spriteName = go.GetComponent(UISprite).spriteName.Replace("_off","_on");
	}
}

function btnPlayerSitout() {

	usr.SetField("data", "&pos=" + myPos);

	if (GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSitout/Label").GetComponent(UILabel).text == "I'm Back") {
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("returnTable", usr);	
	} else {
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("iSitout", usr);
	}
}

function btnAddon() {
	if (GameObject.Find("UI Root/pnlPokerTable/pnlAddon(Clone)") == null) {

		var prefab: GameObject = Resources.Load("Prefabs/pnlAddon", GameObject);
		var newPnl: GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
		newPnl.GetComponent(prefabPnlTxtField).myPos = myPos;
		newPnl.GetComponent(prefabPnlTxtField).showUp();
	}
}

function btnSitPlayEffect(pos) {
	
	var sit = (pos == -1) ? "btnSit4" : "btnSit" + pos;
		
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + sit + "/ButtonPress").GetComponent.<ParticleSystem>().Play(true);
		
}

function btnStartGame() {						
								
	//yield poker.api('player_move.php?action=start');

}
	
//<--- Player ineractions

function stopAllPlayers() {
	for(var i : int = 0; i < 9; i++) {		

		if(playerPanel[i])
			stopTimer(playerPanel[i]);
			
		
	}
	
	return 0;
}

function stopAllNotActivePlayers() {
	for(var i : int = 0; i < 9; i++) {		
		if(activePlayerPanel != playerPanel[i].name) {
			//Debug.Log("about to stop => " + playerPanel[i].name + " | " + activePlayerPanel);
			
			stopTimer(playerPanel[i]);
			
		} 
	}
	
	return 0;
}

function startTimer(flag: String) {

	if(activePlayerName != PlayerPrefs.GetString("playerName")) hideControls(false);
	
	if(activePlayer == -1) return;
	/*
	if(activePlayer != playerActive) {
	
		playerActive = activePlayer;
		
	} else {
		
		return;
	}
	*/
	if (activePlayerPanel == "")
		return;

	var pos: String = activePlayerPanel.Substring(activePlayerPanel.Length - 1);

	if(myPos != -1 && activePlayerPanel == 'pnlPlayer' + (myPos - 1)) {
		TweenScale.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + (myPos - 1) + "/" + activePlayerPanel),0.05, Vector3(1.6f, 1.6f, 1.6f));
		yield WaitForSeconds(0.05);

		TweenScale.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + (myPos - 1) + "/" + activePlayerPanel),0.05, Vector3(1.5f, 1.5f, 1.5f));

	
	} else {
		TweenScale.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + activePlayerPanel),0.05, Vector3(1.1,1.1,1.1));
		yield WaitForSeconds(0.05);
		TweenScale.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + activePlayerPanel),0.05, Vector3(1,1,1));
	}
	
	//yield stopAllNotActivePlayers();

	/*
	var tweenColor : TweenColor;
	tweenColor = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + activePlayerPanel + "/timer").GetComponent("TweenColor");
	
	if(tweenColor.enabled) {
		return;
	} 
	
	tweenColor.ResetToBeginning();
	tweenColor.enabled = true;
	*/
	
	if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + activePlayerPanel + "/timer").GetComponent(TweenColor).enabled) {
		return;
	} 
	
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + activePlayerPanel + "/timer").GetComponent(TweenColor).ResetToBeginning();
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + activePlayerPanel + "/timer").GetComponent(TweenColor).enabled = true;

	/*
	var tracker : Orbit;
	tracker = GameObject.Find(activePlayerPanel + "/tracker").GetComponent("Orbit");

	tracker.Run();


	GameObject.Find(activePlayerPanel + "/tracker").GetComponent.<ParticleSystem>().Play(true);
	*/

	//GameObject.Find(activePlayerPanel + "/EffectActive").particleSystem.Play(true);

	//GameObject.Find(activePlayerPanel + "/timer").GetComponent(UISprite).fillAmount = 0;
	if (flag == "0") {
		var timer : CircularProgress;
		timer = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + activePlayerPanel + "/timer").GetComponent("CircularProgress");
		timer.Run();
	}

	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + activePlayerPanel + "/timer"),0.5,1);

	
	if(activePlayerName == PlayerPrefs.GetString("playerName")) {
		
		if(((System.DateTime.Now.Ticks - timeLastAction) / System.TimeSpan.TicksPerSecond) < 2) {
			Debug.Log("control panel not showing with the timer starts, timeLastAction: " + timeLastAction + " System.DateTime.Now.Ticks: " + System.DateTime.Now.Ticks + " System.TimeSpan.TicksPerSecond:" + System.TimeSpan.TicksPerSecond);
			return;
		}

		
		timeLastAction = System.DateTime.Now.Ticks;
		
		
		if(GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/chkVibrate").GetComponent(UIToggle).value) {
		
			//Web player was erroring
			#if UNITY_IPHONE
				Handheld.Vibrate ();
			#endif
			#if UNITY_ANDROID
				Handheld.Vibrate ();
			#endif
			
		}
		
		PlaySoundFile('notify');
		
		callamount = (tablebet-playerbet);
	    //Debug.Log("Call amount => " + callamount.ToString());
	    
	    
	    /*
	    if (callamount > mypot) {
	        callamount = mypot;
	    }
	    */
	    
	    /*
	    Debug.Log("tablebet => " + tablebet +
	    			"\nplayerbet => " + playerbet +
	    			"\nwinpot => " + winpot +
	    			"\ntablebet-playerbet => " + (tablebet-playerbet) +
	    			"\nmraise => " + mraise);
	    */
	    
	    if(mypot <= 0) {
			hideControls(false);
		} else if(mypot <= callamount && mypot > 0) {
			//Action fold or allin
			showControls("pnlAllinAction");
		} else if((tablebet > playerbet) && mraise != 0) {
	    	
	    	// Show raise panel
			showControls("pnlCallAction");
	    	
	    } else if(winpot >= (tablebet-playerbet)){ 
        	if (mraise != 0) {
        		if (tablebet == playerbet && hand != 5) {
        			// Show bet panel
					showControls("pnlCheckAction");
        		} else {
        			// Show raise panel
					showControls("pnlCallAction");
        		}
        	} else {
        		// Show bet panel
				showControls("pnlCheckAction");
			}
        } else {
        	// Show raise panel
			showControls("pnlCallAction");
        }
	    
		
	} else {
		//Debug.Log("Action is not on me but on "+ activePlayerName);
		//hideControls();
	}
}

function stopTimer(pnlPlayer : GameObject) {

	//Debug.Log("Stop player => " + pnlPlayer.name);
	var timer : CircularProgress;
	var pos: String = pnlPlayer.name.Substring(pnlPlayer.name.Length - 1);
	timer = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + pnlPlayer.name + "/timer").GetComponent("CircularProgress");
	timer.Stop();

	
	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + pnlPlayer.name + "/timer"),0.3,0);
	/*
	var tweenColor : TweenColor;
	tweenColor = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + pnlPlayer.name + "/timer").GetComponent("TweenColor");
	
	if(tweenColor.enabled) {
		tweenColor.enabled = false;
		tweenColor.ResetToBeginning();
	}
	*/
	
	if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + pnlPlayer.name + "/timer").GetComponent(TweenColor).enabled) {
		GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + pnlPlayer.name + "/timer").GetComponent(TweenColor).enabled = false;
		GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + pnlPlayer.name + "/timer").GetComponent(TweenColor).ResetToBeginning();
	}
}

function markWinner(winner : String) {

	if(displayedWinners || winner == "") return;

	Debug.Log("markWinner");
	
	
	var btnSit = "";
	
	for(var i : int = 0; i < 9; i++) {
			
		if(winner.ToString() == playerPanel[i].transform.Find("lblName").GetComponent(UILabel).text) {
			
			
			
			if(winnerCount > 1) {
				yield WaitForSeconds(1);
			}
			
			
			
			if(winPots[i] != "0") {
				//pnlWinPot
				PayoutAction(i);
			}
			
			
			
			for (var cards : String in winCards) {
		
				var card = cards.Split(","[0]);
				for (var c : String in card) {
					
					if(playerPanel[i].transform.Find("pnlCards/cardA").GetComponent(UISprite).spriteName == c && c != "") {
						TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i + "/" + playerPanel[i].name + "/pnlCards/cardA"),0.3,1);
						TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i + "/" + playerPanel[i].name + "/pnlCards/cardA/win"),0.3,1);
					}
					if(playerPanel[i].transform.Find("pnlCards/cardB").GetComponent(UISprite).spriteName == c && c != "") {
						TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i + "/" + playerPanel[i].name + "/pnlCards/cardB"),0.3,1);
						TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i + "/" + playerPanel[i].name + "/pnlCards/cardB/win"),0.3,1);
					}
					
				}
			}
			
			
			//Debug.Log("WIN TYPE: " + winTypes[winnerCount].ToString());
			
			
			GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i + "/" + playerPanel[i].name + "/imgWinner").GetComponent(UISprite).spriteName = "winner-" + winTypes[winnerCount].ToString();
			

			var tweenAlp : TweenAlpha  = TweenAlpha.Begin(playerPanel[i],0.3,1);
			//if(winnerCount == 0) {
				tweenAlp.delay = 0.3f;
			//} else {
				//tweenAlp.delay = winnerCount * 3.0f;
			//}
			tweenAlp.duration = 0.3;

			EventDelegate.Add(tweenAlp.onFinished, AnimateWin);

			tweenAlp.Play(true);


			
			
			
		}
		
	}
	
	winnerCount ++;

}

function PayoutAction(i : int) {
	/*
	var i: int = (myPos > -1) ? GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + p).GetComponent(tableObjPosController).tarPos : p;
	
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(UIPanel).transform.position.x = 100;
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(UIPanel).transform.position.y = 74;
	
	
	var x = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(UIButton).transform.localPosition.x;
	var y = GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(UIButton).transform.localPosition.y;
	
	var xfix = 100;
	var yfix = -100;
	
	if(i == 0) {
		x += -60;
		y += -90;
	} else if(i == 1) {
		x += -110;
		y -= 30;
	} else if(i == 2) {
		x += -95;
		y += 30;
	} else if(i == 3) {
		x += -50;
		y += 80;
	} else if(i == 4) {
		x += -70;
		y += 110;
	} else if(i == 5) {
		x += 50;
		y += 60;
	} else if(i == 6) {
		x += 90;
		y += 10;
	} else if(i == 7) {
		x += 90;
		y += -50;
	} else if(i == 8) {
		x += 50;
		y += -100;
	}
	
	
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/imgAction").GetComponent(UISprite).spriteName = 'coin_blue';
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text = winPots[i];
	
	//TweenAlpha.Begin(GameObject.Find(playerAction[i].name),0.3,1);
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(UIPanel).alpha = 1;
	
	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/pnlWinPot"),0.3,0);
	
	var posEnd = Vector3((x + xfix),(y + yfix),0); //GameObject.Find(playerPanel[i].name).GetComponent(UIPanel).transform.position; //
	var posStart = Vector3(100, 74, 0);
	var tweenPos : TweenPosition = TweenPosition.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name),2,posEnd);

	tweenPos.delay = 0.0;
	tweenPos.duration = 2;
	tweenPos.from = posStart;
	tweenPos.to = posEnd;
	tweenPos.Play(true); 
	*/

	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/pnlWinPot"),2.5,0);

	Debug.Log(i + " => " + winPots[i]);

	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(UIPanel).alpha = 1;

	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/imgAction").GetComponent(UISprite).spriteName = 'coin_blue';
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget/lblAmount").GetComponent(UILabel).text = winPots[i];

	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name + "/widget").GetComponent(UIWidget).width = 80;

	//var curPos = (myPos > -1) ? GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).tarPos : i;
	//var posEnd = Vector3(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + curPos).GetComponent(tableObjPosController).actionx, GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + curPos).GetComponent(tableObjPosController).actiony, 0);
	var posEnd = Vector3(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).actionx, GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).actiony, 0);
	/*
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(UIPanel).alpha = 1;
	//playerAction[i].GetComponent(UIPanel).alpha = 1;
	//playerAction[i].transform.position = Vector3(-30, 150, 0);
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).transform.position = Vector3(-30, 150, 0);
	*/


	var tweenPos : TweenPosition = TweenPosition.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name),2, posEnd);

	tweenPos.delay = 0.0;
	tweenPos.duration = 2;
	tweenPos.from = Vector3(-30, 150, 0);
	tweenPos.to = posEnd;
	tweenPos.Play(true); 


	var tweenAlpha : TweenAlpha = TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name),4, 0);

	tweenAlpha.delay = 4;
	tweenAlpha.duration = 2;
	tweenAlpha.Play(true); 



}


function AnimateWin() {
	
	var pnl = UITweener.current.name;
	var pos: String = UITweener.current.name.Substring(UITweener.current.name.Length - 1);
	
	PlaySoundFile("collectchips");
	
	//Debug.Log("Start marking Winners");
	
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/pnlWinner").GetComponent(UIPanel).alpha = 1;
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/pnlWinner/EffectSparksLeft").GetComponent.<ParticleSystem>().Play(true);
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/pnlWinner/EffectSparksRight").GetComponent.<ParticleSystem>().Play(true);
	

	
	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard1"),0.3,0.8);
	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard2"),0.3,0.8);
	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard3"),0.3,0.8);
	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard4"),0.3,0.8);
	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard5"),0.3,0.8);

	
	
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + UITweener.current.name + "/imgWinner").GetComponent(UISprite).alpha = 1;
	
	//Debug.Log("SPRITE NAME " + GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + UITweener.current.name + "/imgWinner").GetComponent(UISprite).spriteName);
	
	if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + UITweener.current.name + "/imgWinner").GetComponent(UISprite).spriteName == "winner-win") {
		GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + UITweener.current.name + "/WinnerEffectHalo").GetComponent.<ParticleSystem>().Play(true);
	}
	
	if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + UITweener.current.name + "/imgWinner").GetComponent(UISprite).spriteName == "winner-side") {
		GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + UITweener.current.name + "/SideEffectHalo").GetComponent.<ParticleSystem>().Play(true);
	}
	
	if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + UITweener.current.name + "/imgWinner").GetComponent(UISprite).spriteName == "winner-split") {
		GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + UITweener.current.name + "/SplitEffectHalo").GetComponent.<ParticleSystem>().Play(true);
	}
			
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + pos + "/" + UITweener.current.name + "/WinnerEffectChips").GetComponent.<ParticleSystem>().Play(true);


	for (var cards : String in winCards) {
		
		var card = cards.Split(","[0]);
		
		for (var c : String in card) {
			
			if(c != "") {
				if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard1").GetComponent(UISprite).spriteName == c) {
					TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard1"),0.3,1);
					TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard1/win"),0.3,1);
					//TweenColor.Begin(GameObject.Find("pnlTable/imgCard1"),0.3,Color.green);
				}
				if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard2").GetComponent(UISprite).spriteName == c) {
					TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard2"),0.3,1);
					TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard2/win"),0.3,1);
					//TweenColor.Begin(GameObject.Find("pnlTable/imgCard2"),0.3,Color.green);
				}
				if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard3").GetComponent(UISprite).spriteName == c) {
					TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard3"),0.3,1);
					TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard3/win"),0.3,1);
					//TweenColor.Begin(GameObject.Find("pnlTable/imgCard3"),0.3,Color.green);
				}
				if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard4").GetComponent(UISprite).spriteName == c) {
					TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard4"),0.3,1);
					TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard4/win"),0.3,1);
					//TweenColor.Begin(GameObject.Find("pnlTable/imgCard4"),0.3,Color.green);
				}
				if(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard5").GetComponent(UISprite).spriteName == c) {
					TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard5"),0.3,1);
					TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard5/win"),0.3,1);
					//TweenColor.Begin(GameObject.Find("pnlTable/imgCard5"),0.3,Color.green);
				}
			}
			
		}
	}
	
	//Debug.Log("Finished marking Winners");
				
	//GameObject.Find(UITweener.current.name + "/EffectStreaks").particleSystem.Stop();
	//GameObject.Find(UITweener.current.name + "/EffectBurn").particleSystem.Stop();
}
		
	
function unmarkWinner(winner : String) {

	displayedWinners = false;
	
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/pnlWinner").GetComponent(UIPanel).alpha = 0;
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/pnlWinner/EffectSparksLeft").GetComponent.<ParticleSystem>().Stop();
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/pnlWinner/EffectSparksRight").GetComponent.<ParticleSystem>().Stop();
	
	for(var i : int = 0; i < 9; i++) {

		//if(winner.ToString() == GameObject.Find(pnlPlayer + "/lblName").GetComponent(UILabel).text) {
			//Debug.Log("Marked winner => " + playerPanel[i] + " => " + winner.ToString());
			playerPanel[i].transform.Find("imgWinner").GetComponent(UISprite).alpha = 0;
			playerPanel[i].transform.Find("WinnerEffectHalo").GetComponent.<ParticleSystem>().Stop();
			playerPanel[i].transform.Find("SideEffectHalo").GetComponent.<ParticleSystem>().Stop();
			playerPanel[i].transform.Find("SplitEffectHalo").GetComponent.<ParticleSystem>().Stop();
			
		//}
		
	}
	

}

function showControls(panel : String) {
	
	if (sitoutStatus) return;

	// Check auto
	if(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoFold").GetComponent(UISprite).spriteName == "btnAutoFold") {
		sendAction('fold',0);
		return;
	} else if(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName == "btnAutoCall" && autoCall == callamount) {
		sendAction('call',0);
		return;
	} else if(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName == "btnAutoCheck" && callamount == 0) {
		sendAction('check',0);
		return;
	} else if(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCallAny").GetComponent(UISprite).spriteName == "btnAutoCallAny") {
		if(callamount == 0) {
			sendAction('check',0);
		} else {
			sendAction('call',0);
		}
		return;
	} else if(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCheckFold").GetComponent(UISprite).spriteName == "btnAutoCheckFold" && callamount == 0) {
		//Redundant
		sendAction('check',0);
		return;
	} else if(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCheckFold").GetComponent(UISprite).spriteName == "btnAutoCheckFold") {
		if(callamount == 0) {
			sendAction('check',0);
		} else {
			sendAction('fold',0);
		}
		return;
	}

	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting").GetComponent(UIPanel).alpha = 0;

	if(mypot < bigBlind) {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCheckAction/btnBet").GetComponent(UIButton).isEnabled = false;
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction/btnRaise").GetComponent(UIButton).isEnabled = false;
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCheckAction/btnCheckAllin").GetComponent(UIButton).isEnabled = true;
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCheckAction/btnCheckAllin/Label").GetComponent(UILabel).text = CurrencyFormat(mypot);
	} else {
	
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCheckAction/btnBet").GetComponent(UIButton).isEnabled = true;
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction/btnRaise").GetComponent(UIButton).isEnabled = true;
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCheckAction/btnCheckAllin").GetComponent(UIButton).isEnabled = false;
		
		
		if(mypot < mraise) {
			GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction/btnRaise").GetComponent(UIButton).isEnabled = false;
			GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction/btnCallAllin").GetComponent(UIButton).isEnabled = true;
		} else {
			GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction/btnRaise").GetComponent(UIButton).isEnabled = true;
			GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction/btnCallAllin").GetComponent(UIButton).isEnabled = false;
		}
		
		
	}
	
	//Debug.Log("I want to show => " + panel);
	
	if(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlBetAction").GetComponent(UIPanel).alpha == 1) return;
	
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCheckAction").GetComponent(UIPanel).alpha = 0;
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction").GetComponent(UIPanel).alpha = 0;
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlBetAction").GetComponent(UIPanel).alpha = 0;
	
	if(callamount > 0) {
		//Debug.Log("Setting call amount => " + callamount);
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction/btnCall").GetComponent(UIButton).isEnabled = true;
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction/btnCallCheck").GetComponent(UIButton).isEnabled = false;

		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction/btnCall/Label").GetComponent(UILabel).text = CurrencyFormat(callamount);
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlAllinAction/btnAllin/Label").GetComponent(UILabel).text = CurrencyFormat(mypot);
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction/btnCallAllin/Label").GetComponent(UILabel).text = CurrencyFormat(mypot);
		//GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCheckAction/btnCheckAllin/Label").GetComponent(UILabel).text = CurrencyFormat(mypot);

	} else {

		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction/btnCallCheck").GetComponent(UIButton).isEnabled = true;
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction/btnCall").GetComponent(UIButton).isEnabled = false;
		
	}
	
	//Debug.Log("Showing => " + panel);
	
	if(panel == "pnlBetAction") {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/" + panel).GetComponent(UIPanel).alpha = 1;
		
	} else {
		//TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlControls/" + panel), 0.3, 1);
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/" + panel).GetComponent(UIPanel).alpha = 1;
	}
	
	
	
}

function hideControls(force : boolean) {

	callamount = tablebet - playerbet;

	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCheckAction"), 0.3, 0);
	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlCallAction"), 0.3, 0);
	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlBetAction"), 0.3, 0);
	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlAllinAction"), 0.3, 0);


	if(mypot <= 0 || myAction == "fold") {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting").GetComponent(UIPanel).alpha = 0;
		return;
	}



	if(myPos != -1 && hand >= 5 && hand <= 10) { // && lastSerialNumber == serialNumber auto check fold && exportRoot.pnlControls.pnlWaiting.locked != true
	
		//callamount = (tablebet-playerbet);

		if(callamount == 0) {
			GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall/Label").GetComponent(UILabel).text = "";
			GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall/StaticText").GetComponent(UILabel).text = "CHECK";
		} else {

			//GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall/Label").GetComponent(UILabel).text = CurrencyFormat(callamount);

			if(callamount >= mypot) {
				GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall/StaticText").GetComponent(UILabel).text = "ALL-IN";

				GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall/Label").GetComponent(UILabel).text = CurrencyFormat(mypot);

				if(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName != "btnAutoAllInOff" && GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName != "btnAutoAllIn") {
					GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName = "btnAutoAllInOff";
				}

				GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCallAny").GetComponent(UISprite).alpha = 0;

			} else {
				GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall/StaticText").GetComponent(UILabel).text = "CALL";

				GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall/Label").GetComponent(UILabel).text = CurrencyFormat(callamount);

				if(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName == "btnAutoCheckOff" || GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName == "btnAutoCheck") {
					GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName = "btnAutoCallOff";
				}

				if(autoCall != callamount) {
					GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName = "btnAutoCallOff";
				}

			}


		}



		if(!force && !sitoutStatus)
			GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting").GetComponent(UIPanel).alpha = 1;

	} else if(hand <= 5 && hand >= 10) {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting").GetComponent(UIPanel).alpha = 0;
	}

}

function animateAwayActions() {

	for(var i: int = 0; i < 9; i++) {
		if (GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name).GetComponent(UIPanel).alpha > 0)
			AnimateAction(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[i].name), 0.5, Vector3(-30, 150, 0));
	}
}


function showFlop() {
	animateAwayActions();

	dealtFlop = true;
	
	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard1"),0.3,1);
	yield WaitForSeconds(0.1);
	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard2"),0.3,1);
	yield WaitForSeconds(0.1);
	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard3"),0.3,1);

}

function showTurn() {
	animateAwayActions();

	dealtTurn = true;
	//yield WaitForSeconds(0.3);
	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard4"),0.3,1);

}

function showRiver() {
	animateAwayActions();

	dealtRiver = true;
	//yield WaitForSeconds(0.4);
	TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/imgCard5"),0.3,1);
    
}

function setBetAmount() {

	
	var currentValue = 0.0f;
	
	
	currentValue = GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlBetAction/sldBetAmount").GetComponent(UISlider).current.value;
		
	showBetAmount(currentValue);
}

function showBetAmount(currentValue : float) {

	var betAmount = 0;
	
	if(mraise > mypot) {
		betAmount = mypot;
		myBetAmount = mypot;
	} else if(mraise > 0) {
		betAmount = Mathf.Round((currentValue *  currentValue) * (mypot - mraise));
		myBetAmount = betAmount + mraise;
	} else {
		betAmount = Mathf.Round((currentValue *  currentValue) * (mypot - bigBlind));
		myBetAmount = betAmount + bigBlind;
	}
	
	
	//Debug.Log("Set bet amount " + CurrencyFormat(myBetAmount));
	
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlBetAction/sldBetAmount/Label").GetComponent(UILabel).text = CurrencyFormat(myBetAmount);
	
}

function strToFloat(val : String) {
	
	if(val == "") {
		return 0.0;
	} else {
		return parseFloat(val);
	}
}		

function strToInt(val : String) {

	if(val == "") {
		return 0;
	} else {
		return parseInt(val);
	}
}


function CurrencyFormat(number : float) {
   
   return "$" + number.ToString( "n0" );
}

function setVibrate() {
	
	if(GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/chkVibrate").GetComponent(UIToggle).value == true) {
		PlayerPrefs.SetInt("Vibrate",0);
	} else {
		PlayerPrefs.SetInt("Vibrate",1);
	}
	
}


function setVoice () {

	if(GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/chkVoice").GetComponent(UIToggle).value == true) {
		PlayerPrefs.SetInt("Voice",0);
	} else {
		PlayerPrefs.SetInt("Voice",1);
	}

}

function setTableVoice() {

	if(GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/chkTableVoice").GetComponent(UIToggle).value == true) {
		PlayerPrefs.SetInt("TableVoice",0);
	} else {
		PlayerPrefs.SetInt("TableVoice",1);
	}	
}

function TextToSpeech(sentence) {

	//|| UNITY_STANDALONE
	
	#if UNITY_IPHONE || UNITY_ANDROID || UNITY_WEBGL

	if(GameObject.Find("UI Root/pnlPokerTable/wdgMenu/pnlMenu/chkVoice").GetComponent(UIToggle).value != true || sentence == "") {
		return;
	}
	
	if(lastStatus == sentence ) {
		return;
	}

	

	/* ### Only talk 3 seconds after last talk and only as soon as theyer is something new to say ### */
	lastStatus = sentence;
	
	if((((System.DateTime.Now.Ticks - timeLastStatus) / System.TimeSpan.TicksPerSecond) < 3)) {
		return;
	}
	/* ### */
	
	timeLastStatus = System.DateTime.Now.Ticks;

	
	csEasyTTSUtil.SpeechAdd (sentence);
	
 	#endif
 	
 	
 	
}

function resetWaitControls() {
	callamount = 0; //Resets instantaly waiting for next data received

	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting").GetComponent(UIPanel).alpha = 0;

	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoFold").GetComponent(UISprite).spriteName = "btnAutoFoldOff";
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCheckFold").GetComponent(UISprite).spriteName = "btnAutoCheckFoldOff";
	if(callamount == 0) {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName = "btnAutoCheckOff";
	} else {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName = "btnAutoCallOff";
	}
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCallAny").GetComponent(UISprite).spriteName = "btnAutoCallAnyOff";

	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCallAny").GetComponent(UISprite).alpha = 1;
}

function btnWaitCheckFold() {
	
	PlaySoundFile("button2");
	
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoFold").GetComponent(UISprite).spriteName = "btnAutoFoldOff";
	if(callamount == 0) {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName = "btnAutoCheckOff";
	} else {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName = "btnAutoCallOff";
	}
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCallAny").GetComponent(UISprite).spriteName = "btnAutoCallAnyOff";

	if(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCheckFold").GetComponent(UISprite).spriteName == "btnAutoCheckFoldOff") {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCheckFold").GetComponent(UISprite).spriteName = "btnAutoCheckFold";
	} else {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCheckFold").GetComponent(UISprite).spriteName = "btnAutoCheckFoldOff";
	}
	
}

function btnWaitFold(event) {
	
	PlaySoundFile("button2");

	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCheckFold").GetComponent(UISprite).spriteName = "btnAutoCheckFoldOff";
	if(callamount == 0) {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName = "btnAutoCheckOff";
	} else {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName = "btnAutoCallOff";
	}
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCallAny").GetComponent(UISprite).spriteName = "btnAutoCallAnyOff";

	if(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoFold").GetComponent(UISprite).spriteName == "btnAutoFoldOff") {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoFold").GetComponent(UISprite).spriteName = "btnAutoFold";
	} else {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoFold").GetComponent(UISprite).spriteName = "btnAutoFoldOff";
	}
}

function btnWaitCall(event) {
	
	PlaySoundFile("button2");
	
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoFold").GetComponent(UISprite).spriteName = "btnAutoFoldOff";
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCheckFold").GetComponent(UISprite).spriteName = "btnAutoCheckFoldOff";
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCallAny").GetComponent(UISprite).spriteName = "btnAutoCallAnyOff";


	if(callamount == 0) {
		if(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName == "btnAutoCheckOff") {
			GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName = "btnAutoCheck";
		} else {
			GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName = "btnAutoCheckOff";
		}
	} else {
		if(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName == "btnAutoCallOff") {

			GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName = "btnAutoCall";

			autoCall = callamount;
		} else {
			GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName = "btnAutoCallOff";
			autoCall = 0;
		}
	}


}


function btnWaitCallAny(event) {
	
	PlaySoundFile("button2");
	
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoFold").GetComponent(UISprite).spriteName = "btnAutoFoldOff";
	GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCheckFold").GetComponent(UISprite).spriteName = "btnAutoCheckFoldOff";

	if(callamount == 0) {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName = "btnAutoCheckOff";
	} else {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCall").GetComponent(UISprite).spriteName = "btnAutoCallOff";
	}


	if(GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCallAny").GetComponent(UISprite).spriteName == "btnAutoCallAnyOff") {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCallAny").GetComponent(UISprite).spriteName = "btnAutoCallAny";
	} else {
		GameObject.Find("UI Root/pnlPokerTable/pnlControls/pnlWaiting/btnAutoCallAny").GetComponent(UISprite).spriteName = "btnAutoCallAnyOff";
	}
}

function updateRank(response) {

	var data = LitJson.JsonMapper.ToObject(response.ToString());
	
	
	var dec : float = parseFloat(data["value"].ToString());
	var perc = dec / 20000;
	

	if(perc >= 1) perc = 0.99;

	if(myPos > 0) {
		TweenAlpha.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + (myPos - 1) + "/pnlPlayer" + (myPos - 1) + "/HandRank"),0.5,1);

		GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + (myPos - 1) + "/pnlPlayer" + (myPos - 1) + "/HandRank/HandMeter").GetComponent(UISprite).fillAmount = perc;
		GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + (myPos - 1) + "/pnlPlayer" + (myPos - 1) + "/HandRank/Rank").GetComponent(UILabel).text = data["name"].ToString();
	}

	
	/*	
	if(!isFB) {
		
		exportRoot.pnlPlayer4.HandRank.HandRankInfo.lblRank.text = response.name;
	} else {
		exportRoot.pnlPlayer4.HandRank.HandRankInfo.visible = false;
		exportRoot.infoPanel.lblNotify.text = response.name;
		exportRoot.infoPanel.HandRankCards.visible = true;
		exportRoot.infoPanel.visible = true;
	}
	*/
}

function unbindSocket(){
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Off("gotPoker", gotPoker);
	//GameObject.Find("UI Root").GetComponent(enginepoker).socket.Off("sitoutRsp", sitoutRsp);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Off("gotHeartbeat", gotHeartbeat);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Off("gotNewGameID", gotNewGameID);
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Off("closeTable", closeTable);
}

function sitoutRsp(e: SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] sitoutRsp received: " + e.name + " " + e.data);

	if (leaveGame) {

		
		for (var i: int = 0; i < 9; i++) {
			NGUITools.Destroy(playerPanel[i]);
			NGUITools.Destroy(playerAction[i]);
			NGUITools.Destroy(playerDealCard1[i]);
			NGUITools.Destroy(playerDealCard2[i]);
		} 

		playerPanel = null;
		playerAction = null;
		playerDealCard1 = null;
		playerDealCard2 = null;

		pnlTableInitMark = false;
		gameRunning = false;

		unbindSocket();

		leaveGame = false;
		standUp = false;

		lastGameID = 0;

		GameObject.Find("UI Root/pnlPokerTable").GetComponent(voiceQueue).voiceQueue.Clear();
		GameObject.Find("UI Root/pnlPokerTable").GetComponent(voiceQueue).processFlag = false;

		voicePos = 0;

		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);


		if (PlayerPrefs.GetString("clubId") != "0") {
			GameObject.Find("UI Root/pnlRoot/pnlClub/pnlClubGame").GetComponent(clubGameScene).showUp();
		} else if (PlayerPrefs.GetString("season") == "1") {
			GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague").GetComponent(leagueScene).showUp();
		} else {
			GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLobby").GetComponent(lobbyScene).showUp();
		}
	} 
}	

function gotHeartbeat( e : SocketIO.SocketIOEvent) {
	//Debug.Log("[SocketIO] gotHeartbeat: " + e.name + " " + e.data);
	
	StartCoroutine(HeartBeat(45)); 

	Debug.Log(e.data);
}

function HeartBeat(waitTime : int) {
	yield WaitForSeconds (waitTime);

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_heartbeat", usr);

}


function gotNewGameID(e: SocketIO.SocketIOEvent) {
	
	Debug.Log("[SocketIO] gotNewGameID received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	try { 
		var newGameId = strToInt(data['response']['gameID'].ToString());
		if(newGameId != strToInt(PlayerPrefs.GetString("gameID"))) {
			gameRunning = true;
			//gameID = newGameId;
			lastGameID = newGameId;
			PlayerPrefs.SetString("gameID", data['response']['gameID'].ToString());
			usr.SetField("gameID", data['response']['gameID'].ToString());
			GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_sync", usr);
		}
	} catch (err) {
		Debug.Log('Error in TRY');
	}
}

function closeTable(e: SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] closeTable received: " + e.name + " " + e.data);

	GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Table has been closed");
}

function seasonTableResult(e: SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] seasonTableResult received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	try { 

		GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague").GetComponent(leagueScene).resultShow = true;
		GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague").GetComponent(leagueScene).resultFlag = parseInt(data['response']['winFlag'].ToString());
		GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague").GetComponent(leagueScene).resultPoints = parseInt(data['response']['resultPoints'].ToString());
		GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague").GetComponent(leagueScene).points = parseInt(data['response']['points'].ToString());


		for (var i: int = 0; i < 9; i++) {
			NGUITools.Destroy(playerPanel[i]);
			NGUITools.Destroy(playerAction[i]);
			NGUITools.Destroy(playerDealCard1[i]);
			NGUITools.Destroy(playerDealCard2[i]);
		}

		gameRunning = false;

		unbindSocket();

		leaveGame = false;
		standUp = false;

		lastGameID = 0;

		voicePos = 0;

		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);


		GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague").GetComponent(leagueScene).showUp();

		
	} catch (err) {
		Debug.Log('Error in TRY');
	}

}

function gotRank( e : SocketIO.SocketIOEvent) {
	//Debug.Log("[SocketIO] gotRank received: " + e.name + " " + e.data);

	updateRank(e.data);
}

function gotTnmAddon(e: SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotTnmAddon received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());

	GameObject.Find("UI Root").GetComponent(enginepoker).showNotify(data["msg"].ToString());
}

/*
function voicesHandle( e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] voicesHandle received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());

	for(var voices: LitJson.JsonData in data["voiceInfo"]){
		GameObject.Find("UI Root/pnlPokerTable").GetComponent(voiceQueue).addVoices(voices["player"].ToString(), parseInt(voices["timeTag"].ToString()), parseInt(voices["pos"].ToString()));
	}
}*/

function PlaySoundFile(file: String){ // file name without extension

	if(lastSerialNumber == serialNumber) return;
	if(PlayerPrefs.GetInt("Sound") == 1) return;

	if(file == "") return;

	try {
		//Debug.Log('Playing Sound ' + file);
		
	    var clip: AudioClip = UnityEngine.Resources.Load("Sounds/" + file, AudioClip); //UnityEngine.Resources.Load(file);
	    
		csNGUITools.PlaySound(clip, 1f, 1f);

		if(file == 'fold' && hand >= 7) {
			PlaySoundFile('crowd-groan');
		}
		
		if(file == 'allin') {
			PlaySoundFile('shock1');
		}
		
		if(file == 'raise') {
			PlaySoundFile('shock2');
		}
		
		if(file == 'collectchips') {
			PlaySoundFile('applause1');
		}
	
	} catch (err) {

		Debug.Log('Playing Sound Error: ' + err);
	
	}
	
}