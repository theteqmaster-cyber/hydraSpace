# hydraSpace
an online note taking app for the nust student , made by hydra
Below is a **clean, structured proposal** that includes everything we discussed, including the **moderation/report system**. This format is closer to something you could show lecturers, collaborators, or early investors. 🚀

---

# Project Proposal

## NUST HydraSpace  Academic Hub

### A Digital Academic Workspace for University Students

Prepared by: **mphathisi Ndlovu**

---

# 1. Executive Summary

The ** NUST HydraSpace  Academic Hub** is a digital productivity platform designed specifically for university students. The platform helps students organize academic life by combining structured course notes, lecture scheduling, and collaborative knowledge sharing into one unified system.

While existing tools such as Notion and Google Keep offer general note-taking capabilities, they are not optimized for the structured workflows that university students experience daily.

This project proposes a **student-centered academic platform** tailored to how courses, lectures, assignments, and exams actually function within universities.

The project will initially focus on students at **National University of Science and Technology (NUST)**, with potential expansion to other universities.

The goal is to create a **central academic workspace** where students can manage courses, capture lecture notes, track schedules, and benefit from shared peer knowledge.

---

# 2. Problem Statement

University students often struggle to manage academic information due to fragmented tools and unstructured systems.

Common issues include:

• Lecture notes scattered across multiple apps
• Lack of structured organization for courses
• Difficulty tracking lectures, assignments, and tests
• Poor access to peer-shared academic notes
• Confusion caused by differences between official timetables and real lecture schedules

Most productivity tools are designed for **general users**, not specifically for students operating in structured academic environments.

This leads to inefficiencies in learning, collaboration, and academic preparation.

---

# 3. Proposed Solution

The NUST Student Academic Hub provides a **dedicated digital workspace designed around the needs of university students**.

The system centralizes key academic activities in one platform:

• course organization
• structured note-taking
• lecture scheduling
• shared academic knowledge

By aligning the software structure with the way courses are taught, the platform allows students to manage academic work more efficiently.

---

# 4. Core Features

## 4.1 Course-Based Note Organization

Students can create courses inside the application.

Example:

```
Create Course → Database Systems
```

Once created, the system automatically generates structured sections:

```
Database Systems
   ├── Lecture Notes
   ├── Assignments
   ├── Tests
   └── Key Concepts
```

This eliminates manual setup and allows students to start taking notes immediately.

---

## 4.2 Lecture-Based Note Structure

Lecture notes are automatically organized chronologically.

Example:

```
Database Systems
   └── Lecture Notes
        ├── Lecture 1 – Introduction
        ├── Lecture 2 – Data Models
        └── Lecture 3 – SQL Basics
```

This structure mirrors how courses are delivered in universities.

---

## 4.3 Academic Calendar

The platform includes an integrated calendar where students can manage academic events such as:

• lectures
• assignment deadlines
• tests
• rescheduled classes

Example:

```
Tuesday
14:00 – Database Lecture
16:00 – Algorithms Lab
```

---

## 4.4 Timetable System

University timetables often differ from real lecture schedules due to cancellations or changes.

To address this, the platform separates:

**Timetable** – expected weekly schedule
**Calendar** – actual events and changes

This prevents clutter and keeps scheduling organized.

---

# 5. Shared Notes Community

One of the most powerful features of the platform is the **Shared Notes system**, allowing students to share lecture notes with others studying the same course.

Example structure:

```
Database Systems
   └── Shared Notes
        ├── Lecture 1 – Introduction
        ├── Lecture 2 – Data Models
        └── Lecture 3 – SQL Basics
```

Students may choose whether their notes remain **private** or **shared**.

This helps students who:

• missed a lecture
• want alternative explanations
• want collaborative study material

---

# 6. Shared Notes Feed

The platform will include a **shared notes feed** that displays recently shared academic notes.

Example:

```
Recently Shared

1. Database – Lecture 7 – Indexing
2. Algorithms – Lecture 4 – Graph Traversal
3. Operating Systems – Lecture 3 – Threads
```

To maintain efficiency, the system loads notes using **pagination**:

• Initial load: 10 notes
• Additional notes loaded during scrolling

This design ensures fast performance and lower server costs.

---

# 7. Search and Filtering

Students can search shared notes using filters such as:

• course name
• lecture number
• keywords

Example search:

```
Search: Database
```

Results:

```
Database – Lecture 2 – Data Models
Database – Lecture 5 – Normalization
Database – Lecture 7 – Indexing
```

This allows quick access to relevant academic material.

---

# 8. Privacy and Security

The platform prioritizes student privacy.

Key principles:

• notes are private by default
• students choose whether to share notes
• shared notes contain no sensitive personal data

Access may be restricted to verified university emails to ensure the platform remains relevant to students.

---

# 9. Content Moderation and Safety

Because the platform allows user-generated content, safeguards are necessary to prevent abuse such as:

• spam notes
• offensive content
• irrelevant posts
• misuse of the platform

The system will include a **report feature** allowing students to flag problematic notes.

Example:

```
Report Note
```

Reasons for reporting may include:

• spam
• offensive content
• irrelevant information
• other concerns

Reported notes are placed in a **moderation queue** for administrative review.

---

## 9.1 Admin Review Process

The platform administrator reviews reported notes through a moderation dashboard.

Example moderation queue:

```
Reported Notes

Database – Lecture 4 – SQL Joins
Reported by: 3 users
Reason: Spam

Algorithms – Lecture 2 – Sorting
Reported by: 1 user
Reason: Offensive content
```

The administrator may choose to:

• keep the note
• remove the note
• warn the user
• suspend repeat offenders

Human moderation ensures that useful academic content is not mistakenly removed by automated filters.

---

# 10. Technical Architecture

The platform will be built using modern cloud technologies.

### Frontend

Progressive Web Application (PWA)

### Backend

Database and authentication handled by
Supabase

### Hosting

Application deployment through
Vercel

### Simplified Data Model

```
Users
Courses
Course Sections
Notes
Shared Notes
Calendar Events
Timetable
Reports
```

This architecture allows efficient scaling while maintaining low operational costs.

---

# 11. Monetization Strategy

The platform will adopt a **voluntary support model**.

Students can access the full platform for free.

Users who find value in the platform may choose to support development through a **voluntary one-time contribution of $20**.

This model ensures accessibility while enabling sustainable development.

---

# 12. Target Market

Initial market:

Students at
National University of Science and Technology

Future expansion:

• other universities in Zimbabwe
• universities across Africa

University communities are highly networked, allowing useful tools to spread organically among students.

---

# 13. Development Roadmap

### Version 1 – Minimum Viable Product

• course creation
• structured lecture notes
• academic calendar

---

### Version 2 – Academic Management

• assignment tracking
• timetable integration
• exam preparation tools

---

### Version 3 – Collaborative Learning

• shared notes community
• search and filtering
• knowledge-sharing feed

---

# 14. Expected Impact

The NUST Student Academic Hub aims to improve academic productivity by:

• organizing course materials
• simplifying note-taking
• enabling collaborative learning
• centralizing academic resources

Ultimately, the platform could evolve into a digital academic workspace used daily by university students.
