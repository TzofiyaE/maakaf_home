import { getSession } from './api.js';

const session = getSession();

if (session) {
  document.getElementById('cta-guest').hidden = true;
  const ctaUser = document.getElementById('cta-user');
  ctaUser.hidden = false;
  document.getElementById('cta-dashboard-link').href = session.role === 'mentor'
    ? '/he/mentorship/mentor-dashboard/'
    : '/he/mentorship/mentee-dashboard/';
}
