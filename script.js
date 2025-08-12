const API_URL = 'https://api-mural.onrender.com/recados';

let recados = [];
let sortAsc = true;

const listaEl = document.getElementById('mural-lista');
const ordenarBtn = document.getElementById('ordenarBtn');
const refreshBtn = document.getElementById('refreshBtn');

const btnAdd = document.getElementById('btn-add');
const dialogAdd = document.getElementById('dialog-add-recado');
const formRecado = document.getElementById('form-recado');
const btnCancel = document.getElementById('btn-cancel');

// buscar os recadinhos
async function fetchRecados() {
  listaEl.innerHTML = '<li class="placeholder">Carregando recados...</li>';
  try {
    const resp = await fetch(API_URL);
    if (!resp.ok) throw new Error(Erro ${resp.status});
    recados = await resp.json();
    renderRecados();
  } catch (err) {
    console.error('Erro ao buscar recados:', err);
    listaEl.innerHTML = '<li class="error">Não foi possível carregar os recados.</li>';
  }
}

// data certinha
function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

// cor do post-it alternando
function pickColorClass(index) {
  const cores = ['white', 'pink', 'blue'];
  return cores[index % cores.length];
}


function renderRecados() {
  listaEl.innerHTML = '';
  if (!recados || recados.length === 0) {
    listaEl.innerHTML = '<li class="empty">Nenhum recado encontrado.</li>';
    return;
  }

  const arr = [...recados];
  arr.sort((a, b) => {
    const aa = (a.autor || '').toLowerCase();
    const bb = (b.autor || '').toLowerCase();
    return sortAsc ? aa.localeCompare(bb) : bb.localeCompare(aa);
  });

  arr.forEach((r, idx) => {
    const li = document.createElement('li');
    li.className = postit ${pickColorClass(idx)};

    const autor = document.createElement('strong');
    autor.textContent = r.autor || 'Anônimo';

    const msg = document.createElement('p');
    msg.textContent = r.mensagem || '';

    const data = document.createElement('small');
    data.textContent = Postado em: ${formatDate(r.data_criacao)};

    li.append(autor, msg, data);
    listaEl.appendChild(li);
  });
}

// ordenação por autor
ordenarBtn.addEventListener('click', () => {
  sortAsc = !sortAsc;
  ordenarBtn.textContent = sortAsc ? 'Ordenar por autor A→Z' : 'Ordenar por autor Z→A';
  renderRecados();
});

// atualiza
refreshBtn.addEventListener('click', fetchRecados);

// abri o dialog
btnAdd.addEventListener('click', () => {
  dialogAdd.showModal();
});

// cancela o dialog
btnCancel.addEventListener('click', () => {
  dialogAdd.close();
  formRecado.reset();
});

// submete um novo recado
formRecado.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(formRecado);
  const autor = formData.get('autor').trim();
  const mensagem = formData.get('mensagem').trim();

  if (!autor || !mensagem) {
    alert('Por favor, preencha autor e mensagem.');
    return;
  }

  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autor, mensagem }),
    });

    if (!resp.ok) throw new Error(Erro ${resp.status});

    // fecha dialogo
    dialogAdd.close();
    formRecado.reset();

    // atualiza
    fetchRecados();
  } catch (err) {
    alert('Erro ao publicar recado. Tente novamente.');
    console.error(err);
  }
});

// carrega os recados ao iniciar
fetchRecados();