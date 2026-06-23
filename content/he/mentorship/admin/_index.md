---
type: "docs"
title: "אדמין"
slug: "admin"
linkTitle: "אדמין"
weight: 70
---

<p class="lead my-3" dir="rtl">דף זה מיועד למנהל הקהילה בלבד.</p>

<div id="admin-auth-section" dir="rtl">

<div id="admin-choice" class="mb-4">
  <button type="button" class="btn btn-primary btn-lg me-2" id="choose-register">הרשם כמנהל</button>
  <button type="button" class="btn btn-outline-primary btn-lg" id="choose-login">התחבר כמנהל</button>
</div>

<div id="admin-register-wrapper" class="row d-none">
<div class="col-md-6">
<div class="card">
<div class="card-body">
<h4 class="card-title">הרשמה כמנהל</h4>
<div id="admin-register-msg" class="alert d-none" role="alert"></div>
<form id="admin-register-form">
  <div class="mb-3">
    <label class="form-label">שם מלא</label>
    <input type="text" name="fullName" class="form-control" required>
  </div>
  <div class="mb-3">
    <label class="form-label">אימייל</label>
    <input type="email" name="email" class="form-control" required>
  </div>
  <div class="mb-3">
    <label class="form-label">סיסמה</label>
    <input type="password" name="password" class="form-control" minlength="6" required>
  </div>
  <button type="submit" id="register-submit" class="btn btn-primary">הרשמה</button>
  <button type="button" class="btn btn-link" id="back-from-register">חזרה</button>
</form>
</div>
</div>
</div>
</div>

<div id="admin-login-wrapper" class="row d-none">
<div class="col-md-6">
<div class="card">
<div class="card-body">
<h4 class="card-title">כניסה כמנהל</h4>
<div id="admin-login-msg" class="alert d-none" role="alert"></div>
<form id="admin-login-form">
  <div class="mb-3">
    <label class="form-label">אימייל</label>
    <input type="email" name="email" class="form-control" required>
  </div>
  <div class="mb-3">
    <label class="form-label">סיסמה</label>
    <input type="password" name="password" class="form-control" required>
  </div>
  <button type="submit" id="login-submit" class="btn btn-primary">כניסה</button>
  <button type="button" class="btn btn-link" id="back-from-login">חזרה</button>
</form>
</div>
</div>
</div>
</div>

</div>

<hr class="my-4">

<div id="admin-status"></div>

<div id="admin-content" hidden>

סטטיסטיקות כלליות:

<div class="row text-center mb-4" dir="rtl">
<div class="col-md-3 mb-3">
  <div class="card"><div class="card-body">
    <h2 id="stat-mentors">—</h2>
    <p class="mb-0">מנטורים רשומים</p>
  </div></div>
</div>
<div class="col-md-3 mb-3">
  <div class="card"><div class="card-body">
    <h2 id="stat-mentees">—</h2>
    <p class="mb-0">מנטים רשומים</p>
  </div></div>
</div>
<div class="col-md-3 mb-3">
  <div class="card"><div class="card-body">
    <h2 id="stat-requests">—</h2>
    <p class="mb-0">בקשות מנטורינג</p>
  </div></div>
</div>
<div class="col-md-3 mb-3">
  <div class="card"><div class="card-body">
    <h2 id="stat-rate">—</h2>
    <p class="mb-0">אחוז בקשות שנענו</p>
  </div></div>
</div>
</div>

פילוח בקשות לפי סטטוס:

<div class="table-responsive" dir="rtl">
<table class="table table-striped">
<thead>
<tr><th>סטטוס</th><th>כמות</th></tr>
</thead>
<tbody id="admin-status-tbody"></tbody>
</table>
</div>

</div>

<script type="module" src="/js/mentorship/admin.js"></script>
