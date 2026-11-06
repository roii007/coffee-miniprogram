const store = require('../../utils/store.js');

const FILTERS = [
    { id: 'all', name: '全部' },
    { id: 'making', name: '制作中' },
    { id: 'done', name: '已取餐' },
];

Page({
    data: {
        filters: FILTERS,
        activeFilter: 'all',
        orders: [],
        viewState: 'empty',
    },

    onShow() {
        this.refresh();
    },

    refresh() {
        const all = store.getOrders();
        const filter = this.data.activeFilter;
        const list = all.filter(function (order) {
            if (filter === 'all') {
                return true;
            }
            return order.status === filter;
        });

        this.setData({
            orders: list,
            viewState: list.length > 0 ? 'ready' : 'empty',
        });
    },

    switchFilter(event) {
        const id = event.currentTarget.dataset.id;
        if (id === this.data.activeFilter) {
            return;
        }
        this.setData({ activeFilter: id }, () => this.refresh());
    },

    finishOrder(event) {
        const id = event.currentTarget.dataset.id;
        const that = this;
        wx.showModal({
            title: '确认取餐',
            content: '拿到咖啡了就点确认，祝你今天愉快。',
            success(res) {
                if (res.confirm) {
                    store.finishOrder(id);
                    that.refresh();
                    wx.showToast({ title: '已完成', icon: 'success' });
                }
            },
        });
    },

    reorder(event) {
        const id = event.currentTarget.dataset.id;
        const summary = store.reorder(id);
        wx.showToast({ title: '已加入购物车 ' + summary.count + ' 件', icon: 'none' });
        setTimeout(function () {
            wx.switchTab({ url: '/pages/index/index' });
        }, 700);
    },

    goMenu() {
        wx.switchTab({ url: '/pages/index/index' });
    },

    onPullDownRefresh() {
        this.refresh();
        wx.stopPullDownRefresh();
    },
});
