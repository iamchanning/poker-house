#pragma strict

var btnReturn: GameObject;
var btnRingGame: GameObject;
var btnTournament: GameObject;

var ringGameGrid: GameObject;
var tournamentGrid: GameObject;

var sceneFlag: int;

function Start () {
	UIEventListener.Get(btnReturn).onClick = btnReturnClick;
	UIEventListener.Get(btnRingGame).onClick = btnRingGameClick;
	UIEventListener.Get(btnTournament).onClick = btnTournamentClick;

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("clubGameCreate", clubGameCreate);

	sceneFlag = -1;
	btnRingGameClick();
}


function btnReturnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

	GameObject.Find("pnlRoot/pnlClub/pnlClubGame").GetComponent(clubGameScene).showUp();
}

function btnRingGameClick() {
	if (sceneFlag == 0)
		return;
	else {
		GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(ringGameGrid);
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(tournamentGrid);

		sceneFlag = 0;
		btnRingGame.GetComponent(UISprite).spriteName = "btnTab_on";
		btnTournament.GetComponent(UISprite).spriteName = "btnTab_off";

		ringGameGrid.GetComponent(clubRingGameCreate).showUp();
	}
	
}

function btnTournamentClick() {
	if (sceneFlag == 1)
		return;
	else {
		GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(tournamentGrid);
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(ringGameGrid);

		sceneFlag = 1;
		btnRingGame.GetComponent(UISprite).spriteName = "btnTab_off";
		btnTournament.GetComponent(UISprite).spriteName = "btnTab_on";

		tournamentGrid.GetComponent(clubTournamentCreate).showUp();
	}
}

function clubGameCreate(e: SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] clubRingGameCreate received: " + e.name + " " + e.data);

	btnReturnClick();
}

