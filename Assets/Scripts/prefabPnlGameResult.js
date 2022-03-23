#pragma strict

var resultFlag: int;
var points: int;
var resultPoints: int;

var btnConfirm: GameObject;
var btnPlayAgain: GameObject;

function Start () {
	UIEventListener.Get(btnConfirm).onClick = returnBtnClick;
	UIEventListener.Get(btnPlayAgain).onClick = matchBtnClick;	
}

function returnBtnClick() {
	NGUITools.Destroy(gameObject);

	GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague").GetComponent(leagueScene).resultShow = false;
	GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague").GetComponent(leagueScene).showUp();

}

function matchBtnClick() {
	returnBtnClick();

	GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague").GetComponent(leagueScene).playBtnClick();
}

function showUp() {
	if (resultFlag == 1) { 
		gameObject.transform.Find("header").GetComponent(UISprite).spriteName = "rays_gold";
		gameObject.transform.Find("header/title").GetComponent(UISprite).spriteName = "word_win";
	} else {
		gameObject.transform.Find("header").GetComponent(UISprite).spriteName = "rays_gray";
		gameObject.transform.Find("header/title").GetComponent(UISprite).spriteName = "word_failed";
	}
	gameObject.transform.Find("result/Label").GetComponent(UILabel).text = "Points: " + resultPoints;
	gameObject.transform.Find("experience/lblLv").GetComponent(UILabel).text = "Lv. " + (1 + points / 100);

	var fillAmount: float = points % 100;
	fillAmount /= 100;

	gameObject.transform.Find("experience/progress").GetComponent(UISprite).fillAmount = fillAmount;
}




