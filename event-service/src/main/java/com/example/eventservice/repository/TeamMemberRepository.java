package com.example.eventservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.eventservice.entity.TeamMember;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    @Query("SELECT tm FROM TeamMember tm WHERE tm.userId = :userId AND tm.team.hackathon.eventId = :hackathonId")
    Optional<TeamMember> findByUserIdAndHackathonId(String userId, Long hackathonId);

    List<TeamMember> findByTeamId(Long teamId);

    List<TeamMember> findByUserId(String userId);

    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, String userId);

    long countByTeamIdAndStatus(Long teamId, com.example.eventservice.entity.TeamMemberStatus status);
}
