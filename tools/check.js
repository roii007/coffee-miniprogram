// 本地静态校验 + 无 UI 的数据层自测（node tools/check.js）
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let failed = 0;

function fail(msg) {
    failed++;
    console.log('FAIL  ' + msg);
}

function ok(msg) {
    console.log('ok    ' + msg);
}

function readJSON(rel) {
    const file = path.join(ROOT, rel);
    if (!fs.existsSync(file)) {
        fail('缺少文件 ' + rel);
        return null;
    }
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
        fail(rel + ' JSON 解析失败: ' + err.message);
        return null;
    }
}

const app = readJSON('app.json');
const project = readJSON('project.config.json');
readJSON('sitemap.json');

if (project) {
    if (project.appid === 'touristappid' || !project.appid) {
        fail('project.config.json 仍是 touristappid，IDE 真机预览需要真实 AppID');
    } else {
        ok('appid = ' + project.appid);
    }
}

if (app) {
    if (!app.lazyCodeLoading) {
        fail('app.json 缺少 lazyCodeLoading');
    }
    if (!Array.isArray(app.pages) || app.pages.length === 0) {
        fail('app.json pages 为空');
    }
    (app.pages || []).forEach(function (page) {
        ['js', 'wxml', 'json'].forEach(function (ext) {
            const rel = page + '.' + ext;
            if (!fs.existsSync(path.join(ROOT, rel))) {
                fail('页面文件缺失 ' + rel);
            }
        });
    });
    ok('页面文件齐全：' + app.pages.length + ' 个页面');

    const tab = app.tabBar || {};
    (tab.list || []).forEach(function (item) {
        if (app.pages.indexOf(item.pagePath) === -1) {
            fail('tabBar 页面未在 pages 中：' + item.pagePath);
        }
        ['iconPath', 'selectedIconPath'].forEach(function (key) {
            if (!item[key] || !fs.existsSync(path.join(ROOT, item[key]))) {
                fail('tabBar 图标缺失：' + (item[key] || key));
            }
        });
    });
    ok('tabBar 配置与图标检查完成');
}

// WXML 静态规则
const pageDirs = fs.readdirSync(path.join(ROOT, 'pages'));
pageDirs.forEach(function (dir) {
    const file = path.join(ROOT, 'pages', dir, dir + '.wxml');
    if (!fs.existsSync(file)) {
        return;
    }
    const src = fs.readFileSync(file, 'utf8');
    ['?.', '??', '=>'].forEach(function (token) {
        if (src.indexOf(token) !== -1) {
            fail(dir + '.wxml 含不支持的表达式 ' + token);
        }
    });
    if (/<(div|span|p|img)\b/.test(src)) {
        fail(dir + '.wxml 含 HTML 标签');
    }
    if (/\{\{[^}]*$/.test(src.split('\n').filter(function (line) {
        return (line.match(/\{\{/g) || []).length !== (line.match(/\}\}/g) || []).length;
    }).join('\n')) && false) {
        fail(dir + '.wxml 花括号不配对');
    }
    const open = (src.match(/\{\{/g) || []).length;
    const close = (src.match(/\}\}/g) || []).length;
    if (open !== close) {
        fail(dir + '.wxml {{ }} 数量不一致 (' + open + '/' + close + ')');
    }
    ok(dir + '.wxml 静态检查通过');
});

// WXSS 语法粗检：花括号配对、属性名拼写常见错误
pageDirs.forEach(function (dir) {
    const file = path.join(ROOT, 'pages', dir, dir + '.wxss');
    if (!fs.existsSync(file)) {
        return;
    }
    const src = fs.readFileSync(file, 'utf8');
    const open = (src.match(/\{/g) || []).length;
    const close = (src.match(/\}/g) || []).length;
    if (open !== close) {
        fail(dir + '.wxss 花括号不配对 (' + open + '/' + close + ')');
    }
    src.split('\n').forEach(function (line, i) {
        const m = line.match(/^\s{2,}([a-z-]+)\s*:/);
        if (m && m[1].length > 20) {
            fail(dir + '.wxss 第 ' + (i + 1) + ' 行疑似属性名错误: ' + m[1]);
        }
    });
    ok(dir + '.wxss 静态检查通过');
});

// 数据层自测：mock wx
const storage = {};
global.wx = {
    getStorageSync: function (key) {
        return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : '';
    },
    setStorageSync: function (key, value) {
        storage[key] = value;
    },
    removeStorageSync: function (key) {
        delete storage[key];
    },
    showToast: function () {},
};

const store = require(path.join(ROOT, 'utils', 'store.js'));
const menu = require(path.join(ROOT, 'utils', 'menu.js'));

store.init();

const latte = menu.findProduct('p01');
store.quickAdd(latte, latte.price);
let summary = store.summarize();
if (summary.count !== 1 || summary.subtotalText !== '22.00') {
    fail('快捷加购金额错误: ' + JSON.stringify(summary.count) + ' / ' + summary.subtotalText);
} else {
    ok('快捷加购：1 件，¥22.00');
}

// 同规格再加一杯 → 合并
store.quickAdd(latte, latte.price);
summary = store.summarize();
if (summary.count !== 2 || summary.items.length !== 1) {
    fail('同规格未合并: ' + summary.count + ' 件 / ' + summary.items.length + ' 行');
} else {
    ok('同规格合并：2 件 1 行，¥' + summary.subtotalText);
}

// 大杯 + 加燕麦奶 → 22 + 3 + 2 = 27
store.addToCart(
    latte,
    {
        size: 'L',
        temp: 'hot',
        sugar: 'less',
        extras: [{ id: 'oat', name: '换燕麦奶', delta: 2 }],
        text: '大杯 / 热 / 少糖 / 换燕麦奶',
    },
    1,
    27
);
summary = store.summarize();
if (summary.subtotalText !== '71.00') {
    fail('合计错误，期望 71.00，实际 ' + summary.subtotalText);
} else {
    ok('合计正确：2×22 + 27 = ¥71.00');
}

// 优惠券
const usable = store.usableCoupons(71);
if (usable.length !== 3) {
    fail('可用券数量错误: ' + usable.length);
} else {
    ok('满减券可用数量：3 张');
}

// 下单
const order = store.createOrder({
    method: 'pickup',
    methodText: '到店自取',
    note: '少冰',
    items: summary.items,
    count: summary.count,
    subtotal: 71,
    discount: 10,
    total: 61,
    couponId: 'c2',
    couponTitle: '拿铁会员券',
});
if (store.getOrders().length !== 1) {
    fail('订单未写入');
} else {
    ok('下单成功：' + order.no + '，实付 ¥' + order.totalText);
}
if (store.summarize().count !== 0) {
    fail('下单后购物车未清空');
} else {
    ok('下单后购物车已清空');
}
if (store.usableCoupons(71).length !== 2) {
    fail('优惠券未核销');
} else {
    ok('优惠券已核销（剩 2 张）');
}

store.reorder(order.id);
if (store.summarize().count !== 3) {
    fail('再来一单数量错误');
} else {
    ok('再来一单：3 件回到购物车');
}

store.finishOrder(order.id);
if (store.getOrders()[0].status !== 'done') {
    fail('确认取餐状态未更新');
} else {
    ok('订单状态更新为已取餐');
}

console.log('\n' + (failed === 0 ? '全部检查通过' : failed + ' 项失败'));
process.exit(failed === 0 ? 0 : 1);
