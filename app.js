const store = require('./utils/store.js');

App({
    globalData: {
        appName: '拾光咖啡',
        version: '1.0.0',
    },

    onLaunch() {
        store.init();
    },
});
