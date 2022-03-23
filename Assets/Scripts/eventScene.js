#pragma strict

var noticeId: int;
var title: String;

var webViewObj : GameObject;

function Start () {
	UIEventListener.Get(gameObject.transform.Find("header/close").gameObject).onClick = btnReturn;
	UIEventListener.Get(gameObject.transform.Find("btnConfirm").gameObject).onClick = btnReturn;
}

function btnReturn() {
	NGUITools.Destroy(gameObject);

	GameObject.Find("UI Root").GetComponent(enginepoker).showNotices();
}

function showUp() {

	gameObject.transform.Find("header/title").GetComponent(UILabel).text = title;


	var prefab: GameObject = Resources.Load("Prefabs/UniWebViewObject");

	prefab.name = 'WebView' + noticeId;

	webViewObj = GameObject.Find("UI Root").GetComponent(enginepoker).csNGUITools.AddChild(gameObject,prefab);

	webViewObj.GetComponent(UniWebView).OnLoadComplete += OnLoadComplete;
	//var webView = webViewObj.AddComponent(UniWebView);


	if (noticeId > 0)
		webViewObj.GetComponent(UniWebView).url = PlayerPrefs.GetString("server") + "notification_download.php?id=" + noticeId + "&uid=" + PlayerPrefs.GetString ("uid").ToString() + "&key=" + PlayerPrefs.GetString("key").ToString() + "&username=" + PlayerPrefs.GetString ("playerName") + "&type=message"; 
	else {
		var type = "";
		if (title == "Contact")
			type = "webpage";
		else if (title == "Terms of Service")
			type = "service";
		else
			type = "policy";
		webViewObj.GetComponent(UniWebView).url = PlayerPrefs.GetString("server") + "dealerInfo.php?&uid=" + PlayerPrefs.GetString ("uid").ToString() + "&key=" + PlayerPrefs.GetString("key").ToString() + "&username=" + PlayerPrefs.GetString ("playerName") + "&type=" + type; 
	}
		
	var bounds1 =  NGUIMath.CalculateRelativeWidgetBounds(gameObject.transform.Find('bgT'));

	var bounds2 =  NGUIMath.CalculateRelativeWidgetBounds(gameObject.transform.Find('tableBG'));

	var bounds3 =  NGUIMath.CalculateRelativeWidgetBounds(gameObject.transform.Find('header'));

	var bounds4 =  NGUIMath.CalculateRelativeWidgetBounds(gameObject.transform.Find('btnConfirm'));

	var ratio2x = bounds2.size.x / bounds1.size.x;
	var ratio2y = bounds2.size.y / bounds1.size.y;
	var ratio3y = bounds3.size.y / bounds1.size.y;
	var ratio4y = bounds4.size.y / bounds1.size.y;

	var top = ((1 - ratio2y)/2 + ratio3y) * UniWebViewHelper.screenHeight;
	var left = (1 - ratio2x)/2  * 1.1 *UniWebViewHelper.screenWidth;
	var bottom = ((1 - ratio2y)/2 + ratio4y/2) * 1.1 * UniWebViewHelper.screenHeight;

	//Debug.Log("Top: " + );
	//Debug.Log("Left/Right: " + (bounds2.size.x - bounds1.size.x) * 1.1/2);
	//Debug.Log("Bottom: " + ((bounds2.size.y - bounds1.size.y)/2 - bounds4.size.y/2) * 1.1);

	//webView.insets = UniWebViewEdgeInsets(((bounds2.size.y - bounds1.size.y)/2 + bounds3.size.y) * 1.1, (bounds2.size.x - bounds1.size.x) * 1.1/2 , ((bounds2.size.y - bounds1.size.y)/2 + bounds4.size.y/2) * 1.1, (bounds2.size.x - bounds1.size.x) * 1.1/2);
	webViewObj.GetComponent(UniWebView).insets = UniWebViewEdgeInsets(top, left, bottom, left);
	//webView.insets = UniWebViewEdgeInsets(bounds2.size.y - bounds1.size.y + bounds3.size.y * 1.7, bounds2.size.x - bounds1.size.x, bounds2.size.y - bounds1.size.y + bounds4.size.y, bounds2.size.x - bounds1.size.x);
	//webViewObj.GetComponent(UniWebView).autoShowWhenLoadComplete = true;

	webViewObj.GetComponent(UniWebView).Load();


}

function OnLoadComplete(webView: UniWebView, success: boolean, errorMessage: String) {
    if (success) {
    	/*
    	if (GameObject.Find("UI Root").GetComponent(enginepoker).totalNoticeNum > 0)
    		GameObject.Find("UI Root").GetComponent(enginepoker).showWebView();
    	else
    		showUniWebView(); */

    	webViewObj.GetComponent(UniWebView).Show(false, UniWebViewTransitionEdge.None, 0.4f, null);
        
    } else {
        Debug.Log("Something wrong in webview loading: " + errorMessage);
    }
}

/*
function showUniWebView() {
	webViewObj.GetComponent(UniWebView).Show(false, UniWebViewTransitionEdge.None, 0.4f, null);
}

*/