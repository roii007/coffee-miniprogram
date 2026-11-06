const util = require('./util.js');

const KEY_CART = 'coffee_cart_v1';
const KEY_ORDERS = 'coffee_orders_v1';
const KEY_COUPONS = 'coffee_coupons_v1';
const KEY_PROFILE = 'coffee_profile_v1';

const DEFAULT_COUPONS = [
    { id: 'c1', title: '新人首单券', desc: '满 20 元可用', amount: 5, threshold: 20, used: false },
    { id: 'c2', title: '拿铁会员券', desc: '满 38 元可用', amount: 8, threshold: 38, used: false },
    { id: 'c3', title: '甜点搭子券', desc: '满 50 元可用', amount: 12, threshold: 50, used: false },
];

const DEFAULT_PROFILE = {
    nickname: '咖啡搭子',
    member: '金豆会员',
    points: 268,
    joinDays: 41,
};

function read(key, fallback) {
    try {
        const value = wx.getStorageSync(key);
        if (value === '' || value === null || value === undefined) {
            return fallback;
        }
        return value;
    } catch (err) {
        console.error('[store] read failed', key, err);
        return fallback;
    }
}

function write(key, value) {
    try {
        wx.setStorageSync(key, value);
        return true;
    } catch (err) {
        console.error('[store] write failed', key, err);
        wx.showToast({ title: '本地保存失败', icon: 'none' });
        return false;
    }
}

function init() {
    if (!read(KEY_COUPONS, null)) {
        write(KEY_COUPONS, DEFAULT_COUPONS);
    }
    if (!read(KEY_PROFILE, null)) {
        write(KEY_PROFILE, DEFAULT_PROFILE);
    }
    if (!read(KEY_CART, null)) {
        write(KEY_CART, []);
    }
    if (!read(KEY_ORDERS, null)) {
        write(KEY_ORDERS, []);
    }
}

/* ---------------- 购物车 ---------------- */

function getCart() {
    const cart = read(KEY_CART, []);
    return Array.isArray(cart) ? cart : [];
}

function saveCart(cart) {
    write(KEY_CART, cart);
}

function specKey(productId, spec) {
    const extraIds = (spec.extras || [])
        .map(function (item) {
            return item.id;
        })
        .sort()
        .join('-');
    return [productId, spec.size, spec.temp, spec.sugar, extraIds].join('|');
}

function addToCart(product, spec, qty, unitPrice) {
    const cart = getCart();
    const key = specKey(product.id, spec);
    const extraQty = qty || 1;
    let hit = null;

    for (let i = 0; i < cart.length; i++) {
        if (cart[i].key === key) {
            hit = cart[i];
            break;
        }
    }

    if (hit) {
        hit.qty += extraQty;
    } else {
        cart.push({
            key: key,
            id: product.id,
            name: product.name,
            badge: product.badge,
            tone: product.tone,
            specText: spec.text,
            unitPrice: util.money(unitPrice),
            qty: extraQty,
        });
    }

    saveCart(cart);
    return summarize(cart);
}

function quickAdd(product, basePrice) {
    const spec = {
        size: 'M',
        temp: product.specType === 'dessert' ? 'none' : 'ice',
        sugar: product.specType === 'dessert' ? 'none' : 'std',
        extras: [],
        text: product.specType === 'dessert' ? '单份' : '中杯 / 冰 / 标准糖',
    };
    return addToCart(product, spec, 1, basePrice);
}

function changeQty(key, delta) {
    const cart = getCart();
    const next = [];

    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        if (item.key === key) {
            item.qty += delta;
            if (item.qty > 0) {
                next.push(item);
            }
        } else {
            next.push(item);
        }
    }

    saveCart(next);
    return summarize(next);
}

function removeItem(key) {
    const cart = getCart().filter(function (item) {
        return item.key !== key;
    });
    saveCart(cart);
    return summarize(cart);
}

function clearCart() {
    saveCart([]);
    return summarize([]);
}

function summarize(source) {
    const cart = source || getCart();
    let count = 0;
    let subtotal = 0;

    for (let i = 0; i < cart.length; i++) {
        count += cart[i].qty;
        subtotal += cart[i].unitPrice * cart[i].qty;
    }

    return {
        items: cart,
        count: count,
        subtotal: util.money(subtotal),
        subtotalText: util.money(subtotal),
    };
}

/* ---------------- 优惠券 ---------------- */

function getCoupons() {
    return read(KEY_COUPONS, DEFAULT_COUPONS);
}

function usableCoupons(subtotal) {
    const amount = Number(subtotal) || 0;
    return getCoupons().filter(function (coupon) {
        return !coupon.used && amount >= coupon.threshold;
    });
}

function markCouponUsed(couponId) {
    const coupons = getCoupons().map(function (coupon) {
        if (coupon.id === couponId) {
            return { id: coupon.id, title: coupon.title, desc: coupon.desc, amount: coupon.amount, threshold: coupon.threshold, used: true };
        }
        return coupon;
    });
    write(KEY_COUPONS, coupons);
}

/* ---------------- 订单 ---------------- */

function getOrders() {
    const orders = read(KEY_ORDERS, []);
    return Array.isArray(orders) ? orders : [];
}

function createOrder(payload) {
    const now = Date.now();
    const orders = getOrders();
    const order = {
        id: 'o_' + now,
        no: util.orderNo(now),
        createdAt: now,
        timeText: util.timeText(now),
        status: 'making',
        statusText: '制作中',
        method: payload.method,
        methodText: payload.methodText,
        note: payload.note || '',
        items: payload.items,
        count: payload.count,
        subtotal: payload.subtotal,
        discount: util.money(payload.discount || 0),
        total: util.money(payload.total),
        totalText: util.money(payload.total),
        couponTitle: payload.couponTitle || '',
        pickupWait: payload.pickupWait || 12,
    };

    orders.unshift(order);
    write(KEY_ORDERS, orders);

    if (payload.couponId) {
        markCouponUsed(payload.couponId);
    }

    clearCart();
    return order;
}

function finishOrder(orderId) {
    const orders = getOrders().map(function (order) {
        if (order.id === orderId) {
            const next = Object.assign({}, order);
            next.status = 'done';
            next.statusText = '已取餐';
            return next;
        }
        return order;
    });
    write(KEY_ORDERS, orders);
    return orders;
}

function reorder(orderId) {
    const orders = getOrders();
    const cart = getCart();

    for (let i = 0; i < orders.length; i++) {
        if (orders[i].id !== orderId) {
            continue;
        }
        const items = orders[i].items;
        for (let j = 0; j < items.length; j++) {
            const line = items[j];
            const key = line.key + '@' + orderId;
            cart.push({
                key: key,
                id: line.id,
                name: line.name,
                badge: line.badge,
                tone: line.tone,
                specText: line.specText,
                unitPrice: line.unitPrice,
                qty: line.qty,
            });
        }
    }

    saveCart(cart);
    return summarize(cart);
}

/* ---------------- 会员 ---------------- */

function getProfile() {
    return read(KEY_PROFILE, DEFAULT_PROFILE);
}

function stats() {
    const orders = getOrders();
    let cups = 0;
    for (let i = 0; i < orders.length; i++) {
        cups += orders[i].count;
    }
    return {
        orderCount: orders.length,
        cups: cups,
        coupons: getCoupons().filter(function (coupon) {
            return !coupon.used;
        }).length,
    };
}

function resetAll() {
    wx.removeStorageSync(KEY_CART);
    wx.removeStorageSync(KEY_ORDERS);
    wx.removeStorageSync(KEY_COUPONS);
    wx.removeStorageSync(KEY_PROFILE);
    init();
}

module.exports = {
    init: init,
    getCart: getCart,
    addToCart: addToCart,
    quickAdd: quickAdd,
    changeQty: changeQty,
    removeItem: removeItem,
    clearCart: clearCart,
    summarize: summarize,
    getCoupons: getCoupons,
    usableCoupons: usableCoupons,
    getOrders: getOrders,
    createOrder: createOrder,
    finishOrder: finishOrder,
    reorder: reorder,
    getProfile: getProfile,
    stats: stats,
    resetAll: resetAll,
};
