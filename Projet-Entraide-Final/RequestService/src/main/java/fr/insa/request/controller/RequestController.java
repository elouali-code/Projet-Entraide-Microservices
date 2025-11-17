package fr.insa.request.controller;

import fr.insa.request.model.HelpRequest;
import fr.insa.request.service.RequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class RequestController {

    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    // POST /api/requests : Créer une nouvelle demande
    @PostMapping
    public ResponseEntity<HelpRequest> createRequest(@RequestBody HelpRequest request) {
        try {
             HelpRequest newRequest = requestService.createRequest(request);
             return new ResponseEntity<>(newRequest, HttpStatus.CREATED);
        } catch (RuntimeException e) {
             // Gérer les erreurs inter-service (ex: Étudiant introuvable)
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // Ajoutez ici les endpoints GET pour lister les demandes
}