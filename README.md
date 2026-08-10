# Daily Resolve

Create a modern, premium-quality Progressive Web App (PWA) called **CueX**.

# Purpose

This is NOT a normal to-do list.

This application is my personal daily cuex tracker.

Every night before sleeping, I manually create my tasks for the next day.

Every task is mandatory.

There are NO priorities like:

- Must

- Should

- Could

Every task has equal importance.

The application should focus on cuex, consistency, and daily execution.

DO NOT add AI suggestions, recurring tasks, smart scheduling, automatic task generation, or categories.

Everything is planned manually by me.

---

# Authentication

There should be NO login page.

There should be NO sign-up page.

There should be NO authentication.

The application should open directly to the dashboard.

This application is designed for one user only.

---

# Design

Create a premium UI similar to Notion, Linear, Apple, and Arc Browser.

Requirements:

- Modern

- Minimal

- Elegant

- Clean

- Dark Mode by default

- Light mode available

- Beautiful typography

- Rounded corners

- Glassmorphism

- Smooth animations

- Responsive for Desktop, Tablet and Mobile

- Fast loading

- No clutter

- Professional spacing

- Premium feeling

Use:

- Tailwind CSS

- shadcn/ui

- Framer Motion

- Lucide Icons

---

# Dashboard

Display at the top:

Good Morning / Afternoon / Evening

Current Date

Current Time (Live)

A motivational quote that changes every day.

Below that display a large animated circular progress indicator.

Example:

Completed

7 / 10

70%

Below the progress circle show:

"You have completed 70% of today's mission."

---

# Today's Tasks

Display all today's tasks.

Each task contains:

☐ Checkbox

Task Name

Optional Notes

Completion Time

When a task is checked:

✓ Animate the checkbox

✓ Strike through the task

✓ Save completion time

✓ Update progress instantly

✓ Save automatically

✓ Smooth animation

When all tasks are completed:

Play confetti animation.

Display:

🎉 Mission Complete.

Excellent work.

---

# Task Management

Allow me to:

Add unlimited tasks

Delete tasks

Edit task names

Edit notes

Reorder tasks using drag-and-drop

Duplicate tasks

Mark complete

Mark incomplete

Auto-save everything instantly.

No Save button.

---

# Planning Tomorrow

There should be a dedicated page called

"Tomorrow"

Every night I manually create tomorrow's tasks.

Tomorrow's tasks should NEVER appear in today's list until the next day.

At exactly 12:00 AM:

Yesterday becomes History.

Tomorrow automatically becomes Today.

A fresh empty Tomorrow page should be created automatically.

---

# History

Create a History page.

Each day should be stored forever.

Display a monthly calendar.

Color coding:

🟢 100% Completed

🟡 Partially Completed

🔴 Missed

Clicking any day should open:

Date

Completion Percentage

Completed Tasks

Incomplete Tasks

Completion Times

Notes

---

# Statistics

Create a beautiful analytics dashboard.

Include:

Current Streak

Longest Streak

Today's Completion %

Weekly Completion %

Monthly Completion %

Yearly Completion %

Average Completion %

Total Tasks Completed

Total Tasks Missed

Total Days Logged

Best Day

Worst Day

Weekly Graph

Monthly Graph

Yearly Heatmap (GitHub style)

Beautiful animated charts.

---

# Streak Rules

A streak increases only if EVERY task for the day is completed.

If even one task is incomplete:

The streak resets to zero.

Display:

Current Streak

Longest Streak

---

# Achievements

Unlock achievements automatically.

Examples:

First Day

7 Day Streak

30 Day Streak

100 Tasks Completed

500 Tasks Completed

1000 Tasks Completed

365 Logged Days

Display achievement cards.

---

# Notifications

Browser notifications.

Examples:

6:00 AM

"Your mission starts now."

10:00 PM

"Plan tomorrow before sleeping."

Allow notifications to be enabled or disabled.

---

# Settings

Allow me to:

Change Theme

Dark Mode

Light Mode

Choose Accent Color

Export all data to JSON

Import JSON Backup

Clear All Data

Reset Statistics

Reset Achievements

Reset Streak

Confirmation dialogs required before deleting data.

---

# Offline Support

The application must work completely offline.

Store everything locally using IndexedDB.

Never require an internet connection.

Automatically save all data.

Nothing should ever be lost after refreshing or closing the browser.

---

# PWA

Make it installable.

Support:

Windows

Android

iPhone

Tablet

After installation it should behave like a native application.

---

# Animations

Use Framer Motion.

Smooth page transitions.

Smooth card animations.

Animated progress ring.

Animated counters.

Checkbox animation.

Completion animation.

Confetti when all tasks are completed.

Hover effects.

Beautiful loading transitions.

---

# Technology Stack

React

Vite

TypeScript

Tailwind CSS

shadcn/ui

Framer Motion

React Router

React Hook Form

Lucide Icons

IndexedDB

PWA

Recharts

---

# Code Quality

Write production-quality code.

Use reusable components.

Separate:

Components

Pages

Hooks

Utilities

Database

State Management

Use TypeScript everywhere.

Do not generate placeholder code.

Do not leave TODOs.

The application should be fully functional.

---

# Overall Goal

This application should feel like a premium productivity application that I will use every single day.

The design should be beautiful enough that opening it every morning feels motivating.

The focus is not productivity hacks.

The focus is daily cuex.

Every task is manually planned by me every night.

Every task is equally important.

Keep the interface extremely clean, elegant, distraction-free, and enjoyable to use.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://steadfast-day.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3a6ae807-e7d5-4113-8cb8-8669c1c1ed24).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
