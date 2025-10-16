# Insurance Admin Assistant (Demo)

A lightweight, single-file web app that demonstrates how AI and automation can simplify day-to-day admin tasks for insurance professionals.

**Live Demo:** [https://insurancedemo.lulidigital.com](https://insurancedemo.lulidigital.com)

---

## 🧠 Overview
The **Insurance Admin Assistant** is designed to show insurers, brokers, and agents how AI can streamline routine tasks like:
- Lead intake and quote generation  
- Renewal tracking and reminders  
- Smart follow-ups and quick insights  
- Instant client support via a built-in assistant  

It’s fully static — no backend or database required — so you can host it freely on GitHub Pages, Netlify, or Vercel.

---

## ⚙️ Features

### 1. **Quote Intake Form**
- Capture client name, contact info, policy type, coverage amount, and renewal date.
- Auto-generates a premium estimate (demo formula).
- Submits instantly with a success confirmation.

### 2. **Leads & Quotes Dashboard**
- View and manage all leads.
- Quick actions: **Follow-up**, **Quote**, or **Won**.
- Search and filter by status or policy type.

### 3. **Renewals Table**
- Tracks all policies expiring within 30 days.
- One-click reminder sends a simulated message and logs it in the assistant.

### 4. **Assistant Panel**
- Built-in chat that answers FAQ-style queries:
  - “How do I claim?”
  - “Renewal for Sarah?”
  - “Change beneficiary”
- Works entirely offline with rule-based logic.

### 5. **Brand Settings**
- Instantly rebrand: update broker name and email from within the app.
- Saves settings in localStorage for demo persistence.

### 6. **Export & Reporting**
- Export all leads to CSV.
- Generate weekly summary snapshots for demo presentations.

---

## 🚀 Deployment

### Hosting on GitHub Pages
1. Clone this repo or upload the files.  
2. In your repository:  
   - **Settings → Pages → Source:** `Deploy from a branch`  
   - **Branch:** `main / (root)`  
3. *(Optional)* Add a `CNAME` file for your custom domain:  
