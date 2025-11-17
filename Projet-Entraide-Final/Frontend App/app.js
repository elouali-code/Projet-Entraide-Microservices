// app.js

// URLs de base pour chaque microservice
const USER_SERVICE_URL = 'http://localhost:8080/api/users';
const REQUEST_SERVICE_URL = 'http://localhost:8081/api/requests';
const RECO_SERVICE_URL = 'http://localhost:8082/api/recommendations'; // Base URL

const messageDiv = document.getElementById('message');
const recoList = document.getElementById('recommendations-list');

// Fonction pour afficher les messages
function showMessage(text, type = 'success') {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    setTimeout(() => { messageDiv.style.display = 'none'; }, 5000);
}

// ------------------------------------------
// 1. Inscription (Port 8080) - POST
// ------------------------------------------
document.getElementById('inscriptionForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nom = document.getElementById('nom').value;
    const prenom = document.getElementById('prenom').value;
    const email = document.getElementById('email').value;
    const etablissement = document.getElementById('etablissement').value;
    const filiere = document.getElementById('filiere').value;
    const competencesInput = document.getElementById('competences').value;
    const disponibilites = document.getElementById('disponibilites').value;
    
    const competencesArray = competencesInput.split(',').map(item => item.trim());

    const studentData = {
        nom: nom,
        prenom: prenom,
        email: email,
        etablissement: etablissement,
        filiere: filiere,
        competences: competencesArray,
        disponibilites: disponibilites,
        noteMoyenneAvis: 0.0 // Valeur par défaut
    };

    try {
        const response = await fetch(USER_SERVICE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData),
        });

        if (!response.ok) throw new Error('Erreur de service (UserService): ' + response.status);
        
        const data = await response.json();
        showMessage(`Inscription réussie ! Votre ID étudiant est: ${data.id}.`, 'success');
        document.getElementById('inscriptionForm').reset();
    
    } catch (error) {
        showMessage(`Erreur: ${error.message}`, 'error');
    }
});


// ------------------------------------------
// 2. Publier une Demande (Port 8081) - POST
// ------------------------------------------
document.getElementById('demandeForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const studentId = parseInt(document.getElementById('demandeId').value);
    const titre = document.getElementById('titre').value;
    const description = document.getElementById('description').value;
    const motsClesArray = document.getElementById('motsCles').value.split(',').map(item => item.trim());
    const dateSouhaitee = document.getElementById('dateSouhaitee').value; 

    const demandeData = {
        studentId: studentId,
        titre: titre,
        description: description,
        motsCles: motsClesArray,
        dateSouhaitee: dateSouhaitee ? dateSouhaitee : null // Gère le format de date
    };

    try {
        const response = await fetch(REQUEST_SERVICE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(demandeData),
        });

        if (!response.ok) {
            if(response.status === 400) {
                 throw new Error('Erreur de validation: ID Étudiant non trouvé.');
            }
            throw new Error('Erreur de service (RequestService): ' + response.status);
        }

        const data = await response.json();
        showMessage(`Demande ${data.id} publiée avec succès ! Statut: ${data.statut}`, 'success');
        document.getElementById('demandeForm').reset();

    } catch (error) {
        showMessage(`Erreur: ${error.message}`, 'error');
    }
});


// ------------------------------------------
// 3. Trouver des Aidants (Port 8082) - GET (Inter-service)
// ------------------------------------------
document.getElementById('recoForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const keywords = document.getElementById('recoKeywords').value;
    recoList.innerHTML = ''; // Vide les anciens résultats

    try {
        const response = await fetch(`${RECO_SERVICE_URL}/search?keywords=${keywords}`, {
            method: 'GET',
        });

        if (response.status === 204) {
             showMessage('Aucun aidant trouvé pour ces compétences.', 'error');
             return;
        }
        if (!response.ok) {
            throw new Error('Erreur de service (RecommendationService): ' + response.status);
        }
        
        const aidants = await response.json();
        
        // Affichage des résultats
        aidants.forEach(a => {
            const li = document.createElement('li');
            li.innerHTML = `<b>${a.nom} (${a.filiere})</b><br>Compétences: ${a.competences.join(', ')}<br>Note: ${a.noteMoyenneAvis}`;
            recoList.appendChild(li);
        });
        
        showMessage(`Recherche terminée : ${aidants.length} aidant(s) trouvé(s).`, 'success');

    } catch (error) {
        showMessage(`Erreur: ${error.message}`, 'error');
    }
});


// ------------------------------------------
// 4. Soumettre un Avis (Port 8082) - POST (Mise à jour Intelligente)
// ------------------------------------------
document.getElementById('reviewForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const helperId = parseInt(document.getElementById('helperId').value);
    const rating = parseInt(document.getElementById('rating').value);

    const reviewData = {
        helperId: helperId,
        newRating: rating
    };

    try {
        const response = await fetch(`${RECO_SERVICE_URL}/review`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData),
        });

        if (response.status === 202) { 
            showMessage(`Avis de ${rating}/5 soumis pour l'aidant ID ${helperId}.`, 'success');
            document.getElementById('reviewForm').reset();
        } else {
            throw new Error('Erreur lors de la soumission de l\'avis. Statut: ' + response.status);
        }

    } catch (error) {
        showMessage(`Erreur: ${error.message}`, 'error');
    }
});