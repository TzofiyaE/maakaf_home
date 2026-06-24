# מעקף - Maakaf

מעקף היא קהילת קוד פתוח ישראלית המקדמת פרויקטים של תוכנה חופשית.
Maakaf is an Israeli open source community promoting free software projects.

## About This Website

This is the official website for the Maakaf community. It's built using [Hugo](https://gohugo.io/) with the [Docsy](https://www.docsy.dev/) theme, providing a comprehensive platform for our community's documentation, blog posts, and project information.

## Local Development

To run this website locally, you'll need:

- Hugo Extended (version 0.146.0 or higher)
- Go (for Hugo modules)
- Node.js and npm (for SCSS processing)

### Setup and Run

1. Clone the repository:
```bash
git clone https://github.com/Maakaf/maakaf_home.git
cd maakaf_home
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
hugo server
```

The site will be available at `http://localhost:1313`

## Community Links

- 💬 WhatsApp Community: [Join our WhatsApp groups](https://chat.whatsapp.com/LTZKuKyKw7DHppVrDXWv8h)
- 📰 News Updates: [Join our announcements group](https://chat.whatsapp.com/LTZKuKyKw7DHppVrDXWv8h)
- 🎮 Discord: [Join our Discord server](https://discord.com/invite/a2VyCjRk2M)
- 📺 YouTube: [@maakaf-os](https://www.youtube.com/@maakaf-os)
- 🌐 GitHub: [Maakaf Organization](https://github.com/Maakaf/maakaf_home/)
- 🤝 Meetup: [Join our meetups](https://www.meetup.com/maakaf)

## Mentorship Program

The site includes a full mentorship web app at `/he/mentorship/`. It is backed by a separate Express + Firebase API — see [mentors_backend](https://github.com/Maakaf/mentors_backend).

### Pages

| URL | Description |
| --- | --- |
| `/he/mentorship/` | Home: program description, mentor directory with search/filter |
| `/he/mentorship/register/` | Register as mentor or mentee |
| `/he/mentorship/login/` | Sign in |
| `/he/mentorship/mentor-dashboard/` | Mentor: view and respond to incoming requests |
| `/he/mentorship/mentee-dashboard/` | Mentee: view sent requests, cancel, complete, reply |
| `/he/mentorship/directory/mentor/` | Public mentor profile page |
| `/he/mentorship/request/` | Send a mentorship request to a specific mentor |
| `/he/mentorship/profile/` | Edit mentor or mentee profile |
| `/he/mentorship/admin/` | Admin statistics dashboard |

### Frontend modules (`static/js/mentorship/`)

| File | Purpose |
| --- | --- |
| `api.js` | `apiFetch`, `authedFetch`, session helpers (reads `window.MENTORSHIP_API_BASE`) |
| `auth-bar.js` | Injects the beta notice + auth bar (greeting, dashboard link, bell, logout) on every mentorship page |
| `notifications.js` | Bell icon with dropdown, 30s polling, deep-links to specific request cards |
| `mentorship-home.js` | Hides guest CTA when logged in |
| `directory.js` | Mentor directory: renders cards with avatar initials, search/filter |
| `mentor-profile.js` | Public mentor profile: two-column layout with avatar |
| `register.js` | Mentor/mentee registration with email-verification polling |
| `login.js` | Sign-in, forgot-password, email-verification flows |
| `mentor-dashboard.js` | Mentor: request cards with actions, mentee profile toggle, conversation history |
| `dashboard.js` | Mentee: request cards, reply on needs_info, cancel/complete, conversation history |
| `request.js` | Submit a mentorship request |
| `profile.js` | Edit mentor or mentee profile |
| `admin.js` | Admin stats |
| `errors.js` | Hebrew error message map |
| `toast.js` | Toast notification helper |

### Styling

Mentorship-specific styles live in `assets/scss/_styles_project.scss` under the
`/* Mentorship — shared components */` section. Key classes: `.ms-auth-bar`,
`.ms-page-header`, `.ms-avatar`, `.ms-role-card`, `.ms-form-section`.

The `body_class: "no-sidebar"` front matter (cascaded from `content/he/mentorship/_index.md`)
hides the Docsy docs sidebars and constrains content width on all mentorship pages.

### API base URL

`window.MENTORSHIP_API_BASE` is injected by `layouts/partials/hooks/head-end.html`
from `params.mentorshipApiBase` in `hugo.yaml`. Set this to the backend URL for each environment.

## Contributing

We welcome contributions from the community! Whether it's:
- Adding new documentation
- Fixing typos or improving existing content
- Translating content
- Suggesting improvements
- [Join the website channel in our Discord server](https://discord.gg/ctjv8vKZez)

Please feel free to open an issue or submit a pull request.

## License

This project is built on top of Docsy, which is licensed under the Apache License 2.0. Our content and modifications are available under the same terms.
