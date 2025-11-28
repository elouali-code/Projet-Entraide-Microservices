// ==========================================
// CONFIGURATION & CACHE
// ==========================================
const URL_USER = 'http://localhost:8080/api/users';
const URL_REQUEST = 'http://localhost:8081/api/requests';
const URL_RECO = 'http://localhost:8082/api/recommendations';

let currentUser = null;
let currentHelperIdToRate = null;

// Petit cache pour éviter de redemander 10 fois le nom de "ID 1"
// Stocke : { 1: "Alice Martin (ID 1)", 2: "Bob Dupont (ID 2)" }
const namesCache = new Map();

// --- UTILITAIRES ---
function notify(msg, type='success') {
    const el = document.getElementById('global-message');
    if(el) {
        el.textContent = msg;
        el.className = type === 'success' ? 'msg-success' : 'msg-error';
        el.style.display = 'block';
        setTimeout(() => el.style.display = 'none', 4000);
    } else {
        alert(msg);
    }
}

// Fonction magique pour transformer un ID en "Prénom Nom (ID)"
async function resolveName(id) {
    if (!id) return "Inconnu";
    if (namesCache.has(id)) return namesCache.get(id); // Si déjà en mémoire, on renvoie direct

    try {
        const res = await fetch(`${URL_USER}/${id}`);
        if (res.ok) {
            const u = await res.json();
            const prettyName = `${u.prenom} ${u.nom} (ID ${id})`;
            namesCache.set(id, prettyName); // On mémorise pour la prochaine fois
            return prettyName;
        }
    } catch (e) { console.error(e); }
    
    return `Étudiant ID ${id}`; // Fallback si erreur
}

// ==========================================
// 1. INSCRIPTION
// ==========================================
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const checkboxes = document.querySelectorAll('.days-checkboxes input:checked');
    const selectedDays = Array.from(checkboxes).map(cb => cb.value).join(', ');

    const data = {
        nom: document.getElementById('regNom').value,
        prenom: document.getElementById('regPrenom').value,
        email: document.getElementById('regEmail').value,
        filiere: document.getElementById('regFiliere').value,
        competences: document.getElementById('regCompetences').value.split(',').map(s => s.trim()),
        disponibilites: selectedDays, 
        etablissement: "INSA",
        noteMoyenneAvis: 0.0,
        nombreAvis: 0
    };

    try {
        const res = await fetch(URL_USER, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if(res.ok) {
            const user = await res.json();
            alert(`Compte créé ! Votre ID est : ${user.id}`);
            window.location.reload();
        } else { throw new Error("Erreur création"); }
    } catch (err) { notify(err.message, 'error'); }
});

// ==========================================
// 2. CONNEXION
// ==========================================
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('loginId').value;
    try {
        const res = await fetch(`${URL_USER}/${id}`);
        if(!res.ok) throw new Error("Utilisateur introuvable");
        currentUser = await res.json();
        showDashboard();
    } catch (err) { notify(err.message, 'error'); }
});

function showDashboard() {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('dashboard').style.display = 'grid';
    document.getElementById('user-nav').style.display = 'block';
    document.getElementById('nav-username').textContent = currentUser.prenom;

    // Profil
    document.getElementById('dashName').textContent = `${currentUser.prenom} ${currentUser.nom}`;
    document.getElementById('dashFiliere').textContent = currentUser.filiere;
    document.getElementById('dashNote').textContent = currentUser.noteMoyenneAvis.toFixed(1);
    document.getElementById('dashNbAvis').textContent = currentUser.nombreAvis || 0;
    document.getElementById('dashSkills').textContent = currentUser.competences.join(', ');
    document.getElementById('dashDispos').textContent = currentUser.disponibilites || "Aucune";

    refreshLists();
}

function logout() { window.location.reload(); }

// ==========================================
// 3. RECHERCHE (Matching Temporel)
// ==========================================
document.getElementById('searchForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const keywords = document.getElementById('searchKeywords').value;
    const date = document.getElementById('searchDate').value;
    const resultsDiv = document.getElementById('searchResults');
    
    resultsDiv.innerHTML = '<em>Recherche...</em>';

    try {
        const res = await fetch(`${URL_RECO}/search?keywords=${keywords}&targetDate=${date}`);
        if(res.status === 204) {
            resultsDiv.innerHTML = '<p style="color:orange">Personne n\'est disponible ce jour-là avec ces compétences.</p>';
            return;
        }
        const aidants = await res.json();
        let html = '<ul class="results-list">';
        aidants.forEach(a => {
            if(a.id !== currentUser.id) { 
                html += `<li><strong>${a.prenom} ${a.nom}</strong> <span style="float:right; color:#ffc107;">★ ${a.noteMoyenneAvis.toFixed(1)}</span><br><small>${a.filiere} | Dispo: ${a.disponibilites}</small></li>`;
            }
        });
        html += '</ul>';
        resultsDiv.innerHTML = html;
    } catch (err) { resultsDiv.innerHTML = '<p style="color:red">Erreur service.</p>'; }
});

// ==========================================
// 4. PUBLICATION
// ==========================================
document.getElementById('publishForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // ... (récupération des données) ...

    try {
        const res = await fetch(URL_REQUEST, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if(res.ok) {
            notify("Demande publiée !", 'success');
            
            // --- AJOUT : VIDER LE FORMULAIRE ICI ---
            document.getElementById('publishForm').reset(); 
            // ---------------------------------------

            refreshLists();
        }
    } catch (err) { 
        notify("Erreur publication", 'error'); 
    }
});

// ==========================================
// 5. LISTES & ACCEPTATION (Avec Noms Humains)
// ==========================================
async function refreshLists() {
    // Récupération de toutes les demandes
    const resAll = await fetch(URL_REQUEST);
    const allRequests = await resAll.json();
    
    renderMyRequests(allRequests);
    renderMissions(allRequests);
}

// --- A. MES DEMANDES ---
async function renderMyRequests(allRequests) {
    const container = document.getElementById('myRequestsContainer');
    const myReqs = allRequests.filter(r => r.studentId === currentUser.id);

    if(myReqs.length === 0) {
        container.innerHTML = "<em>Aucune demande en cours.</em>";
        return;
    }

    const htmlPromises = myReqs.map(async req => {
        let status = `<span class="status-badge status-wait">En attente</span>`;
        let btn = "";

        if(req.statut === "EN_COURS" && req.helperId) {
            const helperName = await resolveName(req.helperId);
            status = `<span class="status-badge status-active">Pris en charge par ${helperName}</span>`;
            btn = `<button class="btn btn-warning" style="width:100%; margin-top:5px; font-size:0.8em;" onclick="openRatingModal(${req.helperId}, '${helperName.replace(/'/g, "\\'")}')">Noter ${helperName}</button>`;
        }
        
        // --- CORRECTION ICI : Utilisez toLocaleDateString() ---
        // Avant : new Date(req.dateSouhaitee).toLocaleString() -> Affiche l'heure
        // Après : new Date(req.dateSouhaitee).toLocaleDateString() -> Affiche seulement la date
        const dateAffichable = req.dateSouhaitee ? new Date(req.dateSouhaitee).toLocaleDateString() : "Date non précisée";

        return `
            <div class="item-card">
                <div style="display:flex; justify-content:space-between;">
                    <strong>${req.titre}</strong>
                    <small>${dateAffichable}</small> <!-- Ici, l'heure aura disparu -->
                </div>
                <p style="font-size:0.9em; color:#666;">${req.description || ''}</p>
                <div style="margin-top:5px;">${status}</div>
                ${btn}
            </div>
        `;
    });

    const htmlItems = await Promise.all(htmlPromises);
    container.innerHTML = htmlItems.join('');
}
// --- B. MISSIONS POUR MOI ---
async function renderMissions(allRequests) {
    const container = document.getElementById('missionsContainer');
    
    if (!currentUser.competences || currentUser.competences.length === 0) {
        container.innerHTML = "Ajoutez des compétences pour voir les missions.";
        return;
    }

    try {
        const skillsParam = currentUser.competences.join(',');
        const resMatch = await fetch(`${URL_REQUEST}/match?skills=${skillsParam}`);
        const matchingRequests = await resMatch.json();

        const finalMissions = matchingRequests.filter(req => {
            if(req.studentId === currentUser.id) return false;
            const isOpen = !req.statut || req.statut.toUpperCase() === "ATTENTE";
            return isOpen;
        });

        if(finalMissions.length === 0) {
            container.innerHTML = "<em>Aucune mission correspondante.</em>";
            return;
        }

        const htmlPromises = finalMissions.map(async req => {
            // ICI : On récupère le nom de celui qui demande de l'aide
            const requesterName = await resolveName(req.studentId);
            const dateAffichable = req.dateSouhaitee ? new Date(req.dateSouhaitee).toLocaleDateString() : "?";

            return `
                <div class="item-card" style="border-left:4px solid green;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong>${req.titre}</strong>
                        <span class="tag-match">Match !</span>
                    </div>
                    <p style="font-size:0.9em; margin:5px 0;">
                        Demandé par <strong>${requesterName}</strong> <br>
                        Pour le : ${dateAffichable}
                    </p>
                    <small>Mots-clés: ${req.motsCles.join(', ')}</small><br>
                    <button class="btn btn-success" style="margin-top:5px; font-size:0.8em;" onclick="acceptMission(${req.id})">Accepter d'aider</button>
                </div>
            `;
        });

        const htmlItems = await Promise.all(htmlPromises);
        container.innerHTML = htmlItems.join('');

    } catch (err) {
        container.innerHTML = "Erreur chargement missions.";
    }
}

// ==========================================
// 6. ACTIONS & NOTATION
// ==========================================
async function acceptMission(reqId) {
    if(!confirm("Accepter cette mission ?")) return;
    await fetch(`${URL_REQUEST}/${reqId}/accept/${currentUser.id}`, { method: 'PUT' });
    notify("Mission acceptée !", 'success');
    refreshLists();
}

function openRatingModal(helperId, helperName) {
    currentHelperIdToRate = helperId;
    // Affiche le nom au lieu de l'ID dans la popup
    const nameDisplay = helperName ? helperName : `l'étudiant ID ${helperId}`;
    document.getElementById('modalHelperId').textContent = nameDisplay;
    document.getElementById('ratingModal').style.display = 'flex';
}

function closeModal() { document.getElementById('ratingModal').style.display = 'none'; }

document.getElementById('rateForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); // Le bouton est hors form mais au cas où
});

async function submitRating() {
    const note = document.getElementById('modalRating').value;
    if(!note) return;
    
    const data = { helperId: currentHelperIdToRate, newRating: parseInt(note) };
    
    try {
        const res = await fetch(`${URL_RECO}/review`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if(res.status === 202) {
            notify("Avis envoyé !", 'success');
            closeModal();
        }
    } catch(err) { alert("Erreur"); }
}