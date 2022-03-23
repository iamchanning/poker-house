#pragma strict

var csNGUITools: NGUITools;
var csEngineFB : Facebook.Unity.EP.engineFB; 
var fbProcessFlag: boolean = false;

private var usr: JSONObject;
var socket: SocketIO.SocketIOComponent;
var socketErr: boolean;
var playerName: String;


var pokerScene: GameObject;
var scenes : GameObject[];
var menuBtns : GameObject[];
var curpos: int;

var forcePortrait : boolean;
var currentRotation : ScreenOrientation;

//var menu : GameObject;
//var screenWidthHeight : GameObject;
//var lastWidth : int;

var menuDisabled : boolean;

//var noticeCompelete: int;
//var totalNoticeNum: int;
var NoticeItem: Array;
 
//private var newHeight : int;


function Awake() {

	PlayerPrefs.SetString("server", 'https://ep-dev-php.appspot.com/api2.5/');
	//PlayerPrefs.SetString("key", 'AUEEW891WL');
	PlayerPrefs.SetString("key", 'AUEEW8WPTL');
	if(PlayerPrefs.GetString("uid") == "") {
		var uid = System.Guid.NewGuid().ToString();
		PlayerPrefs.SetString("uid", uid.ToString());
	}
	PlayerPrefs.SetString("playerLanguage", 'en');

	#if !UNITY_STANDALONE && !UNITY_WEBGL


	csEngineFB = new Facebook.Unity.EP.engineFB();
	csEngineFB.init();

	#endif

	csEngineFB.OnLoggedIn = fbLoggedIn;
	csEngineFB.OnGetUser = fbGetUser;

	/*
	#if !UNITY_STANDALONE && !UNITY_WEBGL


	csEngineFB = new Facebook.Unity.EP.engineFB();
	csEngineFB.init();

	#endif
	*/

	//currentRotation = ScreenOrientation.Unknown;
	//updateDisplay();
	//#if !UNITY_EDITOR
	/*
		if (PlayerPrefs.GetString("orientation") == "" || PlayerPrefs.GetString("orientation") == "landscape") {
			Screen.orientation = ScreenOrientation.LandscapeLeft;
		}
		else
			Application.LoadLevel("portrait");
			*/
	//#endif

	//noticeCompelete = 0;
	//totalNoticeNum = 0;

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString("key").ToString());
	usr.AddField("username","");
	usr.AddField("data","");	
	usr.AddField("language",PlayerPrefs.GetString("playerLanguage"));

	disablePanel(pokerScene);
	GameObject.Find("UI Root/pnlWaiting").GetComponent(UIPanel).alpha = 0;

	for (var i : int = 0; i < scenes.length; i++) {
		
		if (i == curpos)
			enablePanel(scenes[i]);
		else
			disablePanel(scenes[i]);
	}
	
	menuBtns[curpos].GetComponent(UISprite).spriteName = menuBtns[curpos].GetComponent(UISprite).spriteName.Replace("_off","_on");
}

function Start () {
	

	socket = GameObject.Find("SocketIO").GetComponent("SocketIOComponent");
	socket.On("open", TestOpen);
	socket.On("error", TestError);
	socket.On("close", TestClose);
	socket.On("gotSync", gotSync);


}

function menuBtnClick(pos: int)   {
	if (pos == curpos || menuDisabled) {
		return;
	}
	resetPnlEmptyMsg();
	disablePanel(scenes[curpos]);
	menuBtns[curpos].GetComponent(UISprite).spriteName = menuBtns[curpos].GetComponent(UISprite).spriteName.Replace("_on","_off");
	enablePanel(scenes[pos]);
	menuBtns[pos].GetComponent(UISprite).spriteName = menuBtns[pos].GetComponent(UISprite).spriteName.Replace("_off","_on");

	if(pos == 0)
		scenes[pos].GetComponent(shopController).RefreshInfo();
	if (pos == 1)
		scenes[pos].GetComponent(clubController).getClubInfo();
	if (pos == 4) 
		scenes[pos].GetComponent(profileController).showUp();
	curpos = pos;
}
/*
function Update () {

	
	#if !UNITY_EDITOR
	if(currentRotation != Screen.orientation) {
		currentRotation = Screen.orientation;
		updateDisplay();
	}
	#else
	if(Screen.width != lastWidth) {
		lastWidth = Screen.width;
		updateDisplay();
	}
	#endif
	*/

	/*
	if(screenWidthHeight.GetComponent(UISprite).width != lastWidth) {
		lastWidth = screenWidthHeight.GetComponent(UISprite).width;
		updateDisplay();
	}

}
*/

/*
function updateDisplay() {
	changeRotationScenes();
	changeRotationMenu();
}

function changeRotationScenes() {
	var orientation : UIAtlas;
	var portrait : UIAtlas = Resources.Load("Atlases/portrait",GameObject).GetComponent(UIAtlas);
	var landscape : UIAtlas = Resources.Load("Atlases/landscape",GameObject).GetComponent(UIAtlas);


	//Debug.Log('Screen is ' + Screen.orientation);

	//orientation = landscape;

	if(Screen.orientation == ScreenOrientation.LandscapeLeft || Screen.orientation == ScreenOrientation.LandscapeRight) {
		Debug.Log('Landscape');
		orientation = landscape;
		//isPortrait = false;
	} else {
		//Debug.Log('Portrait');
		orientation = portrait;
		//isPortrait = true;
	}

	#if UNITY_EDITOR
		if(GameObject.Find("UI Root (3D)").GetComponent(enginepoker).forcePortrait) {
			orientation = portrait;
			//isPortrait = true;
		} else {
			orientation = landscape;
			//isPortrait = false;
		}
	#endif



	var allChildren;

	for(var scene : GameObject in scenes) {

		if(scene.GetComponent(UIPanel).alpha == 1) {
			allChildren = scene.GetComponentsInChildren(Transform);
			break;
		}
	}


    for (var child : Transform in allChildren) {
   
		if(child.GetComponent(UISprite)) {

			if(child.GetComponent(UISprite).atlas == portrait || child.GetComponent(UISprite).atlas == landscape) {
				if(child.GetComponent(UISprite).atlas != orientation) {
					child.GetComponent(UISprite).atlas = orientation.GetComponent(UIAtlas);
				}
			}
		}	



		if(child.GetComponent(sceneButtonController)) {

			if(orientation == portrait) {
				newHeight = scaleHeight(child.GetComponent(sceneButtonController).portraitWidth,child.GetComponent(UISprite).width, child.GetComponent(UISprite).height);
			
				child.GetComponent(UISprite).width = child.GetComponent(sceneButtonController).portraitWidth;
				child.GetComponent(UISprite).height = newHeight;
			

			} else {

				newHeight = scaleHeight(child.GetComponent(sceneButtonController).landscapeWidth,child.GetComponent(UISprite).width, child.GetComponent(UISprite).height);

				child.GetComponent(UISprite).width = child.GetComponent(sceneButtonController).landscapeWidth;
				child.GetComponent(UISprite).height = newHeight;
			}

		}

		if (child.GetComponent(sceneController)) {
			if(child.GetComponent(sceneController).header && orientation == portrait) {
				child.GetComponent(sceneController).adjustPortrait();
			}
			if(child.GetComponent(sceneController).header && orientation == landscape) { 	
				child.GetComponent(sceneController).adjustLandscape();
			}
		}

		if (child.GetComponent(hideController)) {
			if (orientation == portrait) {
				child.GetComponent(UILabel).text = "";
			} else {
				child.GetComponent(UILabel).text = "Cheney";
			}
		}

	}

    	
} */

function changeRotationMenu() {
/*
	var itemWidth = menu.GetComponent(menuController).BtnWidth;

	//Debug.Log("Screen W " + screenWidthHeight.GetComponent(UISprite).width);

	var scaleCellWidth : float;

	//var itemHeight = isPortrait ? 5 : 0;




	#if UNITY_EDITOR
		if(GameObject.Find("UI Root (3D)").GetComponent(enginepoker).forcePortrait) {
			
			menu.transform.localPosition.y = -352;
			scaleCellWidth = screenWidthHeight.GetComponent(UISprite).width / 7;
		} else {
			menu.transform.localPosition.y = -334;
			scaleCellWidth = screenWidthHeight.GetComponent(UISprite).width / 9;
		}

	#else 
		if(Screen.orientation == ScreenOrientation.LandscapeLeft || Screen.orientation == ScreenOrientation.LandscapeRight) {
			menu.transform.localPosition.y = -334;
			scaleCellWidth = screenWidthHeight.GetComponent(UISprite).width / 9;
		} else {
			menu.transform.localPosition.y = -352;
			scaleCellWidth = screenWidthHeight.GetComponent(UISprite).width / 7;
		}
	#endif

	if (scaleCellWidth < menu.GetComponent(menuController).BtnWidth) {
		itemWidth = scaleCellWidth * 0.9;
	} 
	menu.GetComponent(UIGrid).cellWidth = scaleCellWidth;

	for(var child : Transform in menu.GetComponent(UIGrid).GetChildList() ) {
        var childWidget : UIWidget = child.GetComponent(UIWidget);


        if(child.GetComponent(menuButtonController).menuItem == 2) {
        	childWidget.SetRect( 0, 0, (itemWidth * 1.2), (itemWidth * 1.2));
        } else {
        	childWidget.SetRect( 0, 0, itemWidth, itemWidth);
        }
    }

    //Debug.Log("scaleCellWidth " + scaleCellWidth);
    //Debug.Log("itemWidth " + itemWidth);

	menu.GetComponent(UIGrid).Reposition();
	*/
}

function scaleHeight(newW: float, currW : float, currH : float){

	var ratio = currH / currW;

	currH = newW * ratio;

	return currH;
}


function enablePanel(scene: GameObject) {
	scene.GetComponent(UIPanel).alpha = 1;
	csNGUITools.SetActive(scene, true);
	//menuDisabled = true;
}

function disablePanel(scene: GameObject) {
	scene.GetComponent(UIPanel).alpha = 0;
	csNGUITools.SetActive(scene, false);
	//menuDisabled = false;
}


function loadAvatar(avatar : String, frame: GameObject, clubFlag: boolean) {
	var url = "";

	if (avatar.IndexOf('https://') == 0) {
		url = avatar;
	} else if(avatar.IndexOf('.jpg') > 0) {
		if (clubFlag)
			url = PlayerPrefs.GetString("server") + "clubAvatars/" + avatar;
		else
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

	frame.GetComponent(UITexture).mainTexture = tex;

	var mask = UnityEngine.Resources.Load.<Texture2D>("avatar_mask");


    //var shader : Shader = Shader.Find("MaskedTexture (AlphaClip)");
    //var shader : Shader = UnityEngine.Resources.Load.<Shader>("MaskedTexture (AlphaClip)");
    //var shader : Shader = UnityEngine.Resources.Load.<Shader>("MaskClipShader (AlphaClip)");
    //var shader : Shader = Shader.Find("Unlit/Transparent Colored");
    var shader : Shader = frame.GetComponent(UITexture).shader;

    if(shader != null) {

		//Debug.Log("Shader exist");

        var material = new Material(shader);

        /*
        if (mask != null)
        	Debug.Log("mask exist");
        else 
        	Debug.Log("mask not exist");
        */
       
		
        if(tex != null) {
        	
        	//material.mainTexture = tex;
        	material.SetTexture("_MainTex", tex);
		
       	} else {
       		//frame.GetComponent(UITexture).mainTexture = UnityEngine.Resources.Load.<Texture2D>("fail_pic");
       		material.SetTexture("_MainTex", UnityEngine.Resources.Load.<Texture2D>("fail_pic"));
        }
	   	
	   	if(avatar == "") {
	   		//frame.GetComponent(UITexture).mainTexture = UnityEngine.Resources.Load.<Texture2D>("fail_pic");
	   		material.SetTexture("_MainTex", UnityEngine.Resources.Load.<Texture2D>("fail_pic"));
	   	}
	   	
       	material.SetTexture("_Mask", mask);
    
        frame.GetComponent(UITexture).material = material;


    } else {
    	Debug.Log("Shader not exist");
    	frame.GetComponent(UITexture).mainTexture = tex;
	}
}


function TestOpen(e : SocketIO.SocketIOEvent) {


	if (socketErr) {
		Debug.Log("re-open...");
		usr.AddField("socketId", socket.sid);
		usr.SetField("usernanme", playerName);
		socket.Emit("get_sync", usr);
		socketErr = false;
	}
	Debug.Log("[SocketIO] Open received: " + e.name + " " + e.data);
}

function TestError( e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] Error received: " + e.name + " " + e.data);
	Debug.Log(e);
	socketErr = true;
}
	
function TestClose(e : SocketIO.SocketIOEvent) {	
	Debug.Log("[SocketIO] Close received: " + e.name + " " + e.data);

}

function gotSync(e: SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotSync received: " + e.name + " " + e.data);

	if (e) {

		GameObject.Find("pnlRoot/pnlHome/pnlLoading").GetComponent(loadingScene).Connect();
	} else {
		Debug.Log('Empty data');
	}
}


function showNotify(txt: String) {
	GameObject.Find("UI Root/pnlNotify/lblNotify").GetComponent(UILabel).text = txt;
	var tp : TweenPosition = TweenPosition.Begin(GameObject.Find("UI Root/pnlNotify"), 0.3, Vector3(0,320,0));

	tp.delay = 1.8f;
	EventDelegate.Add(tp.onFinished, function(){ 
		TweenPosition.Begin(GameObject.Find("UI Root/pnlNotify"), 0.7, Vector3(0,411,0)); 
	}); 

}

function showPnlEmptyMsg(txt: String, imgAlpha: int, positon: Vector3, scale: Vector3) {
	GameObject.Find("UI Root/pnlEmptyMsg/lblMsg").GetComponent(UILabel).text = txt;
	GameObject.Find("UI Root/pnlEmptyMsg/imgMsg").GetComponent(UISprite).alpha = imgAlpha;
	GameObject.Find("UI Root/pnlEmptyMsg").transform.localPosition = positon;
	GameObject.Find("UI Root/pnlEmptyMsg").transform.localScale = scale;
}

function resetPnlEmptyMsg() {
	GameObject.Find("UI Root/pnlEmptyMsg").transform.localPosition = new Vector3(0, 584, 0);
	GameObject.Find("UI Root/pnlEmptyMsg").transform.localScale = new Vector3(1, 1);
}

function enablePokerTable() {
	enablePanel(pokerScene);
	pokerScene.GetComponent(pokerTable).showUp();
}

function handleNotice(notice: String) {

/*
	var depth = 8;
	var pnlNo = 0;
	for(var row : LitJson.JsonData in data){


		var prefab : GameObject = Resources.Load("Prefabs/pnlEvent", GameObject);

		prefab.name = 'pnlEvent' + pnlNo;

		var newPnl : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(GameObject.Find("UI Root/pnlRoot/pnlHome"), prefab);

		newPnl.GetComponent(UIPanel).depth = depth;
		newPnl.GetComponent(eventScene).noticeId = parseInt(row["id"].ToString());
		newPnl.GetComponent(eventScene).title = row["title"].ToString();
		newPnl.GetComponent(eventScene).showUp();
		depth++;
		pnlNo++;
	}
	*/

	if (notice == "")
		return;

	NoticeItem = new Array(notice.Split(" "[0]));
	
	//NoticeItem = PlayerPrefs.GetString("Notices").Split(" "[0]);

	showNotices();

}

function showNotices() {

	if (NoticeItem && NoticeItem.length == 0)
		return;

	var NoticeInfo: String[] = NoticeItem[0].ToString().Split(","[0]);

	var prefab : GameObject = Resources.Load("Prefabs/pnlEvent", GameObject);

	prefab.name = 'pnlEvent' + NoticeInfo[0];

	var newPnl : GameObject = NGUITools.AddChild(GameObject.Find("UI Root/pnlRoot/pnlHome"), prefab);

	//newPnl.GetComponent(UIPanel).depth = depth;
	newPnl.GetComponent(eventScene).noticeId = parseInt(NoticeInfo[0]);
	newPnl.GetComponent(eventScene).title = NoticeInfo[1];

	newPnl.GetComponent(eventScene).showUp();
	//depth++;
	//pnlNo++;

	NoticeItem.RemoveAt(0);

}

/*
function showWebView() {
	noticeCompelete++;

	if (noticeCompelete == totalNoticeNum && totalNoticeNum != 0) {
		for (var i: int = 0; i < totalNoticeNum; i++) {
			GameObject.Find("UI Root/pnlRoot/pnlHome/pnlEvent" + i + "(Clone)").GetComponent(eventScene).showUniWebView();
		}
		noticeCompelete = 0;
		totalNoticeNum = 0;
	}
} */

function CurrencyFormat(number : float) {
   return "$" + number.ToString( "n0" );
}

function ranking(i : int) {
    var j = i % 10;
    var k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

function avatarChanged() {
	GameObject.Find("UI Root/pnlRoot/pnlShop").GetComponent(shopController).avatarChanged = true;
	GameObject.Find("UI Root/pnlRoot/pnlClub").GetComponent(clubController).avatarChanged = true;
	GameObject.Find("UI Root/pnlRoot/pnlProfile").GetComponent(profileController).avatarChanged = true;
	GameObject.Find("UI Root/pnlRoot/pnlHome/pnlLeague").GetComponent(leagueScene).avatarChanged = true;
}

function fbLoggedIn() {

	if(csEngineFB.IsLoggedIn) {
		
		csEngineFB.getUser();
	} else {
		GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Login Facebook fail!");
		//processFlag = false;
		//closeClick();
	}
}


function fbGetUser(theFbId : String, theFbUsername : String, theFbEmail : String) {

	//fbUsername = theFbUsername.Replace(" ", "").Substring(0,7);
	//fbEmail = theFbEmail;
	//fbId = theFbId;

	if (fbProcessFlag)
		return;

	if (csNGUITools.GetActive(GameObject.Find("UI Root/pnlRoot/pnlHome").gameObject)) {
		var country = Application.systemLanguage.ToString();
		var language = PlayerPrefs.GetString("playerLanguage");

		usr.SetField("data", '&user=' + theFbUsername + '&password=' + theFbId + '&language=' + language +'&deviceName=' + WWW.EscapeURL(SystemInfo.deviceName) + '&email=' + theFbEmail + '&myTime=0&country=' + country + '&av=avatar1.jpg&facebookId='+theFbId);
		socket.Emit("get_login", usr);
		fbProcessFlag = true;
	} else if (csNGUITools.GetActive(GameObject.Find("UI Root/pnlRoot/pnlProfile").gameObject)) {
		usr.SetField("data", '&facebookId=' + theFbId);
		socket.Emit("updateFb", usr);
		fbProcessFlag = true;
	}	
}




