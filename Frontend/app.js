
const USER_URL = 'http://localhost:8080/api/users';
const REQUEST_URL = 'http://localhost:8081/api/requests';
const RECO_URL = 'http://localhost:8082/api/recommendations';

let currentUser = null;
let currentHelperIdToRate = null;

function notify(msg, type = 'success') {
    const el = document.getElementById('global-message');
    if(el) {
        el.textContent = msg;
        el.className = type === 'success' ? 'msg-success' : 'msg-error';
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 5000);
    } else {
        alert(msg);
    }
}

const nameCache = new Map();
async function resolveName(id) {
    if (!id) return "Inconnu";
    if (nameCache.has(id)) return nameCache.get(id);
    try {
        const res = await fetch(`${USER_URL}/${id}`);
        if (res.ok) {
            const u = await res.json();
            const name = `${u.prenom} ${u.nom}`;
            nameCache.set(id, name);
            return name;
        }
    } catch (e) {
        console.error("Erreur résolution nom:", e);
    }
    return `ID ${id}`;
}

// ==========================================
// 1. GESTION DU LOGIN & PROFIL (Port 8080)
// ==========================================

// 1.1 INSCRIPTION
document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const checkboxes = document.querySelectorAll('.days-checkboxes input:checked');
    const selectedDays = Array.from(checkboxes).map(cb => cb.value).join(', ');

    const data = {
        nom: document.getElementById('regNom').value,
        prenom: document.getElementById('regPrenom').value,
        email: document.getElementById('regEmail').value,
        etablissement: "INSA",
        filiere: document.getElementById('regFiliere').value,
        disponibilites: selectedDays,
        competences: document.getElementById('regCompetences').value.split(',').map(s => s.trim()),
        noteMoyenneAvis: 0.0,
        nombreAvis: 0
    };

    try {
        const res = await fetch(USER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if(res.ok) {
            const newUser = await res.json();
            alert(`Inscription réussie ! Votre ID est : ${newUser.id}. Notez-le bien.`);
            e.target.reset(); 
        } else {
            throw new Error("Erreur serveur: " + res.status);
        }
    } catch (err) {
        notify("Erreur inscription : " + err.message, 'error');
    }
});

// 1.2 CONNEXION
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const idInput = document.getElementById('loginId');
    const id = idInput.value;

    if(!id) return alert("Veuillez entrer un ID d'étudiant.");

    try {
        const response = await fetch(`${USER_URL}/${id}`);
        
        if (!response.ok) throw new Error("Étudiant introuvable (404)");
        
        currentUser = await response.json();
        e.target.reset();
        showDashboard();

    } catch (e) {
        notify("Erreur de connexion : " + e.message, 'error');
    }
});

function showDashboard() {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('dashboard').style.display = 'grid';
    document.getElementById('user-nav').style.display = 'flex';
    document.getElementById('nav-username').textContent = currentUser.prenom;
    refreshDashboard();
}

function logout() {
    window.location.reload();
}

async function refreshDashboard() {
    if(!currentUser) return;
    
    document.getElementById('dashName').textContent = `${currentUser.prenom} ${currentUser.nom}`;
    document.getElementById('dashFiliere').textContent = `INSA - ${currentUser.filiere}`;
    const note = currentUser.noteMoyenneAvis ? currentUser.noteMoyenneAvis.toFixed(1) : "0.0";
    const nbAvis = currentUser.nombreAvis || 0;
    document.getElementById('dashNote').textContent = note;
    document.getElementById('dashNbAvis').textContent = nbAvis;
    document.getElementById('dashSkills').textContent = currentUser.competences.join(', ');
    document.getElementById('dashDispos').textContent = currentUser.disponibilites || "Non renseigné";

    refreshLists();
}

// ==========================================
// 2. PUBLIER UNE DEMANDE (Port 8081)
// ==========================================
document.getElementById('publishForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        studentId: currentUser.id,
        titre: document.getElementById('reqTitle').value,
        description: document.getElementById('reqDesc').value,
        motsCles: document.getElementById('reqKeywords').value.split(',').map(s => s.trim()),
        dateSouhaitee: document.getElementById('reqDate').value
    };

    try {
        const res = await fetch(REQUEST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if(res.ok) {
            notify("Demande publiée avec succès !", "success");
            e.target.reset();
            refreshLists(); 
        } else {
            throw new Error("Erreur: " + res.status);
        }
    } catch (err) {
        notify("Erreur publication : " + err.message, "error");
    }
});

// ==========================================
// 3. RECHERCHE INTELLIGENTE (Port 8082)
// ==========================================
document.getElementById('searchForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const keywords = document.getElementById('searchKeywords').value;
    const date = document.getElementById('searchDate').value;
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '<em>Recherche...</em>';

    try {
        const res = await fetch(`${RECO_URL}/search?keywords=${keywords}&targetDate=${date}`);
        if(res.status === 204) {
            resultsDiv.innerHTML = '<p style="color:#f39c12">Aucun étudiant disponible ce jour-là.</p>';
            return;
        }
        const aidants = await res.json();
        let html = '<ul class="results-list">';
        aidants.forEach(a => {
            if(a.id !== currentUser.id) {
                html += `<li>
                    <strong>${a.prenom} ${a.nom}</strong> (${a.filiere}) <br>
                    <span style="color:#ffc107; font-weight:bold;">★ ${a.noteMoyenneAvis.toFixed(1)}</span>
                    <div style="font-size:0.85em; color:#666; margin-top:5px;">Dispo: ${a.disponibilites}</div>
                </li>`;
            }
        });
        html += '</ul>';
        resultsDiv.innerHTML = html;
    } catch (err) { 
        console.error("Erreur recherche:", err);
        resultsDiv.innerHTML = '<p style="color:red">Erreur service.</p>'; 
    }
});

// ==========================================
// 4. LISTES & ACTIONS 
// ==========================================
async function refreshLists() {
    const myContainer = document.getElementById('myRequestsContainer');
    const missionsContainer = document.getElementById('missionsContainer');
    
    // Affichage d'un état de chargement
    myContainer.innerHTML = '<em style="color:#666;">Chargement...</em>';
    missionsContainer.innerHTML = '<em style="color:#666;">Chargement...</em>';
    
    try {
        // 1. Récupérer TOUTES les demandes (Port 8081) 
        const res = await fetch(REQUEST_URL); 
        
        if(!res.ok) {
            throw new Error(`Service Request inaccessible (Status: ${res.status})`);
        }
        
        // Gestion du cas où la liste est vide
        let allRequests = [];
        if (res.status === 200) {
            const text = await res.text();
            allRequests = text ? JSON.parse(text) : [];
        } else if (res.status === 204) {
            allRequests = [];
        }

        console.log("Demandes récupérées:", allRequests);

        // A. Mes Demandes 
        const myReqs = allRequests.filter(r => r.studentId === currentUser.id);
        
        if(myReqs.length === 0) {
            myContainer.innerHTML = "<em>Aucune demande en cours.</em>";
        } else {
            const htmlPromises = myReqs.map(async req => {
                let statusHtml = `<span class="status-badge status-wait">En attente</span>`;
                let actionBtn = "";

                if(req.statut === "EN_COURS" && req.helperId) {
                    const helperName = await resolveName(req.helperId);
                    statusHtml = `<span class="status-badge status-active">Pris en charge par ${helperName}</span>`;
                    actionBtn = `<button class="btn btn-warning" style="width:100%; margin-top:10px; font-size:0.85em;" onclick="openRatingModal(${req.helperId}, '${helperName.replace(/'/g, "\\'")}')">Noter l'étudiant</button>`;
                }
                
                const dateAffichable = req.dateSouhaitee ? new Date(req.dateSouhaitee).toLocaleDateString() : "";
                
                return `<div class="item-card">
                    <strong>${req.titre}</strong><br>
                    <small style="color:#666;">Pour le : ${dateAffichable}</small>
                    <div style="margin:5px 0;">${statusHtml}</div>
                    ${actionBtn}
                </div>`;
            });
            myContainer.innerHTML = (await Promise.all(htmlPromises)).join('');
        }

        // B. Missions (Matching via Backend)
        if(!currentUser.competences || currentUser.competences.length === 0) {
            missionsContainer.innerHTML = "<em>Ajoutez des compétences pour voir les missions.</em>";
            return;
        }

        const mySkills = currentUser.competences.join(',');
        const resMatch = await fetch(`${REQUEST_URL}/match?skills=${mySkills}`);
        
        let matchingRequests = [];
        if (resMatch.status === 200) {
            const text = await resMatch.text();
            matchingRequests = text ? JSON.parse(text) : [];
        } else if (resMatch.status === 204) {
            matchingRequests = [];
        }

        console.log("Missions matchées:", matchingRequests);

        const finalMissions = matchingRequests.filter(req => {
            return req.studentId !== currentUser.id && (!req.statut || req.statut === "ATTENTE");
        });

        if(finalMissions.length === 0) {
            missionsContainer.innerHTML = "<em>Aucune mission pour l'instant.</em>";
        } else {
            const htmlPromises = finalMissions.map(async req => {
                const requesterName = await resolveName(req.studentId);
                const dateAffichable = req.dateSouhaitee ? new Date(req.dateSouhaitee).toLocaleDateString() : "";

                return `<div class="item-card" style="border-left:4px solid #28a745;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong>${req.titre}</strong>
                        <span style="color:#28a745; font-weight:bold; font-size:0.8em;">MATCH !</span>
                    </div>
                    <p style="font-size:0.9em; margin:5px 0;">Demandé par <strong>${requesterName}</strong></p>
                    <small>Pour le : ${dateAffichable}</small><br>
                    <button class="btn btn-success" style="width:100%; margin-top:8px; font-size:0.85em;" onclick="acceptMission(${req.id})">Accepter</button>
                </div>`;
            });
            missionsContainer.innerHTML = (await Promise.all(htmlPromises)).join('');
        }

    } catch (err) {
        console.error("Erreur refreshLists:", err);
        myContainer.innerHTML = `<p style="color:red; font-size:0.9em;">Erreur: ${err.message}</p>`;
        missionsContainer.innerHTML = `<p style="color:red; font-size:0.9em;">Erreur: ${err.message}</p>`;
    }
}

async function acceptMission(reqId) {
    if(!confirm("Accepter cette mission ?")) return;
    
    try {
        const res = await fetch(`${REQUEST_URL}/${reqId}/accept/${currentUser.id}`, { 
            method: 'PUT' 
        });
        
        if(res.ok) {
            notify("Mission acceptée !", 'success');
            refreshLists();
        } else {
            throw new Error("Erreur: " + res.status);
        }
    } catch(err) {
        notify("Erreur acceptation: " + err.message, 'error');
    }
}

// ==========================================
// 5. NOTATION
// ==========================================
function openRatingModal(helperId, helperName) {
    currentHelperIdToRate = helperId;
    document.getElementById('modalHelperId').textContent = helperName || helperId;
    document.getElementById('ratingModal').style.display = 'flex';
}

function closeModal() { 
    document.getElementById('ratingModal').style.display = 'none'; 
}

document.getElementById('ratingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = document.getElementById('modalRating').value;
    const data = { helperId: currentHelperIdToRate, newRating: parseInt(note) };
    
    try {
        const res = await fetch(`${RECO_URL}/review`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        if(res.status === 202) {
            notify("Avis enregistré avec succès !", 'success');
            e.target.reset();
            closeModal();
            refreshLists();
        } else {
            throw new Error("Erreur: " + res.status);
        }
    } catch(err) { 
        notify("Erreur notation: " + err.message, 'error'); 
    }
});