# 🏔️ Hillyfielders Gorkha FC — Official Website

Official website for **Hillyfielders Gorkha FC**, a football club based in Gorkha, Gandaki Pradesh, Nepal. Built with a Django REST API backend and React frontend.

---

## 🌐 Live Site
> Coming soon — deploying to Railway

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 6 + Django REST Framework |
| Frontend | React 18 + Vite + Tailwind CSS |
| Database | SQLite (dev) → PostgreSQL (production) |
| Media | Cloudinary |
| Deployment | Railway |

---

## ✨ Features

- 🏃 **Men's & Women's teams** — fully separated squad pages, fixtures and results
- 👥 **Player profiles** — grouped by position with photos and stats
- 📅 **Fixtures & Results** — live data managed from admin, grouped by month
- 📰 **News & Blog** — articles with cover images, categories and slugs
- 🤝 **Sponsors** — tiered sponsor system (Platinum, Gold, Silver)
- 📬 **Contact page** — club location and contact form
- 🔐 **Role-based admin** — super admin, media officer, team manager, secretary
- 📱 **Fully responsive** — mobile-first design

---

## 🗂️ Project Structure
```
hillyfielders-gorkha-fc/
├── backend/
│   ├── players/        # Squad, player profiles, staff
│   ├── fixtures/       # Matches, results, competitions
│   ├── news/           # Articles, categories
│   ├── accounts/       # Fan login (built, hidden until needed)
│   ├── tickets/        # Ticket system (built, hidden until needed)
│   ├── sponsors/       # Club sponsors
│   └── core/           # Django settings, URLs
└── frontend/
    ├── src/
    │   ├── pages/      # Home, Squad, Fixtures, News, Sponsors, Contact
    │   ├── components/ # Navbar, Footer
    │   └── services/   # API calls to Django
    └── public/         # Static assets, logo
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Backend setup
```bash
# Clone the repo
git clone https://github.com/Srijannsm/hillyfielders-gorkha-fc.git
cd hillyfielders-gorkha-fc

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install django djangorestframework django-cors-headers python-dotenv pillow psycopg2-binary cloudinary django-cloudinary-storage

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start Django server
python manage.py runserver
```

### Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Then open:
- Frontend → http://localhost:5173
- Django Admin → http://127.0.0.1:8000/admin

---

## 👤 Admin Roles

| Role | Access |
|---|---|
| Super Admin | Full access to everything |
| Media Officer | Post news, upload photos |
| Team Manager | Manage squad, add results |
| Secretary | Manage fixtures, sponsors |

---

## 🗺️ Roadmap

- [x] Homepage with hero, fixtures, news
- [x] Men's and women's squad pages
- [x] Fixtures and results pages
- [x] News and article pages
- [x] Sponsors page
- [x] Contact page
- [x] Django admin with role-based access
- [ ] Fan login and accounts
- [ ] Ticket booking system
- [ ] Deploy to Railway
- [ ] AI match predictions (future)
- [ ] Player performance analytics (future)

---

## 🏔️ About the Club

**Hillyfielders Gorkha FC** is based in Gorkha, Nepal — home of the legendary Gurkha warriors and the starting point of the 1934 Nepal earthquake relief efforts. The club represents the pride, resilience and community spirit of the Gorkha district.

---

## 👨‍💻 Developer

Built by **Srijan Pradhan**  
GitHub: [@Srijannsm](https://github.com/Srijannsm)

---

*Hillyfielders Gorkha FC — From the hills, for the hills.*