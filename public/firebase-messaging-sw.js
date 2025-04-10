importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

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
    console.log(`Browser Type : ${browser}`);
    return { browser, os, device };
}


// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
const deviceType = getDeviceType();
const browserType = getBrowserType();

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
    console.log("백그라운드 메시지 수신:", payload);
    
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 푸쉬 메세지 처리 [ios / web ]
self.addEventListener('push', (event) => {
    if (deviceType === 'ios') {

        console.log('push 메시지 수신:', event.data.text());
        console.log(`DeviceType : ${deviceType}`);

        const pushData = event.data.json();

        const { title, body } = pushData.notification || {};
        const customData = pushData.data ? pushData.data.customData : null;

        const options = {
            body,
            icon: '/logo.png',
            data: { customData },
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});
