using UnityEngine;
using System.Collections;

public class CircularProgress : MonoBehaviour {
	
	public int timeToComplete = 3;
	public bool run;
	public bool stop;
	bool isRunning;
	// Use this for initialization
	void Start () {
		isRunning = false;
		stop = false;
	
		//Use this to Start progress
		//StartCoroutine(RadialProgress(timeToComplete));
	}

	void Update()
	{

		if (run && !isRunning) { 
			isRunning = true;
			stop = false;

			/*
			UISprite sprite = GetComponent<UISprite>();
			sprite.fillAmount = 0.0f;
			*/

			StartCoroutine (RadialProgress (timeToComplete));

		} 

		
	}

	public void Run() {
		UISprite sprite = GetComponent<UISprite>();
		sprite.fillAmount = 0.0f;
		isRunning = false;
		run = true;
	}

	public void Stop() {
		stop = true;
		run = false;
	}


	IEnumerator RadialProgress(float time)
	{

		float rate = 1 / time;
		float i = 0;
		UISprite sprite = GetComponent<UISprite>();

		while (i < 1)
		{
			if(i <= 0.995) {
				i += Time.deltaTime * rate;
		

				/*
				if(i < 0.3) {
					sprite.color = Color.green;
				}
				if(i > 0.3) {
					sprite.color = Color.magenta;
				}
				if(i > 0.6) {
					sprite.color = Color.red;
				}
				*/

				sprite.fillAmount = i;
			}

			if(stop) {
				i = 1;
				run = false;
				//stop = false;
				isRunning = false;

			}

			yield return 0;
		}



		//sprite.fillAmount = 0.0f;
	}
}