#pragma strict

var gameScene: GameObject;
var memberScene: GameObject;

var returnBtn: GameObject;
var btnchips: GameObject;
var btnMembers: GameObject;
var btnQuitOrNew: GameObject;
var btnEdit: GameObject;

function Start () {
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(memberScene);
	
	UIEventListener.Get(returnBtn).onClick = returnBtnClick;
	UIEventListener.Get(btnEdit).onClick = btnEditClick;
	UIEventListener.Get(btnQuitOrNew).onClick = btnQuitOrNewClick;
	UIEventListener.Get(btnchips).onClick = btnchipsClick;
	UIEventListener.Get(btnMembers).onClick = btnMembersClick;
}


function returnBtnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

	GameObject.Find("pnlRoot/pnlClub/pnlClubGame").GetComponent(clubGameScene).showUp();
}

function btnEditClick() {
	var prefab: GameObject = Resources.Load("Prefabs/pnlClubCE", GameObject);
	var newPnl: GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
	newPnl.GetComponent(prefabPnlClubCE).prefabType = "Edit Club";
	newPnl.GetComponent(prefabPnlClubCE).showUp();
}

function showUp() {
	GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(PlayerPrefs.GetString("clubAvatar"), gameObject.transform.Find("detail/imgClubAvatar").gameObject, true);
	gameObject.transform.Find("detail/clubDetailName").GetComponent(UILabel).text = PlayerPrefs.GetString("clubName");
	gameObject.transform.Find("detail/clubDetailIntro").GetComponent(UILabel).text = PlayerPrefs.GetString("clubNotice");
	gameObject.transform.Find("Table/btnItem1/clubDetailNum").GetComponent(UILabel).text = PlayerPrefs.GetString("clubCurNum") + "/" + PlayerPrefs.GetString("clubMaxNum");

	gameObject.Find("clubId").GetComponent(UILabel).text = "Club ID: " + PlayerPrefs.GetString("clubId");

	for (var i : int = 0; i < 5; i++) {
		if (i < parseInt(PlayerPrefs.GetString("clubRating")))
			gameObject.Find("detailStar" + i.ToString()).GetComponent(UISprite).spriteName = "star_on";
		else 
			gameObject.Find("detailStar" + i.ToString()).GetComponent(UISprite).spriteName = "star_off";
	}

	if (parseInt(PlayerPrefs.GetString("clubAdmin")) == 1 || parseInt(PlayerPrefs.GetString("clubManager")) == 1) {
		gameObject.transform.Find("Table/btnItem/clubDetailChips").GetComponent(UILabel).text = PlayerPrefs.GetString("clubChips");
		gameObject.transform.Find("Table/btnItem2/Label").GetComponent(UILabel).text = "New Member";
		gameObject.transform.Find("Table/btnItem/title").GetComponent(UILabel).text = "Available Chips";
		gameObject.transform.Find("detail/btnEdit").GetComponent(UIButton).isEnabled = true;
	} else {
		gameObject.transform.Find("Table/btnItem/clubDetailChips").GetComponent(UILabel).text = PlayerPrefs.GetString("clubPersonChips");
		gameObject.transform.Find("Table/btnItem2/Label").GetComponent(UILabel).text = "Quit the club";
		gameObject.transform.Find("Table/btnItem/title").GetComponent(UILabel).text = "My Club Chips";
		gameObject.transform.Find("detail/btnEdit").GetComponent(UIButton).isEnabled = false;
	}
	/*
	if (PlayerPrefs.GetString("clubFounder") == PlayerPrefs.GetString("playerName")) {
		gameObject.Find("detail/btnEdit").GetComponent(UIButton).isEnabled = true;
	} else {
		gameObject.Find("detail/btnEdit").GetComponent(UIButton).isEnabled = false;
	} */
}

function btnchipsClick() {
	var prefab : GameObject;
	var newPnl: GameObject;
	if (parseInt(PlayerPrefs.GetString("clubAdmin")) == 1 || parseInt(PlayerPrefs.GetString("clubManager")) == 1) {
		prefab = Resources.Load("Prefabs/pnlClubChips", GameObject);
		newPnl = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
		newPnl.GetComponent(prefabPnlClubChips).sceneFlag = 3;
		newPnl.GetComponent(prefabPnlClubChips).showUp();
	} else {
		prefab = Resources.Load("Prefabs/pnlScrollList", GameObject);
		newPnl = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
		newPnl.GetComponent(prefabPnlScrollList).prefabType = "Trade Record";
		newPnl.GetComponent(prefabPnlScrollList).getList();
	}
}

function btnMembersClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(memberScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

	memberScene.GetComponent(clubMemberList).showUp();
	/*
	var prefab: GameObject = Resources.Load("Prefabs/pnlScrollList", GameObject);
	var newPnl: GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
	newPnl.GetComponent(prefabPnlScrollList).prefabType = "Member Details";
	newPnl.GetComponent(prefabPnlScrollList).getList();
	*/
}

function btnQuitOrNewClick() {
	var prefab : GameObject;
	var newPnl : GameObject;
	if (parseInt(PlayerPrefs.GetString("clubAdmin")) == 1 || parseInt(PlayerPrefs.GetString("clubManager")) == 1) {
		prefab = Resources.Load("Prefabs/pnlScrollList", GameObject);
		newPnl = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
		newPnl.GetComponent(prefabPnlScrollList).prefabType = "New Member";
		newPnl.GetComponent(prefabPnlScrollList).getList();
	} else {
		prefab = Resources.Load("Prefabs/pnlTxtField", GameObject);
		newPnl = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);
		newPnl.GetComponent(prefabPnlTxtField).prefabType = "quit club";
		newPnl.GetComponent(prefabPnlTxtField).showUp();
	}
}