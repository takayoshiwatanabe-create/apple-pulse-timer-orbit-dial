import { useEffect, useState, useCallback, useRef } from "react";
import { Alert, Platform } from "react-native";
import { useSettingsStore } from "@/stores/settingsStore";

const PRODUCT_ID = "com.zerocode.applepulsetimerorbitdial.premium";

let iapModule: typeof import("react-native-iap") | null = null;

async function loadIAP() {
  try {
    iapModule = await import("react-native-iap");
  } catch {
    // IAP not available (Expo Go or dev)
  }
}

export function usePremium() {
  const premiumActive = useSettingsStore((s) => s.premiumActive);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const [isIAPReady, setIsIAPReady] = useState(false);
  const [price, setPrice] = useState<string>("¥300");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const purchaseListenerRef = useRef<ReturnType<
    typeof import("react-native-iap").purchaseUpdatedListener
  > | null>(null);
  const errorListenerRef = useRef<ReturnType<
    typeof import("react-native-iap").purchaseErrorListener
  > | null>(null);

  const setPremium = useCallback(async () => {
    await updateSettings({ premiumActive: true });
  }, [updateSettings]);

  useEffect(() => {
    initIAP();
    return () => {
      purchaseListenerRef.current?.remove();
      errorListenerRef.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initIAP = async () => {
    try {
      await loadIAP();
      if (!iapModule) return;

      await iapModule.initConnection();

      // Flush stuck/pending transactions
      try {
        if (
          Platform.OS === "ios" &&
          typeof (iapModule as any).clearTransactionIOS === "function"
        ) {
          await (iapModule as any).clearTransactionIOS();
        } else if (
          Platform.OS === "android" &&
          typeof (iapModule as any)
            .flushFailedPurchasesCachedAsPendingAndroid === "function"
        ) {
          await (
            iapModule as any
          ).flushFailedPurchasesCachedAsPendingAndroid();
        }
      } catch (e) {
        console.warn("Transaction flush error:", e);
      }

      // Set up purchase success listener
      if (!purchaseListenerRef.current) {
        purchaseListenerRef.current = iapModule.purchaseUpdatedListener(
          async (purchase) => {
            try {
              if (purchase.productId === PRODUCT_ID) {
                await iapModule!.finishTransaction({ purchase });
                await setPremium();
                Alert.alert(
                  "購入完了",
                  "プレミアムが有効になりました。広告なしでお楽しみください！"
                );
              }
            } catch (e) {
              console.warn("Purchase listener error:", e);
            }
          }
        );
      }

      // Set up purchase error listener
      if (!errorListenerRef.current) {
        errorListenerRef.current = iapModule.purchaseErrorListener((error) => {
          // User cancellation is not a real error — silently ignore
          if (
            error.code === "E_USER_CANCELLED" ||
            error.responseCode === 1
          ) {
            return;
          }
          console.warn("Purchase error:", error);
          Alert.alert(
            "購入エラー",
            "購入処理中にエラーが発生しました。しばらく後でお試しください。"
          );
        });
      }

      // Get product info
      const products = await iapModule.getProducts({
        skus: [PRODUCT_ID],
      });
      if (products.length > 0) {
        const p = products[0];
        let displayPrice = p.localizedPrice ?? "¥300";
        try {
          const numPrice = parseFloat(p.price);
          if (p.currency && !isNaN(numPrice)) {
            displayPrice = new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: p.currency,
              minimumFractionDigits: p.currency === "JPY" ? 0 : 2,
            }).format(numPrice);
          }
        } catch {
          // fallback to localizedPrice
        }
        setPrice(displayPrice);
        setIsIAPReady(true);
      }

      // Check if already purchased (silent restore on launch)
      await restoreInner(false);
    } catch (e) {
      console.warn("IAP init error:", e);
      iapModule = null;
    }
  };

  const retryGetProducts = async (): Promise<boolean> => {
    if (!iapModule) await loadIAP();
    const mod = iapModule;
    if (!mod) return false;
    try {
      await mod.initConnection();
      const products = await mod.getProducts({ skus: [PRODUCT_ID] });
      if (products.length > 0) {
        setPrice(products[0].localizedPrice ?? "¥300");
        setIsIAPReady(true);
        return true;
      }
    } catch (e) {
      console.warn("IAP retry getProducts error:", e);
    }
    return false;
  };

  const restoreInner = async (showAlert: boolean = false): Promise<boolean> => {
    if (!iapModule) {
      if (showAlert) {
        Alert.alert(
          "復元できません",
          "App Storeに接続できません。ネットワーク接続を確認してください。"
        );
      }
      return false;
    }
    try {
      const purchases = await iapModule.getAvailablePurchases();
      const hasPremium = purchases.some((p) => p.productId === PRODUCT_ID);
      if (hasPremium) {
        await setPremium();
        if (showAlert) {
          Alert.alert("復元完了", "プレミアムが復元されました。");
        }
        return true;
      } else {
        if (showAlert) {
          Alert.alert(
            "購入履歴なし",
            "復元可能な購入が見つかりませんでした。"
          );
        }
        return false;
      }
    } catch (e) {
      console.warn("Restore error:", e);
      if (showAlert) {
        Alert.alert(
          "復元エラー",
          "購入情報の復元中にエラーが発生しました。しばらく後でお試しください。"
        );
      }
      return false;
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
      iapModule!
        .requestPurchase({
          sku: PRODUCT_ID,
          ...(Platform.OS === "ios"
            ? { andDangerouslyFinishTransactionAutomaticallyIOS: false }
            : {}),
        })
        .catch((e) => {
          console.warn("Purchase requestPurchase rejected:", e);
        });
      return true;
    } catch (e) {
      console.warn("Purchase launch error:", e);
      return false;
    }
  }, [isIAPReady, setPremium]);

  const restorePurchases = useCallback(async () => {
    await restoreInner(true);
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
