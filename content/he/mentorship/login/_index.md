---
type: "docs"
title: "התחברות"
slug: "login"
linkTitle: "התחברות"
weight: 30
---

<div id="login-choice" class="text-center my-4" dir="rtl">
  <p class="fs-5 mb-3">בחרו את סוג ההתחברות המתאימה לכם:</p>
  <button type="button" class="btn btn-primary btn-lg me-2" id="choose-mentee">התחברות כמנטי</button>
  <button type="button" class="btn btn-outline-primary btn-lg" id="choose-mentor">התחברות כמנטור/ית</button>
</div>

<div id="login-form-wrapper" class="d-none" dir="rtl">
<div class="row">
<div class="col-md-5">
<div id="login-message" class="alert d-none" role="alert"></div>
<form id="login-form">
  <div class="mb-3">
    <label class="form-label">אימייל</label>
    <input type="email" name="email" class="form-control" required>
  </div>
  <div class="mb-3">
    <label class="form-label">סיסמה</label>
    <input type="password" name="password" class="form-control" required>
  </div>
  <button type="submit" class="btn btn-primary">התחברות</button>
  <button type="button" class="btn btn-link" id="back-from-login">חזרה לבחירה</button>
</form>
<p class="mt-2"><a href="#" id="forgot-password-link">שכחתי סיסמה</a></p>
<p class="mt-1">אין לכם חשבון? <a href="/he/mentorship/register/">הירשמו כאן</a>.</p>
</div>
</div>
</div>

<div id="forgot-password-form-wrapper" class="d-none" dir="rtl">
<div class="row"><div class="col-md-5">
  <h5 class="mb-3">איפוס סיסמה</h5>
  <div id="forgot-password-message" class="alert d-none" role="alert"></div>
  <form id="forgot-password-form">
    <div class="mb-3">
      <label class="form-label">אימייל</label>
      <input type="email" id="forgot-email-input" name="email" class="form-control" required>
    </div>
    <button type="submit" class="btn btn-primary">שליחת קישור לאיפוס</button>
    <button type="button" class="btn btn-link" id="back-from-forgot">חזרה להתחברות</button>
  </form>
</div></div>
</div>

<div id="forgot-password-sent" class="d-none" dir="rtl">
<div class="row"><div class="col-md-5">
  <h5>בדקו את תיבת הדואר שלכם ✉️</h5>
  <p>שלחנו קישור לאיפוס סיסמה לכתובת <strong id="reset-email-display"></strong>.</p>
  <p class="text-muted" style="font-size:13px;">לא קיבלתם? בדקו את תיקיית הספאם, או לחצו לשליחה מחדש.</p>
  <button class="btn btn-outline-secondary btn-sm" id="resend-btn">שליחה מחדש</button>
  <span id="resend-countdown" class="text-muted me-2 d-none" style="font-size:13px;"></span>
  <p class="mt-3"><a href="#" id="back-to-login-from-sent">זכרתם/שינתם את הסיסמה? חזרה להתחברות</a></p>
</div></div>
</div>

<div id="verify-email-wrapper" class="d-none" dir="rtl">
<div class="row"><div class="col-md-5">
  <h5>בדקו את תיבת הדואר שלכם ✉️</h5>
  <p>שלחנו קישור לאימות לכתובת <strong id="verify-email-display"></strong>.</p>
  <p class="text-muted" style="font-size:13px;">לא קיבלתם? בדקו את תיקיית הספאם, או לחצו לשליחה מחדש.</p>
  <button class="btn btn-outline-secondary btn-sm" id="verify-resend-btn">שליחה מחדש</button>
  <span id="verify-resend-countdown" class="text-muted me-2 d-none" style="font-size:13px;"></span>
  <p class="mt-3"><a href="#" id="back-to-login-from-verify">חזרה להתחברות</a></p>
</div></div>
</div>

<script type="module" src="/js/mentorship/login.js"></script>
