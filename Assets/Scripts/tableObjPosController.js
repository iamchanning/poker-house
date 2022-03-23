#pragma strict

var x: int;
var y: int;

var card1x: int;
var card1y: int;

var card2x: int;
var card2y: int;

var actionx: int;
var actiony: int;

var pos: int;
var tarPos: int = -1;


function Start () {
	//setCardPos();
}

function shift() {
	
	if (PlayerPrefs.GetString("seats") == "5") {
		if (pos == 1 || pos == 3 || pos == 5 || pos == 7)
			return;
		tarPos = 4 - (GameObject.Find("UI Root/pnlPokerTable").GetComponent(pokerTable).myPos - 1) + pos;
		if (tarPos >= 10) tarPos -= 10;
		if (tarPos < 0) tarPos += 10;
	} else {
		tarPos = 4 - (GameObject.Find("UI Root/pnlPokerTable").GetComponent(pokerTable).myPos - 1) + pos;
		if (tarPos >= 9) tarPos -= 9;
		if (tarPos < 0) tarPos += 9;
	}

	//Debug.Log(pos + " " + tarPos);

	if (pos < tarPos) {
		for (var i: int = pos + 1; i <= tarPos; i++) {
			TweenPosition.Begin(gameObject, 0.4, Vector3(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).x, GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).y,0));
		}
	} else if (pos > tarPos){
		for (var j: int = pos + 1; j <= 8; j++) {
			TweenPosition.Begin(gameObject, 0.4, Vector3(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + j).GetComponent(tableObjPosController).x, GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + j).GetComponent(tableObjPosController).y,0));
		}

		TweenPosition.Begin(gameObject, 0.4, Vector3(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit0").GetComponent(tableObjPosController).x, GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit0").GetComponent(tableObjPosController).y,0));

		for (var z: int = 1; z <= tarPos; z++) {
			TweenPosition.Begin(gameObject, 0.4, Vector3(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + z).GetComponent(tableObjPosController).x, GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + z).GetComponent(tableObjPosController).y,0));
		} 
	}

	setRelativePos();
}

function shiftBack() {
	if (PlayerPrefs.GetString("seats") == "5" && (pos == 1 || pos == 3 || pos == 5 || pos == 7))
		return;

	if (tarPos < pos) {
		for (var i: int = tarPos + 1; i <= pos; i++) {
			TweenPosition.Begin(gameObject, 0.4, Vector3(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).x, GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).y,0));
		}
	} else if (pos < tarPos) {
		for (var j: int = tarPos + 1; j <= 8; j++) {
			TweenPosition.Begin(gameObject, 0.4, Vector3(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + j).GetComponent(tableObjPosController).x, GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + j).GetComponent(tableObjPosController).y,0));
		}

		TweenPosition.Begin(gameObject, 0.4, Vector3(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit0").GetComponent(tableObjPosController).x, GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit0").GetComponent(tableObjPosController).y,0));

		for (var z: int = 1; z <= pos; z++) {
			TweenPosition.Begin(gameObject, 0.4, Vector3(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + z).GetComponent(tableObjPosController).x, GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + z).GetComponent(tableObjPosController).y,0));
		} 
	}


	tarPos = -1;
	setRelativePos();
}

function setRelativePos() {

	if (PlayerPrefs.GetString("seats") == "5" && (pos == 1 || pos == 3 || pos == 5 || pos == 7))
		return;

	var curx = (tarPos == -1) ? x : GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + tarPos).GetComponent(tableObjPosController).x;
	var cury = (tarPos == -1) ? y : GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + tarPos).GetComponent(tableObjPosController).y;
	var curPos = (tarPos == -1) ? pos : tarPos;

	switch (curPos) {
		case 0: card1x = curx - 60;  card1y = cury - 90; actionx = curx - 23;  actiony = cury - 122; break;
		case 1: card1x = curx - 110; card1y = cury - 30; actionx = curx - 140; actiony = cury - 87;  break;
		case 2: card1x = curx - 95;  card1y = cury + 30; actionx = curx - 136; actiony = cury - 26;  break;
		case 3: card1x = curx - 50;  card1y = cury + 80; actionx = curx - 137; actiony = cury + 25;  break;
		case 4: card1x = curx - 50;  card1y = cury + 80; actionx = curx + 107; actiony = cury + 47;  break;
		case 5: card1x = curx + 50;  card1y = cury + 60; actionx = curx + 77;  actiony = cury + 21;  break;
		case 6: card1x = curx + 90;  card1y = cury + 10; actionx = curx + 79;  actiony = cury - 25;  break;
		case 7: card1x = curx + 90;  card1y = cury - 50; actionx = curx + 66;  actiony = cury - 92;  break;
		case 8: card1x = curx + 50; card1y = cury - 100; actionx = curx - 30;  actiony = cury - 121; break;
	}

	if (curPos == 4 && tarPos != -1) {
		card1x = curx - 70; 
		card1y = cury + 110;
	}

	card2x = card1x + 10;
	card2y = card1y; 

	GameObject.Find("UI Root/pnlPokerTable").GetComponent(pokerTable).ResetAction(curPos);
	//TweenPosition.Begin(GameObject.Find("UI Root/pnlPokerTable/pnlTable/" + playerAction[curPos].name),0.01,Vector3(GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + curPos).GetComponent(tableObjPosController).actionx,GameObject.Find("UI Root/pnlPokerTable/pnlTable/btnSit" + i).GetComponent(tableObjPosController).actiony,0));
}


