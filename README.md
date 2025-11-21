# Projet d'Entraide Intelligente (Architecture Microservices )

Ce projet implémente une application d'entraide étudiante en utilisant une architecture microservices (Spring Boot) et une base de données MySQL.

## 1. Architecture

L'application est décomposée en 3 microservices principaux et un frontend :

* **UserService (Port 8080)** : Gère le CRUD des étudiants (profils, compétences, avis).
* **RequestService (Port 8081)** : Gère le CRUD des demandes d'aide. Appelle `UserService` pour valider l'existence de l'étudiant.
* **RecommendationService (Port 8082)** : Gère la logique de recommandation. Appelle `UserService` pour trouver les aidants par compétences et gère la soumission des avis.
* **Frontend (HTML/JS/CSS)** : Interface utilisateur unique qui consomme les 3 microservices.

## 2. Configuration de la Base de Données (INSA)

* **Serveur :** `srv-bdens.insa-toulouse.fr`
* **Login :** `projet_gei_068`
* **Mot de passe :** `fuoTh1oa`
* **BDD (unique) :** `projet_gei_068` (Les tables sont créées automatiquement par Hibernate).

## 3. Comment Lancer le Projet

1.  Assurez-vous que les 3 projets Maven (`UserService`, `RequestService`, `RecommendationService`) sont importés dans Eclipse.
2.  Lancez `UserApplication.java` (Port 8080).
3.  Lancez `RequestApplication.java` (Port 8081).
4.  Lancez `RecommendationApplication.java` (Port 8082).
5.  Ouvrez le fichier `index.html` (du dossier `MonFrontend`) dans un navigateur.
