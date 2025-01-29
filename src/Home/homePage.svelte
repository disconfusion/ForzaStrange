<script>
  import { Round } from "../Classes/Round";
  import { RandomApi } from "../Servicies/RandomApi";
  import { Move } from "../Classes/Move";
  import { Streak } from "../Classes/Streak";
  import { Item, List } from "../Data Structures/linked-list";
  import { Waiter } from "../Servicies/Waiter.js";
  import { sleepAsync } from "../Servicies/SleepAsync";
  import { PossibleDirection } from "../Classes/PossibleDirections";
  import Riepilogo from "../Riepilogo/Riepilogo.svelte";
  import { setOppositeStreaks } from "../functions/setOppositeStreaks";

  let starting = true;
  let playerNames = ["", ""];
  let movesForWinningCounter = 0;
  let movesForBlocking = 0;
  let duplicateCoordinatesCounter = 0;

  /*Making Game Table */
  //RICORDA IDEA BARRA DELLA PERCENTUALE PROPORZIONALE ALLE CELLE PUNTATE DALLE STREAK
  let rows = 5;
  let cols = 5;

  let frontier;
  $: frontier = new Array(cols).fill(rows - 1); //Initializing frontier; for keeping track of possible moves for cols

  let Table = [[]];

  $: Table = Array.from({ length: rows }, () => Array(cols).fill(null)); //Initializing game Table

  //Setting Game metadata
  let p1Streaks = new List(); //Player1's Linked List of real Streaks in the frame
  let p1PossibleStreaks = new List(); //Player1's Linked List of actual 1 "Streaks" in the frame
  let p2Streaks = new List(); //Player2's Linked List of real Streaks in the frame
  let p2PossibleStreaks = new List(); //Player2's Linked List of actual 1 "Streaks" in the frame

  let Streaks = [
    [p1Streaks, p1PossibleStreaks],
    [p2Streaks, p2PossibleStreaks],
  ];

  let round;
  let roundTime = 0.5; //Roundtime in seconds
  let History = []; //Initialize History; array of rounds
  let nMoves = 1;
  $: maxMoves = rows * cols;
  let winner = "";

  async function start() {
    playerNames[0] ? playerNames[0] : (playerNames[0] = "Giocatore 1");
    playerNames[1] ? playerNames[1] : (playerNames[1] = "Giocatore 2");
    starting = false;
    await play();
    console.log("\n\n\n------Fine------");
  }

  async function play() {
    let playOptions = [BlockStreak, continueStreak, RandomMove]; //Priorities of next move
    console.log("starting the game...");

    //Make a move till there is a winner or there are no more available moves
    for (; !winner && nMoves < maxMoves + 1; nMoves++) {
      //Setting CPU's Thinking Time
      roundTime ? await sleepAsync(roundTime * 1000) : undefined;

      console.log(
        "Round n: %d\nPlayer %d Thinking...\nPlayer %d waiting...",
        nMoves,
        1 + ((nMoves + 1) % 2),
        (nMoves % 2) + 1
      );

      //Making a move between functions in playOptions array
      for (let i = 0, moveDone = false; !moveDone && i < 3; i++) {
        moveDone = await Waiter(
          playOptions[i],
          ...[1 + ((nMoves + 1) % 2), (nMoves % 2) + 1]
        ); //when function did best move set to true
      }
      console.log("Move Done:%o\n\n\n", Table);
      Table = Table;
      if (nMoves % 2 == 0) {
        console.log("History %o: ", [...History]);
        console.log("Player 1 streaks: ", p1Streaks, p1PossibleStreaks);
        console.log("Player 2 streaks: ", p2Streaks, p2PossibleStreaks);
        console.log(
          "-----------------------------------Round Completed-----------------------------------\n\n\n\n\n\n\n\n"
        );
      }
    }

    //tie
    if (!winner) {
      winner = "Pareggio!";
    }
  }

  /**
   * @param {Move} nextMove - Where to place player's piece
   */
  function placePiece(nextMove, player, opponent) {
    CleaningCell(Table[nextMove.y][nextMove.x], opponent);
    //If cell pointed by some streak
    frontier[nextMove.x]--; //Moving up the frontier
    UpdateNextMoves(nextMove.y, nextMove.x);
    Table[nextMove.y][nextMove.x] = player;
    console.log("[[Piece placed... %s]]", Table[nextMove.y][nextMove.x]);

    StartStreaks(nextMove.x, nextMove.y, player, opponent);

    //Taking track of rounds
    if (player == 1) {
      round = new Round(nextMove, undefined);
      History.push(round);
      History = History;
    } else {
      History[History.length - 1].secondMove = { ...nextMove };
      History = History;
    }
  }

  //Da riscrivere
  async function RandomMove(player, opponent) {
    let possibleX = await RandomApi(0, cols, 10); //Random number from cols
    let x;
    let y; //Putting the piece in frontier of a random col
    for (let randomNumber of possibleX) {
      if (frontier[randomNumber] != -1) {
        x = randomNumber;
        y = frontier[x];
        break;
      }
      duplicateCoordinatesCounter++;
    }
    console.log("[[Random Nums: %o]]", ...[possibleX]);
    console.log("[[Random move: y:%d  x:%d]]", y, x);
    await Waiter(placePiece, ...[new Move(y, x), player, opponent]);

    return true;
  }

  function StartStreaks(x, y, player, opponent) {
    //forse deve memorizzare quale ha gia espanso
    //@param x:int; row
    //@param y:int; column
    //@param opponent: int; could be 1 or 2
    //DA RIFARE, MANCA TUTTA LA PARTE DELLA CREAZIONE DELL ARAY DI PUNTATORI NELLE STREAK

    let rootMove = new Move(y, x);
    console.log("[[Creando streaks di mossa: %o]]", rootMove);

    /**
     * @type {{ cl: Streak | null, ul: Streak | null, ur: Streak | null }}
     */
    let streaks = {
      cl: null,
      ul: null,
      ur: null,
    };

    let posDir = new PossibleDirection(y, x, frontier).getPossibleDirections();

    for (let direction of posDir) {
      let streak = new Streak({
        rootMove: rootMove,
        direction: direction,
        player: player,
      });

      let dX = streak.getDeltaX();
      let dY = streak.getDeltaY();

      let item = new Item(streak);

      for (let i = 0; i < 4; i++) {
        let nextCell = Table[y + dY * i][x + dX * i];

        //Player's piece found on the line
        if (nextCell === player) {
          streak.streakCount += 1; //incrementing streak counter

          //Winning condition
          if (streak.streakCount === 4) {
            winner = playerNames[streak.player - 1];
            return;
          }
          //If it's max the third cell checked AND the adjacent frontier is on the line
          else {
            if (i < 3 && frontier[x + dX * (i + 1)] == y + dY * (i + 1)) {
              streak.addNextMove(new Move(y + dY * (i + 1), x + dX * (i + 1))); //pushing adjacent hole, as the nextMove of the streak, to the found piece for continuing the streak
            }
          }
        }
        //Opponent's piece found on the line
        else if (nextCell === opponent) {
          break;
        }
        //Cell is empty on the line
        else {
          //if cell isn't pointed by anyone
          if (!nextCell) {
            Table[y + dY * i][x + dX * i] = new Array();
          }
          Table[y + dY * i][x + dX * i].push(item); //Pushing the pointer to the item(Streak) in the cell
          streak.addCellPointer(Table[y + dY * i][x + dX * i]);
        }

        //Streak analysed, pushing it in the right list
        if (i == 3) {
          if (streaks[streak.direction] === null) {
            streaks[streak.direction] = streak;
          } else {
            setOppositeStreaks(streak, streaks);
          }

          //3 streak
          if (streak.streakCount == 3) {
            Streaks[player - 1][0].prepend(item);
          }
          //2 streak
          else if (streak.streakCount == 2) {
            Streaks[player - 1][0].append(item);
          }
          //1 streak
          else {
            Streaks[player - 1][1].append(item);
          }
        }
      }
    }
  }

  function continueStreak(player, opponent) {
    //checking the list of streaks, returns first possible nextMove
    for (let i = 0; i < 2; i++) {
      let nextStreakItem = Streaks[player - 1][i].head; //Take first priority streak holder

      //prima streak che trovo(con streak count più alto) la contuinuo
      for (; nextStreakItem; nextStreakItem = nextStreakItem.next) {
        let streak = nextStreakItem.streak; //getting streak reference from the list
        let nextMove = streak.nextMove;

        //if streak has next move, just do the first one in the list
        if (nextMove && nextMove.length) {
          console.log("[[Continuing streak: %o]]", { ...streak });
          placePiece(nextMove[0], player, opponent);
          movesForWinningCounter++;
          return true;
        }
      }
    }

    return false;
  }

  //return true if Block first opponent's 3-streak, false if there is none
  function BlockStreak(player, opponent) {
    let bestOpponentStreakItem = Streaks[opponent - 1][0].head; //Getting opponent's longest streak item

    console.log("Checking if there are any streaks to block!", {
      ...bestOpponentStreakItem,
    });

    //check opponent's best streaks list for finding a 3-streak and if it has a next move then kill it and return true
    for (
      ;
      bestOpponentStreakItem;
      bestOpponentStreakItem = bestOpponentStreakItem.next
    ) {
      let bestOpponentStreak = bestOpponentStreakItem.streak;
      let oppenentnextMove = bestOpponentStreak.nextMove;
      console.log(
        "Item found",
        { ...bestOpponentStreak },
        bestOpponentStreak.hasNextMove()
      );

      if (
        bestOpponentStreak.hasNextMove() &&
        bestOpponentStreak.streakCount === 3
      ) {
        console.log("[[Blocking player's %d streak %o]]", opponent, {
          ...bestOpponentStreak,
        });
        placePiece(oppenentnextMove[0], player, opponent);
        movesForBlocking++;
        return true;
      }
      //checking if opponent has a 2-symmetric streak
      else if (
        bestOpponentStreak.hasNextMove() &&
        bestOpponentStreak.oppositeDirectionStreak &&
        bestOpponentStreak.oppositeDirectionStreak.hasNextMove()
      ) {
        console.log("[[STREAK DA DUE BLOCCATA]]");
        placePiece(oppenentnextMove[0], player, opponent);
        movesForBlocking++;
        return true;
      }
    }
    return false;
  }

  /**
   * @param {Item[]} cell - cell containing the opponent's streaks that have to be killed
   * @param {number} opponent - who's the opponent now?
   */
  function CleaningCell(cell, opponent) {
    //For every streak in the cell pick a streak
    if (Array.isArray(cell) && cell.length) {
      console.log(
        "[[Cleaning cell(%o) from player %d pointers...]]",
        [...cell],
        opponent
      );
      for (let item of [...cell]) {
        let streak = item.streak;
        //If opponent's streak
        if (streak.player === opponent) {
          console.log("{{Streak %o is being canceled}}", { ...streak });
          //For every cell pointed of cellsPointersInTheLine remove the item reference in cells
          console.log("{{Pointed cells by Streak %o}}", [
            ...streak.cellsPointersInTheLine,
          ]);
          for (let cellPointed of streak.cellsPointersInTheLine) {
            let iItem = cellPointed.indexOf(item);
            cellPointed.splice(iItem, 1); //Removing from cell reference to the streak

            console.log(
              "{{Erasing cell %o from %o}}",
              [...cellPointed],
              [...streak.cellsPointersInTheLine]
            );
          }
          item.detach(); //Detaching Streak item from the list, the garbage collector can now collect it
          console.log("[Item erased %o]", { ...item });
        }
      }
    }
  }

  /**
   * @param {number} y - y coordinate where to update nextMoves
   * @param {number} x - y coordinate where to update nextMoves
   * @param {Item[]} cell - Table[y][x]'s cell
   *
   * Update all player's nextMoves from the cell,
   * and updates all the nextMoves of streaks pointing to the frontier
   */
  function UpdateNextMoves(y, x, cell = Table[y][x]) {
    console.log(
      "[[Updating cell(%d, %d) = %O...]]",
      y,
      x,
      cell ? [...cell] : "Vuota"
    );
    //Updating nextMoves of new frontier pointing streaks
    if (frontier[x] != -1 && Table[y - 1][x]) {
      for (let item of Table[y - 1][x]) {
        if (item.streak.direction !== "uc") {
          let move = new Move(y - 1, x);
          /**
           * @type {Streak}
           */
          item.streak.addNextMove(move);
          console.log(
            "[[Updating frontier of y: %d, x:%d\nUpdating %o\n\n",
            y - 1,
            x,
            { ...item.streak }
          );
        }
      }
    }
    if (Array.isArray(cell)) {
      for (let item of cell) {
        /**
         * @type {Streak}
         */
        let streak = item.streak;
        streak.streakCount++;
        item = item.detach();
        console.log("Moving %o to %d list", { ...item }, streak.streakCount);
        if (streak.streakCount === 4) {
          winner = playerNames[streak.player - 1];
          return;
        } else if (streak.streakCount === 3) {
          Streaks[streak.player - 1][0].prepend(item);
        } else if (streak.streakCount === 2) {
          Streaks[streak.player - 1][0].append(item);
        }

        console.log("[[streak cell pointers before %o]]", [
          ...streak.cellsPointersInTheLine,
        ]);
        streak.cellsPointersInTheLine = streak.cellsPointersInTheLine.filter(
          (pointer) => pointer != cell
        ); //Removing pointer to nextMove cell from the list
        console.log("[[streak cell pointers after %o]]", [
          ...streak.cellsPointersInTheLine,
        ]);

        //deciding direction offsets for nextMove
        let deltaY = 0; //direction: "c"
        if (streak.direction[0] == "u") {
          deltaY = -1;
        } else if (streak.direction[0] == "d") {
          deltaY = +1;
        }

        let deltaX = 0; //direction: "cc"
        if (streak.direction[1] == "l") {
          deltaX = -1;
        } else if (streak.direction[1] == "r") {
          deltaX = +1;
        }

        console.log("[[DELTAY: %d, DELTAX: %d]]", deltaY, deltaX);
        //If move is not the last cell of the streak, then add next move on the direction as nextMove
        if (
          Boolean(Math.abs(deltaX)) == (streak.rootMove.x + deltaX * 3 != x) &&
          Boolean(Math.abs(deltaY)) == (streak.rootMove.y + deltaY * 3 != y) &&
          frontier[x + deltaX] == y + deltaY
        ) {
          streak.addNextMove(new Move(y + deltaY, x + deltaX));
        }

        if (streak.nextMove) {
          streak.nextMove = streak.nextMove.filter(
            (move) => move.x != x || move.y != y
          ); //removing done move from nextMove array
        }

        console.log(
          "Cleaned LIST OF nextMoves: %o",
          streak.nextMove ? [...streak.nextMove] : "Nessuna Next move"
        );
      }
    }
  }
</script>

<h1>Forza Strange</h1>
<main>
  <section id="GameTable">
    <div id="tab">
      {#each Table as row}
        <div class="row">
          {#each row as cell}
            {#if cell != 1 && cell != 2}
              <span class="empty"></span>
            {:else}
              <span
                class="tile"
                style="background-color :{cell == 1 ? 'blue' : 'red'};"
              ></span>
            {/if}
          {/each}
        </div>
      {/each}
    </div>
  </section>

  {#if starting}
    <form on:submit|preventDefault={start}>
      <section id="GameInput">
        <header>Se vuoi, modifica il numero di Righe e Colonne</header>
        <h3>Righe</h3>
        <div class="rowsInputContainer">
          <input name="Rows" bind:value={rows} type="number" step="1" min="5" />
        </div>
        <h3>Colonne</h3>
        <div class="colsInputContainer">
          <input
            name="Cols"
            class="rowsInput-c"
            bind:value={cols}
            type="number"
            step="1"
            min="5"
          />
        </div>
        <header>
          Se vuoi, modifica il nome dei Giocatori che la CPU simulerà
        </header>
        <h4>
          Giocatore 1 <aside class="color-one"></aside>
        </h4>
        <div>
          <input
            bind:value={playerNames[0]}
            type="text"
            name="Giocatore1"
            id="Player"
            placeholder="Giocatore 1"
          />
        </div>
        <h4>
          Giocatore 2 <aside class="color-two"></aside>
        </h4>
        <div>
          <input
            bind:value={playerNames[1]}
            type="text"
            name="Giocatore2"
            id="Opponent"
            placeholder="Giocatore 2"
          />
        </div>
        <header>
          Se vuoi, scegli per quanto la CPU deve pensare prima di fare una mossa
        </header>
        <h4>Secondi per Round</h4>
        <div>
          <input
            bind:value={roundTime}
            type="text"
            name="RoundTime"
            id="roundTime"
          />
        </div>
        <button>Start</button>
      </section>
    </form>
  {:else}
    <Riepilogo
      {winner}
      p1={playerNames[0]}
      {movesForWinningCounter}
      {movesForBlocking}
      {duplicateCoordinatesCounter}
      {History}
    />
  {/if}
</main>

<style>
</style>
