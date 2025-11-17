package fr.insa.request.service;

import fr.insa.request.model.HelpRequest;
import fr.insa.request.repository.RequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class RequestService {
    
    private final RequestRepository requestRepository;
    private final WebClient webClient;
    private final String userServiceUrl = "http://localhost:8080"; 

    public RequestService(RequestRepository requestRepository, WebClient.Builder webClientBuilder) {
        this.requestRepository = requestRepository;
        // Initialisation du WebClient pour les appels inter-services
        this.webClient = webClientBuilder.baseUrl(userServiceUrl).build();
    }

    public HelpRequest createRequest(HelpRequest request) {
        
        // 1. VALIDATION INTER-SERVICE : Vérifier si l'étudiant demandeur existe
        // Le WebClient va appeler GET http://localhost:8080/api/users/{studentId}
        webClient.get()
                .uri("/api/users/{id}", request.getStudentId())
                .retrieve()
                // CORRECTION DE LA SYNTAXE onStatus : gère le 404/4xx du UserService
                .onStatus(status -> status.is4xxClientError(), clientResponse -> {
                    // Renvoie une exception si l'étudiant n'est pas trouvé (404)
                    return Mono.error(new RuntimeException("Erreur: Étudiant ID " + request.getStudentId() + " introuvable."));
                })
                .bodyToMono(Void.class)
                .block(); // Bloque ici pour attendre la validation avant de continuer
        
        
        // 2. LOGIQUE MÉTIER : Initialisation et Persistance
        if (request.getStatut() == null) {
             request.setStatut("attente");
        }
        
        // 3. Persistance de la demande dans la BDD locale du RequestService
        return requestRepository.save(request);
    }
}