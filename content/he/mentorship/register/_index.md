---
type: "docs"
title: "הרשמה"
slug: "register"
linkTitle: "הרשמה"
weight: 20
---

<div id="register-choice" dir="rtl">
  <p class="text-muted mb-4 text-center">בחרו את סוג ההרשמה המתאים לכם:</p>
  <div class="row g-3 mb-3">
    <div class="col-md-6">
      <div class="ms-role-card" id="choose-mentee" role="button" tabindex="0">
        <span class="ms-role-card__icon">🎓</span>
        <div class="ms-role-card__title">הרשמה כמנטי</div>
        <p class="ms-role-card__desc">מחפשים מנטור שיעזור לכם להתפתח, לקבל כיוון ולהתחיל בקריירה בפיתוח.</p>
      </div>
    </div>
    <div class="col-md-6">
      <div class="ms-role-card" id="choose-mentor" role="button" tabindex="0">
        <span class="ms-role-card__icon">🧑‍💻</span>
        <div class="ms-role-card__title">הרשמה כמנטור/ית</div>
        <p class="ms-role-card__desc">יש לכם ניסיון בתעשייה ורוצים לתת לקהילה? פתחו את היומן שלכם לפניות.</p>
      </div>
    </div>
  </div>
  <p class="text-center text-muted small">כבר יש לכם חשבון? <a href="/he/mentorship/login/">כניסה למערכת</a></p>
</div>

<div id="mentee-form-wrapper" class="d-none" dir="rtl">
<div class="row justify-content-center">
<div class="col-md-7">
<div class="card border-0 shadow-sm">
<div class="card-body p-4">
<h3 class="card-title mb-1">הרשמה כמנטי</h3>
<p class="text-muted small mb-3">שדות המסומנים ב-<span class="text-danger">*</span> הם שדות חובה.</p>
<div id="mentee-message" class="alert d-none" role="alert"></div>
<form id="mentee-register-form">
  <p class="ms-form-section">פרטי חשבון</p>
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
  <p class="ms-form-section">פרטי פרופיל</p>
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
    <div class="form-text">הפרד/י בפסיקים בין מספר תחומים.</div>
  </div>
  <div class="mb-4">
    <label class="form-label">מטרות בתהליך המנטורינג <span class="text-muted">(לא חובה)</span></label>
    <textarea name="goals" class="form-control" rows="3" placeholder="לדוגמה: למצוא עבודה ראשונה בתחום"></textarea>
  </div>
  <div class="d-flex gap-2 align-items-center">
    <button type="submit" class="btn btn-primary">הרשמה כמנטי</button>
    <button type="button" class="btn btn-link text-muted" id="back-from-mentee">חזרה לבחירה</button>
  </div>
</form>
</div>
</div>
</div>
</div>
</div>

<div id="mentor-form-wrapper" class="d-none" dir="rtl">
<div class="row justify-content-center">
<div class="col-md-7">
<div class="card border-0 shadow-sm">
<div class="card-body p-4">
<h3 class="card-title mb-1">הרשמה כמנטור/ית</h3>
<p class="text-muted small mb-3">שדות המסומנים ב-<span class="text-danger">*</span> הם שדות חובה.</p>
<div id="mentor-message" class="alert d-none" role="alert"></div>
<form id="mentor-register-form">
  <p class="ms-form-section">פרטי חשבון</p>
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
  <p class="ms-form-section">פרטי פרופיל</p>
  <div class="row g-3 mb-3">
    <div class="col-sm-6">
      <label class="form-label">תפקיד נוכחי <span class="text-muted">(לא חובה)</span></label>
      <input type="text" name="currentRole" class="form-control" placeholder="לדוגמה: Backend Developer">
    </div>
    <div class="col-sm-6">
      <label class="form-label">חברה <span class="text-muted">(לא חובה)</span></label>
      <input type="text" name="company" class="form-control">
    </div>
  </div>
  <div class="mb-3">
    <label class="form-label">תחומי התמחות <span class="text-danger">*</span></label>
    <input type="text" name="expertise" class="form-control" placeholder="לדוגמה: Python, AWS, מערכות מבוזרות" required>
    <div class="form-text">הפרד/י בפסיקים בין מספר תחומים.</div>
  </div>
  <div class="mb-3">
    <label class="form-label">זמינות</label>
    <select name="availability" class="form-select">
      <option value="available">פנוי/ה למנטורינג</option>
      <option value="unavailable">לא פנוי/ה כרגע</option>
    </select>
  </div>
  <p class="ms-form-section">קישורים</p>
  <div class="mb-3">
    <label class="form-label">פרופיל LinkedIn <span class="text-danger">*</span></label>
    <input type="url" name="linkedIn" class="form-control" placeholder="https://linkedin.com/in/yourprofile" required>
  </div>
  <div class="mb-4">
    <label class="form-label">קישור לתיאום פגישה (Calendly או שווה ערך) <span class="text-danger">*</span></label>
    <input type="url" name="calendlyUrl" class="form-control" placeholder="https://calendly.com/yourname" required>
  </div>
  <div class="mb-4 form-check">
    <input type="checkbox" class="form-check-input" id="mentor-visibility-consent">
    <label class="form-check-label small" for="mentor-visibility-consent">
      כל הפרטים שתספקו יופיעו בספריית המנטורים ויהיו גלויים לכולם, <strong>למעט כתובת האימייל</strong>.
    </label>
  </div>
  <div class="d-flex gap-2 align-items-center">
    <button type="submit" class="btn btn-primary" id="mentor-submit-btn" disabled>הרשמה כמנטור/ית</button>
    <button type="button" class="btn btn-link text-muted" id="back-from-mentor">חזרה לבחירה</button>
  </div>
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

  function bindCard(el, handler) {
    el.addEventListener('click', handler);
    el.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
    });
  }

  bindCard(document.getElementById('choose-mentee'), showMentee);
  bindCard(document.getElementById('choose-mentor'), showMentor);
  document.getElementById('back-from-mentee').addEventListener('click', showChoice);
  document.getElementById('back-from-mentor').addEventListener('click', showChoice);

  // Deep-link support: /register/#mentee or /register/#mentor
  var hash = window.location.hash;
  if (hash === '#mentee') showMentee();
  else if (hash === '#mentor') showMentor();
})();
</script>

<div id="verify-card" hidden dir="rtl">
<div class="row justify-content-center">
<div class="col-md-6">
<div class="card border-0 shadow-sm">
<div class="card-body p-4 text-center">
<div style="font-size:2.5rem;margin-bottom:16px">✉️</div>
<h5 class="fw-bold mb-2">הכנס/י את קוד האימות</h5>
<p class="text-muted mb-1">שלחנו קוד בן 6 ספרות אל</p>
<p class="fw-semibold mb-3" id="verify-email-display"></p>
<input id="verify-code-input" type="text" inputmode="numeric" maxlength="6" autocomplete="one-time-code" class="form-control form-control-lg text-center mb-2" style="letter-spacing:8px;font-size:1.5rem;max-width:200px;margin:0 auto 12px;" placeholder="------">
<p id="verify-code-error" class="text-danger small d-none mb-2"></p>
<button id="verify-submit-btn" type="button" class="btn btn-primary w-100 mb-3">אמת/י</button>
<button id="resend-btn" type="button" class="btn btn-link btn-sm mb-1">שלח/י קוד חדש</button>
<p id="resend-msg" class="text-success small d-none mb-1">קוד חדש נשלח ✓</p>
<a href="#" id="change-email-link" class="d-block small text-muted mt-1">שינוי כתובת אימייל</a>
</div>
</div>
</div>
</div>
</div>

<script type="module" src="/js/mentorship/register.js"></script>
</content>
