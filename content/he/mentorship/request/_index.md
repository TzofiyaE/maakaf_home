---
type: "docs"
title: "בקשת מנטורינג"
slug: "request"
linkTitle: "בקשת מנטורינג"
weight: 40
---

<div id="req-status"></div>

<div id="req-form" dir="rtl">
<div class="row justify-content-center">
<div class="col-md-7">

<div class="card border-0 shadow-sm">
<div class="card-body p-4">

<h3 class="card-title mb-1">שליחת בקשת מנטורינג</h3>
<p class="text-muted small mb-4">בקשה תישלח למנטור/ית שבחרתם מתוך <a href="/he/mentorship/">ספריית המנטורים</a>.</p>

<div class="mb-3">
  <label class="form-label">מנטור/ית</label>
  <input id="req-mentor-name" type="text" class="form-control" disabled>
</div>
<div class="mb-3">
  <label class="form-label">נושא הבקשה <span class="text-danger">*</span></label>
  <input id="req-topic" type="text" class="form-control" placeholder="לדוגמה: הכנה לראיון עבודה">
</div>
<div class="mb-3">
  <label class="form-label">תיאור קצר <span class="text-muted">(לא חובה)</span></label>
  <textarea id="req-description" class="form-control" rows="4" placeholder="ספרו בכמה מילים מה הייתם רוצים לקבל מהשיחה"></textarea>
</div>

<div class="card mb-3 border-info">
  <div class="card-header bg-info bg-opacity-10 fw-bold small">הפרופיל שלך — המנטור/ית יוכל/תוכל לצפות בפרטים אלו</div>
  <div id="req-profile-preview" class="card-body small">
    <div class="text-muted">טוען פרטי פרופיל...</div>
  </div>
</div>

<div class="mb-4 form-check">
  <input type="checkbox" class="form-check-input" id="req-consent">
  <label class="form-check-label small" for="req-consent">
    אני מאשר/ת שהמנטור/ית יוכל/תוכל לצפות בפרטי הפרופיל שלי
  </label>
</div>

<button id="req-submit" type="button" class="btn btn-primary" disabled>שליחת בקשה</button>

</div>
</div>

</div>
</div>
</div>

<script type="module" src="/js/mentorship/request.js"></script>
</content>
