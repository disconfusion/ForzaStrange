# StrangeFour

Strange Four è un motore semplicistico del gioco da tavolo Forza 4, dove la CPU gioca contro sè stessa.

# Idea del flusso

**Un'idea indicativa viene data nel Diagramma di flusso[here](./Diagramma%20di%20Flusso%20indicativo.jpg)**

## Abstract del funzionamento

Viene creata una matrice[rows][columns] `Table` e una frontiera lunga come il numero di colonne.

- Le celle ospiteranno `riferimenti a streak` che potrebbero espandersi in quella direzione, utili per raggiungere in modo diretto le streak avversarie da terminare quando si piazza un tassello, oppure per aggiornare altre celle alleate;
- Quando una cella è occupata da un tassello contiene l'id del giocatore(G1:1 oppure G2:2)
- Quando cella vuota vale `null`

`La frontiera` indica fino a dove il gioco si è spinto, utile ad indicare dove piazzare i prossimi tasselli.

Vengono inizializzate due liste collegate per giocatore contenute in `Streaks[]`;
**`La scelta` della lista collegata nasce dalla `necessità` di modificare spesso la priorità degli item, rendendo `costante` il costo di movimento all'interno della `lista`. Se si fosse utilizzato un array, questo costo sarebbe stato asintoticamente n**

Le `liste collegate` contengono item con un campo `streak` e sono ordinate per `priorità`:

- nella prima lista `in testa` vengono inserite sempre le streak da 3, `in coda` quelle da 2;
- la seconda contiene unicamente quelle da 1;

**Definizione di streak**
Una streak, in una data direzione, è un insieme formato da tutte le celle vuote o riempite da un alleato nel raggio di 3 caselle dalla radice.

- Le celle conterranno i riferimenti che puntano ad esse.

**Svolgimento del gioco**
Il gioco si svolge seguendo queste priorità: blocco streak, continua streak, mossa casuale.

- Vengono bloccate le streak avversarie da 3 oppure quelle simmetriche da 2 che hanno una casella adiacente valida per il piazzamento di un tassello;
- Vengono continuate le prime streak disponibili che hanno tasselli con celle adiacenti nella `frontiera` seguendo queste priorità: 3-2-1;
- Una mossa casuale viene fatta quando le altre due non sono possibili
