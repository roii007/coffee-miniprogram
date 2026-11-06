const menu = require('../../utils/menu.js');
const store = require('../../utils/store.js');
const util = require('../../utils/util.js');

Page({
    data: {
        product: null,
        method: 'pickup',
        viewState: 'loading',
        isDrink: true,
        sizes: [],
        temps: [],
        sugars: [],
        extras: [],
        sizeIndex: 0,
        tempIndex: 0,
        sugarIndex: 0,
        qty: 1,
        unitPriceText: '0.00',
        totalText: '0.00',
        specText: '',
        cartCount: 0,
    },

    onLoad(query) {
        const product = menu.findProduct(query.id);
        if (!product) {
            this.setData({ viewState: 'error' });
            return;
        }

        const isDrink = product.specType === 'drink';
        const extras = menu.extraOptions.map(function (item) {
            return { id: item.id, name: item.name, delta: item.delta, deltaText: '+' + item.delta, checked: false };
        });

        this.setData(
            {
                product: product,
                method: query.method || 'pickup',
                isDrink: isDrink,
                sizes: menu.sizeOptions.map(function (item) {
                    return { id: item.id, name: item.name, note: item.note };
                }),
                temps: menu.tempOptions,
                sugars: menu.sugarOptions,
                extras: extras,
                viewState: 'ready',
                cartCount: store.summarize().count,
            },
            () => {
                this.recompute();
            }
        );

        wx.setNavigationBarTitle({ title: product.name });
    },

    pickSize(event) {
        this.setData({ sizeIndex: Number(event.currentTarget.dataset.index) }, () => this.recompute());
    },

    pickTemp(event) {
        this.setData({ tempIndex: Number(event.currentTarget.dataset.index) }, () => this.recompute());
    },

    pickSugar(event) {
        this.setData({ sugarIndex: Number(event.currentTarget.dataset.index) }, () => this.recompute());
    },

    toggleExtra(event) {
        const index = Number(event.currentTarget.dataset.index);
        const extras = this.data.extras.map(function (item, i) {
            if (i === index) {
                return { id: item.id, name: item.name, delta: item.delta, deltaText: item.deltaText, checked: !item.checked };
            }
            return item;
        });
        this.setData({ extras: extras }, () => this.recompute());
    },

    changeQty(event) {
        const delta = Number(event.currentTarget.dataset.delta);
        const qty = this.data.qty + delta;
        if (qty < 1) {
            return;
        }
        this.setData({ qty: qty }, () => this.recompute());
    },

    recompute() {
        const product = this.data.product;
        if (!product) {
            return;
        }

        let unit = product.price;
        const parts = [];

        if (this.data.isDrink) {
            const size = menu.sizeOptions[this.data.sizeIndex];
            const temp = menu.tempOptions[this.data.tempIndex];
            const sugar = menu.sugarOptions[this.data.sugarIndex];
            unit += size.delta;
            parts.push(size.name);
            parts.push(temp.name);
            parts.push(sugar.name);

            for (let i = 0; i < this.data.extras.length; i++) {
                if (this.data.extras[i].checked) {
                    unit += this.data.extras[i].delta;
                    parts.push(this.data.extras[i].name);
                }
            }
        } else {
            parts.push('单份');
        }

        this.setData({
            unitPriceText: util.money(unit),
            totalText: util.money(unit * this.data.qty),
            specText: parts.join(' / '),
        });
    },

    addToCart() {
        const product = this.data.product;
        if (!product) {
            return;
        }

        const spec = {
            size: this.data.isDrink ? menu.sizeOptions[this.data.sizeIndex].id : 'none',
            temp: this.data.isDrink ? menu.tempOptions[this.data.tempIndex].id : 'none',
            sugar: this.data.isDrink ? menu.sugarOptions[this.data.sugarIndex].id : 'none',
            extras: this.data.isDrink
                ? this.data.extras
                      .filter(function (item) {
                          return item.checked;
                      })
                      .map(function (item) {
                          return { id: item.id, name: item.name, delta: item.delta };
                      })
                : [],
            text: this.data.specText,
        };

        const summary = store.addToCart(product, spec, this.data.qty, Number(this.data.unitPriceText));
        this.setData({ cartCount: summary.count });
        wx.showToast({ title: '已加入购物车', icon: 'success', duration: 900 });
        setTimeout(function () {
            wx.navigateBack();
        }, 700);
    },

    goCart() {
        wx.navigateTo({ url: '/pages/cart/cart?method=' + this.data.method });
    },
});
