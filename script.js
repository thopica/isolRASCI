let data = [];

async function loadData() {
  const response = await fetch('data.json');
  data = await response.json();
  populateFilters();
  renderTable();
}

function populateFilters() {
  const kategorieSet = new Set();
  const beschreibungSet = new Set();

  data.forEach(row => {
    kategorieSet.add(row.serviceKategorie);
    beschreibungSet.add(row.serviceBeschreibung);
  });

  fillSelect('filterKategorie', kategorieSet);
  fillSelect('filterBeschreibung', beschreibungSet);
}

function fillSelect(id, items) {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">Alle</option>';
  items.forEach(item => {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

function renderTable() {
  const tbody = document.querySelector('#dataTable tbody');
  tbody.innerHTML = '';

  const kategorie = document.getElementById('filterKategorie').value;
  const beschreibung = document.getElementById('filterBeschreibung').value;
  const verantwortung = document.getElementById('filterVerantwortung').value;

  const filtered = data.filter(row => {
    const matchKategorie = !kategorie || row.serviceKategorie === kategorie;
    const matchBeschreibung = !beschreibung || row.serviceBeschreibung === beschreibung;

    let matchVerantwortung = true;
    if (verantwortung === 'isolutions') {
      matchVerantwortung = row.isolutions?.includes('R');
    } else if (verantwortung === 'kunde') {
      matchVerantwortung = row.kunde?.includes('R');
    }

    return matchKategorie && matchBeschreibung && matchVerantwortung;
  });

  filtered.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.serviceKategorie}</td>
      <td>${row.serviceBeschreibung}</td>
      <td>${row.aktivitaet}</td>
      <td>${row.isolutions || ''}</td>
      <td>${row.kunde || ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById('filterKategorie').addEventListener('change', renderTable);
document.getElementById('filterBeschreibung').addEventListener('change', renderTable);
document.getElementById('filterVerantwortung').addEventListener('change', renderTable);

loadData();

