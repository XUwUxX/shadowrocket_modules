const version = 'Hybrid V1.0.0';

/**
 * Helper: set header
 */
function setHeaderValue(e, a, d) {
  var r = a.toLowerCase();
  r in e ? e[r] = d : e[a] = d;
}

/**
 * Universal fake subscription template
 */
function genSub(product_id, entitlement) {
  const now = new Date().toISOString();
  return {
    subscriptions: {
      [product_id]: {
        is_sandbox: false,
        ownership_type: "PURCHASED",
        period_type: "normal",
        expires_date: "2099-12-18T01:04:17Z",
        purchase_date: now,
        original_purchase_date: now,
        store: "app_store",
        grace_period_expires_date: null,
        billing_issues_detected_at: null,
        unsubscribe_detected_at: null
      }
    },
    entitlements: {
      [entitlement]: {
        product_identifier: product_id,
        purchase_date: now,
        expires_date: "2099-12-18T01:04:17Z",
        grace_period_expires_date: null
      }
    }
  };
}

/**
 * Hardcode mapping cho 1 số app cụ thể
 */
const mapping = {
  '%E8%BD%A6%E7%A5%A8%E7%A5%A8': ['vip+watch_vip', 'vip'],
  'Locket': ['com.locket02.premium.yearly', 'Gold']
};

if ($request && $request.headers) {
  // mode deleteHeader
  let modifiedHeaders = $request.headers;
  setHeaderValue(modifiedHeaders, "X-RevenueCat-ETag", "");
  $done({ headers: modifiedHeaders });

} else if ($response && $response.body) {
  // mode response rewrite
  let ua = $request.headers["User-Agent"] || $request.headers["user-agent"];
  let obj = JSON.parse($response.body);

  const match = Object.keys(mapping).find(e => ua.includes(e));
  if (match) {
    // --- Hardcode mode ---
    const [product_id, entitlement] = mapping[match];
    let fake = genSub(product_id, entitlement);
    obj.subscriber.subscriptions = fake.subscriptions;
    obj.subscriber.entitlements = fake.entitlements;
    obj.Attention = "[AnhzTuan] Chúc mừng bạn! Vui lòng không bán hoặc chia sẻ cho người khác!";
  } else {
    // --- Universal mode ---
    if (obj.subscriber) {
      // Trường hợp app không có mapping sẵn
      let product_id = "com.default.premium.yearly";
      let entitlement = "pro";
      let fake = genSub(product_id, entitlement);
      obj.subscriber.subscriptions = fake.subscriptions;
      obj.subscriber.entitlements = fake.entitlements;
    }
  }

  $done({ body: JSON.stringify(obj) });
}
