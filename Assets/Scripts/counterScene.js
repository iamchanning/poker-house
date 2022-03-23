#pragma strict

private var usr: JSONObject;

var returnBtn: GameObject;
var btnTrade: GameObject;
var btnRecord: GameObject;

var tradePanel: GameObject;
var recordPanel: GameObject;

var gameScene: GameObject;

var tradeShow: boolean;


function Start () {
	UIEventListener.Get(returnBtn).onClick = returnBtnClick;
	UIEventListener.Get(btnTrade).onClick = tradeBtnClick;
	UIEventListener.Get(btnRecord).onClick = recordBtnClick;

	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(recordPanel);
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(tradePanel);
}


function returnBtnClick() {

	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

	gameScene.GetComponent(clubGameScene).showUp();
}

function tradeBtnClick(){
	if (tradeShow) {
		return;
	} else {
		tradeShow = true;

		GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(tradePanel);
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(recordPanel);

		btnTrade.GetComponent(UISprite).spriteName = btnTrade.GetComponent(UISprite).spriteName.Replace("_off","_on");
		btnRecord.GetComponent(UISprite).spriteName = btnRecord.GetComponent(UISprite).spriteName.Replace("_on","_off");

		tradePanel.GetComponent(clubTradeGrid).showUp();
	}
}

function recordBtnClick(){
	if (!tradeShow) {
		return;
	} else {
		tradeShow = false;

		GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(recordPanel);
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(tradePanel);

		btnTrade.GetComponent(UISprite).spriteName = btnTrade.GetComponent(UISprite).spriteName.Replace("_on","_off");
		btnRecord.GetComponent(UISprite).spriteName = btnRecord.GetComponent(UISprite).spriteName.Replace("_off","_on");

		recordPanel.GetComponent(clubTradeRecordGrid).showUp();
	}
}
