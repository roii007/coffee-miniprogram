const store = require('../../utils/store.js');
const menu = require('../../utils/menu.js');

Page({
    data: {
        profile: {},
        stats: { orderCount: 0, cups: 0, coupons: 0 },
        coupons: [],
        storeInfo: menu.storeInfo,
        version: '1.0.0',
    },

    onShow() {
        this.refresh();
    },

    refresh() {
        this.setData({
            profile: store.getProfile(),
            stats: store.stats(),
            coupons: store.getCoupons(),
        });
    },

    goOrders() {
        wx.switchTab({ url: '/pages/orders/orders' });
    },

    goMenu() {
        wx.switchTab({ url: '/pages/index/index' });
    },

    showCoupons() {
        const coupons = store.getCoupons();
        if (!coupons.length) {
            wx.showToast({ title: '暂无优惠券', icon: 'none' });
            return;
        }
        wx.showActionSheet({
            itemList: coupons.map(function (coupon) {
                return coupon.title + ' · 减 ' + coupon.amount + ' 元（' + (coupon.used ? '已使用' : '可用') + '）';
            }),
            success(res) {
                console.log('[mine] coupon tapped', res.tapIndex);
            },
            fail() {},
        });
    },

    showStore() {
        wx.showModal({
            title: menu.storeInfo.name,
            content: menu.storeInfo.address + '\n营业时间 ' + menu.storeInfo.hours + '\n距你 ' + menu.storeInfo.distance,
            confirmText: '知道了',
            showCancel: false,
        });
    },

    showAbout() {
        wx.showModal({
            title: '关于拾光咖啡',
            content: '这是一个用原生微信小程序实现的咖啡点单 Demo：菜单、规格加料、购物车、优惠券与订单都存在手机本地，不需要后端即可跑通全流程。',
            confirmText: '好的',
            showCancel: false,
        });
    },

    resetData() {
        const that = this;
        wx.showModal({
            title: '清空本地数据',
            content: '会删除本机的购物车、订单和优惠券记录，无法恢复。',
            confirmText: '清空',
            confirmColor: '#b4462f',
            success(res) {
                if (res.confirm) {
                    store.resetAll();
                    that.refresh();
                    wx.showToast({ title: '已重置', icon: 'success' });
                }
            },
        });
    },
});
