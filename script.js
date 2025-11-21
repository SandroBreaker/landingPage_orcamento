/* script.js - Lógica Zero-Bug */

const WHATSAPP_NUM = "5511968036476"; 
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwTjmfUd-_Nx_1Tcpsu1EQINJB8RxwGWLrkT1FQhQ_WFlg_P6Ov0gAiA3Gx8OkMBbU/exec";

/* ---------- helpers ---------- */
function showCard(msg){
  const card = document.getElementById('cardNotif');
  if(!card) return;
  card.innerText = msg;
  card.style.display = 'block';
  setTimeout(() => { card.style.display = 'none'; }, 4200);
}

function scrollToSection(id){
  const el = document.getElementById(id);
  if(!el) return;
  const headerOffset = 80; 
  const elementPosition = el.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth"
  });
}

function scrollToTop(){
  window.scrollTo({top:0, behavior:'smooth'});
}

/* ---------- modal & lightbox ---------- */
function openModal(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.style.display = 'flex';
  requestAnimationFrame(() => {
    el.classList.add('ativo');
  });
  el.setAttribute('aria-hidden', 'false');
}

function closeModal(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.remove('ativo');
  setTimeout(()=> { 
    el.style.display = 'none'; 
    el.setAttribute('aria-hidden','true'); 
  }, 300); 
}

function openLightbox(imgSrc, caption){
  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCaption');
  if(img) img.src = imgSrc;
  if(cap) cap.innerText = caption || '';
  openModal('lightbox');
}

/* ---------- animações por scroll ---------- */
function setupScrollAnimations(){
  const elements = document.querySelectorAll('.secao-padrao, .secao-numeros, .secao-historia, .secao-orcamento, .numero-card, .movel-card, .avaliacao-card, .card-diferencial, .faq-container');
  
  if(!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visivel'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add('visivel');
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => {
    el.classList.add('animar-entrada');
    observer.observe(el);
  });
}

/* ---------- Robot Mascot Logic (Novo) ---------- */
function initRobotPhrases() {
  const bubble = document.getElementById('robot-bubble');
  if(!bubble) return;

  const frases = [
    "Posso gerar seu orçamento! 💬",
    "Serviço rápido? Fale comigo! ⚡",
    "Valor na hora. 💰",
    "Alguma dúvida? Envie aqui! 👋",
    "Vamos iniciar seu atendimento! 📞"
  ];

  let idx = 0;

  function showBubble() {
    bubble.innerText = frases[idx];
    bubble.classList.add('show');
    idx = (idx + 1) % frases.length;

    setTimeout(() => bubble.classList.remove('show'), 3000);
  }

  setTimeout(showBubble, 5000);
  setInterval(showBubble, 30000);
}

/* ---------- Inicialização ---------- */
document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.ver-mais-link').forEach(el => {
    el.addEventListener('click', (e) => {
      const nome = e.currentTarget.dataset.nome || '';
      const msg = e.currentTarget.dataset.msg || '';
      const modalNome = document.getElementById('modalNome');
      const modalTexto = document.getElementById('modalTexto');
      if(modalNome) modalNome.innerText = nome;
      if(modalTexto) modalTexto.innerText = msg;
      openModal('modalAvaliacao');
    });
  });

  document.addEventListener('keydown', (ev) => {
    if(ev.key === 'Escape'){
      document.querySelectorAll('.modal-overlay.ativo').forEach(m => closeModal(m.id));
    }
  });

  setupScrollAnimations();
  
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if(e.target === overlay) closeModal(overlay.id);
    });
  });

  initRobotPhrases();

  initChatFlow();
});

/* =========================================
   LÓGICA CHATBOT ESPECIALISTA (GENÉRICO)
   ========================================= */
let chatState = 0; 
let chatData = { nome: '', tipo: '', detalhe: '', condicao: '', zona: '', bairro: '' };

function initChatFlow() {
  const msgs = document.getElementById('chat-messages');
  if(msgs && msgs.innerHTML.trim() === '') {
     setTimeout(() => {
        botSay("Olá! 🤖 Sou o assistente virtual.");
        setTimeout(() => botSay("Vou fazer algumas perguntas rápidas para gerar seu orçamento. Qual é o seu **Nome**?"), 800);
        chatState = 1; 
     }, 500);
  }
}

function botSay(text) {
  const msgs = document.getElementById('chat-messages');
  if(!msgs) return;
  
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.innerHTML = text; 
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function userSay(text) {
  const msgs = document.getElementById('chat-messages');
  if(!msgs) return;

  const div = document.createElement('div');
  div.className = 'msg user';
  div.innerText = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showOptions(options) {
  const msgs = document.getElementById('chat-messages');
  if(!msgs) return;

  const div = document.createElement('div');
  div.className = 'chat-options';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'chat-btn-opt';
    btn.innerText = opt;
    btn.onclick = () => processUserMessage(opt);
    div.appendChild(btn);
  });
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function handleChatEnter(e) {
  if(e.key === 'Enter') processUserMessage();
}

function processUserMessage(optValue) {
  const input = document.getElementById('chat-input');
  const text = optValue || (input ? input.value.trim() : '');
  
  if(!text) return;
  if(!optValue && input) input.value = ''; 

  userSay(text);

  setTimeout(() => {
    
    // 1. NOME → TIPO DO SERVIÇO
    if(chatState === 1) {
      chatData.nome = text;
      botSay(`Prazer, ${text}! Qual serviço você precisa?`);
      showOptions([
        'Instalação',
        'Manutenção',
        'Reparo',
        'Consultoria',
        'Atendimento Técnico',
        'Outro Serviço'
      ]);
      chatState = 2;
    } 
    
    // 2. TIPO → DETALHES
    else if(chatState === 2) {
      chatData.tipo = text;

      botSay("Certo! Pode detalhar um pouco mais?");
      showOptions([
        'Serviço Simples',
        'Serviço Complexo',
        'Projeto Grande',
        'Projeto Pequeno',
        'Não sei informar'
      ]);
      
      chatState = 3;
    }

    // 3. DETALHE → CONDIÇÃO
    else if(chatState === 3) {
      chatData.detalhe = text;
      
      botSay("Qual é a condição do item ou situação?");
      showOptions([
        'Novo',
        'Usado',
        'Precisa Ajuste',
        'Somente Verificação'
      ]);
      
      chatState = 4;
    }

    // 4. CONDIÇÃO → ZONA
    else if(chatState === 4) {
      chatData.condicao = text;
      botSay("Em qual **região** você está?");
      showOptions([
        'Zona Leste', 
        'Zona Sul', 
        'Zona Norte', 
        'Zona Oeste', 
        'Centro', 
        'Grande SP / ABC'
      ]);
      chatState = 5;
    }

    // 5. ZONA → BAIRRO
    else if(chatState === 5) {
      chatData.zona = text;
      botSay(`Beleza! Informe agora o **Bairro** ou ponto de referência:`);
      chatState = 6;
    }

    // 6. FINALIZA → WHATSAPP
    else if(chatState === 6) {
      chatData.bairro = text;
      
      botSay("Tudo certo! Montei o resumo do seu atendimento.");
      botSay("👇 Toque para enviar no WhatsApp e receber o valor:");

      const msgZap = 
`Olá! Sou *${chatData.nome}*.

Gostaria de um orçamento para:
📌 Serviço: *${chatData.tipo}*
🔧 Detalhe: ${chatData.detalhe}
📦 Condição: ${chatData.condicao}

📍 Local: ${chatData.zona} - ${chatData.bairro}`;

      const link = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msgZap)}`;
      
      const msgs = document.getElementById('chat-messages');
      const btnLink = document.createElement('a');
      btnLink.href = link;
      btnLink.target = '_blank';
      btnLink.className = 'chat-btn-opt';
      btnLink.style.background = '#25D366';
      btnLink.style.color = 'white';
      btnLink.style.textAlign = 'center';
      btnLink.style.display = 'block';
      btnLink.style.marginTop = '12px';
      btnLink.style.padding = '12px';
      btnLink.style.fontWeight = 'bold';
      btnLink.style.textDecoration = 'none';
      btnLink.style.borderRadius = '8px';
      btnLink.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      btnLink.innerHTML = '✅ Enviar no WhatsApp';

      msgs.appendChild(btnLink);
      msgs.scrollTop = msgs.scrollHeight;
      
      chatState = 7;
    }

    else if(chatState === 7) {
       botSay("O link já está acima! Só tocar para enviar. 👍");
    }

  }, 600);
}