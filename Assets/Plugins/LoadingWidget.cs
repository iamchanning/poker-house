
using UnityEngine;
using System.Collections;
	
public class LoadingWidget : MonoBehaviour {
	
	public bool Forward;
	public int Speed;

	Vector3 Direction;

	// Use this for initialization
	void Start () {
		
		if(Forward) {
			Direction = Vector3.back;
		} else {
			Direction = Vector3.forward;
		}

	}
	
	void Update()
	{
		

		transform.Rotate(Direction * (Speed * Time.deltaTime));
		GetComponent<UISprite>().MarkAsChanged();
		
	}
	
	IEnumerator RadialProgress(float time)
	{
		
		float rate = 1 / time;
		float i = 0;
		UISprite sprite = GetComponent<UISprite>();
		
		while (i < 1)
		{
			if(i <= 1) {
				i += Time.deltaTime * rate;
				
				
				sprite.fillAmount = i;
			}
			
			if(i >= 0.995)  {
				i = 0;
				sprite.fillAmount = i;
			}

			yield return 0;
		}
		
		
		//sprite.fillAmount = 0.0f;
	}
}