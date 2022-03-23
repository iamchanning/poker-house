#pragma strict


var crtSrchScene: GameObject;
var gameScene: GameObject;
var createGameScene: GameObject;

var btnCreate: GameObject;
var profileBtn: GameObject;

var uiGrid: GameObject;
var avatarChanged: boolean = false;

private var usr: JSONObject;

function Start () {
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotClubList", gotClubList);

	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(crtSrchScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(createGameScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameScene);

	UIEventListener.Get(btnCreate).onClick = btnCreateClick;
	UIEventListener.Get(profileBtn).onClick = profileBtnClick;

	GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(PlayerPrefs.GetString("playerAvatar").ToString(), gameObject.transform.Find("header/playerProfile/imgPlayerAvatar").gameObject, false);
}


function getClubInfo() {

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);

	if (avatarChanged) {
		GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(PlayerPrefs.GetString("playerAvatar").ToString(), gameObject.transform.Find("header/playerProfile/imgPlayerAvatar").gameObject, false);
		avatarChanged = false;
	}
	gameObject.Find("lblClubUsrName").GetComponent(UILabel).text = PlayerPrefs.GetString("playerName");

	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();

    PlayerPrefs.SetString("clubId", "0");

	usr.SetField("data", "&action=playerclubs");
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_clubs", usr);	
}

function profileBtnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuBtnClick(4);
}

function gotClubList(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotClubs received: " + e.name + " " + e.data);

	for (var child : Transform in uiGrid.GetComponent(UIGrid).GetChildList()){
        NGUITools.Destroy(child.gameObject);
    } 

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	 
	try { 
		
		if (data["response"].Count == 0) {

			GameObject.Find("UI Root").GetComponent(enginepoker).showPnlEmptyMsg("You have not joined a club yet!", 1, new Vector3(0, 0, 0), new Vector3(1.5, 1.5));

		} else {

			for(var grid : LitJson.JsonData in data["response"]){

				var prefabRow : GameObject = Resources.Load("Prefabs/clubRow", GameObject);
				var newRow : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(uiGrid,prefabRow);

				newRow.transform.localScale = new Vector3(0.95, 0.95);

				GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(grid["clubAvatar"].ToString(), newRow.transform.Find("imgClubAvatar").gameObject, true);

				newRow.transform.GetComponent(gridRow).clubId = grid["clubId"].ToString();
				newRow.transform.GetComponent(gridRow).clubName = grid["clubName"].ToString();
				newRow.transform.GetComponent(gridRow).clubNotice = grid["clubNotice"].ToString();
				newRow.transform.GetComponent(gridRow).clubAdmin = grid["clubAdmin"].ToString(); 
				newRow.transform.GetComponent(gridRow).clubManager = grid["clubManager"].ToString();
				newRow.transform.GetComponent(gridRow).clubRating = grid["clubRating"].ToString();
				newRow.transform.GetComponent(gridRow).clubMaxNum = grid["clubMaxNum"].ToString();
				newRow.transform.GetComponent(gridRow).clubCurNum = grid["clubCurNum"].ToString();
				newRow.transform.GetComponent(gridRow).exchangeRate = grid["exchangeRate"].ToString();
				newRow.transform.GetComponent(gridRow).clubChips = grid["clubChips"].ToString();
				newRow.transform.GetComponent(gridRow).personChips = grid["personChips"].ToString();
				newRow.transform.GetComponent(gridRow).clubAvatar = grid["clubAvatar"].ToString();
				
				newRow.transform.Find("Label").GetComponent(UILabel).text = grid["clubName"].ToString();
				for (var i : int = 0; i < parseInt(grid["clubRating"].ToString()); i++) {
					newRow.transform.Find("clubStar" + i.ToString()).GetComponent(UISprite).spriteName = "star_on";
				}

				if (parseInt(grid["clubAdmin"].ToString()) == 1 || parseInt(grid["clubManager"].ToString()) == 1) {
					newRow.transform.Find("clubFounder").GetComponent(UISprite).spriteName = "online_icon";
				} else {
					newRow.transform.Find("clubFounder").GetComponent(UISprite).spriteName = "";
				}

				UIEventListener.Get(newRow).onClick = viewClub;
			}

			uiGrid.GetComponent(UIGrid).Reposition();
		}
			
	} catch(e) {
		Debug.Log('err in data received');
	}
}

function viewClub(item: GameObject) {

	PlayerPrefs.SetString("clubId", item.GetComponent(gridRow).clubId);
	PlayerPrefs.SetString("clubName", item.GetComponent(gridRow).clubName);
	PlayerPrefs.SetString("clubNotice", item.GetComponent(gridRow).clubNotice);
	PlayerPrefs.SetString("clubAdmin", item.GetComponent(gridRow).clubAdmin);
	PlayerPrefs.SetString("clubManager", item.GetComponent(gridRow).clubManager);
	PlayerPrefs.SetString("clubRating", item.GetComponent(gridRow).clubRating);
	PlayerPrefs.SetString("clubMaxNum", item.GetComponent(gridRow).clubMaxNum);
	PlayerPrefs.SetString("clubCurNum", item.GetComponent(gridRow).clubCurNum);
	PlayerPrefs.SetString("clubChips", item.GetComponent(gridRow).clubChips);
	PlayerPrefs.SetString("clubExRate", item.GetComponent(gridRow).exchangeRate);
	PlayerPrefs.SetString("clubPersonChips", item.GetComponent(gridRow).personChips);
	PlayerPrefs.SetString("clubAvatar", item.GetComponent(gridRow).clubAvatar);


	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(gameScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

	gameScene.GetComponent(clubGameScene).showUp();
}	

function btnCreateClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(crtSrchScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;
}
