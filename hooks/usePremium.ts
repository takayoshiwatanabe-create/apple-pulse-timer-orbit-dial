import { useEffect, useState, useCallback, useRef } from "react";
import { Alert, Platform } from "react-native";
import { useSettingsStore } from "@/stores/settingsStore";

const PRODUCT_ID = "com.zerocode.applepulsetimerorbitdial.premium";

type IAPModule = typeof import("react-native-iap");
let iapModule: IAPModule | null = null;

async function loadIAP(): Promise<IAPModule | null> {
  if (iapModule) return iapModule;
  try {
    iapModule = await (import("react-native-iap") as Promise<IAPModule>);
    return iapModule;
  } catch {
    return null;
  }
}

export function usePremium() {
  const premiumActive = useSettingsStore((s) => s.premiumActive);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const [isIAPReady, setIsIAPReady] = useState(false);
  const [price, setPrice] = useState<string>("¥300");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const listenerRef = useRef<{ remove: () => void } | null>(null);

  const setPremium = useCallback(async () => {
    await updateSettings({ premiumActive: true });
  }, [updateSettings]);

  useEffect(() => {
    initIAP();
    return () => {
      listenerRef.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initIAP = async () => {
    try {
      const mod = await loadIAP();
      if (!mod) return;

      await mod.initConnection();

      // Set up purchase listener
      if (!listenerRef.current) {
        listenerRef.current = mod.purchaseUpdatedListener(async (purchase) => {
          try {
            if (purchase.productId === PRODUCT_ID) {
              await mod.finishTransaction({ purchase });
              await setPremium();
            }
          } catch (e) {
            console.warn("Purchase listener error:", e);
          }
        });
      }

      // Get product info
      const products = await mod.fetchProducts({ skus: [PRODUCT_ID] });
      if (products && products.length > 0) {
        const p = products[0];
        setPrice(p.displayPrice ?? "¥300");
        setIsIAPReady(true);
      }

      // Check if already purchased
      await restoreInner(mod);
    } catch (e) {
      console.warn("IAP init error:", e);
      iapModule = null;
    }
  };

  const retryGetProducts = async (): Promise<boolean> => {
    const mod = await loadIAP();
    if (!mod) return false;
    try {
      await mod.initConnection();
      const products = await mod.fetchProducts({ skus: [PRODUCT_ID] });
      if (products && products.length > 0) {
        setPrice(products[0].displayPrice ?? "¥300");
        setIsIAPReady(true);
        return true;
      }
    } catch (e) {
      console.warn("IAP retry fetchProducts error:", e);
    }
    return false;
  };

  const restoreInner = async (mod?: IAPModule | null) => {
    const m = mod ?? iapModule;
    if (!m) return;
    try {
      const purchases = await m.getAvailablePurchases();
      const hasPremium = purchases.some((p) => p.productId === PRODUCT_ID);
      if (hasPremium) {
        await setPremium();
      }
    } catch (e) {
      console.warn("Restore error:", e);
    }
  };

  const purchasePremium = useCallback(async (): Promise<boolean> => {
    // Dev fallback
    if (__DEV__ && !iapModule) {
      await setPremium();
      return true;
    }

    // If IAP not ready, retry once
    if (!iapModule || !isIAPReady) {
      setIsPurchasing(true);
      try {
        const ready = await retryGetProducts();
        if (!ready || !iapModule) {
          Alert.alert(
            "購入できません",
            "App Storeに接続できません。しばらく後でお試しください。"
          );
          return false;
        }
      } finally {
        setIsPurchasing(false);
      }
    }

    try {
      const purchaseRequest =
        Platform.OS === "ios"
          ? {
              apple: {
                sku: PRODUCT_ID,
                andDangerouslyFinishTransactionAutomatically: false,
              },
            }
          : { google: { skus: [PRODUCT_ID] } };

      iapModule!
        .requestPurchase({ request: purchaseRequest, type: "in-app" as const })
        .catch((e: unknown) => {
          console.warn("Purchase requestPurchase rejected:", e);
        });
      return true;
    } catch (e) {
      console.warn("Purchase launch error:", e);
      return false;
    }
  }, [isIAPReady, setPremium]);

  const restorePurchases = useCallback(async () => {
    await restoreInner();
  }, []);

  return {
    isPremium: premiumActive,
    isIAPReady,
    isPurchasing,
    price,
    purchasePremium,
    restorePurchases,
  };
}
