const jwt = require('jsonwebtoken');

exports.isUserLoggedIn = (req, res, next) => {
  const token = req.cookies.token;
  console.log(`token 있어요. ${token}`);
  if (token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);    
    return next();
  } catch (err) {
    console.error('JWT 토큰 만료');
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });
    return res.redirect('/user/login');
  }
};

exports.isNotUserLoggedIn = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {    
    return next();
  }

  try {    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return res.status(400).json({
      message: '로그인한 상태에서 해당 페이지에 접근할 수 없습니다',
      redirect: '/user/login'
    });
  } catch (err) {
    console.error('JWT 토큰 만료');
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });
    return res.redirect('/user/login');
  }
}

exports.isParentLoggedIn = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    console.error('JWT 토큰 만료');
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });
    return res.redirect('/parent/login');
  }
};

exports.isNotParentLoggedIn = (req, res, next) => {
  const token = req.cookies.token;
  console.log(`token: ${token}`);
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return res.status(400).json({
      message: '로그인한 상태에서 해당 페이지에 접근할 수 없습니다',
      redirect: '/parent/login'
    });

  } catch (err) {
    console.error('JWT 토큰 만료');
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });
    return res.redirect('/parent/login');
  }
}

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
  });
  res.status(200).send("쿠키 제거 완료");
};

exports.kakaoAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() && req.user.provider === 'kakao') {
    return next();
  } else {
    const message = encodeURIComponent('로그인이 필요합니다');
    res.redirect('/');
  }
}
