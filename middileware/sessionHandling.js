export function isLoggedIn(req, res, next) {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    next();
  }
}
export function isUser(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/");
  }
}

export function isloggedInad(req, res, next) {
  if (req.session.loggedInad) {
    req.admin = req.session.admin;
    next();
  } else {
    res.redirect('/admin/login');
  }
}
