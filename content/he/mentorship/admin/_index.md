---
type: "docs"
title: "אדמין"
slug: "admin"
linkTitle: "אדמין"
weight: 70
---

<div id="admin-auth" dir="rtl">
<div class="admin-auth-card">
<h2 class="admin-auth-card__title">כניסה למערכת ניהול</h2>
<div id="admin-auth-msg" class="alert d-none mb-3" role="alert"></div>
<form id="admin-login-form">
  <div class="mb-3">
    <label class="form-label">אימייל</label>
    <input type="email" name="email" class="form-control" required autofocus>
  </div>
  <div class="mb-3">
    <label class="form-label">סיסמה</label>
    <input type="password" name="password" class="form-control" required>
  </div>
  <button type="submit" id="login-submit" class="btn btn-primary w-100">כניסה</button>
</form>
<form id="admin-register-form" hidden>
  <hr class="my-4">
  <p class="small text-muted mb-3">החשבון ייווצר במצב ממתין לאישור מנהל המערכת.</p>
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
  <button type="submit" id="register-submit" class="btn btn-outline-primary w-100">רישום</button>
  <button type="button" id="cancel-register" class="btn btn-link w-100 mt-1 small">ביטול</button>
</form>
<p class="admin-auth-card__footer" id="register-toggle-wrap">
  <a href="#" id="show-register">רישום מנהל חדש</a>
</p>
</div>
</div>

<div id="admin-dashboard" hidden dir="rtl">
<div class="ms-page-header">
  <h1 class="ms-page-header__title">לוח בקרה</h1>
  <button id="admin-logout" class="ms-auth-bar__logout">התנתקות</button>
</div>
<div class="row g-3 mb-4">
  <div class="col-6 col-lg">
    <div class="admin-stat">
      <div class="admin-stat__value" id="stat-mentors">—</div>
      <div class="admin-stat__label">מנטורים</div>
    </div>
  </div>
  <div class="col-6 col-lg">
    <div class="admin-stat">
      <div class="admin-stat__value" id="stat-mentees">—</div>
      <div class="admin-stat__label">מנטים</div>
    </div>
  </div>
  <div class="col-6 col-lg">
    <div class="admin-stat">
      <div class="admin-stat__value" id="stat-requests">—</div>
      <div class="admin-stat__label">סה״כ בקשות</div>
    </div>
  </div>
  <div class="col-6 col-lg">
    <div class="admin-stat">
      <div class="admin-stat__value admin-stat__value--warn" id="stat-open">—</div>
      <div class="admin-stat__label">ממתינות לטיפול</div>
    </div>
  </div>
  <div class="col-6 col-lg">
    <div class="admin-stat">
      <div class="admin-stat__value admin-stat__value--success" id="stat-rate">—</div>
      <div class="admin-stat__label">אחוז מענה</div>
    </div>
  </div>
</div>
<ul class="nav nav-tabs mb-0" id="admin-tabs">
  <li class="nav-item">
    <button class="nav-link active" data-target="tab-requests">בקשות</button>
  </li>
  <li class="nav-item">
    <button class="nav-link" data-target="tab-mentors">מנטורים</button>
  </li>
  <li class="nav-item">
    <button class="nav-link" data-target="tab-mentees">מנטים</button>
  </li>
</ul>
<div class="admin-panel">
  <div id="tab-requests">
    <div class="admin-filter-bar">
      <input type="text" id="req-search" class="form-control form-control-sm admin-filter-bar__search" placeholder="חיפוש לפי שם מנטור, מנטי או נושא...">
      <select id="req-status-filter" class="form-select form-select-sm admin-filter-bar__select">
        <option value="">כל הסטטוסים</option>
        <option value="pending">בהמתנה</option>
        <option value="needs_info">דורש פרטים</option>
        <option value="approved">אושרה</option>
        <option value="rejected">נדחתה</option>
        <option value="completed">הושלמה</option>
        <option value="canceled">בוטלה</option>
      </select>
      <span id="req-stale-alert" class="badge bg-warning text-dark d-none" style="margin-inline-start:auto"></span>
    </div>
    <div class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>מנטור/ית</th>
            <th>מנטי/ת</th>
            <th>נושא</th>
            <th>סטטוס</th>
            <th>תאריך יצירה</th>
            <th>ימים</th>
          </tr>
        </thead>
        <tbody id="admin-requests-tbody">
          <tr><td colspan="6" class="text-center text-muted py-4">טוען...</td></tr>
        </tbody>
      </table>
    </div>
    <p class="small text-muted mt-2 mb-0">שורות מסומנות בצהוב = ממתינות מעל 5 ימים.</p>
  </div>
  <div id="tab-mentors" hidden>
    <div class="admin-filter-bar">
      <input type="text" id="mentor-search" class="form-control form-control-sm admin-filter-bar__search" placeholder="חיפוש לפי שם, אימייל או תחום...">
    </div>
    <div class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>שם מלא</th>
            <th>אימייל</th>
            <th>תפקיד / חברה</th>
            <th>תחומי התמחות</th>
            <th>זמינות</th>
            <th>הצטרפות</th>
          </tr>
        </thead>
        <tbody id="admin-mentors-tbody">
          <tr><td colspan="6" class="text-center text-muted py-4">טוען...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
  <div id="tab-mentees" hidden>
    <div class="admin-filter-bar">
      <input type="text" id="mentee-search" class="form-control form-control-sm admin-filter-bar__search" placeholder="חיפוש לפי שם, אימייל או תחום עניין...">
    </div>
    <div class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>שם מלא</th>
            <th>אימייל</th>
            <th>רמת ניסיון</th>
            <th>תחומי עניין</th>
            <th>מטרות</th>
            <th>הצטרפות</th>
          </tr>
        </thead>
        <tbody id="admin-mentees-tbody">
          <tr><td colspan="6" class="text-center text-muted py-4">טוען...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</div>

<script type="module" src="/js/mentorship/admin.js"></script>
