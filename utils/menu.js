const categories = [
    { id: 'hot', name: '招牌推荐' },
    { id: 'latte', name: '拿铁系列' },
    { id: 'black', name: '黑咖纯粹' },
    { id: 'special', name: '季节特调' },
    { id: 'tea', name: '轻茶饮' },
    { id: 'dessert', name: '烘焙甜点' },
];

const sizeOptions = [
    { id: 'M', name: '中杯', note: '360ml', delta: 0 },
    { id: 'L', name: '大杯', note: '480ml', delta: 3 },
];

const tempOptions = [
    { id: 'ice', name: '冰', delta: 0 },
    { id: 'hot', name: '热', delta: 0 },
];

const sugarOptions = [
    { id: 'std', name: '标准糖', delta: 0 },
    { id: 'less', name: '少糖', delta: 0 },
    { id: 'none', name: '无糖', delta: 0 },
];

const extraOptions = [
    { id: 'oat', name: '换燕麦奶', delta: 2 },
    { id: 'shot', name: '加一份浓缩', delta: 3 },
    { id: 'cream', name: '加淡奶油', delta: 4 },
];

const products = [
    {
        id: 'p01',
        name: '生椰拿铁',
        sub: 'Coconut Latte',
        cat: 'hot',
        price: 22,
        tag: '销冠',
        badge: '椰',
        tone: 't1',
        desc: '冷压椰乳撞上双份意式浓缩，椰香绵密不腻口。',
        specType: 'drink',
    },
    {
        id: 'p02',
        name: '黑糖珍珠拿铁',
        sub: 'Brown Sugar Latte',
        cat: 'hot',
        price: 24,
        tag: '人气',
        badge: '珠',
        tone: 't2',
        desc: '现煮黑糖珍珠挂壁，趁热吸一口最满足。',
        specType: 'drink',
    },
    {
        id: 'p03',
        name: '燕麦冷萃',
        sub: 'Oat Cold Brew',
        cat: 'hot',
        price: 26,
        tag: '低负担',
        badge: '燕',
        tone: 't3',
        desc: '12 小时慢萃，燕麦奶收尾，清爽带回甘。',
        specType: 'drink',
    },
    {
        id: 'p04',
        name: '经典拿铁',
        sub: 'Caffe Latte',
        cat: 'latte',
        price: 20,
        tag: '',
        badge: '拿',
        tone: 't1',
        desc: '每日现磨拼配豆，奶泡细腻，稳定不出错的选择。',
        specType: 'drink',
    },
    {
        id: 'p05',
        name: '香草拿铁',
        sub: 'Vanilla Latte',
        cat: 'latte',
        price: 22,
        tag: '',
        badge: '香',
        tone: 't2',
        desc: '马达加斯加香草糖浆，甜香柔和。',
        specType: 'drink',
    },
    {
        id: 'p06',
        name: '抹茶拿铁',
        sub: 'Matcha Latte',
        cat: 'latte',
        price: 24,
        tag: '无咖啡因',
        badge: '抹',
        tone: 't3',
        desc: '宇治抹茶石磨细粉，微苦回甘。',
        specType: 'drink',
    },
    {
        id: 'p07',
        name: '美式咖啡',
        sub: 'Americano',
        cat: 'black',
        price: 16,
        tag: '',
        badge: '美',
        tone: 't4',
        desc: '坚果与可可调性，口感干净利落。',
        specType: 'drink',
    },
    {
        id: 'p08',
        name: '冷萃黑咖',
        sub: 'Cold Brew Black',
        cat: 'black',
        price: 20,
        tag: '',
        badge: '冷',
        tone: 't4',
        desc: '低温慢萃 12 小时，酸度更低。',
        specType: 'drink',
    },
    {
        id: 'p09',
        name: '气泡冰美式',
        sub: 'Sparkling Americano',
        cat: 'black',
        price: 18,
        tag: '夏日限定',
        badge: '泡',
        tone: 't5',
        desc: '气泡水冲开浓缩，一口透心凉。',
        specType: 'drink',
    },
    {
        id: 'p10',
        name: '桂花酒酿拿铁',
        sub: 'Osmanthus Latte',
        cat: 'special',
        price: 26,
        tag: '秋季新品',
        badge: '桂',
        tone: 't5',
        desc: '糖桂花加米酒酿，甜香里带一点点酒气。',
        specType: 'drink',
    },
    {
        id: 'p11',
        name: '咸奶盖拿铁',
        sub: 'Salted Cream Latte',
        cat: 'special',
        price: 26,
        tag: '',
        badge: '咸',
        tone: 't1',
        desc: '海盐芝士奶盖厚厚一层，先舔后喝。',
        specType: 'drink',
    },
    {
        id: 'p12',
        name: '橙 C 美式',
        sub: 'Orange Americano',
        cat: 'special',
        price: 22,
        tag: '',
        badge: '橙',
        tone: 't5',
        desc: '鲜榨橙汁配浓缩，酸甜平衡。',
        specType: 'drink',
    },
    {
        id: 'p13',
        name: '蜜桃乌龙',
        sub: 'Peach Oolong',
        cat: 'tea',
        price: 18,
        tag: '无咖啡因',
        badge: '桃',
        tone: 't3',
        desc: '炭焙乌龙打底，蜜桃果肉沉底。',
        specType: 'drink',
    },
    {
        id: 'p14',
        name: '茉莉初雪',
        sub: 'Jasmine Snow',
        cat: 'tea',
        price: 18,
        tag: '',
        badge: '茉',
        tone: 't3',
        desc: '茉莉绿茶配奶盖，清清爽爽一杯。',
        specType: 'drink',
    },
    {
        id: 'p15',
        name: '提拉米苏',
        sub: 'Tiramisu',
        cat: 'dessert',
        price: 26,
        tag: '',
        badge: '提',
        tone: 't6',
        desc: '手指饼浸满浓缩，马斯卡彭打得很轻。',
        specType: 'dessert',
    },
    {
        id: 'p16',
        name: '黄油可颂',
        sub: 'Butter Croissant',
        cat: 'dessert',
        price: 16,
        tag: '现烤',
        badge: '可',
        tone: 't6',
        desc: '每天两炉，起酥层层分明。',
        specType: 'dessert',
    },
    {
        id: 'p17',
        name: '芝士贝果',
        sub: 'Cheese Bagel',
        cat: 'dessert',
        price: 20,
        tag: '',
        badge: '贝',
        tone: 't6',
        desc: '嚼劲足的贝果夹厚芝士片。',
        specType: 'dessert',
    },
];

const storeInfo = {
    name: '拾光咖啡 · 中山路店',
    address: '中山路 88 号 1 层（地铁 2 号线 B 口）',
    distance: '320m',
    status: '营业中',
    hours: '08:00 - 21:30',
    pickupWait: 12,
    table: 'A 区 06 号桌',
};

module.exports = {
    categories: categories,
    products: products,
    sizeOptions: sizeOptions,
    tempOptions: tempOptions,
    sugarOptions: sugarOptions,
    extraOptions: extraOptions,
    storeInfo: storeInfo,
    findProduct: function (id) {
        for (let i = 0; i < products.length; i++) {
            if (products[i].id === id) {
                return products[i];
            }
        }
        return null;
    },
    byCategory: function (cat) {
        if (!cat) {
            return products.slice();
        }
        return products.filter(function (item) {
            return item.cat === cat;
        });
    },
};
