#pragma strict

//var menuButton : GameObject;

var loadingScene: GameObject;
var startScene: GameObject;
var loginScene: GameObject;
var leagueGameScene: GameObject;
var missionScene: GameObject;
var signupScene: GameObject;

/*
var btnMission: GameObject;
var btnMissionReturn: GameObject;


var leagueGrid: GameObject;
*/

var btnLobby: GameObject;
var lobby: GameObject;

var btnLeague: GameObject;
var league: GameObject;


function Start () {

	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(startScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(loginScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(signupScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(missionScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(leagueGameScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(lobby);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(league);
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(loadingScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

	UIEventListener.Get(btnLobby).onClick = btnLobbyClick;
	UIEventListener.Get(btnLeague).onClick = btnLeagueClick;
}

function btnLobbyClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(lobby);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

	lobby.GetComponent(lobbyScene).showUp();
}

function btnLeagueClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(league);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

	league.GetComponent(leagueScene).showUp();
}

/*

function missionClick() {
	root.GetComponent(enginepoker).enablePanel(missionScene);

	UIEventListener.Get(btnMissionReturn).onClick = missionReturnClick;
}

function missionReturnClick() {
	root.GetComponent(enginepoker).disablePanel(missionScene);
	root.GetComponent(enginepoker).menuDisabled = true;
}
*/