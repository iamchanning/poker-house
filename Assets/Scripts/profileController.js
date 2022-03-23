#pragma strict

//var usr : JSONObject;

var headerRightBtn: GameObject;
var chipPlusBtn: GameObject;
var diamondPlusBtn: GameObject;
var mailBtn: GameObject;
var contactBtn: GameObject;

var settingScene : GameObject;
var emailScene : GameObject;
var pnlAvatar: GameObject;

var avatarChanged: boolean = false;

function Start () {
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(settingScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(emailScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(pnlAvatar);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = false; 	

	UIEventListener.Get(headerRightBtn).onClick = headerBtnClick;
	UIEventListener.Get(chipPlusBtn).onClick = chipPlusBtnClick;
	UIEventListener.Get(diamondPlusBtn).onClick = diamondPlusBtnClick;
	UIEventListener.Get(mailBtn).onClick = mailBtnClick;
	UIEventListener.Get(gameObject.transform.Find("avatar").gameObject).onClick = avatarChange;
	UIEventListener.Get(contactBtn).onClick = contactBtnClick;

	GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(PlayerPrefs.GetString("playerAvatar").ToString(), GameObject.Find("UI Root/pnlRoot/pnlProfile/avatar/imgPlayerAvatar"), false);

	//GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotProfile", gotProfile);
	/*
	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString ("playerName"));
	usr.AddField("playerMove","");
	usr.AddField("joinGame","");
	usr.AddField("msg","");
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);
	usr.AddField("language",PlayerPrefs.GetString("playerLanguage"));
	usr.AddField("gameID","");
	*/

	//getUser();
}

function showUp() {
	GameObject.Find("UI Root/pnlRoot/pnlProfile/lblProfileName").GetComponent(UILabel).text = PlayerPrefs.GetString("playerName");
	GameObject.Find("UI Root/pnlRoot/pnlProfile/lblProfileId").GetComponent(UILabel).text = "ID: " + PlayerPrefs.GetString("playerId");
	GameObject.Find("UI Root/pnlRoot/pnlProfile/chips/lblProfileBank").GetComponent(UILabel).text = PlayerPrefs.GetString("playerBank");
	GameObject.Find("UI Root/pnlRoot/pnlProfile/diamonds/lblProfileGold").GetComponent(UILabel).text = PlayerPrefs.GetString("playerGold");


	if (avatarChanged) {
		GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(PlayerPrefs.GetString("playerAvatar").ToString(), GameObject.Find("UI Root/pnlRoot/pnlProfile/avatar/imgPlayerAvatar"), false);
		avatarChanged = false;
	} 
}


function headerBtnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(settingScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;
}

function chipPlusBtnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuBtnClick(0);
	GameObject.Find("UI Root/pnlRoot/pnlShop").GetComponent(shopController).sceneFlag = 1;
	GameObject.Find("UI Root/pnlRoot/pnlShop").GetComponent(shopController).chipsBtnClick();
}

function diamondPlusBtnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuBtnClick(0);
	GameObject.Find("UI Root/pnlRoot/pnlShop").GetComponent(shopController).sceneFlag = 0;
	GameObject.Find("UI Root/pnlRoot/pnlShop").GetComponent(shopController).diamondsBtnClick();
}

function mailBtnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(emailScene);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

	emailScene.GetComponent(mailScene).showUp();
}

function avatarChange() {
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(pnlAvatar);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = true;

	pnlAvatar.GetComponent(avatarScene).showUp();
}

function contactBtnClick() {
	var prefab : GameObject = Resources.Load("Prefabs/pnlEvent", GameObject);
	var newPnl : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);

	newPnl.GetComponent(eventScene).noticeId = 0;
	newPnl.GetComponent(eventScene).title = "Contact";
	newPnl.GetComponent(eventScene).showUp();
}

/*
function getUser() {
	usr.SetField("data", "&username=" + PlayerPrefs.GetString("playerName"));
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_profile", usr);
	
}
*/
/*
function gotProfile (e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotProfile received: " + e.name + " " + e.data); 

	if (e) {
		
		var data = LitJson.JsonMapper.ToObject(e.data.ToString());
		try {
 			GameObject.Find("StaticPlayerName").GetComponent(UILabel).text = data["response"]["playerName"].ToString();
			GameObject.Find("lblPlayerBank").GetComponent(UILabel).text = data["response"]["playerBank"].ToString();
			GameObject.Find("lblPlayerGold").GetComponent(UILabel).text = data["response"]["playerGold"].ToString();

			if(data["response"]["country"].ToString() == "") {
				GameObject.Find("imgFlag").GetComponent(UISprite).spriteName = PlayerPrefs.GetString("playerLanguage");
			} else {
				GameObject.Find("imgFlag").GetComponent(UISprite).spriteName = data["response"]["country"].ToString();
			}
			 
			
			PlayerPrefs.SetString("loadVocab", data["response"]["loadVocab"].ToString());
			
			GameObject.Find("lblLevel").GetComponent(UILabel).text = data["response"]["playerLevel"].ToString();
		 	GameObject.Find("prgLevel").GetComponent(UISlider).value = poker.strToFloat(data["response"]["playerLevelPoints"].ToString());
			
			PlayerPrefs.SetString("playerAvatar",data["response"]["playerAvatar"].ToString());
						
			loadAvatar(data["response"]["playerAvatar"].ToString());

		} catch (err) {

		}
	}	
}
*/
/*
function loadAvatar(avatar : String) {
	var url = "";
	
	if(avatar.IndexOf('.jpg') > 0) {
		url = PlayerPrefs.GetString("server") + "avatars/" + avatar;
	} else {
		url = "https://graph.facebook.com/" + avatar + "/picture?type=large";
	}
	
	var www : WWW = new WWW (url);
	// Wait for download to complete
	yield www;
	
	try {
		//Put a try here and fail to default image
    	var tex : Texture2D = www.texture;
    } catch (err) {
    	Debug.Log("Failed to load image");
    }
    
	gameObject.Find("imgPlayerAvatar").GetComponent(UITexture).mainTexture = tex;

	var mask = UnityEngine.Resources.Load.<Texture2D>("avatar_mask");
    var shader : Shader = Shader.Find("MaskedTexture");
	
    if(shader != null) {
    	
        var material = new Material(shader);
		
        if(tex != null) {
        	
        	material.mainTexture = tex;
		
       	} else {
       		gameObject.Find("imgPlayerAvatar").GetComponent(UITexture).mainTexture = UnityEngine.Resources.Load.<Texture2D>("fail_pic");
        }
	   	
	   	if(avatar == "") {
	   		gameObject.Find("imgPlayerAvatar").GetComponent(UITexture).mainTexture = UnityEngine.Resources.Load.<Texture2D>("fail_pic");
	   	}
	   	
       	material.SetTexture("_Mask", mask);

        gameObject.Find("imgPlayerAvatar").GetComponent(UITexture).material = material;

    }
}
*/