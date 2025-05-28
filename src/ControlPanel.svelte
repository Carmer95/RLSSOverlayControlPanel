<script>
  import { onMount, onDestroy } from 'svelte';

  let manualGameNumber = '';
  let bestOfValue = '3';
  let message = '';
  let blueWins = '';
  let orangeWins = '';
  let currentGame = 1;
  let bestOf = 5;
  let blueLogoUrl = '';
  let orangeLogoUrl = '';

  let ws;

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
          blueLogoUrl = data.blueLogo?.toString() ?? blueLogoUrl;
          orangeLogoUrl = data.orangeLogo?.toString() ?? orangeLogoUrl;
          manualGameNumber = currentGame.toString();
          bestOfValue = bestOf.toString();
          message = 'Data updated from server';
          console.log('Received panelData via WS:', data);
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

  // Initial fetch fallback if WS is not connected yet
  async function loadInitialData() {
    try {
      const res = await fetch('http://localhost:1234/api/data');
      if (!res.ok) throw new Error(`Failed to load panel data: ${res.statusText}`);
      const data = await res.json();

      currentGame = data.currentGame ?? 1;
      bestOf = data.bestOf ?? 5;

      manualGameNumber = currentGame.toString();
      bestOfValue = bestOf.toString();
      blueWins = data.blueWins?.toString() ?? '';
      orangeWins = data.orangeWins?.toString() ?? '';
      blueLogoUrl = data.blueLogo?.toString() ?? '';
      orangeLogoUrl = data.orangeLogo?.toString() ?? '';

      console.log('Loaded initial panel data:', data);
      message = 'Initial data loaded';
    } catch (err) {
      message = `Error loading initial data: ${err.message}`;
    }
  }

  async function sendData(body) {
    console.log('Sending:', body);
    try {
      const res = await fetch('http://localhost:1234/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error (${res.status}): ${text}`);
      }

      const result = await res.json();
      message = result.message;

      // After POST, no need to manually reload data since WS will push updates
      // But optionally keep fallback:
      // await loadInitialData();
    } catch (err) {
      message = 'Failed to send data: ' + err.message;
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

  onMount(() => {
    loadInitialData();
    connectWebSocket();
  });

  onDestroy(() => {
    if (ws) ws.close();
  });
</script>

<div class="panel">
  <h2>Game Control Panel</h2>
  <p style="margin-top: 0.5rem; font-weight: bold;">
    Game {currentGame} of Best of {bestOf}
  </p>

  <button on:click={incrementGame}>➕ Next Game</button>
  <button on:click={resetGame}>🔁 Reset Series</button>

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

  <div class="manual-set">
    <label for="blueWinsInput">Blue Wins:</label>
    <input id="blueWinsInput" type="number" autocomplete="off" min="0" bind:value={blueWins} />
    <button on:click={setBlueWins}>Set</button>
  </div>

  <div class="manual-set">
    <label for="orangeWinsInput">Orange Wins:</label>
    <input id="orangeWinsInput" type="number" autocomplete="off" min="0" bind:value={orangeWins} />
    <button on:click={setOrangeWins}>Set</button>
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
    padding: 1rem;
    background: #f4f4f4;
    border-radius: 10px;
    width: 500px;
    height: 820px;
    max-width: 800px;
    margin: 2rem auto;
    text-align: center;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    font-family: sans-serif;
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

  input {
    width: 60px;
    margin: 0 0.5rem;
    padding: 0.3rem;
  }

  #orangeLogoInput {
    width: 140px;
  }

  #blueLogoInput {
    width: 140px;
  }

  label {
    color: black;
  }
</style>
