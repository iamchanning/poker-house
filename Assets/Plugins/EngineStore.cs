using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace Soomla.Store.Engine {
	
	/// <summary>
	/// This class defines our game's economy, which includes virtual goods, virtual currencies
	/// and currency packs, virtual categories
	/// </summary>
	public class EngineStore : IStoreAssets{
		
		/// <summary>
		/// see parent.
		/// </summary>
		public int GetVersion() {
			return 0;
		}
		
		/// <summary>
		/// see parent.
		/// </summary>
		public VirtualCurrency[] GetCurrencies() {
			return new VirtualCurrency[]{ENGINE_CURRENCY};
		}
		
		/// <summary>
		/// see parent.
		/// </summary>
		public VirtualGood[] GetGoods() {
			return new VirtualGood[] {GLD1, GLD2,GLD3, GLD4, GLD5, GLD6, GLD7, GLD8};
		}
		
		/// <summary>
		/// see parent.
		/// </summary>
		public VirtualCurrencyPack[] GetCurrencyPacks() {
			return new VirtualCurrencyPack[] {PH1, PH2, PH3, PH4, PH5, PH6};
		}
		
		/// <summary>
		/// see parent.
		/// </summary>
		public VirtualCategory[] GetCategories() {
			return new VirtualCategory[]{GENERAL_CATEGORY};
		}
		
		/** Static Final Members **/
		
		public const string ENGINE_CURRENCY_ITEM_ID     = "currency_engine";

		public const string ENGINE_CATEGORY_ITEM_ID   	= "category_engine";
		
		public const string PH1_PRODUCT_ID    			= "ph1";
		
		public const string PH2_PRODUCT_ID   			= "ph2";
		
		public const string PH3_PRODUCT_ID   			= "ph3";

		public const string PH4_PRODUCT_ID   			= "ph4";

		public const string PH5_PRODUCT_ID   			= "ph5";

		public const string PH6_PRODUCT_ID   			= "ph6";

		public const string GLD1_PRODUCT_ID   			= "gld1";

		public const string GLD2_PRODUCT_ID   			= "gld2";

		public const string GLD3_PRODUCT_ID   			= "gld3";

		public const string GLD4_PRODUCT_ID   			= "gld4";

		public const string GLD5_PRODUCT_ID   			= "gld5";

		public const string GLD6_PRODUCT_ID   			= "gld6";

		public const string GLD7_PRODUCT_ID   			= "gld7";

		public const string GLD8_PRODUCT_ID   			= "gld8";

		public const string NO_ADS_LIFETIME_PRODUCT_ID 	= "no_ads";

		/** Virtual Currencies **/
		
		public static VirtualCurrency ENGINE_CURRENCY = new VirtualCurrency(
			"Engine",										// name
			"",												// description
			ENGINE_CURRENCY_ITEM_ID							// item id
			);
		
		
		/** Virtual Currency Packs **/
		/*
		public static VirtualCurrencyPack ENG1 = new VirtualCurrencyPack(
			"$100,000 chips",                                   // name
			"$100,000 chips",                       // description
			"eng1",                                   // item id
			100000,												// number of currencies in the pack
			ENGINE_CURRENCY_ITEM_ID,                        // the currency associated with this pack
			new PurchaseWithMarket(ENG1_PRODUCT_ID, 0.99)
			);
		
		public static VirtualCurrencyPack ENG2 = new VirtualCurrencyPack(
			"$500,000 chips",                                   // name
			"$500,000 chips",                 // description
			"eng2",                                   // item id
			500000,                                             // number of currencies in the pack
			ENGINE_CURRENCY_ITEM_ID,                        // the currency associated with this pack
			new PurchaseWithMarket(ENG2_PRODUCT_ID, 4.99)
			);

		public static VirtualCurrencyPack ENG3 = new VirtualCurrencyPack(
			"$1,000,000 chips",                                   // name
			"$1,000,000 chips",                 // description
			"eng3",                                   // item id
			1000000,                                             // number of currencies in the pack
			ENGINE_CURRENCY_ITEM_ID,                        // the currency associated with this pack
			new PurchaseWithMarket(ENG3_PRODUCT_ID, 9.99)
			);


		public static VirtualCurrencyPack ENG4 = new VirtualCurrencyPack(
			"$10,000,000 chips",                                   // name
			"$10,000,000 chips",                 // description
			"eng4",                                   // item id
			10000000,                                             // number of currencies in the pack
			ENGINE_CURRENCY_ITEM_ID,                        // the currency associated with this pack
			new PurchaseWithMarket(ENG4_PRODUCT_ID, 19.99)
			);


		public static VirtualCurrencyPack ENG5 = new VirtualCurrencyPack(
			"$20,000,000 chips",                                   // name
			"$20,000,000 chips",                 // description
			"eng5",                                   // item id
			20000000,                                             // number of currencies in the pack
			ENGINE_CURRENCY_ITEM_ID,                        // the currency associated with this pack
			new PurchaseWithMarket(ENG5_PRODUCT_ID, 39.99)
			);


		public static VirtualCurrencyPack ENG6 = new VirtualCurrencyPack(
			"$60,000,000 chips",                                   // name
			"$60,000,000 chips",                 // description
			"eng6",                                   // item id
			60000000,                                             // number of currencies in the pack
			ENGINE_CURRENCY_ITEM_ID,                        // the currency associated with this pack
			new PurchaseWithMarket(ENG6_PRODUCT_ID, 99.99)
			);
		*/
		public static VirtualCurrencyPack PH1 = new VirtualCurrencyPack(
			"60 diamonds",                                   // name
			"60 diamonds",                       // description
			"ph1",                                   // item id
			60,												// number of currencies in the pack
			ENGINE_CURRENCY_ITEM_ID,                        // the currency associated with this pack
			new PurchaseWithMarket(PH1_PRODUCT_ID, 0.99)
		);

		public static VirtualCurrencyPack PH2 = new VirtualCurrencyPack(
			"300 diamonds",                                   // name
			"300 diamonds",                 // description
			"ph2",                                   // item id
			300,                                             // number of currencies in the pack
			ENGINE_CURRENCY_ITEM_ID,                        // the currency associated with this pack
			new PurchaseWithMarket(PH2_PRODUCT_ID, 4.99)
		);

		public static VirtualCurrencyPack PH3 = new VirtualCurrencyPack(
			"880 diamonds",                                   // name
			"880 diamonds",                 // description
			"ph3",                                   // item id
			880,                                             // number of currencies in the pack
			ENGINE_CURRENCY_ITEM_ID,                        // the currency associated with this pack
			new PurchaseWithMarket(PH3_PRODUCT_ID, 12.99)
		);


		public static VirtualCurrencyPack PH4 = new VirtualCurrencyPack(
			"1280 diamonds",                                   // name
			"1280 diamonds",                 // description
			"ph4",                                   // item id
			1280,                                             // number of currencies in the pack
			ENGINE_CURRENCY_ITEM_ID,                        // the currency associated with this pack
			new PurchaseWithMarket(PH4_PRODUCT_ID, 19.99)
		);


		public static VirtualCurrencyPack PH5 = new VirtualCurrencyPack(
			"2980 diamonds",                                   // name
			"2980 diamonds",                 // description
			"ph5",                                   // item id
			2980,                                             // number of currencies in the pack
			ENGINE_CURRENCY_ITEM_ID,                        // the currency associated with this pack
			new PurchaseWithMarket(PH5_PRODUCT_ID, 46.99)
		);


		public static VirtualCurrencyPack PH6 = new VirtualCurrencyPack(
			"6480 diamonds",                                   // name
			"6480 diamonds",                 // description
			"ph6",                                   // item id
			6480,                                             // number of currencies in the pack
			ENGINE_CURRENCY_ITEM_ID,                        // the currency associated with this pack
			new PurchaseWithMarket(PH6_PRODUCT_ID, 99.99)
		);

		/** Virtual Goods **/

		public static VirtualGood GLD1 = new SingleUseVG(
			"300 chips",                                       		// name
			"300 chips", // description
			"gld1",                                       		// item id
			new PurchaseWithVirtualItem(ENGINE_CURRENCY_ITEM_ID, 60)); // the way this virtual good is purchased
		

		public static VirtualGood GLD2 = new SingleUseVG(
			"600 chips",                                       		// name
			"600 chips", // description
			"gld2",                                       		// item id
			new PurchaseWithVirtualItem(ENGINE_CURRENCY_ITEM_ID, 120)); // the way this virtual good is purchased


		public static VirtualGood GLD3 = new SingleUseVG(
			"1500 chips",                                       		// name
			"1500 chips", // description
			"gld3",                                       		// item id
			new PurchaseWithVirtualItem(ENGINE_CURRENCY_ITEM_ID, 300)); // the way this virtual good is purchased


		public static VirtualGood GLD4 = new SingleUseVG(
			"2500 chips",                                       		// name
			"2500 chips", // description
			"gld4",                                       		// item id
			new PurchaseWithVirtualItem(ENGINE_CURRENCY_ITEM_ID, 500)); // the way this virtual good is purchased


		public static VirtualGood GLD5 = new SingleUseVG(
			"6400 chips",                                       		// name
			"6400 chips", // description
			"gld5",                                       		// item id
			new PurchaseWithVirtualItem(ENGINE_CURRENCY_ITEM_ID, 1280)); // the way this virtual good is purchased


		public static VirtualGood GLD6 = new SingleUseVG(
			"14900 chips",                                       		// name
			"14900 chips", // description
			"gld6",                                       		// item id
			new PurchaseWithVirtualItem(ENGINE_CURRENCY_ITEM_ID, 2480)); // the way this virtual good is purchased

		public static VirtualGood GLD7 = new SingleUseVG(
			"24400 chips",                                       		// name
			"24400 chips", // description
			"gld7",                                       		// item id
			new PurchaseWithVirtualItem(ENGINE_CURRENCY_ITEM_ID, 4880)); // the way this virtual good is purchased

		public static VirtualGood GLD8 = new SingleUseVG(
			"32400 chips",                                       		// name
			"32400 chips", // description
			"gld8",                                       		// item id
			new PurchaseWithVirtualItem(ENGINE_CURRENCY_ITEM_ID, 6480)); // the way this virtual good is purchased
		

		
		/** Virtual Categories **/
		// The muffin rush theme doesn't support categories, so we just put everything under a general category.
		public static VirtualCategory GENERAL_CATEGORY = new VirtualCategory(
			"General", new List<string>(new string[] { ENGINE_CATEGORY_ITEM_ID })
			);
		
		
		/** LifeTimeVGs **/
		// Note: create non-consumable items using LifeTimeVG with PuchaseType of PurchaseWithMarket
		public static VirtualGood NO_ADS_LTVG = new LifetimeVG(
			"No Ads", 														// name
			"No More Ads!",				 									// description
			"no_ads",														// item id
			new PurchaseWithMarket(NO_ADS_LIFETIME_PRODUCT_ID, 0.99));	// the way this virtual good is purchased
	}
	
}