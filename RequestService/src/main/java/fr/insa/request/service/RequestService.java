package fr.insa.request.service;

import fr.insa.request.model.HelpRequest;
import fr.insa.request.repository.RequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Optional;

@Service
public class RequestService {
    
    private final RequestRepository requestRepository;
    private final WebClient webClient;
    private final String userServiceUrl = "http://localhost:8080"; 

    public RequestService(RequestRepository requestRepository, WebClient.Builder webClientBuilder) {
        this.requestRepository = requestRepository;
        this.webClient = webClientBuilder.baseUrl(userServiceUrl).build();
    }

    // 1. Créer une demande (avec validation inter-service)
    public HelpRequest createRequest(HelpRequest request) {
        webClient.get()
                .uri("/api/users/{id}", request.getStudentId())
                .retrieve()
                .onStatus(status -> status.is4xxClientError(), clientResponse -> 
                    Mono.error(new RuntimeException("Étudiant introuvable"))
                )
                .bodyToMono(Void.class)
                .block(); 
        
        if (request.getStatut() == null) {
             request.setStatut("ATTENTE");
        }
        return requestRepository.save(request);
    }

    // 2. Lister toutes les demandes
    public List<HelpRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    // 3. Accepter une demande
    public HelpRequest acceptRequest(Long requestId, Long helperId) {
        Optional<HelpRequest> optionalRequest = requestRepository.findById(requestId);
        if (optionalRequest.isPresent()) {
            HelpRequest req = optionalRequest.get();
            req.setStatut("EN_COURS");
            req.setHelperId(helperId);
            return requestRepository.save(req);
        } else {
            throw new RuntimeException("Demande introuvable.");
        }
    }

    public List<HelpRequest> findMatches(List<String> skills) {
        // Appelle la méthode magique du repository
        return requestRepository.findDistinctByMotsClesIn(skills);
    }
}