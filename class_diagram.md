# HackHub Class Diagram

## Backend Domain Model

```mermaid
classDiagram
    namespace CommonLibrary {
        class BaseEntity {
            +Instant createdAt
            +Instant updatedAt
            +String createdBy
            +String lastModifiedBy
        }
    }

    namespace UserService {
        class User {
            +Long id
            +String username
            +String email
            +String firstName
            +String lastName
            +String phoneNumber
            +String address
            +String role
            +String otp
            +Instant otpExpiry
        }
        class PendingRegistration {
            +Long id
            +String username
            +String email
            +String password
            +String otp
            +Instant otpExpiry
        }
    }

    namespace EventService {
        class Event {
            +Long eventId
            +String eventName
            +String eventType
            +Instant startDate
            +Instant endDate
            +String location
            +String description
            +EventStatus eventStatus
            +Long organizerId
            +String organizerUserId
        }

        class Hackathon {
            +String theme
            +Integer duration
            +BigDecimal prizePool
            +Integer minTeamSize
            +Integer maxTeamSize
            +Set~String~ technologies
        }

        class Venue {
            +Long venueId
            +String venueName
            +String address
            +Integer capacity
            +Set~String~ facilities
        }

        class Team {
            +Long id
            +String name
            +String teamCode
            +String leaderUserId
        }

        class TeamMember {
            +Long id
            +String userId
            +TeamMemberStatus status
        }

        class ProblemStatement {
            +Long id
            +String title
            +String description
        }

        class Submission {
            +Long id
            +String repoUrl
            +String demoUrl
            +String description
        }

        class Registration {
            +Long registrationId
            +Instant registrationDate
            +RegistrationStatus registrationStatus
            +BigDecimal amount
            +Long attendeeId
        }

        class EventStatus {
            <<enumeration>>
            PLANNED
            PUBLISHED
            ONGOING
            COMPLETED
            CANCELLED
        }

        class RegistrationStatus {
            <<enumeration>>
            PENDING
            CONFIRMED
            CANCELLED
        }
    }

    %% Relationships
    User --|> BaseEntity
    PendingRegistration --|> BaseEntity
    Event --|> BaseEntity
    Team --|> BaseEntity
    TeamMember --|> BaseEntity
    Submission --|> BaseEntity
    Venue --|> BaseEntity
    Registration --|> BaseEntity
    
    Hackathon --|> Event
    Event "1" --> "0..1" Venue : has
    Event --> EventStatus : status
    Hackathon "1" --> "*" Team : participatingTeams
    Hackathon "1" --> "*" ProblemStatement : problemStatements
    Team "1" --> "*" TeamMember : members
    Submission "1" --> "1" Team : submittedBy
    Submission "*" --> "1" ProblemStatement : solves
    Registration "*" --> "1" Event : registersFor
    Registration --> RegistrationStatus : status
```

## Description
- **UserService**: Manages user identities (`User`) and temporary registration data (`PendingRegistration`).
- **EventService**: The core domain.
    - `Event` is the base class for events. `Hackathon` extends it with specific fields like `theme`, `prizePool`, etc.
    - `Venue` stores location details.
    - `Registration` tracks who is attending which event.
    - `Team` and `TeamMember` manage hackathon participation.
    - `ProblemStatement` defines the challenges in a hackathon.
    - `Submission` links a `Team`'s work to a `ProblemStatement`.
- **Inheritance**: specific entities inherit audit fields from `BaseEntity`.

## Notes
- `id` fields often use Snowflake IDs for distributed uniqueness.
- Cross-service references (e.g., `organizerUserId` in `Event` referring to `User`) are stored as Strings/IDs to maintain loose coupling between microservices.
