# Project Documentation: Naanaa Platform

## 1. Executive Summary
As detailed in the project's repository base in Screenshot_4.png, **Naanaa** is a university web application built with a scalable full-stack architecture. It delivers a modern, interactive user experience optimized for efficient data management and seamless system integration through RESTful APIs.

Naanaa operates as a hybrid, integrated **SaaS (Software as a Service) Health & Social Platform**. Rather than functioning as a standalone health utility, it acts as a centralized ecosystem that bridges the gap between health-conscious individuals and professional health service providers. By combining advanced health metrics tracking, dynamic role-based profile management, and social engagement mechanics, Naanaa transforms complex health management into an intuitive, community-driven digital experience.

---

## 2. System Architecture & Tech Stack
The platform's underlying architecture is designed around clear separation of concerns, ensuring high performance, security, and scalability:

* **Backend Framework:** Django / Django REST Framework (DRF) powering the robust business logic, robust authentication, and secure RESTful endpoints.
* **Database Management System:** Enterprise-grade T-SQL implementation deployed on Microsoft SQL Server, engineered for extensive entity relationship management and complex relational schemas.
* **Data Access Layer:** Django ORM, utilizing abstract database mappings to enforce strict security protocols against SQL injection vulnerabilities and handle automated migrations efficiently.
* **Frontend Library:** React, providing a dynamic, reactive, and highly responsive single-page application (SPA) user interface.

---

## 3. Core Architectural Modules
The backend schema is structurally divided into four cohesive sub-systems that interact seamlessly via the API gateway:

### A. Identity & Multi-Role Profile Management
The platform features an advanced, multi-tenant authentication and profile structure utilizing a specialized role-based access control layout:
* **Core Authentication (`auth_user`):** Handles secure system access, credentials, system staff status, and registration timelines.
* **User Profiles (`nutrition_userprofile`):** The foundational layer for individual users, providing personal metadata and acting as the switchboard for elevated roles.
* **Professional Tier Profiles:** Dedicated, separate entities tailored for distinct enterprise classes:
  * **Chef Profiles (`nutrition_chefprofile`):** Captures brand credentials, professional experience, culinary specialties, and verification statuses.
  * **Restaurant Profiles (`nutrition_restaurantprofile`):** Manages physical locations, government licensing numbers, cuisine types, operational hours, and logistical availability.
  * **Trainer Profiles (`nutrition_trainerprofile`):** Tracks athletic specializations, licensing, professional background details, and custom social link maps.

### B. Analytical Health Metrics Engine
An isolated, data-driven module designed to process clinical and physiological parameters over time:
* **Static Diagnostics (`nutrition_healthprofile`):** Validates and stores baseline physiological parameters such as gender boundaries, current/target weights, exact height variables, age, and designated activity multiplier indices.
* **Dynamic Telemetry (`nutrition_healthcheck`):** Tracks chronological variations in health records. It calculates and logs critical health indexes including Body Mass Index (BMI) and daily metabolic Caloric targets based on evolving user metrics.

### C. Content & Media Distribution Management
Handles the heavy-duty distribution of health-oriented content across varying digital mediums:
* **Nutritional Recipe Engine (`nutrition_recipe`):** An exhaustive relational catalog linking back to verified chefs or restaurants. It records precise macronutrient allocations (protein, carbohydrates, fats), caloric yields, targeted diet classifications, estimated difficulty, and pricing for commercial services.
* **Fitness Media Center (`nutrition_workoutvideo`):** Connects verified trainers directly to a robust multimedia streaming architecture. It organizes workout routines by targeted caloric burn, duration indexes, and programmatic difficulty classes.
* **Social Publishing (`nutrition_post`):** Allows users to broadcast updates, micro-blogs, or milestones directly to the collective social feed.

### D. Relational Interaction & Social Network Matrix
Maps user-to-user and user-to-content interactions through dedicated, highly indexed intermediate lookup tables:
* **Content Favoriting & Bookmarking:** Managed independently via custom-tailored relational arrays (`nutrition_recipe_likes`, `nutrition_workoutvideo_likes`, `nutrition_workoutvideo_saves`, and `nutrition_savedrecipe`).
* **Social Graphs (`nutrition_follow` & `nutrition_userfollow`):** Implements asymmetric social networking behaviors, managing standard peer-to-peer networking graphs alongside consumer-to-creator subscription maps.
* **Asynchronous Dialogue Systems (`nutrition_comment` & `nutrition_postcomment`):** Structured multi-threaded text blocks attached across recipe nodes and social updates to foster active user engagement.

---

## 4. Key Engineering Deliverables
* **High Scalability:** The system architecture is explicitly engineered to handle large volumes of concurrent user data without degradation of performance.
* **Strict Security Standards:** Features enterprise-grade user data isolation, protected database context routing, and comprehensive foreign key restrictions (`ON DELETE CASCADE` / `SET NULL`) to preserve absolute data integrity.
* **Extensible Business Model:** Positioned strategically to support scalable commercial applications, monetization routes for business profiles, and automated digital health coaching pipelines.
