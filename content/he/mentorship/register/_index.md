---
type: "docs"
title: "הרשמה"
slug: "register"
linkTitle: "הרשמה"
weight: 20
---

{{% alert title="🚧 בבנייה" color="warning" %}}
טפסי ההרשמה עדיין לא מחוברים למערכת. זוהי תצוגה מקדימה של השדות שיופיעו.
{{% /alert %}}

<div id="register-choice" class="text-center my-4" dir="rtl">
<p class="fs-5 mb-3">בחרו את סוג ההרשמה המתאים לכם:</p>
<button type="button" class="btn btn-primary btn-lg me-2" id="choose-mentee">הרשמה כמנטי/ה</button>
<button type="button" class="btn btn-outline-primary btn-lg" id="choose-mentor">הרשמה כמנטור/ית</button>
</div>

<div id="mentee-form-wrapper" class="d-none" dir="rtl">
<div class="row justify-content-center">
<div class="col-md-7">
<div class="card">
<div class="card-body">
<h3 class="card-title">הרשמה כמנטי/ה</h3>
<p class="text-muted small">שדות המסומנים ב-<span class="text-danger">*</span> הם שדות חובה.</p>
<form>
  <div class="mb-3">
    <label class="form-label">שם מלא <span class="text-danger">*</span></label>
    <input type="text" class="form-control" required>
  </div>
  <div class="mb-3">
    <label class="form-label">אימייל <span class="text-danger">*</span></label>
    <input type="email" class="form-control" required>
  </div>
  <div class="mb-3">
    <label class="form-label">סיסמה <span class="text-danger">*</span></label>
    <input type="password" class="form-control" required>
  </div>
  <div class="mb-3">
    <label class="form-label">רמת ניסיון <span class="text-muted">(לא חובה)</span></label>
    <select class="form-select">
      <option>אין ניסיון בתכנות</option>
      <option>מתחיל/ה</option>
      <option>קצת ניסיון</option>
    </select>
  </div>
  <div class="mb-3">
    <label class="form-label">תחומי עניין <span class="text-danger">*</span></label>
    <input type="text" class="form-control" placeholder="לדוגמה: פיתוח Web, נתונים, אבטחה" required>
  </div>
  <div class="mb-3">
    <label class="form-label">מטרות בתהליך המנטורינג <span class="text-muted">(לא חובה)</span></label>
    <textarea class="form-control" rows="3" placeholder="לדוגמה: למצוא עבודה ראשונה בתחום"></textarea>
  </div>
  <button type="button" class="btn btn-primary" disabled>הרשמה כמנטי/ה (בקרוב)</button>
  <button type="button" class="btn btn-link" id="back-from-mentee">חזרה לבחירה</button>
</form>
</div>
</div>
</div>
</div>
</div>

<div id="mentor-form-wrapper" class="d-none" dir="rtl">
<div class="row justify-content-center">
<div class="col-md-7">
<div class="card">
<div class="card-body">
<h3 class="card-title">הרשמה כמנטור/ית</h3>
<p class="text-muted small">שדות המסומנים ב-<span class="text-danger">*</span> הם שדות חובה.</p>
<form>
  <div class="mb-3">
    <label class="form-label">שם מלא <span class="text-danger">*</span></label>
    <input type="text" class="form-control" required>
  </div>
  <div class="mb-3">
    <label class="form-label">אימייל <span class="text-danger">*</span></label>
    <input type="email" class="form-control" required>
  </div>
  <div class="mb-3">
    <label class="form-label">סיסמה <span class="text-danger">*</span></label>
    <input type="password" class="form-control" required>
  </div>
  <div class="mb-3">
    <label class="form-label">תפקיד נוכחי <span class="text-muted">(לא חובה)</span></label>
    <input type="text" class="form-control" placeholder="לדוגמה: Backend Developer">
  </div>
  <div class="mb-3">
    <label class="form-label">חברה <span class="text-muted">(לא חובה)</span></label>
    <input type="text" class="form-control">
  </div>
  <div class="mb-3">
    <label class="form-label">תחומי התמחות <span class="text-danger">*</span></label>
    <input type="text" class="form-control" placeholder="לדוגמה: Python, AWS, מערכות מבוזרות" required>
  </div>
  <div class="mb-3">
    <label class="form-label">שנות ניסיון <span class="text-muted">(לא חובה)</span></label>
    <input type="number" class="form-control" min="0">
  </div>
  <div class="mb-3">
    <label class="form-label">זמינות <span class="text-muted">(לא חובה)</span></label>
    <select class="form-select">
      <option>פנוי/ה למנטורינג</option>
      <option>לא פנוי/ה כרגע</option>
    </select>
  </div>
  <button type="button" class="btn btn-primary" disabled>הרשמה כמנטור/ית (בקרוב)</button>
  <button type="button" class="btn btn-link" id="back-from-mentor">חזרה לבחירה</button>
</form>
</div>
</div>
</div>
</div>
</div>

<script>
(function () {
  var choice = document.getElementById('register-choice');
  var menteeForm = document.getElementById('mentee-form-wrapper');
  var mentorForm = document.getElementById('mentor-form-wrapper');

  function showChoice() {
    choice.classList.remove('d-none');
    menteeForm.classList.add('d-none');
    mentorForm.classList.add('d-none');
  }

  function showMentee() {
    choice.classList.add('d-none');
    menteeForm.classList.remove('d-none');
    mentorForm.classList.add('d-none');
  }

  function showMentor() {
    choice.classList.add('d-none');
    mentorForm.classList.remove('d-none');
    menteeForm.classList.add('d-none');
  }

  document.getElementById('choose-mentee').addEventListener('click', showMentee);
  document.getElementById('choose-mentor').addEventListener('click', showMentor);
  document.getElementById('back-from-mentee').addEventListener('click', showChoice);
  document.getElementById('back-from-mentor').addEventListener('click', showChoice);
})();
</script>
