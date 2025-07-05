fetch("http://localhost:8000/api/transactions/latest")
  .then(res => res.json())
  .then(tx => {
    document.getElementById("latest").innerText = `€${tx.amount} on ${tx.category}`;
  });
