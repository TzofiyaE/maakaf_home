---
type: "docs"
title: "בקשת מנטורינג"
slug: "request"
linkTitle: "בקשת מנטורינג"
weight: 40
---

שליחת בקשת מנטורינג למנטור/ית שבחרתם מתוך [ספריית המנטורים](/he/mentorship/).

<div id="req-status"></div>

<div id="req-form" class="row" dir="rtl">
<div class="col-md-7">
  <div class="mb-3">
    <label class="form-label">מנטור/ית</label>
    <input id="req-mentor-name" type="text" class="form-control" disabled>
  </div>
  <div class="mb-3">
    <label class="form-label">נושא הבקשה <span class="text-danger">*</span></label>
    <input id="req-topic" type="text" class="form-control" placeholder="לדוגמה: הכנה לראיון עבודה">
  </div>
  <div class="mb-3">
    <label class="form-label">תיאור קצר</label>
    <textarea id="req-description" class="form-control" rows="4" placeholder="ספרו בכמה מילים מה הייתם רוצים לקבל מהשיחה"></textarea>
  </div>

  <div class="card mb-3 border-info">
    <div class="card-header bg-info bg-opacity-10 fw-bold">הפרופיל שלך — המנטור/ית יוכל/תוכל לצפות בפרטים אלו</div>
    <div id="req-profile-preview" class="card-body">
      <div class="text-muted small">טוען פרטי פרופיל...</div>
    </div>
  </div>

  <div class="mb-3 form-check">
    <input type="checkbox" class="form-check-input" id="req-consent">
    <label class="form-check-label" for="req-consent">
      אני מאשר/ת שהמנטור/ית יוכל/תוכל לצפות בפרטי הפרופיל שלי
    </label>
  </div>

  <button id="req-submit" type="button" class="btn btn-primary" disabled>שליחת בקשה</button>
</div>
</div>

<script type="module" src="/js/mentorship/request.js"></script>
