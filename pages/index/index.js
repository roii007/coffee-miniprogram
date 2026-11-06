const menu = require('../../utils/menu.js');
const store = require('../../utils/store.js');
const util = require('../../utils/util.js');

Page({
    data: {
        storeInfo: menu.storeInfo,
        categories: menu.categories,
        activeCat: 'hot',
        products: [],
        viewState: 'loading',
        method: 'pickup',
        methodText: '到店自取',
        notice: '生椰拿铁第二杯半价，会员额外再减 2 元',
        cart: { count: 0, subtotalText: '0.00' },
    },

    onLoad() {
        this.loadMenu();
    },

    onShow() {
        this.syncCart();
    },

    loadMenu() {
        this.setData({ viewState: 'loading' });
        setTimeout(() => {
            try {
                this.setData({ products: this.decorate(menu.byCategory(this.data.activeCat)), viewState: 'ready' });
            } catch (err) {
                console.error('[index] load menu failed', err);
                this.setData({ viewState: 'error' });
            }
        }, 180);
    },

    decorate(list) {
        return list.map(function (item) {
            return Object.assign({}, item, { priceText: util.money(item.price) });
        });
    },

    handleRetry() {
        this.loadMenu();
    },

    switchCat(event) {
        const id = event.currentTarget.dataset.id;
        if (id === this.data.activeCat) {
            return;
        }
        this.setData({ activeCat: id, products: this.decorate(menu.byCategory(id)) });
    },

    switchMethod(event) {
        const method = event.currentTarget.dataset.method;
        this.setData({
            method: method,
            methodText: method === 'dinein' ? '堂食' : '到店自取',
        });
    },

    goDetail(event) {
        const id = event.currentTarget.dataset.id;
        wx.navigateTo({ url: '/pages/detail/detail?id=' + id + '&method=' + this.data.method });
    },

    quickAdd(event) {
        const id = event.currentTarget.dataset.id;
        const product = menu.findProduct(id);
        if (!product) {
            return;
        }
        store.quickAdd(product, product.price);
        this.syncCart();
        wx.vibrateShort({ type: 'light' });
        wx.showToast({ title: '已加入购物车', icon: 'none', duration: 800 });
    },

    syncCart() {
        const summary = store.summarize();
        this.setData({ cart: { count: summary.count, subtotalText: summary.subtotalText } });
    },

    goCart() {
        wx.navigateTo({ url: '/pages/cart/cart?method=' + this.data.method });
    },

    handleCall() {
        wx.showModal({
            title: '联系门店',
            content: '前台电话 020-8888 6666，营业时间 08:00 - 21:30。',
            confirmText: '知道了',
            showCancel: false,
        });
    },

    handleNotice() {
        wx.showModal({
            title: '今日活动',
            content: '1. 生椰拿铁第二杯半价，限堂食与自取。\n2. 会员下单立减 2 元，可与优惠券叠加。',
            confirmText: '去看看',
            cancelText: '关闭',
            success(res) {
                if (res.confirm) {
                    wx.switchTab({ url: '/pages/index/index' });
                }
            },
        });
    },

    onShareAppMessage() {
        return {
            title: '拾光咖啡 · 今天喝点什么',
            path: '/pages/index/index',
        };
    },
});
