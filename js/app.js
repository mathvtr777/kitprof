/* ==========================================================================
   CONFIGURAÇÃO — ajuste apenas estes valores
   ========================================================================== */
var CONFIG = {
  // Link do checkout do plano Kit Completo (R$ 25,90)
  checkoutCompleto: 'https://pay.wiapy.com/31k2V64jZ0mj',

  // Link do checkout do plano Essencial (R$ 12)
  checkoutEssencial: 'https://checkout.wiven.com.br/checkout/cmw0qs0ms0bcd01pv1qixbpio?offer=G975JBL',

  // Link do checkout do upgrade promocional (R$ 17,90)
  checkoutUpgrade: 'https://checkout.wiven.com.br/checkout/cmw0r67iq0d5m01pvia45qm04?offer=USCVF5G',

  // Preço mostrado no pop-up de upgrade.
  precoUpgrade: '17,90'
};

// Promo date + repeating countdown
(function () {
  var months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var dateEl = document.getElementById('promoDate');

  function updatePromoDate() {
    if (!dateEl) return;
    var now = new Date();
    var d = now.getDate();
    var shortDate = ' (' + (d < 10 ? '0' + d : d) + '/' + String(now.getMonth() + 1).padStart(2, '0') + ')';
    var longDate = ' (' + d + ' de ' + months[now.getMonth()] + ' de ' + now.getFullYear() + ')';

    dateEl.innerHTML = 'A promoção encerra hoje' +
      '<span class="promo-bar__date promo-bar__date--short"></span>' +
      '<span class="promo-bar__date promo-bar__date--long"></span>';
    dateEl.querySelector('.promo-bar__date--short').textContent = shortDate;
    dateEl.querySelector('.promo-bar__date--long').textContent = longDate;
  }

  updatePromoDate();
  // Check every 60 seconds if the day changed so the promo date stays accurate across days
  setInterval(updatePromoDate, 60000);

  var DURATION = 15 * 60; // 15-minute repeating urgency countdown
  var remaining = DURATION;
  var timerEl = document.getElementById('countdown');
  function render() {
    if (!timerEl) return;
    var m = Math.floor(remaining / 60);
    var s = remaining % 60;
    timerEl.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }
  render();
  setInterval(function () {
    remaining -= 1;
    if (remaining < 0) remaining = DURATION;
    render();
  }, 1000);
})();

// Scroll reveal
(function () {
  var els = document.querySelectorAll('.reveal, .reveal-scale');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });
})();

// FAQ accordion
(function () {
  document.querySelectorAll('.faq-item button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('open');
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
})();

// Marquees (amostras + mapas mentais) — drag to scroll (mouse) + autoscroll em loop infinito
function initMarquee(trackId, pxPerSecond) {
  var track = document.getElementById(trackId);
  if (!track) return;
  var viewport = track.parentElement; // .marquee-mask
  var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Duplica os cards uma vez para permitir o loop contínuo sem "salto" visível
  if (pxPerSecond && !reduzMovimento) {
    Array.from(track.children).forEach(function (el) {
      var clone = el.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

  var isDown = false;
  var startX = 0;
  var startScroll = 0;
  var paused = false;
  var resumeTimer = null;

  function pause() {
    paused = true;
    if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; }
  }
  function resumeSoon() {
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function () { paused = false; }, 900);
  }

  viewport.addEventListener('pointerdown', function (e) {
    pause();
    if (e.pointerType !== 'mouse') return; // touch/pen scroll natively, no need to hijack
    isDown = true;
    startX = e.clientX;
    startScroll = viewport.scrollLeft;
    viewport.classList.add('is-dragging');
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener('pointermove', function (e) {
    if (!isDown) return;
    viewport.scrollLeft = startScroll - (e.clientX - startX);
  });

  function endDrag() {
    isDown = false;
    viewport.classList.remove('is-dragging');
    resumeSoon();
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('pointerleave', function () { if (isDown) endDrag(); });
  viewport.addEventListener('touchend', resumeSoon);
  viewport.addEventListener('mouseenter', pause);
  viewport.addEventListener('mouseleave', resumeSoon);

  if (!pxPerSecond || reduzMovimento) return;

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pause(); else resumeSoon();
  });

  var lastTs = null;
  function tick(ts) {
    if (lastTs === null) lastTs = ts;
    var dt = (ts - lastTs) / 1000;
    lastTs = ts;
    if (!paused) {
      var half = track.scrollWidth / 2;
      viewport.scrollLeft += pxPerSecond * dt;
      if (viewport.scrollLeft >= half) viewport.scrollLeft -= half;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

initMarquee('marqueeTrack', 40);
initMarquee('mmMarqueeTrack', 40);

// Carrossel genérico — dots, drag/swipe, e autoplay com pausa em interação
function initCarousel(trackId, dotsId, autoplayMs) {
  var track = document.getElementById(trackId);
  if (!track) return;
  var viewport = track.parentElement;
  var slides = track.children.length;
  var dots = document.querySelectorAll('#' + dotsId + ' .dot');
  var index = 0;
  var dragDeltaPct = 0;
  var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var autoplayTimer = null;

  function apply(withTransition) {
    track.style.transition = withTransition ? 'transform .35s ease-out' : 'none';
    track.style.transform = 'translateX(calc(-' + (index * 100) + '% + ' + dragDeltaPct + '%))';
  }

  function go(i) {
    index = (i + slides) % slides;
    dragDeltaPct = 0;
    apply(true);
    dots.forEach(function (d, di) { d.classList.toggle('active', di === index); });
  }

  function startAutoplay() {
    if (!autoplayMs || reduzMovimento || slides < 2) return;
    stopAutoplay();
    autoplayTimer = setInterval(function () { go(index + 1); }, autoplayMs);
  }
  function stopAutoplay() {
    if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
  }
  function restartAutoplay() { stopAutoplay(); startAutoplay(); }

  dots.forEach(function (d, di) { d.addEventListener('click', function () { go(di); restartAutoplay(); }); });

  // Pausa com o mouse em cima ou com foco no teclado; retoma ao sair
  viewport.addEventListener('mouseenter', stopAutoplay);
  viewport.addEventListener('mouseleave', startAutoplay);
  viewport.addEventListener('focusin', stopAutoplay);
  viewport.addEventListener('focusout', startAutoplay);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAutoplay(); else startAutoplay();
  });

  // Arrasta/desliza com o dedo (touch) ou com o mouse — sempre manual
  var isDown = false;
  var startX = 0;

  viewport.addEventListener('pointerdown', function (e) {
    isDown = true;
    startX = e.clientX;
    viewport.classList.add('is-dragging');
    viewport.setPointerCapture(e.pointerId);
    stopAutoplay();
  });

  viewport.addEventListener('pointermove', function (e) {
    if (!isDown) return;
    var deltaPx = e.clientX - startX;
    dragDeltaPct = (deltaPx / viewport.clientWidth) * 100;
    apply(false);
  });

  function endDrag() {
    if (!isDown) return;
    isDown = false;
    viewport.classList.remove('is-dragging');
    if (dragDeltaPct < -12) go(index + 1);
    else if (dragDeltaPct > 12) go(index - 1);
    else go(index);
    startAutoplay();
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('pointerleave', function () { if (isDown) endDrag(); });

  startAutoplay();
}

initCarousel('carouselTrack', 'dots', 5000);

// Footer year
(function () {
  var el = document.getElementById('footerYear');
  if (el) el.textContent = '© ' + new Date().getFullYear() + ' · Todos os direitos reservados.';
})();


/* ==========================================================================
   CTAs da página -> scroll até enquadrar os DOIS planos
   ==========================================================================
   Em telas largas os cards ficam lado a lado e cabem inteiros na viewport.
   No celular eles somam ~1370px contra ~810px de tela, então mostrar os dois
   por inteiro é impossível: o alvo passa a ser enquadrar os dois PREÇOS ao
   mesmo tempo, que é o que permite a comparação.                             */
(function () {
  var oferta = document.getElementById('oferta');
  if (!oferta) return;

  function barraAltura() {
    var bar = document.querySelector('.promo-bar');
    return bar ? bar.getBoundingClientRect().height : 0;
  }

  function alvoDeComparacao() {
    var cards = oferta.querySelectorAll('.price-card');
    if (cards.length < 2) return oferta.getBoundingClientRect().top + window.scrollY;

    var topo = barraAltura() + 8;
    var util = window.innerHeight - topo;
    var a = cards[0].getBoundingClientRect();
    var b = cards[1].getBoundingClientRect();

    // 1) os dois cards inteiros caberiam? então centraliza o bloco todo
    var blocoTopo = Math.min(a.top, b.top) + window.scrollY;
    var blocoBase = Math.max(a.bottom, b.bottom) + window.scrollY;
    var blocoAltura = blocoBase - blocoTopo;
    if (blocoAltura <= util) {
      return blocoTopo - topo - (util - blocoAltura) / 2;
    }

    // 2) lado a lado (>=768px) e o bloco não cabe: ancora o topo do bloco.
    //    Centralizar aqui cortaria o topo dos dois cards; ancorar mostra o
    //    máximo possível de ambos, preços e selo incluídos.
    var ladoALado = Math.abs(a.top - b.top) < 40;
    if (ladoALado) return blocoTopo - topo;

    // 3) empilhados: enquadra os dois preços (e o selo "Mais Escolhido")
    var precos = oferta.querySelectorAll('.price-card__amount');
    var selo = oferta.querySelector('.price-card__ribbon');
    if (precos.length < 2) return blocoTopo - topo;

    var pA = precos[0].getBoundingClientRect();
    var pB = precos[1].getBoundingClientRect();
    var faixaTopo = Math.min(pA.top, pB.top, selo ? selo.getBoundingClientRect().top : Infinity) + window.scrollY;
    var faixaBase = Math.max(pA.bottom, pB.bottom) + window.scrollY;
    var faixaAltura = faixaBase - faixaTopo;

    // centraliza a faixa dos preços; se ela for maior que a tela, ancora no primeiro preço
    if (faixaAltura <= util) {
      return faixaTopo - topo - (util - faixaAltura) / 2;
    }
    return faixaTopo - topo - 12;
  }

  function irParaOferta(e) {
    if (e) e.preventDefault();
    var y = Math.max(0, Math.round(alvoDeComparacao()));
    var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: y, behavior: reduz ? 'auto' : 'smooth' });
  }

  document.querySelectorAll('[data-scroll-oferta]').forEach(function (el) {
    el.addEventListener('click', irParaOferta);
  });
})();


/* ==========================================================================
   Pop-up de upgrade — abre SÓ no clique do plano de R$ 10
   ========================================================================== */
(function () {
  var modal = document.getElementById('upsell');
  var gatilho = document.getElementById('ctaEssencial');
  if (!modal || !gatilho) return;

  var aceitar = document.getElementById('upsellAccept');
  var recusar = document.getElementById('upsellDecline');
  var precoEl = modal.querySelector('[data-upsell-price]');
  var ultimoFoco = null;

  if (precoEl) precoEl.textContent = CONFIG.precoUpgrade;
  if (aceitar) aceitar.href = CONFIG.checkoutUpgrade || CONFIG.checkoutCompleto;
  if (recusar && CONFIG.checkoutEssencial) recusar.href = CONFIG.checkoutEssencial;

  function abrir(e) {
    if (e) e.preventDefault();
    ultimoFoco = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('upsell-open');
    (aceitar || modal.querySelector('.upsell__close')).focus({ preventScroll: true });
  }

  function fechar() {
    modal.hidden = true;
    document.body.classList.remove('upsell-open');
    if (ultimoFoco) ultimoFoco.focus({ preventScroll: true });
  }

  gatilho.addEventListener('click', abrir);

  // overlay e botão X fecham; nunca prende o usuário no modal
  modal.querySelectorAll('[data-upsell-dismiss]').forEach(function (el) {
    el.addEventListener('click', function (ev) { ev.preventDefault(); fechar(); });
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && !modal.hidden) fechar();
  });

  // "continuar com o plano de R$ 10": segue para o checkout original
  if (recusar) {
    recusar.addEventListener('click', function (ev) {
      if (!CONFIG.checkoutEssencial) {
        // sem link configurado ainda: apenas fecha, em vez de levar a lugar nenhum
        ev.preventDefault();
        fechar();
      }
    });
  }

  // mantém o foco dentro do modal enquanto ele estiver aberto
  modal.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Tab') return;
    var focaveis = modal.querySelectorAll('a[href], button');
    if (!focaveis.length) return;
    var primeiro = focaveis[0], ultimo = focaveis[focaveis.length - 1];
    if (ev.shiftKey && document.activeElement === primeiro) { ev.preventDefault(); ultimo.focus(); }
    else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primeiro.focus(); }
  });
})();


/* ==========================================================================
   Notificação de Vendas (Social Proof Toast)
   ========================================================================== */
(function () {
  var names = [
    'Juliana', 'Camila', 'Patrícia', 'Ana Paula', 'Fernanda', 'Mariana',
    'Luciana', 'Renata', 'Vanessa', 'Aline', 'Débora', 'Carina', 'Tatiana',
    'Beatriz', 'Sandra', 'Cláudia', 'Simone', 'Priscila', 'Letícia',
    'Marcelo', 'Ricardo', 'Eduardo', 'Gustavo', 'Rodrigo', 'Thiago', 'Gabriel'
  ];

  var cities = [
    'Belo Horizonte', 'Salvador', 'Campinas', 'Curitiba', 'Recife', 'Fortaleza',
    'Goiânia', 'Manaus', 'Belém', 'Florianópolis', 'Porto Alegre', 'Vitória',
    'Brasília', 'Ribeirão Preto', 'Niterói', 'Uberlândia', 'Sorocaba',
    'Londrina', 'Santos', 'São José dos Campos', 'Juiz de Fora', 'Joinville',
    'Campo Grande', 'Natal', 'Maceió', 'João Pessoa', 'Teresina', 'São Luís'
  ];

  var plans = [
    'o Kit Completo',
    'o Plano Recomendado',
    'o Kit Completo de Português',
    'o Plano Essencial'
  ];

  var times = [
    'comprou agora mesmo',
    'há 1 minuto',
    'há 2 minutos',
    'há 3 minutos',
    'há 4 minutos',
    'há 5 minutos'
  ];

  // Create toast container dynamically
  var toast = document.createElement('div');
  toast.className = 'sales-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML =
    '<div class="sales-toast__content">' +
      '<div class="sales-toast__header">' +
        '<span class="sales-toast__check" title="Compra verificada">' +
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' +
        '</span>' +
        '<span class="sales-toast__name" id="salesToastName">Juliana</span>' +
        '<span class="sales-toast__location" id="salesToastLocation">de Belo Horizonte</span>' +
      '</div>' +
      '<div class="sales-toast__action">Comprou <strong id="salesToastPlan">o Kit Completo</strong></div>' +
      '<div class="sales-toast__footer">' +
        '<span class="sales-toast__badge">' +
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Compra verificada' +
        '</span>' +
        '<span class="sales-toast__sep">•</span>' +
        '<span class="sales-toast__time" id="salesToastTime">há 1 min</span>' +
      '</div>' +
    '</div>' +
    '<button type="button" class="sales-toast__close" id="salesToastClose" aria-label="Fechar notificação">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>' +
    '</button>';

  document.body.appendChild(toast);

  var nameEl = document.getElementById('salesToastName');
  var locationEl = document.getElementById('salesToastLocation');
  var planEl = document.getElementById('salesToastPlan');
  var timeEl = document.getElementById('salesToastTime');
  var closeBtn = document.getElementById('salesToastClose');

  var hideTimeout = null;
  var showTimer = null;

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function showToast() {
    var name = pickRandom(names);
    var city = pickRandom(cities);
    var plan = pickRandom(plans);
    var time = pickRandom(times);

    if (nameEl) nameEl.textContent = name;
    if (locationEl) locationEl.textContent = 'de ' + city;
    if (planEl) planEl.textContent = plan;
    if (timeEl) timeEl.textContent = time;

    // Reset styles
    toast.style.transform = '';
    toast.style.transition = '';
    toast.style.opacity = '';
    toast.classList.add('is-active');

    // Fica visível por ~5.5s: tempo suficiente para ler nome, cidade e plano
    // sem segurar a notificação na tela além da conta.
    if (hideTimeout) clearTimeout(hideTimeout);
    hideTimeout = setTimeout(function () {
      hideToast();
      scheduleNext();
    }, 5500);
  }

  function hideToast() {
    toast.classList.remove('is-active', 'is-dragging');
    toast.style.transform = '';
    toast.style.transition = '';
    toast.style.opacity = '';
    if (hideTimeout) clearTimeout(hideTimeout);
  }

  function scheduleNext() {
    if (showTimer) clearTimeout(showTimer);
    // Próxima notificação entre 35s e 65s (média 50s): frequente o bastante para
    // manter a sensação de vendas acontecendo, sem virar um popup insistente.
    var BASE_DELAY = 50000;
    var randomVariation = Math.floor(Math.random() * 30000) - 15000; // -15s a +15s
    var delay = BASE_DELAY + randomVariation;

    showTimer = setTimeout(showToast, delay);
  }

  /* Drag-to-dismiss feature */
  var startX = 0, startY = 0, deltaX = 0, deltaY = 0;
  var isDragging = false;

  toast.addEventListener('pointerdown', function (e) {
    if (e.target.closest('#salesToastClose')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    deltaX = 0;
    deltaY = 0;
    toast.classList.add('is-dragging');
    try { toast.setPointerCapture(e.pointerId); } catch (err) {}

    // Pause timer while dragging
    if (hideTimeout) clearTimeout(hideTimeout);
  });

  toast.addEventListener('pointermove', function (e) {
    if (!isDragging) return;
    deltaX = e.clientX - startX;
    deltaY = e.clientY - startY;

    var translateY = Math.max(-10, deltaY);
    toast.style.transform = 'translate(' + deltaX + 'px, ' + translateY + 'px)';
  });

  function onDragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    toast.classList.remove('is-dragging');
    try { toast.releasePointerCapture(e.pointerId); } catch (err) {}

    var threshold = 45; // 45px displacement to trigger dismiss
    if (deltaY > threshold || Math.abs(deltaX) > threshold) {
      // Swipe/drag away animation
      toast.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
      toast.style.transform = 'translate(' + (deltaX * 1.4) + 'px, ' + (deltaY > 15 ? deltaY + 100 : deltaY) + 'px)';
      toast.style.opacity = '0';

      setTimeout(function () {
        hideToast();
        scheduleNext();
      }, 250);
    } else {
      // Snap back to position and set remaining auto-hide time
      toast.style.transition = 'transform 0.2s ease-out';
      toast.style.transform = '';
      setTimeout(function () {
        toast.style.transition = '';
      }, 200);

      hideTimeout = setTimeout(function () {
        hideToast();
        scheduleNext();
      }, 4800);
    }
  }

  toast.addEventListener('pointerup', onDragEnd);
  toast.addEventListener('pointercancel', onDragEnd);

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      hideToast();
      scheduleNext();
    });
  }

  // Primeira notificação aparece após 6 segundos do carregamento inicial
  setTimeout(showToast, 6000);
})();

