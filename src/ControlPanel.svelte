<script>
  let manualGameNumber = '';
  let bestOfValue = '';
  let message = '';

  async function sendData(body) {
    try {
      const res = await fetch('http://localhost:1234/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await res.json();
      message = result.message;
    } catch (err) {
      message = 'Failed to send data: ' + err.message;
    }
  }

  function incrementGame() {
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
</script>

<div class="panel">
  <h2>Game Control Panel</h2>

  <button on:click={incrementGame}>➕ Next Game</button>
  <button on:click={resetGame}>🔁 Reset Series</button>

  <div class="manual-set">
    <label for="gameInput">Set Game #:</label>
    <input id="gameInput" type="number" bind:value={manualGameNumber} min="1" />
    <button on:click={setGameNumber}>Set</button>
  </div>

  <div class="manual-set">
    <label for="bestOfInput">Best Of:</label>
    <input id="bestOfInput" type="number" bind:value={bestOfValue} min="1" />
    <button on:click={setBestOf}>Set</button>
  </div>

  {#if message}
    <p style="margin-top: 1rem; color: green">{message}</p>
  {/if}
</div>

<style>
  h2 {
    color: black;
  }

  .panel {
    padding: 1rem;
    background: #f4f4f4;
    border-radius: 10px;
    width: 500px;
    height: 420px;
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

  label {
    color: black;
  }
</style>












































<!-- //   let dropdownValue = '';
//   let inputValue = '';

//   async function sendData() {
//     const data = {
//       dropdownValue,
//       inputValue,
//     };

//     try {
//       const response = await fetch('http://localhost:1234/api/data', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//       });

//       if (response.ok) {
//         const result = await response.json();
//         console.log('Response from App 2:', result);
//       } else {
//         console.error('Error sending data to App 2:', response.statusText);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   }
// </script>

// <div>
//   <h1>Control Panel</h1>
//   <label>
//     Series length:
//     <select bind:value={dropdownValue}>
//       <option value="" disabled>Select amount of games...</option>
//       <option value="Option 1">1</option>
//       <option value="Option 2">2</option>
//       <option value="Option 3">3</option>
//       <option value="Option 4">4</option>
//       <option value="Option 5">5</option>
//       <option value="Option 6">6</option>
//       <option value="Option 7">7</option>
//     </select>
//   </label>

//   <label>
//     Enter a Value:
//     <input type="text" bind:value={inputValue} />
//   </label>

//   <button on:click={sendData}>Send Data</button>
// </div>

// <style>
//   label {
//     display: block;
//     margin-bottom: 1rem;
//     height: 50px;
//     font-size: 24px;
//   }

//   button {
//     padding: 0.5rem 1rem;
//     background-color: #007BFF;
//     color: white;
//     border: none;
//     border-radius: 4px;
//     cursor: pointer;
//   }

//   button:hover {
//     background-color: #0056b3;
//   }

//   select {
//     height: 50px;
//     font-size: 24px;
//   }

//   input {
//     height: 50px;
//     font-size: 24px;
//   }
// </style> -->
