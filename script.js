/* ========================================
   BARBER PRIME — script.js
   Funcionalidades interativas com JavaScript
   ======================================== */

// ─────────────────────────────────────────
// 1. MODO CLARO / ESCURO
// ─────────────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const htmlEl      = document.documentElement;

// Recupera preferência salva
const temaSalvo = localStorage.getItem('barber-theme') || 'dark';
aplicarTema(temaSalvo);

themeToggle.addEventListener('click', () => {
  const atual = htmlEl.getAttribute('data-theme');
  const novo  = atual === 'dark' ? 'light' : 'dark';
  aplicarTema(novo);
  localStorage.setItem('barber-theme', novo);
});

function aplicarTema(tema) {
  htmlEl.setAttribute('data-theme', tema);
  if (tema === 'light') {
    themeIcon.className = 'bi bi-sun-fill';
    themeToggle.title   = 'Mudar para modo escuro';
  } else {
    themeIcon.className = 'bi bi-moon-stars-fill';
    themeToggle.title   = 'Mudar para modo claro';
  }
}

// ─────────────────────────────────────────
// 2. ANIMAÇÃO DE CONTADORES (Hero Stats)
// ─────────────────────────────────────────
function animarContadores() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const alvo     = parseInt(el.getAttribute('data-target'));
    const duracao  = 2000;
    const inicio   = performance.now();

    function atualizar(agora) {
      const decorrido  = agora - inicio;
      const progresso  = Math.min(decorrido / duracao, 1);
      // Easing out quad
      const eased      = 1 - (1 - progresso) * (1 - progresso);
      el.textContent   = Math.floor(eased * alvo);
      if (progresso < 1) requestAnimationFrame(atualizar);
      else el.textContent = alvo;
    }

    requestAnimationFrame(atualizar);
  });
}

// Dispara contadores quando a hero fica visível
const heroObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animarContadores();
      heroObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) heroObserver.observe(heroStats);

// ─────────────────────────────────────────
// 3. REVEAL AO SCROLL (Animação de seções)
// ─────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.section-reveal').forEach(el => {
  revealObserver.observe(el);
});

// ─────────────────────────────────────────
// 4. SIMULAÇÃO DE PEDIDO / ORÇAMENTO
// ─────────────────────────────────────────
const carrinho     = { itens: [], total: 0 };
const carrinhoEl   = document.getElementById('carrinho');
const carrinhoLista = document.getElementById('carrinhoItens');
const carrinhoTotalEl = document.getElementById('carrinhoTotal');

document.querySelectorAll('.btn-adicionar').forEach(btn => {
  btn.addEventListener('click', () => {
    const card    = btn.closest('.serv-card');
    const nome    = card.getAttribute('data-servico');
    const preco   = parseFloat(card.getAttribute('data-preco'));

    // Verifica se já foi adicionado
    const jaExiste = carrinho.itens.find(i => i.nome === nome);
    if (jaExiste) {
      mostrarToast(`"${nome}" já está no orçamento!`);
      return;
    }

    carrinho.itens.push({ nome, preco });
    carrinho.total += preco;
    renderizarCarrinho();

    btn.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i> Adicionado!';
    btn.disabled  = true;
    btn.style.opacity = '0.7';
  });
});

document.getElementById('limparCarrinho').addEventListener('click', () => {
  carrinho.itens = [];
  carrinho.total  = 0;
  renderizarCarrinho();
  // Reativa todos os botões
  document.querySelectorAll('.btn-adicionar').forEach(btn => {
    btn.innerHTML = '<i class="bi bi-plus-circle me-1"></i> Adicionar';
    btn.disabled  = false;
    btn.style.opacity = '1';
  });
});

function renderizarCarrinho() {
  carrinhoLista.innerHTML = '';

  if (carrinho.itens.length === 0) {
    carrinhoEl.style.display = 'none';
    return;
  }

  carrinhoEl.style.display = 'block';
  carrinho.itens.forEach((item, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${item.nome}</span>
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="color:var(--gold);font-weight:600;">R$ ${item.preco}</span>
        <button class="item-remover" data-idx="${idx}" title="Remover">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    `;
    carrinhoLista.appendChild(li);
  });

  carrinhoTotalEl.textContent = `R$ ${carrinho.total}`;

  // Botões de remover
  carrinhoLista.querySelectorAll('.item-remover').forEach(btn => {
    btn.addEventListener('click', () => {
      const i   = parseInt(btn.getAttribute('data-idx'));
      const rem = carrinho.itens.splice(i, 1)[0];
      carrinho.total -= rem.preco;

      // Reativa o botão do card correspondente
      document.querySelectorAll('.serv-card').forEach(card => {
        if (card.getAttribute('data-servico') === rem.nome) {
          const addBtn = card.querySelector('.btn-adicionar');
          addBtn.innerHTML = '<i class="bi bi-plus-circle me-1"></i> Adicionar';
          addBtn.disabled  = false;
          addBtn.style.opacity = '1';
        }
      });

      renderizarCarrinho();
    });
  });
}

// ─────────────────────────────────────────
// 5. FAVORITAR SERVIÇOS
// ─────────────────────────────────────────
document.querySelectorAll('.favorito-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const icone = btn.querySelector('i');
    btn.classList.toggle('ativo');
    if (btn.classList.contains('ativo')) {
      icone.className = 'bi bi-heart-fill';
      mostrarToast('Adicionado aos favoritos! ❤️');
    } else {
      icone.className = 'bi bi-heart';
    }
  });
});

// ─────────────────────────────────────────
// 6. GALERIA — VER MAIS + LIGHTBOX
// ─────────────────────────────────────────
const btnVerMais  = document.getElementById('btnVerMais');
const extrasEl    = document.querySelectorAll('.galeria-extra');
let mostrandoMais = false;

btnVerMais.addEventListener('click', () => {
  mostrandoMais = !mostrandoMais;
  extrasEl.forEach(el => {
    el.style.display = mostrandoMais ? 'block' : 'none';
  });
  btnVerMais.innerHTML = mostrandoMais
    ? '<i class="bi bi-dash-circle me-2"></i>Ver menos'
    : '<i class="bi bi-images me-2"></i>Ver mais fotos';
});

// Lightbox
const lightbox    = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
let imagensAtivas = [];
let indexAtivo    = 0;

function abrirLightbox(imgs, idx) {
  imagensAtivas = imgs;
  indexAtivo    = idx;
  lightboxImg.src = imgs[idx];
  lightbox.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function fecharLightbox() {
  lightbox.style.display = 'none';
  document.body.style.overflow = '';
}

function navLightbox(dir) {
  indexAtivo = (indexAtivo + dir + imagensAtivas.length) % imagensAtivas.length;
  lightboxImg.src = imagensAtivas[indexAtivo];
}

document.querySelectorAll('.galeria-img-wrap').forEach((wrap, idx, todos) => {
  wrap.addEventListener('click', () => {
    const imgs = Array.from(todos).map(w => w.querySelector('img').src);
    abrirLightbox(imgs, idx);
  });
});

document.querySelector('.lightbox-close').addEventListener('click', fecharLightbox);
document.querySelector('.lightbox-prev').addEventListener('click', () => navLightbox(-1));
document.querySelector('.lightbox-next').addEventListener('click', () => navLightbox(1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) fecharLightbox(); });

document.addEventListener('keydown', e => {
  if (lightbox.style.display === 'flex') {
    if (e.key === 'Escape') fecharLightbox();
    if (e.key === 'ArrowLeft')  navLightbox(-1);
    if (e.key === 'ArrowRight') navLightbox(1);
  }
});

// ─────────────────────────────────────────
// 7. BOTÃO VOLTAR AO TOPO
// ─────────────────────────────────────────
const btnTopo = document.getElementById('btnTopo');

window.addEventListener('scroll', () => {
  btnTopo.classList.toggle('visivel', window.scrollY > 400);
});

btnTopo.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─────────────────────────────────────────
// 8. NAVBAR — muda aparência ao rolar
// ─────────────────────────────────────────
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 60) {
    navbar.style.padding = '8px 0';
    navbar.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
  } else {
    navbar.style.padding = '14px 0';
    navbar.style.boxShadow = 'none';
  }
});

// ─────────────────────────────────────────
// UTILITÁRIO — Toast de notificação
// ─────────────────────────────────────────
function mostrarToast(msg) {
  const ja = document.getElementById('toast-barber');
  if (ja) ja.remove();

  const toast = document.createElement('div');
  toast.id = 'toast-barber';
  toast.textContent = msg;
  Object.assign(toast.style, {
    position:      'fixed',
    bottom:        '100px',
    left:          '50%',
    transform:     'translateX(-50%)',
    background:    'var(--gold)',
    color:         '#000',
    padding:       '12px 24px',
    borderRadius:  '50px',
    fontWeight:    '600',
    fontSize:      '0.88rem',
    zIndex:        '99999',
    boxShadow:     '0 8px 24px rgba(212,175,55,0.4)',
    animation:     'fadeUp 0.3s ease',
    pointerEvents: 'none',
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}
