#pragma strict

var portraitColumnLimit : int;
var landscapeColumnLimit : int;
var landscapeItemWidth : int;
var landscapeItemHeight : int;
var padding : int = 20;

var grid : GameObject;
var gridBG : GameObject;
var scrollView : GameObject;

var cols : int;


function Start () {

	//gridBG.onChange += updateGrid
}

function Update () {
/*
	var cols : int;
	var itemWidth : int;
	var itemHeight : int;

	if(Screen.orientation == ScreenOrientation.LandscapeLeft || Screen.orientation == ScreenOrientation.LandscapeRight) {
		cols = landscapeColumnLimit;
	} else {
		cols = portraitColumnLimit;

		#if UNITY_EDITOR
		if(!GameObject.Find("UI Root (3D)").GetComponent(enginepoker).forcePortrait) {
			cols = landscapeColumnLimit;
		}
		#endif

	}

	// Scale item to width of column
	itemWidth = gridBG.GetComponent(UISprite).width / cols - (2 * padding);
	itemHeight = scaleHeight(itemWidth, landscapeItemWidth,landscapeItemHeight);
 
	grid.GetComponent(UIGrid).maxPerLine = cols;



	var newCellWidth : float = (gridBG.GetComponent(UISprite).width / cols) - padding;

	if(newCellWidth != grid.GetComponent(UIGrid).cellWidth) {
		grid.GetComponent(UIGrid).cellHeight = itemHeight + padding;
		grid.GetComponent(UIGrid).cellWidth = newCellWidth;

		for(var child : Transform in grid.GetComponent(UIGrid).GetChildList() ) {
                var childWidget : UIWidget = child.GetComponent(UIWidget);

                childWidget.SetRect( 0, 0, itemWidth, itemHeight);
        }

		grid.GetComponent(UIGrid).Reposition();
		scrollView.GetComponent(UIScrollView).ResetPosition();
	} */
}

function scaleHeight(newW: float, currW : float, currH : float){

	var ratio = currH / currW;

	currH = newW * ratio;

	return currH;
}