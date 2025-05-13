<script>
  let dropdownValue = '';
  let inputValue = '';

  async function sendData() {
    const data = {
      dropdownValue,
      inputValue,
    };

    try {
      const response = await fetch('http://localhost:1234/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Response from App 2:', result);
      } else {
        console.error('Error sending data to App 2:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
</script>

<div>
  <h1>Control Panel</h1>
  <label>
    Series length:
    <select bind:value={dropdownValue}>
      <option value="" disabled>Select amount of games...</option>
      <option value="Option 1">1</option>
      <option value="Option 2">2</option>
      <option value="Option 3">3</option>
      <option value="Option 4">4</option>
      <option value="Option 5">5</option>
      <option value="Option 6">6</option>
      <option value="Option 7">7</option>
    </select>
  </label>

  <label>
    Enter a Value:
    <input type="text" bind:value={inputValue} />
  </label>

  <button on:click={sendData}>Send Data</button>
</div>

<style>
  label {
    display: block;
    margin-bottom: 1rem;
    height: 50px;
    font-size: 24px;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }

  select {
    height: 50px;
    font-size: 24px;
  }

  input {
    height: 50px;
    font-size: 24px;
  }
</style>
