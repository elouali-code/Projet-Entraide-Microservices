package fr.insa.user.controller;

import fr.insa.user.model.Student;
import fr.insa.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.CrossOrigin; // NOUVEL IMPORT

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {


    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<Student> registerStudent(@RequestBody Student student) {
        return new ResponseEntity<>(userService.saveStudent(student), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) { 
        Optional<Student> student = userService.findStudentById(id);
        return student.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student studentDetails) {
        return userService.findStudentById(id)
                .map(student -> {
                    student.setNoteMoyenneAvis(studentDetails.getNoteMoyenneAvis());
                    student.setNombreAvis(studentDetails.getNombreAvis()); // N'oubliez pas ce champ !
                 
                    // SAUVEGARDE EN BDD
                    return ResponseEntity.ok(userService.saveStudent(student));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        if (userService.findStudentById(id).isPresent()) {
            userService.deleteStudent(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/search/by-competences")
    public List<Student> searchByCompetences(@RequestParam List<String> keywords) {
        return userService.findByCompetences(keywords);
    }
}