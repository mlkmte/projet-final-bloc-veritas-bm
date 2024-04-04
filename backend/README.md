# PROJET 2 MINTE BAFODE

J'ai classé mes tests en 5 catégories : 
- l'initialisation
- La fonction addVoteur
- La fonction addProposal
- La fonction setVote
- La fonction tallyVotes

Voici mes tests de coverage : 

est Voting Contract       
    INITIALISATION DU CONTRAT
      ✔ Check si owner = déployeur du contrat
    VERIFICATION DES EVENTS
      ✔ event VoterRegistered (66ms)
    VERIFICATION DES REQUIRES
      ✔ addVoter : ajout d'un voteur impossible si ce n'est pas l'owner (89ms)
      ✔ addVoter : vérifier si la sessionn d'enregistrement du voteur est ouverte
      ✔ addVoter : vérifier si le voteur existe déjà (54ms)
    Set and Get
      ✔ TEST FONCTIONS addProposal (125ms)

  Test Voting Contract
    INITIALISATION DU CONTRAT
      ✔ Check si owner = déployeur du contrat
      ✔ Check si le contrat à bien été déployé
    FONCTION addVoter
      ✔ Ajout d'un voteur impossible si ce n'est pas l'owner (42ms)
      ✔ Vérifier qu'on est bien sans le state RegisteringVoters
      ✔ Vérification si le voteur existe déjà
      ✔ Vérification si l'event VoterRegistered a bien été émit
    FONCTION addProposal
      ✔ Fonction addProposal impossible si ce n'est pas un voteur
      ✔ Vérifier qu'on est bien dans le state ProposalsRegistrationStarted
      ✔ Ajout d'une proposal impossible si ce n'est pas un voteur
      ✔ Vérifier que la préposition n'est pas vide (47ms)
      ✔ Voir si la proposal a bien été ajouté dans la liste (148ms)
      ✔ Vérification si l'event ProposalRegistered a bien été emit (81ms)
    FONCTION setVote
      ✔ Fonction setVote impossible si ce n'est pas un voteur (48ms)
      ✔ Vérifier qu'on est bien dans le state VotingSessionStarted (59ms)
      ✔ Vérifier si le voteur a déjà voté (140ms)
      ✔ Vérifier si la proposition a voter existe (110ms)
      ✔ Vérifier si les infos du voteur ont bien été mise à jour une fois qu'il a voté (151ms)
      ✔ Vérifier que le voteCount a bien été pris en compte dans le tableau des proposition (120ms)
      ✔ Vérification si l'event Voted a bien été emit (102ms)
    FONCTION tallyVotes
      ✔ Fonction tallyVotes impossible si ce n'est pas l'owner
      ✔ Vérifier qu'on est bien dans le state VotingSessionEnded (77ms)
      ✔ Vérifier que la proposition gagnante est bien la bonne (303ms)
      ✔ Vérification si l'event VotesTallied a bien été emit (112ms)


  29 passing (5s)

-------------|----------|----------|----------|----------|----------------|
File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------|----------|----------|----------|----------|----------------|
 contracts\  |      100 |    70.83 |      100 |      100 |                |
  voting.sol |      100 |    70.83 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|
All files    |      100 |    70.83 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|