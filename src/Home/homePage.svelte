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

  //#region Game Input data
  let rows = 5;
  let cols = 5;
  let playerNames = ["", ""];
  let roundTime = 0.5; //Roundtime in seconds
  //#endregion Game Input data

  //#region Init Matrix&frontier

  let frontier;
  $: frontier = new Array(cols).fill(rows - 1); //Initializing frontier; for keeping track of possible moves for cols

  let Table = [[]];
  $: Table = Array.from({ length: rows }, () => Array(cols).fill(null)); //Initializing game Table
  //#endregion Inizializzazione Matrice

  //#region Init Streaks' linked lists
  let p1Streaks = new List(); //Player1's Linked List of real Streaks in the frame
  let p1PossibleStreaks = new List(); //Player1's Linked List of actual 1 "Streaks" in the frame
  let p2Streaks = new List(); //Player2's Linked List of real Streaks in the frame
  let p2PossibleStreaks = new List(); //Player2's Linked List of actual 1 "Streaks" in the frame

  let Streaks = [
    [p1Streaks, p1PossibleStreaks],
    [p2Streaks, p2PossibleStreaks],
  ];
  //#endregion Init Streaks' linked lists

  //#region Game Metadata
  let round;
  let History = []; //Initialize History; array of rounds

  let nMoves = 1;
  $: maxMoves = rows * cols;

  let winner = "";

  let movesForWinningCounter = 0;
  let movesForBlocking = 0;
  let duplicateCoordinatesCounter = 0;

  //#endregion Game Metadata

  //Toggle variable for input's game form
  let starting = true;

  /**
   * Setup start function
   */
  async function start() {
    //Saving player names
    playerNames[0] ? playerNames[0] : (playerNames[0] = "Giocatore 1");
    playerNames[1] ? playerNames[1] : (playerNames[1] = "Giocatore 2");
    //Toggle input form
    starting = false;
    //Scroll-Up to the Table
    document.getElementById("app")?.scrollIntoView({ behavior: "smooth" });
    //Game Rolls
    await play();
  }

  /**
   * Game loop
   */
  async function play() {
    let playOptions = [BlockStreak, continueStreak, RandomMove]; //Next Move priority queue

    //Make a move till there is a winner or there are no more available moves
    for (; !winner && nMoves < maxMoves + 1; nMoves++) {
      //Setting CPU's 'Thinking Time'
      roundTime ? await sleepAsync(roundTime * 1000) : undefined;

      //Making a move between functions in playOptions array
      for (let i = 0, moveDone = false; !moveDone && i < 3; i++) {
        moveDone = await Waiter(
          playOptions[i],
          ...[1 + ((nMoves + 1) % 2), (nMoves % 2) + 1]
        ); //when function did a move return true
      }
    }

    //tie
    if (!winner) {
      winner = "Pareggio!";
    }
  }

  /**
   * @param {Move} nextMove - Where to place player's piece
   * @param {number} player - Actual player
   * @param {number} opponent - Actual opponent
   */
  function placePiece(nextMove, player, opponent) {
    CleaningCell(Table[nextMove.y][nextMove.x], opponent); //Cleaning the chosen cell from opponent's streak item references
    frontier[nextMove.x]--; //Moving up the frontier
    UpdateNextMoves(nextMove.y, nextMove.x); //Updating player's streaks in the cell, and the streaks in the new frontier
    Table[nextMove.y][nextMove.x] = player; //Placing player's piece in the Table
    StartStreaks(nextMove.x, nextMove.y, player, opponent); //Starting root streaks from the cell

    //Taking track of rounds
    if (player == 1) {
      //Pushing new Round in the History
      round = new Round(nextMove, undefined);
      History.push(round);
      History = History;
    } else {
      //Setting Round's second move
      History[History.length - 1].secondMove = { ...nextMove };
      History = History;
    }
  }

  /**
   * @param {number} player - Actual player
   * @param {number} opponent - Actual opponent
   * @returns True when RandomMove is found
   */
  async function RandomMove(player, opponent) {
    let x;
    let y;
    let moveFound = false;

    //Get 10 Random numbers between cols till have a valid one
    while (!moveFound) {
      let possibleX = await RandomApi(0, cols, 10); //Random number from cols(Getting 10 numbers for not asking more than one HTTP request)

      //Looking for a valid number in possibleX array
      for (let randomNumber of possibleX) {
        //If selected column by random number is not full move is setted true
        if (frontier[randomNumber] != -1) {
          x = randomNumber;
          y = frontier[x];
          moveFound = true;
          break;
        }
        duplicateCoordinatesCounter++;
      }
    }
    await Waiter(placePiece, ...[new Move(y, x), player, opponent]);
    return true;
  }

  /**
   * @param {number} x - Root Streak's x coordinate
   * @param {number} y - Root Streak's y coordinate
   * @param {number} player - Actual player
   * @param {number} opponent - Actual opponent
   */
  function StartStreaks(x, y, player, opponent) {
    //Root move
    let rootMove = new Move(y, x);

    /**
     * @type {{ cl: Streak | null, ul: Streak | null, ur: Streak | null }}
     * Save streaks here later, for setOppositeStreaks function
     */
    let streaks = {
      cl: null,
      ul: null,
      ur: null,
    };

    //Getting valid directions where to build streaks
    let posDir = new PossibleDirection(y, x, frontier).getPossibleDirections();

    //Iterating on posDir
    for (let direction of posDir) {
      //Initializing the new Streak
      let streak = new Streak({
        rootMove: rootMove,
        direction: direction,
        player: player,
      });

      //Getting the Streak's offsets
      let dX = streak.getDeltaX();
      let dY = streak.getDeltaY();

      //Initializing Streak's Item
      let item = new Item(streak);

      //Building the Streak
      for (let i = 0; i < 4; i++) {
        //Saving next cell on the line(starting from root)
        let nextCell = Table[y + dY * i][x + dX * i];

        //Player's piece found on the line
        if (nextCell === player) {
          streak.streakCount += 1;
          //Winning condition
          if (streak.streakCount === 4) {
            //Saving winner's name
            winner = playerNames[streak.player - 1];
            return;
          }
          //If it's max the third cell on the line AND the adjacent frontier is on the line then add next move
          else {
            if (i < 3 && frontier[x + dX * (i + 1)] == y + dY * (i + 1)) {
              streak.addNextMove(new Move(y + dY * (i + 1), x + dX * (i + 1))); //pushing adjacent hole inte streak's nextMove array
            }
          }
        }
        //Opponent's piece found on the line, Stop the streak building
        else if (nextCell === opponent) {
          break;
        }
        //nextCell is empty on the line
        else {
          //if cell isn't pointed by any other streak, initialize new array
          if (!nextCell) {
            Table[y + dY * i][x + dX * i] = new Array();
          }
          Table[y + dY * i][x + dX * i].push(item); //Pushing the reference to the item(Streak) in the cell
          streak.addCellPointer(Table[y + dY * i][x + dX * i]); //Save the pointed cell by the streak, in the streak
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

  /**
   * @param {number} player - Actual player
   * @param {number} opponent - Actual opponent
   * @returns True if there are streaks to continue, otherwise False
   */
  function continueStreak(player, opponent) {
    //checking the list of streaks, returns first possible nextMove
    for (let i = 0; i < 2; i++) {
      let nextStreakItem = Streaks[player - 1][i].head; //Take first Item in the 3/2-streaks list

      //Continuing first streak found in the list
      for (; nextStreakItem; nextStreakItem = nextStreakItem.next) {
        let streak = nextStreakItem.streak; //getting streak reference from the list
        let nextMove = streak.nextMove; //Saving streak's nextMove's reference

        //if streak has next move, just continue first one in the list
        if (nextMove && nextMove.length) {
          placePiece(nextMove[0], player, opponent); //Placing the piece and do all the updating job on the cell
          //Incrementing 'Mosse Sensate per vincere' counter
          movesForWinningCounter++;
          return true;
        }
      }
    }

    return false;
  }

  /**
   * @param {number} player - Actual player
   * @param {number} opponent - Actual opponent
   * @returns True if there are streaks to Block, otherwise False
   * @description Blocking just opponent's 3 streaks or 2 symmetric streaks with nextMoves
   */
  function BlockStreak(player, opponent) {
    let bestOpponentStreakItem = Streaks[opponent - 1][0].head; //Getting opponent's longest streak item

    //doing the @Description job
    for (
      ;
      bestOpponentStreakItem;
      bestOpponentStreakItem = bestOpponentStreakItem.next
    ) {
      let bestOpponentStreak = bestOpponentStreakItem.streak; //Saving bestOpponentStreak reference
      let oppenentnextMove = bestOpponentStreak.nextMove; //Saving streak's nextMove array reference

      //If it's a 3-Streak AND has nextMove
      if (
        bestOpponentStreak.hasNextMove() &&
        bestOpponentStreak.streakCount === 3
      ) {
        placePiece(oppenentnextMove[0], player, opponent); //Place piece where the best opponent's next Move is
        //Incrementing 'Mosse sensate per bloccare'
        movesForBlocking++;
        return true;
      }
      //If opponent has a 2-symmetric streak
      else if (
        bestOpponentStreak.hasNextMove() &&
        bestOpponentStreak.oppositeDirectionStreak &&
        bestOpponentStreak.oppositeDirectionStreak.hasNextMove()
      ) {
        placePiece(oppenentnextMove[0], player, opponent); //Place piece where the best opponent's next Move is
        //Incrementing 'Mosse sensate per bloccare'
        movesForBlocking++;
        console.log("Blocking 2 streak %o", { ...bestOpponentStreak });
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
    //If cell not empty
    if (Array.isArray(cell) && cell.length) {
      //Iterating on items in the cell
      for (let item of [...cell]) {
        let streak = item.streak; //Saving streak
        //If it's opponent's streak
        if (streak.player === opponent) {
          //Remove Streak from every pointed cell
          for (let pointedCell of streak.cellsPointersInTheLine) {
            let iItem = pointedCell.indexOf(item); //Saving Streak's index in the pointedCell
            pointedCell.splice(iItem, 1); //Deleting streak from the pointed cell
          }
          item.detach(); //Detaching Streak item from the list, the garbage collector can now collect it
        }
      }
    }
  }

  /**
   * @param {number} y - y coordinate where to update nextMoves
   * @param {number} x - y coordinate where to update nextMoves
   * @param {Item[]} cell - Table[y][x]'s cell
   *
   * @description Update all player's nextMoves in the cell,
   * and do the same in the new frontier
   */
  function UpdateNextMoves(y, x, cell = Table[y][x]) {
    //Updating nextMoves in new frontier
    //If column not full AND cell not empty
    if (frontier[x] != -1 && Table[y - 1][x]) {
      //Iterating on items in the new frontier
      for (let item of Table[y - 1][x]) {
        //If isn't an up streak(It will be updated later)
        if (item.streak.direction !== "uc") {
          let move = new Move(y - 1, x);
          /**
           * @type {Streak}
           */
          item.streak.addNextMove(move); //Updating streak's nextMove array
        }
      }
    }

    //Updating nextMoves in the cell
    //If cell touched already in the past
    if (Array.isArray(cell)) {
      //Iterating on items in the cell
      for (let item of cell) {
        /**
         * @type {Streak}
         */
        let streak = item.streak;
        streak.streakCount++;

        item = item.detach(); //Detaching item for updating its position in the list

        //Winning condintion
        if (streak.streakCount === 4) {
          winner = playerNames[streak.player - 1]; //Setting winner's name
          return;
        }
        //Changing streak 'continuing priority' to 'Highest'
        else if (streak.streakCount === 3) {
          Streaks[streak.player - 1][0].prepend(item);
        }
        ////Changing streak 'continuing priority' to 'Middle'
        else if (streak.streakCount === 2) {
          Streaks[streak.player - 1][0].append(item);
        }

        streak.cellsPointersInTheLine = streak.cellsPointersInTheLine.filter(
          (pointer) => pointer != cell
        ); //Removing cell pointer of done move

        //deciding direction offsets for nextMove
        let dY = streak.getDeltaY();
        let dX = streak.getDeltaX();

        //If move is not the last cell of the streak, then add next move in the streak
        if (
          Boolean(Math.abs(dX)) == (streak.rootMove.x + dX * 3 != x) &&
          Boolean(Math.abs(dY)) == (streak.rootMove.y + dY * 3 != y) &&
          frontier[x + dX] == y + dY
        ) {
          streak.addNextMove(new Move(y + dY, x + dX));
        }

        //If nextMove not null remove done move from nextMove array
        if (streak.nextMove) {
          streak.nextMove = streak.nextMove.filter(
            (move) => move.x != x || move.y != y
          );
        }
      }
    }
  }
</script>

<h1>Strange Four</h1>
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
          <!-- svelte-ignore a11y_autofocus -->
          <input
            name="Rows"
            bind:value={rows}
            type="number"
            step="1"
            min="5"
            autofocus
          />
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
