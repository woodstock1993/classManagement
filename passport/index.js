const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');

module.exports = () => {
    local();
    kakao();
}