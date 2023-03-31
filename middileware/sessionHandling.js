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
