---
type: 'docs'
title: 'מנטורינג'
slug: "mentorship"
linkTitle: 'מנטורינג'
body_class: "no-sidebar"
menu:
  main:
    weight: 10
    identifier: mentorship
cascade:
  body_class: "no-sidebar"
---

<div class="text-center mb-5 mt-3" dir="rtl">
  <h1 class="display-6 mb-2" style="font-weight: 900;">תוכנית המנטורינג של מעקף</h1>
  <p class="text-muted mb-0" style="max-width:640px;margin:0 auto;">פרויקט המנטורים הוא יוזמה קהילתית שמאפשרת למתכנתים בתחילת דרכם לקבל הכוונה, ידע וניסיון ממתכנתים מנוסים. בין אם אתם מחפשים עצה מקצועית, עזרה טכנית, הכנה לראיונות או הכוונה בקריירה – תוכלו לקבוע פגישת מנטורינג אישית עם אחד המנטורים בקהילה ולהפיק מהניסיון שלהם.</p>
</div>

<div id="cta-guest" dir="rtl">
  <div class="row g-3 mb-3">
    <div class="col-md-6">
      <a href="/he/mentorship/register/#mentee" class="text-decoration-none">
        <div class="ms-role-card">
          <span class="ms-role-card__icon">🎓</span>
          <div class="ms-role-card__title">אני מחפש/ת מנטור</div>
          <p class="ms-role-card__desc">הירשמו כמנטי, עיינו בספרייה ושלחו בקשה למנטור/ית שמתאים/ת לכם.</p>
        </div>
      </a>
    </div>
    <div class="col-md-6">
      <a href="/he/mentorship/register/#mentor" class="text-decoration-none">
        <div class="ms-role-card">
          <span class="ms-role-card__icon">🧑‍💻</span>
          <div class="ms-role-card__title">אני רוצה לחנוך</div>
          <p class="ms-role-card__desc">הצטרפו כמנטור/ית, הגדירו את תחומי ההתמחות שלכם וקבלו בקשות מנטורינג.</p>
        </div>
      </a>
    </div>
  </div>
  <p class="text-center text-muted mb-5">כבר יש לכם חשבון? <a href="/he/mentorship/login/">כניסה למערכת</a></p>
</div>

<hr class="mb-4">

<div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2" dir="rtl">
  <h2 class="h5 fw-bold mb-0">ספריית מנטורים</h2>
</div>

<div class="row g-2 mb-4" dir="rtl">
  <div class="col-md-6">
    <input id="dir-search" type="text" class="form-control" placeholder="חיפוש לפי שם, תחום או טכנולוגיה...">
  </div>
  <div class="col-md-3">
    <select id="dir-topic" class="form-select">
      <option value="">תחום: הכל</option>
    </select>
  </div>
  <div class="col-md-3">
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
</content>
