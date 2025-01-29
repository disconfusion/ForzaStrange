<script>
  export let winner,
    p1,
    movesForWinningCounter,
    movesForBlocking,
    duplicateCoordinatesCounter,
    History;
</script>

<section>
  {#if winner}
    {#if winner === "Pareggio!"}
      <h3 style="color: orange;">Pareggio!</h3>
    {:else}
      <h3>
        Ha vinto
        <strong style="color :{winner === p1 ? 'blue' : 'red'};"
          >{winner}</strong
        >!
      </h3>
    {/if}
  {/if}
  <p>Mosse Sensate per vincere: <i>{movesForWinningCounter}</i></p>
  <p>Mosse Sensate per bloccare: <i>{movesForBlocking}</i></p>
  <p>Coordinate duplicate estratte: <i>{duplicateCoordinatesCounter}</i></p>
  <div id="HistoryBox">
    <h2>Storico</h2>
    <header>Round: Mossa G1 -- Mossa G2</header>
    <div id="History">
      {#each History as round, index}
        <div id="Round">
          {index + 1}: ({round.firstMove.x}, {round.firstMove.y}) -- ({round
            .secondMove.x}, {round.secondMove.y})
        </div>
      {/each}
    </div>
  </div>

  <button id="Reload" on:click={() => window.location.reload()}
    >Ricarica Pagina</button
  >
</section>

<style>
  h2 {
    text-align: center;
  }

  #HistoryBox {
    border: 2px solid black;
    padding: 10px;
  }

  #History {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-weight: 600;
  }
</style>
