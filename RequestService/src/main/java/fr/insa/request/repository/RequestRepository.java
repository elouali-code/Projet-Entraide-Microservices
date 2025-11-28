package fr.insa.request.repository;

import fr.insa.request.model.HelpRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Collection; 

@Repository
public interface RequestRepository extends JpaRepository<HelpRequest, Long> {

    List<HelpRequest> findDistinctByMotsClesIn(Collection<String> motsCles);
}