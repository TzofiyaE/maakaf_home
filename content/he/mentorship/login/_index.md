---
type: "docs"
title: "התחברות"
slug: "login"
linkTitle: "התחברות"
weight: 30
---

<div class="row justify-content-center" dir="rtl">
<div class="col-md-5">

<div id="login-form-wrapper">
<div class="card border-0 shadow-sm">
<div class="card-body p-4">
<h3 class="card-title mb-4">כניסה למערכת</h3>
<div id="login-message" class="alert d-none" role="alert"></div>
<form id="login-form">
  <div class="mb-3">
    <label class="form-label">אימייל</label>
    <input type="email" name="email" class="form-control" required>
  </div>
  <div class="mb-4">
    <label class="form-label">סיסמה</label>
    <input type="password" name="password" class="form-control" required>
  </div>
  <button type="submit" class="btn btn-primary w-100">כניסה</button>
</form>
<hr class="my-3">
<p class="text-center small mb-1"><a href="#" id="forgot-password-link">שכחתי סיסמה</a></p>
<p class="text-center small mb-0">אין לכם חשבון? <a href="/he/mentorship/register/">הרשמה כאן</a></p>
</div>
</div>
</div>

<div id="forgot-password-form-wrapper" class="d-none">
<div class="card border-0 shadow-sm">
<div class="card-body p-4">
<h5 class="mb-3">איפוס סיסמה</h5>
<div id="forgot-password-message" class="alert d-none" role="alert"></div>
<form id="forgot-password-form">
  <div class="mb-3">
    <label class="form-label">אימייל</label>
    <input type="email" id="forgot-email-input" name="email" class="form-control" required>
  </div>
  <button type="submit" class="btn btn-primary w-100">שליחת קישור לאיפוס</button>
</form>
<p class="text-center small mt-3 mb-0"><a href="#" id="back-from-forgot">חזרה להתחברות</a></p>
</div>
</div>
</div>

<div id="forgot-password-sent" class="d-none">
<div class="card border-0 shadow-sm">
<div class="card-body p-4 text-center">
<div style="font-size:40px;margin-bottom:12px;">✉️</div>
<h5 class="mb-2">בדקו את תיבת הדואר</h5>
<p class="text-muted small mb-3">שלחנו קישור לאיפוס סיסמה לכתובת <strong id="reset-email-display"></strong>.</p>
<p class="text-muted small mb-3">לא קיבלתם? בדקו את תיקיית הספאם, או לחצו לשליחה מחדש.</p>
<button class="btn btn-outline-secondary btn-sm" id="resend-btn">שליחה מחדש</button>
<span id="resend-countdown" class="text-muted me-2 d-none" style="font-size:13px;"></span>
<p class="mt-3 small mb-0"><a href="#" id="back-to-login-from-sent">חזרה להתחברות</a></p>
</div>
</div>
</div>

<div id="verify-email-wrapper" class="d-none">
<div class="card border-0 shadow-sm">
<div class="card-body p-4 text-center">
<div style="font-size:40px;margin-bottom:12px;">✉️</div>
<h5 class="mb-2">הכנס/י את קוד האימות</h5>
<p class="text-muted small mb-1">שלחנו קוד בן 6 ספרות אל</p>
<p class="fw-semibold mb-3" id="verify-email-display"></p>
<input id="verify-code-input" type="text" inputmode="numeric" maxlength="6" autocomplete="one-time-code" class="form-control form-control-lg text-center mb-2" style="letter-spacing:8px;font-size:1.5rem;max-width:200px;margin:0 auto 12px;" placeholder="------">
<p id="verify-code-error" class="text-danger small d-none mb-2"></p>
<button id="verify-submit-btn" type="button" class="btn btn-primary w-100 mb-3">אמת/י</button>
<button class="btn btn-link btn-sm mb-1" id="verify-resend-btn">שלח/י קוד חדש</button>
<span id="verify-resend-countdown" class="text-muted d-none" style="font-size:13px;"></span>
<p class="mt-2 small mb-0"><a href="#" id="back-to-login-from-verify">חזרה להתחברות</a></p>
</div>
</div>
</div>

</div>
</div>

<script type="module" src="/js/mentorship/login.js"></script>
</content>
