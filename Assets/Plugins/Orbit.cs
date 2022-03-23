using UnityEngine;

public class Orbit : MonoBehaviour
{
	int waitTimer;
	Vector3 originalRotationValue;

	/* the object to orbit */
	public Transform target;
	
	/* speed of orbit (in degrees/second) */
	public float speed;
	public int secondsPast;
	public bool run;

	int counter;
	float i = 0;
	bool passedGo = false;

	void Start () {
		originalRotationValue = transform.localPosition; // save the initial rotation


	}

	void Update()
	{

		if (target != null && run != false) {
			i = Time.deltaTime * speed;

			transform.RotateAround (target.position, Vector3.back, i );
			secondsPast += 1;
			//Debug.Log (secondsPast);

		} 

		if (V3Equal (transform.localPosition, originalRotationValue) && passedGo) {
			resetNow();
		}
	
	}

	public void Run() {


		transform.localPosition = originalRotationValue;
		//transform.RotateAround (target.position, Vector3.back, 4 );

		run = true;
		passedGo = false;
		secondsPast = 0;
	}

	public void resetNow() {
		run = false;
		passedGo = false;
		transform.localPosition = originalRotationValue;
	}

	public bool V3Equal(Vector3 a, Vector3 b){
		var diff = Vector3.SqrMagnitude (a - b);

		if (diff > 10000 && secondsPast > 50)
						passedGo = true;

		return diff < 10;
	}
}