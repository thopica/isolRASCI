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
  const serviceartSet = new Set();

  data.forEach(row => {
    kategorieSet.add(row.serviceKategorie);
    const beschreibungText = row.serviceBeschreibung.replace(/<[^>]*>/g, '');
    beschreibungSet.add(beschreibungText);
    if (row.serviceart) {
      serviceartSet.add(row.serviceart);
    }
  });

  fillSelect('filterKategorie', kategorieSet);
  fillSelect('filterBeschreibung', beschreibungSet);
  fillSelect('filterServiceart', serviceartSet);
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

function renderTable(scrollToSearch = true) {
  const tbody = document.querySelector('#dataTable tbody');
  tbody.innerHTML = '';

  const kategorie = document.getElementById('filterKategorie').value;
  const beschreibungFilter = document.getElementById('filterBeschreibung').value;
  const verantwortung = document.getElementById('filterVerantwortung').value;
  const serviceartFilter = document.getElementById('filterServiceart')?.value;
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();

  const highlightMatch = (text) => {
    if (!searchQuery || !text.toLowerCase().includes(searchQuery)) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.replace(regex, `<span class="highlight">$1</span>`);
  };

  const filtered = data.filter(row => {
    const matchKategorie = !kategorie || row.serviceKategorie === kategorie;
    const beschreibungText = row.serviceBeschreibung.replace(/<[^>]*>/g, '');
    const matchBeschreibung = !beschreibungFilter || beschreibungText === beschreibungFilter;

    let matchVerantwortung = true;
    if (verantwortung === 'isolutions') {
      matchVerantwortung = row.isolutions?.includes('R');
    } else if (verantwortung === 'kunde') {
      matchVerantwortung = row.kunde?.includes('R');
    }

    const matchServiceart = !serviceartFilter || row.serviceart === serviceartFilter;

    const rowText = `${row.serviceKategorie} ${beschreibungText} ${row.aktivitaet} ${row.isolutions} ${row.kunde}`.toLowerCase();
    const matchSearch = !searchQuery || rowText.includes(searchQuery);

    return matchKategorie && matchBeschreibung && matchVerantwortung && matchServiceart && matchSearch;
  });

  let firstMatchRow = null;

  filtered.forEach((row, index) => {
    const beschrPlain = row.serviceBeschreibung.replace(/<[^>]*>/g, '');
    const beschrLinkMatch = row.serviceBeschreibung.match(/href="(.*?)"/);
    const beschrLink = beschrLinkMatch ? beschrLinkMatch[1] : null;

    const displayBeschreibung = beschrLink
      ? `<a href="${beschrLink}" target="_blank">${highlightMatch(beschrPlain)}</a>`
      : highlightMatch(beschrPlain);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${highlightMatch(row.serviceKategorie)}</td>
      <td>${displayBeschreibung}</td>
      <td>${highlightMatch(row.aktivitaet)}</td>
      <td>${highlightMatch(row.isolutions || '')}</td>
      <td>${highlightMatch(row.kunde || '')}</td>
      <td>${highlightMatch(row.serviceart || '')}</td>
    `;
    if (!firstMatchRow && index === 0) {
      firstMatchRow = tr;
    }
    tbody.appendChild(tr);
  });

  if (firstMatchRow && scrollToSearch) {
    firstMatchRow.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

document.getElementById('filterKategorie').addEventListener('change', () => renderTable(false));
document.getElementById('filterBeschreibung').addEventListener('change', () => renderTable(false));
document.getElementById('filterVerantwortung').addEventListener('change', () => renderTable(false));
document.getElementById('filterServiceart')?.addEventListener('change', () => renderTable(false));
document.getElementById('searchInput').addEventListener('input', () => renderTable(true));

document.getElementById('resetButton').addEventListener('click', () => {
  document.getElementById('filterKategorie').value = '';
  document.getElementById('filterBeschreibung').value = '';
  document.getElementById('filterVerantwortung').value = '';
  if (document.getElementById('filterServiceart')) {
    document.getElementById('filterServiceart').value = '';
  }
  document.getElementById('searchInput').value = '';
  renderTable(false);
});

loadData();
