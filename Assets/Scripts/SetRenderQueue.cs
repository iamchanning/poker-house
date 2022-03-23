using UnityEngine;

public class SetRenderQueue : MonoBehaviour
{
	public string sortingLayer;
	public int sortOrder;
	//public GameObject spawnObject;

	void Start ()
	{
		//particleSystem

		GetComponent<Renderer>().sortingLayerName = sortingLayer;
	
		GetComponent<Renderer>().sortingOrder = sortOrder;

/*
		GameObject clone;
		clone = Instantiate(spawnObject.transform, 
		                    transform.position, 
		                    transform.rotation) as GameObject;

		NGUITools.AddChild(GameObject.Find("UI Root"), clone);
*/

	}

}