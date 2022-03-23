#pragma strict

import System.Collections.Generic;

class queueItem {
	var username: String;
	var timeTag: int; 
	var pos: int;
}

var voiceQueue = new Queue.<queueItem>();

var processFlag: boolean = false;

var aud: AudioSource;

//var count: int = 0;


var curNo: int = 0;

function Start () {
	aud = GameObject.Find("UI Root/pnlPokerTable").GetComponent(AudioSource);
}

function addVoices(name, time, pos) {

	var voice = queueItem();
	voice.username = name;
	voice.timeTag = time;
	voice.pos = pos;

	Debug.Log(voice.username + " " + voice.timeTag + " " + voice.pos);
	
	voiceQueue.Enqueue(voice);
	//count = voiceQueue.Count;

	if (!processFlag)
		playVoice();
}

function playVoice() {

	processFlag = true;

	while (voiceQueue.Count > 0) {


		var voice = voiceQueue.Dequeue();

		//count = voiceQueue.Count;

		if (voice.username == PlayerPrefs.GetString ("playerName") || PlayerPrefs.GetInt("TableVoice") == 1 || GameObject.Find("UI Root/pnlPokerTable").GetComponent(pokerTable).playerPanel[voice.pos - 1].transform.Find("btnMute").GetComponent(UISprite).spriteName == "notice_off") {
			if (voiceQueue.Count == 0)
				processFlag = false;
			continue;
		} 

		var form : WWWForm = new WWWForm();

	    form.AddField("uid", PlayerPrefs.GetString ("uid").ToString());
	    form.AddField("key", PlayerPrefs.GetString ("key").ToString());
	    form.AddField("username", PlayerPrefs.GetString ("playerName"));
	    form.AddField("gameID", PlayerPrefs.GetString("gameID").ToString());
	    form.AddField("gameNo", PlayerPrefs.GetString("gameNo").ToString());
	    form.AddField("player", voice.username);
	    form.AddField("timeTag", voice.timeTag.ToString());
	    form.AddField("pos", voice.pos.ToString());

	    var www = new WWW(PlayerPrefs.GetString("server") + "voices_download.php", form);
	    yield www;

	  
		if (www.error == null && www.text != "") {
		    // request completed!
		    Debug.Log("request completed");

		    //Debug.Log(www.text);

		    var data: byte[] = System.Convert.FromBase64String(www.text);

		   	var filename = "play" + curNo + ".wav";
		   	//var filename = "play.wav";
		   	curNo++;

			var filepath = System.IO.Path.Combine(Application.persistentDataPath, filename);


		   	System.IO.File.WriteAllBytes(filepath, data);

		   	//yield WaitForSeconds(0.2);

		   	GameObject.Find("UI Root/pnlPokerTable").GetComponent(pokerTable).playerPanel[voice.pos - 1].transform.Find("talking").GetComponent(UISprite).alpha = 1;

		   	//var aud: AudioSource = GameObject.Find("UI Root/pnlPokerTable").GetComponent(AudioSource);
		   	aud.clip = WavUtility.ToAudioClip(filepath);
			aud.Play();


			yield WaitForSeconds(aud.clip.length);

			GameObject.Find("UI Root/pnlPokerTable").GetComponent(pokerTable).playerPanel[voice.pos - 1].transform.Find("talking").GetComponent(UISprite).alpha = 0;

			System.IO.File.Delete(filepath);

			if (voiceQueue.Count == 0)
				processFlag = false;


		} else {
		    // something wrong!
		    Debug.Log("WWW Error: "+ www.error);
		}


	}
	//curNo = 0;
}

function showQueue() {

	if (voiceQueue.Count > 0) {
		var arr = voiceQueue.ToArray();
		var string = "";
		for (var i: int = 0; i < arr.Length; i++) 
			string += (arr[i].username + " ");
			
		GameObject.Find("UI Root/pnlPokerTable/pnlDebug/lblDebug").GetComponent(UILabel).text = string;

	} else {
		GameObject.Find("UI Root/pnlPokerTable/pnlDebug/lblDebug").GetComponent(UILabel).text = "";
	}
}



