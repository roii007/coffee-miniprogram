function money(value) {
    const n = Number(value) || 0;
    return (Math.round(n * 100) / 100).toFixed(2);
}

function pad(n) {
    return n < 10 ? '0' + n : '' + n;
}

function timeText(timestamp) {
    const d = new Date(timestamp);
    return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function orderNo(timestamp) {
    const d = new Date(timestamp);
    return (
        '' +
        d.getFullYear() +
        pad(d.getMonth() + 1) +
        pad(d.getDate()) +
        pad(d.getHours()) +
        pad(d.getMinutes()) +
        pad(d.getSeconds())
    );
}

module.exports = {
    money: money,
    timeText: timeText,
    orderNo: orderNo,
};
