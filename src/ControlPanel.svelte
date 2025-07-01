<script>
  import { onMount, onDestroy } from 'svelte';

  let ws;
  let countdown = 0, countdownInterval;

  let currentGame = 1, bestOf = 5;
  let blueWins = '', orangeWins = '';
  let blueTeam = '', orangeTeam = '';
  let blueLogoUrl = '', orangeLogoUrl = '';
  let manualGameNumber = '', bestOfValue = '3';
  let message = '', startSeries = false;

  // Connect to the WebSocket server to get live updates
  function connectWebSocket() {
    ws = new WebSocket('ws://localhost:1234');

    ws.onopen = () => {
      console.log('WebSocket connected to panel data server');
      message = 'Connected to server';
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'panelData') {
          // Update UI reactively from WS push data
          const data = msg.data;
          currentGame = data.currentGame ?? currentGame;
          bestOf = data.bestOf ?? bestOf;
          blueWins = data.blueWins?.toString() ?? blueWins;
          orangeWins = data.orangeWins?.toString() ?? orangeWins;
          blueTeam = data.blueTeam?.toString() ?? blueTeam;
          orangeTeam = data.orangeTeam?.toString() ?? orangeTeam;
          blueLogoUrl = data.blueLogo?.toString() ?? blueLogoUrl;
          orangeLogoUrl = data.orangeLogo?.toString() ?? orangeLogoUrl;
          startSeries = data.startSeries ?? false;
          manualGameNumber = currentGame.toString();
          bestOfValue = bestOf.toString();
          message = 'Data updated from server';
          console.log('Received panelData via WS:', data);

          if (msg.data.seriesOver === true) {
            countdown = 70;
            clearInterval(countdownInterval);
            countdownInterval = setInterval(() => {
              if (--countdown <= 0) clearInterval(countdownInterval);
            }, 1000);
          } else if (msg.data.seriesOver === false && msg.data.startSeries === false) {
            startSeries = false;
            message = 'Series reset — ready to start';
            clearInterval(countdownInterval);
          }
        }
      } catch (err) {
        console.error('WS message parse error:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      message = 'WebSocket error occurred';
    };

    ws.onclose = () => {
      console.log('WebSocket closed, attempting reconnect in 3 seconds...');
      message = 'Disconnected from server, reconnecting...';
      setTimeout(connectWebSocket, 3000);
    };
  }

   function sendData(payload) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    } else {
      message = 'WebSocket not connected';
    }
  }

  function incrementGame() {
    if (currentGame >= bestOf) {
      message = `Cannot increment — current game (${currentGame}) >= Best Of (${bestOf})`;
      return;
    }
    sendData({ incrementGame: true });
  }

  function resetGame() {
    sendData({ resetGame: true });
  }

  function setGameNumber() {
    const num = parseInt(manualGameNumber);
    if (!isNaN(num)) {
      sendData({ setGameNumber: num });
      manualGameNumber = '';
    }
  }

  function setBestOf() {
    const num = parseInt(bestOfValue);
    if (!isNaN(num)) {
      sendData({ bestOf: num });
      bestOfValue = '';
    }
  }

  function setBlueWins() {
    const num = parseInt(blueWins);
    if (!isNaN(num)) {
      sendData({ blueWins: num });
      blueWins = '';
    }
  }

  function setOrangeWins() {
    const num = parseInt(orangeWins);
    if (!isNaN(num)) {
      sendData({ orangeWins: num });
      orangeWins = '';
    }
  }

  function setBlueTeam() {
  const trimmed = orangeLogoUrl.trim();
  if (trimmed) {
      sendData({ blueTeam: trimmed });
      blueTeam = '';
    }
  }

  function setOrangeTeam() {
  const trimmed = orangeLogoUrl.trim();
  if (trimmed) {
      sendData({ orangeTeam: trimmed });
      orangeTeam = '';
    }
  }

  function setBlueLogo() {
  const trimmed = blueLogoUrl.trim();
  if (trimmed) {
    sendData({ blueLogo: trimmed });
    blueLogoUrl = '';
  }
}

  function setOrangeLogo() {
  const trimmed = orangeLogoUrl.trim();
  if (trimmed) {
    sendData({ orangeLogo: trimmed });
    orangeLogoUrl = '';
  }
}

  function startSeriesNow() {
    sendData({ startSeries: true });
  }

  onMount(() => {
    connectWebSocket();
  });

  onDestroy(() => {
    if (ws) ws.close();
  });
</script>

<div class="panel">
  <h2>Game Control Panel</h2>
  <p style="margin-top: 0.5rem; font-weight: bold;">
    Game {currentGame} of Bo{bestOf}
  </p>

  <button on:click={incrementGame}>➕ Next Game</button>
  <button on:click={resetGame}>🔁 Reset Series</button>

  <div style="margin-top: 2rem;">
    <button on:click={startSeriesNow} disabled={startSeries}>✅ Start Series</button>
    {#if startSeries}
      <p style="color: green; margin-top: 0.5rem;">Series has started</p>
    {/if}
  </div>

  <div class="manual-set-l">
    <div class="manual-set">
      <label for="blueLogoInput">Blue Logo URL:</label>
      <input id="blueLogoInput" type="text" bind:value={blueLogoUrl} />
      <button on:click={setBlueLogo}>Set</button>
      <button on:click={() => {
        sendData({ blueLogo: '' });
        blueLogoUrl = '';
      }}>Reset</button>
    </div>

    <div class="manual-set">
      <label for="orangeLogoInput">Orange Logo URL:</label>
      <input id="orangeLogoInput" type="text" bind:value={orangeLogoUrl} />
      <button on:click={setOrangeLogo}>Set</button>
      <button on:click={() => {
        sendData({ orangeLogo: '' });
        orangeLogoUrl = '';
      }}>Reset</button>
    </div>
  </div>

  <div class="manual-set-l">
    <div class="manual-set">
      <label for="blueTeamInput">Blue Team Name:</label>
      <input id="blueTeamInput" type="text" bind:value={blueTeam} />
      <button on:click={setBlueTeam}>Set</button>
      <button on:click={() => {
        sendData({ blueTeam: '' });
        blueTeam = '';
      }}>Reset</button>
    </div>

    <div class="manual-set">
      <label for="orangeTeamInput">Orange Team Name:</label>
      <input id="orangeTeamInput" type="text" bind:value={orangeTeam} />
      <button on:click={setOrangeTeam}>Set</button>
      <button on:click={() => {
        sendData({ orangeTeam: '' });
        orangeTeam = '';
      }}>Reset</button>
    </div>
  </div>

  <div class="manual-set-g">
    <div class="manual-set">
      <label for="gameInput">Set Game #:</label>
      <input id="gameInput" type="number" autocomplete="off" bind:value={manualGameNumber} min="1" />
      <button on:click={setGameNumber}>Set</button>
    </div>

    <div class="manual-set">
      <label for="bestOfInput">Best Of:</label>
      <input id="bestOfInput" type="number" autocomplete="off" bind:value={bestOfValue} min="1" />
      <button on:click={setBestOf}>Set</button>
    </div>
  </div>

  <div class="manual-set-w">
    <div>
      <label for="blueWinsInput">Blue Wins:</label>
      <input id="blueWinsInput" type="number" autocomplete="off" min="0" bind:value={blueWins} />
      <button on:click={setBlueWins}>Set</button>
    </div>

    <div>
      <label for="orangeWinsInput">Orange Wins:</label>
      <input id="orangeWinsInput" type="number" autocomplete="off" min="0" bind:value={orangeWins} />
      <button on:click={setOrangeWins}>Set</button>
    </div>
  </div>

  {#if message}
    <p style="margin-top: 1rem; color: green">{message}</p>
  {/if}
</div>

<style>
  h2, p {
    color: black;
  }

  .panel {
    background-color: rgba(255, 255, 255, 0.2);
    padding: 1rem;
    border-radius: 10px;
    width: 65%;
    height: 80%;
    max-width: 800px;
    margin: 2rem auto;
    text-align: center;
    box-shadow: 0 0 10px rgba(0,0,0,0.6);
    font-family: sans-serif;
    text-shadow: 0 0 5px #FFF, 0 0 10px #FFF, 0 0 20px #000000;
    font-weight: 600;
  }

  button {
    margin: 0.5rem;
    margin-top: 2rem;
    padding: 0.4rem 1rem;
    font-size: 1rem;
    cursor: pointer;
  }

  .manual-set {
    margin-top: 2rem;
  }

  .manual-set-l {
    margin: auto;
    width: 80%;
    margin-top: 2rem;
    box-shadow: 0 0 10px rgba(0,0,0,0.6);
  }

  .manual-set-g {
    margin: auto;
    width: 60%;
    margin-top: 2rem;
    box-shadow: 0 0 10px rgba(0,0,0,0.8);
  }

  .manual-set-w {
    margin: auto;
    width: 60%;
    margin-top: 2rem;
    box-shadow: 0 0 10px rgba(0,0,0,0.8);
  }

  input {
    width: 60px;
    margin: 0 0.5rem;
    padding: 0.3rem;
  }

  #orangeLogoInput, #blueLogoInput, #blueTeamInput, #orangeTeamInput {
    width: 140px;
  }

  label {
    color: black;
  }
</style>
