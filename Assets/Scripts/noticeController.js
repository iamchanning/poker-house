#pragma strict

var uiGrid: GameObject;

//var eventPnl: GameObject;

private var usr: JSONObject;

private var alreadyLoading: int;
private var totalLoading: int;

function Start () {

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotNoticeList", gotNoticeList);

	//GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(eventPnl);

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);

	GameObject.Find("UI Root/pnlWaiting").GetComponent(UIPanel).alpha = 1;
	getNoticeInfo();
}

function getNoticeInfo() {
	
    GameObject.Find("UI Root").GetComponent(enginepoker).resetPnlEmptyMsg();

	usr.SetField("data", "&dealerId=" + PlayerPrefs.GetString("playerDealerId"));
	GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_notice", usr);
}

function gotNoticeList(e : SocketIO.SocketIOEvent) {

	Debug.Log("[SocketIO] gotNoticeList received: " + e.name + " " + e.data);

	for (var child : Transform in uiGrid.GetComponent(UIGrid).GetChildList()){
        NGUITools.Destroy(child.gameObject);
    }

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	 
	try { 

		totalLoading = data["response"].Count;

		if (data["response"].Count == 0) {

			GameObject.Find("UI Root").GetComponent(enginepoker).showPnlEmptyMsg("There are no new events yet!", 1, new Vector3(0, 0, 0), new Vector3(1.5, 1.5));
			GameObject.Find("UI Root/pnlWaiting").GetComponent(UIPanel).alpha = 0;

		} else {

			for(var grid : LitJson.JsonData in data["response"]){

				var prefabRow : GameObject = Resources.Load("Prefabs/noticeEvent", GameObject);


				var newRow : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(uiGrid,prefabRow);


				newRow.transform.localScale = new Vector3(0.95, 0.95);

				loadNoticeImg(parseInt(grid["noticeId"].ToString()), newRow);

				newRow.transform.GetComponent(gridRow).noticeId = parseInt(grid["noticeId"].ToString());
				newRow.transform.GetComponent(gridRow).noticeSubject = grid["subject"].ToString();
				//newRow.transform.GetComponent(gridRow).noticeMsg = grid["message"].ToString();

				UIEventListener.Get(newRow).onClick = noticeView;
			}

			uiGrid.GetComponent(UIGrid).Reposition();
		}
		
	} catch(e) {
		Debug.Log('err in data received');
	}
}

function noticeView(item: GameObject) {

	//GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(eventPnl);

	//eventPnl.GetComponent(eventScene).noticeId = item.GetComponent(gridRow).noticeId;
	//eventPnl.GetComponent(eventScene).title = item.GetComponent(gridRow).noticeSubject;
	//eventPnl.GetComponent(eventScene).showUp();

	var prefab : GameObject = Resources.Load("Prefabs/pnlEvent", GameObject);
	var newPnl : GameObject = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);

	newPnl.GetComponent(eventScene).noticeId = item.GetComponent(gridRow).noticeId;
	newPnl.GetComponent(eventScene).title = item.GetComponent(gridRow).noticeSubject;
	newPnl.GetComponent(eventScene).showUp();
	
}	

function loadNoticeImg(noticeId: int, frame: GameObject) {
	
	var form : WWWForm = new WWWForm();

	/*
	form.AddField("uid", PlayerPrefs.GetString ("uid").ToString());
    form.AddField("key", PlayerPrefs.GetString ("key").ToString());
    form.AddField("username", PlayerPrefs.GetString ("playerName"));
    form.AddField("type", "image");
    form.AddField("id", noticeId.ToString());
    */
    var url = PlayerPrefs.GetString("server") + "notification_download.php?id=" + noticeId + "&uid=" + PlayerPrefs.GetString ("uid").ToString() + "&key=" + PlayerPrefs.GetString("key").ToString() + "&username=" + PlayerPrefs.GetString ("playerName") + "&type=imageUrl";

	//var www : WWW = new WWW (PlayerPrefs.GetString("server") + "notification_download.php", form);
	var www: WWW = new WWW(url);
	// Wait for download to complete
	yield www;

	var data: byte[] = System.Convert.FromBase64String(www.text);

	var tex : Texture2D = new Texture2D(1,1);
	tex.LoadImage(data); 

	frame.GetComponent(UITexture).mainTexture = tex;

    var shader : Shader = frame.GetComponent(UITexture).shader;

    if(shader != null) {

	   var material = new Material(shader);

       if(tex != null) {
        	
        	//material.mainTexture = tex;
        	material.SetTexture("_MainTex", tex);
		
       	} else {
       		material.SetTexture("_MainTex", UnityEngine.Resources.Load.<Texture2D>("fail_pic"));
        }
	   	
    	frame.GetComponent(UITexture).material = material;
	} 
	alreadyLoading++;

	if (alreadyLoading == totalLoading) {
		GameObject.Find("UI Root/pnlWaiting").GetComponent(UIPanel).alpha = 0;
	}

}
