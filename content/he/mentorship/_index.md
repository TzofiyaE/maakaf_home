---
type: 'docs'
title: 'מנטורינג'
slug: "mentorship"
linkTitle: 'מנטורינג'
menu:
  main:
    weight: 10
    identifier: mentorship
---

<div class="alert alert-danger" dir="rtl" role="alert">
  ⚙️ <strong>המערכת נמצאת בשלבי הרצה.</strong> אם נתקלתם בתקלה או שיש לכם הצעה לשיפור, נשמח לקבל את פנייתכם בכתובת: <a href="mailto:maakafsupport@gmail.com" class="alert-link">maakafsupport@gmail.com</a>.
</div>

<div id="cta-guest" class="row mb-5" dir="rtl">
  <div class="col-md-6 mb-3">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">📝 הרשמה</h5>
        <p class="card-text">הירשמו כמנטור/ית או כמנטי כדי להתחיל את התהליך.</p>
        <a href="/he/mentorship/register/" class="btn btn-primary">להרשמה</a>
      </div>
    </div>
  </div>
  <div class="col-md-6 mb-3">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">🔑 התחברות</h5>
        <p class="card-text">כבר נרשמתם? התחברו כדי לראות ולנהל את הבקשות שלכם.</p>
        <a href="/he/mentorship/login/" class="btn btn-outline-primary">להתחברות</a>
      </div>
    </div>
  </div>
</div>

<div id="cta-user" hidden class="mb-5 text-center" dir="rtl">
  <a id="cta-dashboard-link" href="#" class="btn btn-primary btn-lg">לדשבורד שלי</a>
</div>

<hr class="mb-4">

<h4 dir="rtl">ספריית מנטורים</h4>

<div class="row mb-4" dir="rtl">
  <div class="col-md-6 mb-2">
    <input id="dir-search" type="text" class="form-control" placeholder="חיפוש לפי שם, תחום או טכנולוגיה...">
  </div>
  <div class="col-md-3 mb-2">
    <select id="dir-topic" class="form-select">
      <option value="">תחום: הכל</option>
    </select>
  </div>
  <div class="col-md-3 mb-2">
    <select id="dir-avail" class="form-select">
      <option value="">זמינות: הכל</option>
      <option value="available">פנוי/ה למנטורינג</option>
      <option value="unavailable">לא פנוי/ה כרגע</option>
    </select>
  </div>
</div>

<div id="mentor-grid" class="row" dir="rtl"></div>

<script type="module" src="/js/mentorship/mentorship-home.js"></script>
<script type="module" src="/js/mentorship/directory.js"></script>
