---
type: "docs"
title: "עריכת פרופיל"
slug: "profile"
linkTitle: "עריכת פרופיל"
weight: 45
---

<div id="profile-status"></div>

<div id="profile-content" hidden dir="rtl">

<div class="ms-page-header mb-4">
  <h1 class="ms-page-header__title">עריכת פרופיל</h1>
</div>

<div class="card border-0 shadow-sm p-1 mb-2">
  <div class="card-body pb-2">
    <p class="ms-form-section mt-0">פרטי חשבון</p>
    <div id="profile-readonly" class="d-flex gap-2 align-items-center text-muted small mb-2">
      <strong id="profile-name"></strong>
      <span class="text-muted">·</span>
      <span id="profile-email"></span>
    </div>
  </div>
</div>

<div id="mentor-form-section" hidden>
<div class="card border-0 shadow-sm p-1">
<div class="card-body">
<form id="mentor-profile-form">
  <div id="mentor-message" class="alert d-none" role="alert"></div>
  <p class="ms-form-section mt-0">פרטי פרופיל</p>
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
  <div class="row g-3 mb-3">
    <div class="col-sm-6">
      <label class="form-label">שנות ניסיון <span class="text-muted">(לא חובה)</span></label>
      <input type="number" name="yearsExperience" class="form-control" min="0">
    </div>
    <div class="col-sm-6">
      <label class="form-label">זמינות</label>
      <select name="availability" class="form-select">
        <option value="available">פנוי/ה למנטורינג</option>
        <option value="unavailable">לא פנוי/ה כרגע</option>
      </select>
    </div>
  </div>
  <p class="ms-form-section">קישורים</p>
  <div class="mb-3">
    <label class="form-label">פרופיל LinkedIn <span class="text-danger">*</span></label>
    <input type="url" name="linkedIn" class="form-control" placeholder="https://linkedin.com/in/yourprofile" required>
  </div>
  <div class="mb-4">
    <label class="form-label">קישור לתיאום פגישה <span class="text-danger">*</span></label>
    <input type="url" name="calendlyUrl" class="form-control" placeholder="https://calendly.com/yourname" required>
  </div>
  <div class="d-flex gap-2">
    <button type="submit" class="btn btn-primary">שמירת שינויים</button>
    <a id="mentor-back-link" href="/he/mentorship/mentor-dashboard/" class="btn btn-outline-secondary">חזרה לדשבורד</a>
  </div>
</form>
</div>
</div>
</div>

<div id="mentee-form-section" hidden>
<div class="card border-0 shadow-sm p-1">
<div class="card-body">
<form id="mentee-profile-form">
  <div id="mentee-message" class="alert d-none" role="alert"></div>
  <p class="ms-form-section mt-0">פרטי פרופיל</p>
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
  <div class="d-flex gap-2">
    <button type="submit" class="btn btn-primary">שמירת שינויים</button>
    <a id="mentee-back-link" href="/he/mentorship/mentee-dashboard/" class="btn btn-outline-secondary">חזרה לדשבורד</a>
  </div>
</form>
</div>
</div>
</div>

</div>

<script type="module" src="/js/mentorship/profile.js"></script>
</content>
