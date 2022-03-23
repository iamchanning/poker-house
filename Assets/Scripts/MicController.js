#pragma strict
//@script RequireComponent (AudioSource);

//import System.IO;

//var pressTime: float = 0f;
var aud: AudioSource;

var mTimer:float = 0;

var curNo: int;
var lastGameId: int = 0;

//var samples: float[]; 

function Start () {
	
	if(!aud){
 		aud = GameObject.Find("UI Root/pnlPokerTable/pnlTable/microphone").GetComponent(AudioSource);
	} 

	GameObject.Find("UI Root/pnlPokerTable/pnlTable/microphone/part1").GetComponent(UISprite).alpha = 0;
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/microphone/part2").GetComponent(UISprite).alpha = 0;
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/microphone/part3").GetComponent(UISprite).alpha = 0;
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/microphone/part4").GetComponent(UISprite).alpha = 0;

	//aud = GameObject.Find("UI Root/pnlPokerTable").GetComponent(pokerTable).aSources[0];

	StopMicrophone();



}

function Update() {

	var num = Random.Range(0,5);
	if(Microphone.IsRecording(Microphone.devices[0])){
		mTimer += Time.deltaTime;
		if (mTimer >= 10) {
			//saveSound();

			saveAndSend();
			StopMicrophone();
			mTimer = 0;
		} else {
			//Debug.Log(GetDataStream() * 10);
			for (var i: int = 1; i < (num + 1); i++) {
				GameObject.Find("UI Root/pnlPokerTable/pnlTable/microphone/part" + i).GetComponent(UISprite).alpha = 1;
			}

			for (var j: int = (num + 1); j < 5; j++) {
				GameObject.Find("UI Root/pnlPokerTable/pnlTable/microphone/part" + j).GetComponent(UISprite).alpha = 0;
			}
		}
	}


}


function onPress() {	
	Debug.Log("onPress");

	if (PlayerPrefs.GetInt("TableVoice") != 1) {
		StartMicrophone();
	} else {
		GameObject.Find("UI Root").GetComponent(enginepoker).showNotify("Please switch on table voice!");
	}

}

function onRelease() {
	Debug.Log("onRelease");

	if(Microphone.IsRecording(Microphone.devices[0])){
		//saveSound();
		saveAndSend();
		StopMicrophone();
	}
}

/*
function GetDataStream() {
	//if(Microphone.IsRecording(Microphone.devices[0])){
		var dataStream: float[]  = new float[256];
        var audioValue: float = 0;
        aud.GetOutputData(dataStream,0);
 
        for(var i in dataStream){
            audioValue += Mathf.Abs(i);
        }
        return audioValue/256;
	//}
}
*/

function StartMicrophone () {
	

    aud.clip = Microphone.Start(Microphone.devices[0], false, 10, 44100);//Starts recording

    mTimer = 0;

    while (!(Microphone.GetPosition(Microphone.devices[0]) > 0)){} // Wait until the recording has started



	

     //
    //aud.Play(); // Play the audio source!

}

function StopMicrophone () {
    aud.Stop();//Stops the audio

     /*
		samples = new float[aud.clip.samples * aud.clip.channels];
		aud.clip.GetData(samples, 0);
		for (var i = 0; i < samples.Length; ++i) {
			
				
			samples[i] = samples[i] * 0.5f;
			if (i < 10) {
				Debug.Log(samples[i]);
			}
		}
		aud.clip.SetData(samples, 0);
	
	*/
    Microphone.End(Microphone.devices[0]);//Stops the recording of the device  

    mTimer = 0;

    GameObject.Find("UI Root/pnlPokerTable/pnlTable/microphone/part1").GetComponent(UISprite).alpha = 0;
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/microphone/part2").GetComponent(UISprite).alpha = 0;
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/microphone/part3").GetComponent(UISprite).alpha = 0;
	GameObject.Find("UI Root/pnlPokerTable/pnlTable/microphone/part4").GetComponent(UISprite).alpha = 0;
}

/*
function saveSound(){
	
	//if (lastGameId == 0 || lastGameId != parseInt(PlayerPrefs.GetString("gameID"))) {
	//	curNo = 0;
	//	lastGameId = parseInt(PlayerPrefs.GetString("gameID"));
	//} else {
	//	curNo++;
	//}


	//var filename = PlayerPrefs.GetString("playerName") + "_" + PlayerPrefs.GetString("gameID") + "_" + curNo + ".wav";
	var filename = "temp.wav";

	var filepath = System.IO.Path.Combine(Application.persistentDataPath, filename);

	Debug.Log(filepath);

	SavWav.Save(filepath, SavWav.TrimSilence(aud.clip, 0));

	yield WaitForSeconds(0.5);

	//StartCoroutine(uploadSoundFile(filepath));
	uploadSoundFile(filepath, filename);
}

function uploadSoundFile(filepath: String, filename: String) {

	var data : byte[] = System.IO.File.ReadAllBytes(filepath);

 
    var form : WWWForm = new WWWForm();
    form.AddField("uid", PlayerPrefs.GetString ("uid").ToString());
    form.AddField("key", PlayerPrefs.GetString ("key").ToString());
    form.AddField("username", PlayerPrefs.GetString ("playerName"));
    form.AddField("gameID", PlayerPrefs.GetString("gameID"));
    form.AddField("gameNo", PlayerPrefs.GetString("gameNo"));
    //form.AddField("frameCount", Time.get_frameCount().ToString());

    form.AddBinaryData("file", data, filename, "audio/wav");

 
    var www = new WWW("https://ep-dev-php.appspot.com/api2.5/voices_upload.php", form);
    yield www;
 	
    if (!String.IsNullOrEmpty(www.error)){
        Debug.Log("UPLOAD ERROR: [" + www.error + "]");
    } else {
        Debug.Log("UPLOAD SUCCESSFUL, response: [" + www.text + "]");
    } 

    System.IO.File.Delete(filepath);

}
*/

function saveAndSend() {

	var filename = "temp.wav";

	var filepath = System.IO.Path.Combine(Application.persistentDataPath, filename);

	Debug.Log(filepath);

	var data : byte[] = WavUtility.FromAudioClip (WavUtility.TrimSilence(aud.clip, 0), filepath, true);

	var form : WWWForm = new WWWForm();
    form.AddField("uid", PlayerPrefs.GetString ("uid").ToString());
    form.AddField("key", PlayerPrefs.GetString ("key").ToString());
    form.AddField("username", PlayerPrefs.GetString ("playerName"));
    form.AddField("gameID", PlayerPrefs.GetString("gameID"));
    form.AddField("gameNo", PlayerPrefs.GetString("gameNo"));
    form.AddField("pos", GameObject.Find("UI Root/pnlPokerTable").GetComponent(pokerTable).myPos);
    //form.AddField("frameCount", Time.get_frameCount().ToString());

    form.AddBinaryData("file", data, filename, "audio/wav");

 
    var www = new WWW(PlayerPrefs.GetString("server") + "voices_upload.php", form);
    yield www;
 	
    if (!String.IsNullOrEmpty(www.error)){
        Debug.Log("UPLOAD ERROR: [" + www.error + "]");
    } else {
        Debug.Log("UPLOAD SUCCESSFUL, response: [" + www.text + "]");
    } 

    System.IO.File.Delete(filepath);	
}

