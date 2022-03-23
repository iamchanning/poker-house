using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace Facebook.Unity.EP {

	public class engineFB : MonoBehaviour {

		public bool IsLoggedIn = false;
		protected string status = "Ready";
		protected string lastResponse = "";
		protected Texture2D lastResponseTexture;


		#region FB.AppRequest() Friend Selector
		
		public string FriendSelectorTitle = "";
		public string FriendSelectorMessage = "Engine Poker";
		//public string FriendSelectorFilters = "[\"app_users\"]";
		public string FriendSelectorFilters = "";
		public string FriendSelectorData = "{}";
		public string FriendSelectorExcludeIds = "";
		public string FriendSelectorMax = "";

		public static Action OnLoggedIn = delegate {};
		public static Action<string, string, string> OnGetUser = delegate {};

		public void CallAppRequestAsFriendSelector()
		{
			// If there's a Max Recipients specified, include it
			int? maxRecipients = null;
			if (FriendSelectorMax != "")
			{
				try
				{
					maxRecipients = Int32.Parse(FriendSelectorMax);
				}
				catch (Exception e)
				{
					status = e.Message;
				}
			}
			
			// include the exclude ids
			string[] excludeIds = (FriendSelectorExcludeIds == "") ? null : FriendSelectorExcludeIds.Split(',');
			List<object> FriendSelectorFiltersArr = null;
			if (!String.IsNullOrEmpty(FriendSelectorFilters))
			{
				try
				{
					FriendSelectorFiltersArr = Facebook.MiniJSON.Json.Deserialize(FriendSelectorFilters) as List<object>;
				}
				catch
				{
					throw new Exception("JSON Parse error");
				}
			}


			FB.AppRequest(
				FriendSelectorMessage,
				null,
				FriendSelectorFiltersArr,
				excludeIds,
				maxRecipients,
				FriendSelectorData,
				FriendSelectorTitle,
				HandleResult
				);
				

		}
		#endregion

		void Awake () {
			
			// Initialize FB SDK              
			FB.Init(this.OnInitComplete, this.OnHideUnity); 
			
		}
		
		// Use this for initialization
		void Start () {
			
			//  
			
		}
		
		// Update is called once per frame
		void Update () {
			
		}
		
		public void init() {
			FB.Init (this.OnInitComplete, this.OnHideUnity); 
		}

		public void login() {
			//FB.Login("public_profile,email,user_friends,publish_actions", LoginCallback);
			FB.LogInWithReadPermissions(new List<string>() { "public_profile", "email", "user_friends" }, this.LoginCallback);
		}

		public void logout() {
			FB.LogOut();
		}

		public void getUser() {
			Debug.Log ("Get User");

			FB.API("me?fields=name,email", HttpMethod.GET, NameCallBack);
		}

	
		public void NameCallBack(IResult result)
		{

			Debug.Log ("Got User => " + result.RawResult);

			IDictionary dict = Facebook.MiniJSON.Json.Deserialize(result.RawResult) as IDictionary;
			string fbuserId = dict["id"].ToString();
			string fbname = dict["name"].ToString();
			string fbemail = dict["email"].ToString();

			PlayerPrefs.SetString("playerFBId", fbuserId);

			//PlayerPrefs.SetString("playerFBToken", FB.AccessToken);

			engineFB.OnGetUser (fbuserId, fbname, fbemail);

		}
	

		public void buyItem(string PayProduct) {


	

			FB.Canvas.Pay (PayProduct,"purchaseitem", 1,1,1,PlayerPrefs.GetString("playerName"),null,null,OnPayComplete);
			//FB.Canvas.Pay (PayProduct);

		}


		private void OnPayComplete(IResult result)
		{
			lastResponseTexture = null;
			// Some platforms return the empty string instead of null.
			if (!String.IsNullOrEmpty (result.Error))
			{
				lastResponse = "Error Response:\n" + result.Error;
			}
			else if (!String.IsNullOrEmpty (result.RawResult))
			{
				lastResponse = "Success Response:\n" + result.RawResult;
			}
			else
			{
				lastResponse = "Empty Response\n";
			}

			#if UNITY_STANDALONE
			Application.ExternalEval("window.open('https://enginepoker.com/thankyou.php'),'Engine Poker')");
			#endif
		}


	
		#region FB.Init() example
		
		private void CallFBInit()
		{
			FB.Init(this.OnInitComplete, this.OnHideUnity);
		}
		
		private void OnInitComplete()
		{
			IsLoggedIn = FB.IsLoggedIn;

			Debug.Log("FB.Init completed: Is user logged in? " + FB.IsLoggedIn);
		}
		
		private void OnHideUnity(bool isGameShown)
		{
			Debug.Log("Is game showing? " + isGameShown);
		}
		
		#endregion
		
		#region FB.Login() example
		
		private void CallFBLogin()
		{
			FB.LogInWithReadPermissions(new List<string>() { "public_profile", "email", "user_friends" }, this.LoginCallback);
		}


		void LoginCallback(IResult result)
		{
			if (result.Error != null) {
				IsLoggedIn = false;
				lastResponse = "Error Response:\n" + result.Error;
			} 
			else if (!FB.IsLoggedIn)
			{
				lastResponse = "Login cancelled by Player";
				IsLoggedIn = false;
			}
			else
			{
				IsLoggedIn = true;
				lastResponse = "Login was successful!";

				getUser();
			}

			Debug.Log (lastResponse);
			//Debug.Log (FB.UserId);

			engineFB.OnLoggedIn ();

			Debug.Log (result.RawResult);
		}


		private void CallFBLogout()
		{
			FB.LogOut();
		}
		#endregion

		public void PushEventOnGetUser(string fbId, string fbUsername, string fbEmail) {
			var eventJSON = new JSONObject();
			eventJSON.AddField("fbId", fbId);
			eventJSON.AddField("fbUsername", fbUsername);
			eventJSON.AddField("fbEmail", fbEmail);

			_pushEventGetUser(eventJSON.print());
		}

		public void PushEventOnLoggedIn() {
			var eventJSON = new JSONObject();
	

			_pushEventLoggedIn(eventJSON.print());
		}

		protected virtual void _pushEventGetUser(string message) {}
		protected virtual void _pushEventLoggedIn(string message) {}

	

		protected void HandleResult(IResult result)
		{
			if (result == null)
			{
				Debug.Log("Facebook NULL");
				return;
			}
			
			
			// Some platforms return the empty string instead of null.
			if (!string.IsNullOrEmpty(result.Error))
			{
				
				Debug.Log(result.Error);
			}
			else if (result.Cancelled)
			{
				
				Debug.Log(result.RawResult);
			}
			else if (!string.IsNullOrEmpty(result.RawResult))
			{
				//Success
				
				Debug.Log(result.RawResult);
			}
			else
			{
				
				Debug.Log("Facebook Empty");
			}
		}

	}


}
