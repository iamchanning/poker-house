using UnityEngine;
using System.Collections;
using Soomla;


namespace Soomla.Store.Engine {


	public class InitStore : MonoBehaviour {


		// Use this for initialization
		public void Start () {
		
			SoomlaStore.Initialize(new EngineStore());

		}
		
		// Update is called once per frame
		void Update () {
		
		}

		public void BuyItem(string item) {

			StoreInventory.BuyItem(item);

		
		}

		public string GetPrice(string item)	{
			Soomla.Store.PurchasableVirtualItem pvi = Soomla.Store.StoreInfo.GetPurchasableItemWithProductId(item);
			Soomla.Store.MarketItem mi = ((Soomla.Store.PurchaseWithMarket)pvi.PurchaseType).MarketItem;
			

			return mi.MarketPriceAndCurrency;
		}

	}






}