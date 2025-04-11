const firebaseConfig = {
    apiKey: "AIzaSyAitCN0a0Ch9ULRvBSmgujhT_GTmWcKKww",
    authDomain: "class-management-f7f10.firebaseapp.com",
    projectId: "class-management-f7f10",
    storageBucket: "class-management-f7f10.firebasestorage.app",
    messagingSenderId: "97667343399",
    appId: "1:97667343399:web:9285d6d7ba07d3bc865a02",
    measurementId: "G-81EKHKKHKP",
    vapidKey: "BFJzmMTwkGJm1JarI6GAiZX5m7D8Jf77N5Bvyy9CXnSIBtO403zgZ8HMYz3GADZW2vTTZ4Q8u4y07fa_Uy4UazU"
}

// Firebase 초기화
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 디바이스 유형 + 브라우저 유형
const deviceType = getDeviceType();
const browserType = getBrowserType();


// 디바이스 유형
function getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
        return 'ios';
    } else if (/android/.test(userAgent)) {
        return 'android';
    } else {
        return 'web';
    }
}

// 브라우저 유형
function getBrowserType() {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    let os = "Unknown";
    let device = "Desktop";

    // 브라우저 판별
    if (ua.includes("Chrome") && !ua.includes("Edg") && !ua.includes("Opera")) {
        browser = "Chrome";
    } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
        browser = "Safari";
    } else if (ua.includes("Firefox")) {
        browser = "Firefox";
    } else if (ua.includes("Edg")) {
        browser = "Edge";
    } else if (ua.includes("Opera") || ua.includes("OPR")) {
        browser = "Opera";
    }

    // OS 판별
    if (ua.includes("Win")) {
        os = "Windows";
    } else if (ua.includes("Mac")) {
        os = "MacOS";
    } else if (ua.includes("Linux")) {
        os = "Linux";
    } else if (ua.includes("Android")) {
        os = "Android";
        device = "Mobile";
    } else if (ua.includes("iPhone") || ua.includes("iPad")) {
        os = "iOS";
        device = "Mobile";
    }
    return browser;
}

// PWA 환경 확인
function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// 서비스 워커 등록
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

            return registration;
        } catch (error) {
            console.error('서비스 워커 등록 실패:', error);
        }
    }
    return null;
}

// FCM 토큰 요청 및 서버 전송
async function requestPermissionAndGetToken() {
    try {
        const deviceType = getDeviceType();
        const browserType = getBrowserType();
        const token = await messaging.getToken({
            vapidKey: firebaseConfig.vapidKey
        });

        if (token) {            
            sendTokenToServer(token, deviceType, browserType);
        } else {
            console.log('토큰을 생성할 수 없습니다.');
        }
    } catch (error) {
        console.error('토큰 생성 실패:', error);
    }
}

// 서버로 토큰 전송 함수
function sendTokenToServer(token, platform, browserType) {
    fetch('/notification/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, platform, browserType }),
        credentials: 'include',
    })
        .then(response => response.json())
        .then(data => console.log('토큰 저장 성공:', data))
        .catch(error => console.error('토큰 저장 실패:', error));
}

// 실행 로직
window.addEventListener('load', async () => {
    const registration = await registerServiceWorker();
    if (registration) {
        console.log('서비스 워커가 등록되었습니다');
        if (registerServiceWorker) {
            await requestPermissionAndGetToken();

            const token = await messaging.getToken({
                vapidKey: firebaseConfig.vapidKey
            });

            const option = {
                userVisibleOnly: true,
                applicationServerKey: "BFJzmMTwkGJm1JarI6GAiZX5m7D8Jf77N5Bvyy9CXnSIBtO403zgZ8HMYz3GADZW2vTTZ4Q8u4y07fa_Uy4UazU",
            }

            navigator.serviceWorker.ready
                .then(registration => {
                    registration.pushManager.subscribe(option).then(subscription => {
                    })
                })

        } else {
            console.log('서비스 워커 등록을 실패하였습니다');
        }
    }
});