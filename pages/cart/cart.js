const store = require('../../utils/store.js');
const util = require('../../utils/util.js');

const MEMBER_THRESHOLD = 20;
const MEMBER_DISCOUNT = 2;

Page({
    data: {
        items: [],
        count: 0,
        subtotalText: '0.00',
        memberDiscountText: '0.00',
        couponDiscountText: '0.00',
        totalText: '0.00',
        memberDiscount: 0,
        couponDiscount: 0,
        subtotal: 0,
        method: 'pickup',
        methodText: '到店自取',
        note: '',
        coupons: [],
        couponIndex: -1,
        couponTitle: '',
        canSubmit: false,
    },

    onLoad(query) {
        this.setData({ method: query.method === 'dinein' ? 'dinein' : 'pickup', methodText: query.method === 'dinein' ? '堂食' : '到店自取' });
    },

    onShow() {
        this.refresh();
    },

    refresh() {
        const summary = store.summarize();
        const subtotal = Number(summary.subtotal);
        const memberDiscount = subtotal >= MEMBER_THRESHOLD ? MEMBER_DISCOUNT : 0;
        const coupons = store.usableCoupons(subtotal).map(function (coupon) {
            return {
                id: coupon.id,
                title: coupon.title,
                desc: coupon.desc,
                amount: coupon.amount,
                threshold: coupon.threshold,
                amountText: util.money(coupon.amount),
            };
        });

        let couponIndex = this.data.couponIndex;
        if (couponIndex >= coupons.length) {
            couponIndex = -1;
        }

        const picked = couponIndex >= 0 ? coupons[couponIndex] : null;
        const couponDiscount = picked ? picked.amount : 0;
        const total = Math.max(0, subtotal - memberDiscount - couponDiscount);

        this.setData({
            items: summary.items.map(function (item) {
                return Object.assign({}, item, {
                    lineTotalText: util.money(item.unitPrice * item.qty),
                });
            }),
            count: summary.count,
            subtotal: subtotal,
            subtotalText: util.money(subtotal),
            memberDiscount: memberDiscount,
            memberDiscountText: util.money(memberDiscount),
            couponIndex: couponIndex,
            couponTitle: picked ? picked.title : '',
            couponDiscount: couponDiscount,
            couponDiscountText: util.money(couponDiscount),
            totalText: util.money(total),
            coupons: coupons,
            canSubmit: summary.count > 0,
        });
    },

    changeQty(event) {
        const key = event.currentTarget.dataset.key;
        const delta = Number(event.currentTarget.dataset.delta);
        store.changeQty(key, delta);
        this.refresh();
    },

    removeItem(event) {
        const key = event.currentTarget.dataset.key;
        const that = this;
        wx.showModal({
            title: '移出购物车',
            content: '确定要把这一项删掉吗？',
            success(res) {
                if (res.confirm) {
                    store.removeItem(key);
                    that.refresh();
                }
            },
        });
    },

    clearCart() {
        const that = this;
        if (!this.data.count) {
            return;
        }
        wx.showModal({
            title: '清空购物车',
            content: '清空后需要重新选择商品。',
            success(res) {
                if (res.confirm) {
                    store.clearCart();
                    that.setData({ couponIndex: -1 });
                    that.refresh();
                }
            },
        });
    },

    switchMethod(event) {
        const method = event.currentTarget.dataset.method;
        this.setData({ method: method, methodText: method === 'dinein' ? '堂食' : '到店自取' });
    },

    pickCoupon(event) {
        const index = Number(event.currentTarget.dataset.index);
        const next = this.data.couponIndex === index ? -1 : index;
        this.setData({ couponIndex: next }, () => this.refresh());
    },

    onNoteInput(event) {
        this.setData({ note: event.detail.value });
    },

    goMenu() {
        wx.switchTab({ url: '/pages/index/index' });
    },

    submit() {
        if (!this.data.canSubmit) {
            wx.showToast({ title: '购物车是空的', icon: 'none' });
            return;
        }

        const that = this;
        wx.showLoading({ title: '提交中', mask: true });

        setTimeout(function () {
            try {
                const picked = that.data.couponIndex >= 0 ? that.data.coupons[that.data.couponIndex] : null;
                const order = store.createOrder({
                    method: that.data.method,
                    methodText: that.data.methodText,
                    note: that.data.note,
                    items: that.data.items.map(function (item) {
                        return {
                            key: item.key,
                            id: item.id,
                            name: item.name,
                            badge: item.badge,
                            tone: item.tone,
                            specText: item.specText,
                            unitPrice: item.unitPrice,
                            qty: item.qty,
                        };
                    }),
                    count: that.data.count,
                    subtotal: that.data.subtotal,
                    discount: that.data.memberDiscount + that.data.couponDiscount,
                    total: Number(that.data.totalText),
                    couponId: picked ? picked.id : '',
                    couponTitle: picked ? picked.title : '',
                });

                wx.hideLoading();
                wx.showToast({ title: '下单成功', icon: 'success', duration: 1200 });
                that.setData({ couponIndex: -1 });

                setTimeout(function () {
                    wx.switchTab({
                        url: '/pages/orders/orders',
                        success: function () {
                            console.log('[cart] order created', order.no);
                        },
                    });
                }, 900);
            } catch (err) {
                wx.hideLoading();
                console.error('[cart] submit failed', err);
                wx.showModal({ title: '下单失败', content: '本地保存出错，请重试一次。', showCancel: false });
            }
        }, 400);
    },
});
