// fireball script

// Inspector variables
var fireballSpeed 	: float = -6.0;
var explosion		: Transform;
// Private variables
private var particleTransform	: Transform;
// Game Loop

function Update ()
{
	transform.Translate ( Vector3(0, 0,  fireballSpeed * Time.deltaTime ));

}


function OnTriggerEnter (other : Collider)
{
	Destroy (gameObject);
    particleTransform = Instantiate(explosion, transform.position,  Quaternion.identity);
    Destroy (particleTransform.gameObject, 1.2);
}	
