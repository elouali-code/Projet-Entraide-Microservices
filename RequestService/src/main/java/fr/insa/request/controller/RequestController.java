package fr.insa.request.controller;

import fr.insa.request.model.HelpRequest;
import fr.insa.request.service.RequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*") 
public class RequestController {

    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    // POST : Créer
    @PostMapping
    public ResponseEntity<HelpRequest> createRequest(@RequestBody HelpRequest request) {
        try {
             return new ResponseEntity<>(requestService.createRequest(request), HttpStatus.CREATED);
        } catch (RuntimeException e) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // GET : Lister Tout
    @GetMapping
    public List<HelpRequest> getAllRequests() {
        return requestService.getAllRequests();
    }

    // PUT : Accepter
    @PutMapping("/{id}/accept/{helperId}")
    public ResponseEntity<HelpRequest> acceptRequest(@PathVariable Long id, @PathVariable Long helperId) {
        try {
            return ResponseEntity.ok(requestService.acceptRequest(id, helperId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/match")
    public ResponseEntity<List<HelpRequest>> getMatchingRequests(@RequestParam List<String> skills) {
        List<HelpRequest> matches = requestService.findMatches(skills);
        
        if (matches.isEmpty()) {
            return ResponseEntity.noContent().build(); 
        }
        return ResponseEntity.ok(matches);
    }
}