#pragma strict

var chipsPanel: GameObject;
var diamondsPanel: GameObject;

var chipsBtn: GameObject;
var diamondsBtn: GameObject;
var confirmBtn: GameObject;
var profileBtn: GameObject;

private var csInitStore : Soomla.Store.Engine.InitStore;
private var csStoreEvents : Soomla.Store.StoreEvents;
private var csStoreInfo : Soomla.Store.StoreInfo;

var sceneFlag: int;

var buyingItem: String;
var usingDiamond: int;

var selectedItem: GameObject;

private var usr: JSONObject;

var avatarChanged: boolean = false;

function Start () {

	UIEventListener.Get(chipsBtn).onClick = chipsBtnClick;
	UIEventListener.Get(diamondsBtn).onClick = diamondsBtnClick;
	UIEventListener.Get(confirmBtn).onClick = confirmBtnClick;
	UIEventListener.Get(profileBtn).onClick = profileBtnClick;

	GameObject.Find("UI Root").GetComponent(enginepoker).socket.On("gotTrade", gotTrade);


	csStoreEvents = new Soomla.Store.StoreEvents();
   // csStoreEvents.OnMarketPurchase = onMarketPurchase;
   // csStoreEvents.OnMarketPurchaseCancelled = onMarketPurchaseCancelled;
    csStoreEvents.OnMarketItemsRefreshFinished = onMarketItemsRefreshFinished;

    csInitStore = new Soomla.Store.Engine.InitStore();
	csInitStore.Start();

	for(var i: int = 1; i < 9; i++) {
		UIEventListener.Get(chipsPanel.transform.Find("grid/btnBuyChips" + i).gameObject).onClick = buyChips;
		chipsPanel.transform.Find("grid/btnBuyChips" + i + "/selected").GetComponent(UISprite).alpha = 0;
		//chipsPanel.transform.Find("grid/btnBuyChips" + i + "/lblDiamonds").GetComponent(UILabel).text = csInitStore.GetPrice("gld" + i);
		//Debug.Log("gld" + i);

		if (i < 7) {
			UIEventListener.Get(diamondsPanel.transform.Find("grid/btnBuyDiamonds" + i).gameObject).onClick = buyDiamonds;
			diamondsPanel.transform.Find("grid/btnBuyDiamonds" + i + "/selected").GetComponent(UISprite).alpha = 0;
			//diamondsPanel.transform.Find("grid/btnBuyDiamonds" + i + "/lblCash").GetComponent(UILabel).text = csInitStore.GetPrice("eng" + i);
		}
	}

	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(diamondsPanel);
	GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(chipsPanel);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuDisabled = false;

	GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(PlayerPrefs.GetString("playerAvatar").ToString(), gameObject.transform.Find("header/playerProfile/imgPlayerAvatar").gameObject, false);
	RefreshInfo();

	usr = new JSONObject(JSONObject.Type.OBJECT);
	usr.AddField("uid",PlayerPrefs.GetString ("uid").ToString());
	usr.AddField("key",PlayerPrefs.GetString ("key").ToString());
	usr.AddField("username",PlayerPrefs.GetString("playerName").ToString());
	usr.AddField("data","");	
	usr.AddField("socketId", GameObject.Find("UI Root").GetComponent(enginepoker).socket.sid);

	sceneFlag = -1;
	chipsBtnClick();
}

function profileBtnClick() {
	GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(gameObject);
	GameObject.Find("UI Root").GetComponent(enginepoker).menuBtnClick(4);
}

function chipsBtnClick() {
	if (sceneFlag == 0) {
		return;
	} else {
		sceneFlag = 0;

		usingDiamond = 0;
		if (selectedItem) {
			selectedItem.transform.Find("selected").GetComponent(UISprite).alpha = 0;
			selectedItem = null;
		}

		GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(chipsPanel);
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(diamondsPanel);

		chipsBtn.GetComponent(UISprite).spriteName = chipsBtn.GetComponent(UISprite).spriteName.Replace("_off","_on");
		diamondsBtn.GetComponent(UISprite).spriteName = diamondsBtn.GetComponent(UISprite).spriteName.Replace("_on","_off");
		GameObject.Find("UI Root/pnlRoot/pnlShop/btnExchange/lblShopConfirmBtn").GetComponent(UILabel).text = "Exchange";

	}
}

function diamondsBtnClick() {
	if (sceneFlag == 1) {
		return;
	} else {
		sceneFlag = 1;

		if (selectedItem) {
			selectedItem.transform.Find("selected").GetComponent(UISprite).alpha = 0;
			selectedItem = null;
		}

		GameObject.Find("UI Root").GetComponent(enginepoker).enablePanel(diamondsPanel);
		GameObject.Find("UI Root").GetComponent(enginepoker).disablePanel(chipsPanel);

		chipsBtn.GetComponent(UISprite).spriteName = chipsBtn.GetComponent(UISprite).spriteName.Replace("_on","_off");
		diamondsBtn.GetComponent(UISprite).spriteName = diamondsBtn.GetComponent(UISprite).spriteName.Replace("_off","_on");
		GameObject.Find("UI Root/pnlRoot/pnlShop/btnExchange/lblShopConfirmBtn").GetComponent(UILabel).text = "Purchase";

	}
}

function confirmBtnClick() {
	if (sceneFlag == 0) {
		if (usingDiamond == 0)
			return;
		usr.SetField("data", "&action=buychips&diamondAmount=" + usingDiamond);
		usr.SetField("username",PlayerPrefs.GetString("playerName").ToString());
		GameObject.Find("UI Root").GetComponent(enginepoker).socket.Emit("get_trade", usr);	
	} else {
		#if UNITY_ANDROID || UNITY_IPHONE

			GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Contacting store..");

			csInitStore.BuyItem(buyingItem);
		#endif
		
		
		/*
		#if UNITY_WEBGL || UNITY_WEBPLAYER
			
			csEngineFB.buyItem(PlayerPrefs.GetString("panel") + "payments/facebook.php?key=" + PlayerPrefs.GetString("key") + "&itemNo=" + buyingItem);
			
		#endif
		*/
				
		#if UNITY_STANDALONE
			var url = PlayerPrefs.GetString("server") + "buychips.php?item=" + buyingItem + "&username=" + PlayerPrefs.GetString("playerName");

			Application.OpenURL (url);
		#endif
	}
}

function buyChips(item: GameObject) {
	if (selectedItem)
		selectedItem.transform.Find("selected").GetComponent(UISprite).alpha = 0;
	usingDiamond = item.GetComponent(gridRow).diamondAmount;
	item.transform.Find("selected").GetComponent(UISprite).alpha = 1;
	selectedItem = item;

}

function buyDiamonds(item: GameObject) {
	if (selectedItem)
		selectedItem.transform.Find("selected").GetComponent(UISprite).alpha = 0;

	buyingItem = item.GetComponent(gridRow).buyingItem;

	item.transform.Find("selected").GetComponent(UISprite).alpha = 1;
	selectedItem = item;
}
 
function gotTrade(e : SocketIO.SocketIOEvent) {
	Debug.Log("[SocketIO] gotTrade received: " + e.name + " " + e.data);

	var data = LitJson.JsonMapper.ToObject(e.data.ToString());
	try { 
		if(data["response"]["buyResult"].ToString() == "0") {
			
			GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Not enough diamond");
		} else {
			PlayerPrefs.SetString("playerGold", data["response"]["playerGold"].ToString());
			PlayerPrefs.SetString("playerBank", data["response"]["playerBank"].ToString());
			PlayerPrefs.SetString("playerBankAmount", data["response"]["playerBankAmount"].ToString());

			RefreshInfo();

			GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Purchase complete!");
		}
		
	} catch (err) {
		Debug.Log('Error in TRY');
	}
}

function RefreshInfo() {
	gameObject.Find("lblShopUsrName").GetComponent(UILabel).text = PlayerPrefs.GetString("playerName");
	if (avatarChanged) {
		GameObject.Find("UI Root").GetComponent(enginepoker).loadAvatar(PlayerPrefs.GetString("playerAvatar").ToString(), gameObject.transform.Find("header/playerProfile/imgPlayerAvatar").gameObject, false);
		avatarChanged = false;
	}
	GameObject.Find("UI Root/pnlRoot/pnlShop/header/pinRight/diamonds/lblShopDiamonds").GetComponent(UILabel).text = PlayerPrefs.GetString("playerGold");
	GameObject.Find("UI Root/pnlRoot/pnlShop/header/pinRight/chips/lblShopChips").GetComponent(UILabel).text = PlayerPrefs.GetString("playerBank");
}

function onMarketItemsRefreshFinished() {
	/*
	vBuyChips.transform.FindChild("Grid/btnBuyChips1/Label").GetComponent(UILabel).text = csInitStore.GetPrice("eng6");
	vBuyChips.transform.FindChild("Grid/btnBuyChips2/Label").GetComponent(UILabel).text = csInitStore.GetPrice("eng5");
	vBuyChips.transform.FindChild("Grid/btnBuyChips3/Label").GetComponent(UILabel).text = csInitStore.GetPrice("eng4");
	vBuyChips.transform.FindChild("Grid/btnBuyChips4/Label").GetComponent(UILabel).text = csInitStore.GetPrice("eng3");
	vBuyChips.transform.FindChild("Grid/btnBuyChips5/Label").GetComponent(UILabel).text = csInitStore.GetPrice("eng2");
	vBuyChips.transform.FindChild("Grid/btnBuyChips6/Label").GetComponent(UILabel).text = csInitStore.GetPrice("eng1");
	*/

}

function onMarketPurchaseCancelled (pvi : Soomla.Store.PurchasableVirtualItem) {

	GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Purchase cancelled!");

}


function onMarketPurchase(pvi : Soomla.Store.PurchasableVirtualItem, payload : String, extra : Object) {

	Debug.Log("Store Purchase Complete");
	Debug.Log(payload);
	Debug.Log("Store Purchase End Debug");
	Debug.Log(pvi.ItemId);
	Debug.Log("Store Purchase End PVI");
	//extra is android
	//its all here https://github.com/soomla/unity3d-store
	//Debug.Log(extra);

	ValidatePurchase(pvi.ItemId, "receipt");
	
}

function ValidatePurchase(itemId : String, receipt : String) {

	GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Purchase complete!");
		
	Debug.Log("Validating Purchase");

	
	var url = PlayerPrefs.GetString("server") + "purchase.php?itemNo=" + itemId + "&receipt=" + receipt + "&uid=" + PlayerPrefs.GetString("uid") + "&dealerKey=" + PlayerPrefs.GetString("key");
	
	Debug.Log('API => ' + url);
	
	
	var www : WWW = new WWW ( url );
	
	// wait for request to complete
	yield www;
	 
	// and check for errors
	if (www.error == null)
	{
	    // request completed!
	    OnPurchaseComplete(www.text);
	} else {
	    // something wrong!
	    Debug.Log("WWW Error: "+ www.error);

	}


	
}

function OnPurchaseComplete(response) {
	
	
	if(response == "no") {
	
	} else {
		var data = LitJson.JsonMapper.ToObject(response.ToString());
		
		PlayerPrefs.SetString("playerBank", data["response"]["playerBank"].ToString());
		PlayerPrefs.SetString("playerBankAmount", data["response"]["playerBankAmount"].ToString());


	}
	
			
	TweenAlpha.Begin(GameObject.Find("pnlNotify"),0.3,0);
	
	Debug.Log(response);
	
}
