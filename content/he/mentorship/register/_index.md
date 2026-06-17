---
type: "docs"
title: "הרשמה"
slug: "register"
linkTitle: "הרשמה"
weight: 20
---


<div id="register-choice" class="text-center my-4" dir="rtl">
<p class="fs-5 mb-3">בחרו את סוג ההרשמה המתאים לכם:</p>
<button type="button" class="btn btn-primary btn-lg me-2" id="choose-mentee">הרשמה כמנטי</button>
<button type="button" class="btn btn-outline-primary btn-lg" id="choose-mentor">הרשמה כמנטור/ית</button>
</div>

<div id="mentee-form-wrapper" class="d-none" dir="rtl">
<div class="row justify-content-center">
<div class="col-md-7">
<div class="card">
<div class="card-body">
<h3 class="card-title">הרשמה כמנטי</h3>
<p class="text-muted small">שדות המסומנים ב-<span class="text-danger">*</span> הם שדות חובה.</p>
<div id="mentee-message" class="alert d-none" role="alert"></div>
<form id="mentee-register-form">
  <div class="mb-3">
    <label class="form-label">שם מלא <span class="text-danger">*</span></label>
    <input type="text" name="fullName" class="form-control" required>
  </div>
  <div class="mb-3">
    <label class="form-label">אימייל <span class="text-danger">*</span></label>
    <input type="email" name="email" class="form-control" required>
  </div>
  <div class="mb-3">
    <label class="form-label">סיסמה <span class="text-danger">*</span></label>
    <input type="password" name="password" class="form-control" minlength="6" required>
  </div>
  <div class="mb-3">
    <label class="form-label">רמת ניסיון <span class="text-muted">(לא חובה)</span></label>
    <select name="experienceLevel" class="form-select">
      <option value="">אין ניסיון בתכנות</option>
      <option value="מתחיל/ה">מתחיל/ה</option>
      <option value="קצת ניסיון">קצת ניסיון</option>
    </select>
  </div>
  <div class="mb-3">
    <label class="form-label">תחומי עניין <span class="text-danger">*</span></label>
    <input type="text" name="interests" class="form-control" placeholder="לדוגמה: פיתוח Web, נתונים, אבטחה" required>
  </div>
  <div class="mb-3">
    <label class="form-label">מטרות בתהליך המנטורינג <span class="text-muted">(לא חובה)</span></label>
    <textarea name="goals" class="form-control" rows="3" placeholder="לדוגמה: למצוא עבודה ראשונה בתחום"></textarea>
  </div>
  <button type="submit" class="btn btn-primary">הרשמה כמנטי</button>
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
<div class="alert alert-info">כל הפרטים שתספקו יופיעו באתר, למעט כתובת האימייל שלכם</div>
<p class="text-muted small">שדות המסומנים ב-<span class="text-danger">*</span> הם שדות חובה.</p>
<div id="mentor-message" class="alert d-none" role="alert"></div>
<form id="mentor-register-form">
  <div class="mb-3">
    <label class="form-label">שם מלא <span class="text-danger">*</span></label>
    <input type="text" name="fullName" class="form-control" required>
  </div>
  <div class="mb-3">
    <label class="form-label">אימייל <span class="text-danger">*</span></label>
    <input type="email" name="email" class="form-control" required>
  </div>
  <div class="mb-3">
    <label class="form-label">סיסמה <span class="text-danger">*</span></label>
    <input type="password" name="password" class="form-control" minlength="6" required>
  </div>
  <div class="mb-3">
    <label class="form-label">תפקיד נוכחי <span class="text-muted">(לא חובה)</span></label>
    <input type="text" name="currentRole" class="form-control" placeholder="לדוגמה: Backend Developer">
  </div>
  <div class="mb-3">
    <label class="form-label">חברה <span class="text-muted">(לא חובה)</span></label>
    <input type="text" name="company" class="form-control">
  </div>
  <div class="mb-3">
    <label class="form-label">תחומי התמחות <span class="text-danger">*</span></label>
    <input type="text" name="expertise" class="form-control" placeholder="לדוגמה: Python, AWS, מערכות מבוזרות" required>
  </div>
  <div class="mb-3">
    <label class="form-label">שנות ניסיון <span class="text-muted">(לא חובה)</span></label>
    <input type="number" name="yearsExperience" class="form-control" min="0">
  </div>
  <div class="mb-3">
    <label class="form-label">זמינות <span class="text-muted">(לא חובה)</span></label>
    <select name="availability" class="form-select">
      <option value="available">פנוי/ה למנטורינג</option>
      <option value="unavailable">לא פנוי/ה כרגע</option>
    </select>
  </div>
  <div class="mb-3">
    <label class="form-label">קישור לפרופיל LinkedIn <span class="text-danger">*</span></label>
    <input type="url" name="linkedIn" class="form-control" placeholder="https://linkedin.com/in/yourprofile" required>
  </div>
  <div class="mb-3">
    <label class="form-label">קישור לתיאום פגישה (Calendly או שווה ערך) <span class="text-danger">*</span></label>
    <input type="url" name="calendlyUrl" class="form-control" placeholder="https://calendly.com/yourname" required>
  </div>
  <button type="submit" class="btn btn-primary">הרשמה כמנטור/ית</button>
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

<script type="module" src="/js/mentorship/register.js"></script>
