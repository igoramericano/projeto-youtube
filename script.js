
  // Função para extrair o ID do vídeo do YouTube a partir da URL
  function extrairVideoId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  // Adiciona as thumbnails e eventos
  const videoCards = document.querySelectorAll('.video-card');
  const modal = document.getElementById('video-modal');
  const iframe = modal.querySelector('iframe');
  const closeBtn = modal.querySelector('.close-btn');

  // Coloca as thumbnails automáticas baseadas no ID do vídeo
  videoCards.forEach(card => {
    const url = card.getAttribute('data-video-url');
    const videoId = extrairVideoId(url);
    if (videoId) {
      // Thumbnail padrão do YouTube
      const img = card.querySelector('img');
      img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      img.alt = card.querySelector('h3').textContent;

      // Salva o videoId para facilitar depois
      card.setAttribute('data-video-id', videoId);
    }
  });

  // Abrir modal e salvar histórico
  videoCards.forEach(card => {
    card.addEventListener('click', () => {
      const videoId = card.getAttribute('data-video-id');
      const title = card.querySelector('h3').textContent;
      const url = card.getAttribute('data-video-url');
      const thumbnail = card.querySelector('img').src;

      // Salvar no histórico localStorage
      let historico = JSON.parse(localStorage.getItem('videoHistorico')) || [];

      // Remove vídeo duplicado se existir
      historico = historico.filter(v => v.videoId !== videoId);

      // Adiciona no início
      historico.unshift({ videoId, title, url, thumbnail, watchedAt: new Date().toISOString() });

      // Limitar a 50 vídeos
      if (historico.length > 50) historico.pop();

      localStorage.setItem('videoHistorico', JSON.stringify(historico));

      // Abrir modal
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Fechar modal
  closeBtn.addEventListener('click', fecharModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) fecharModal();
  });
  function fecharModal() {
    modal.classList.remove('active');
    iframe.src = '';
    document.body.style.overflow = 'auto';
  }

  // Filtrar vídeos pela pesquisa
  function filtrarVideos() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    videoCards.forEach(card => {
      const titulo = card.querySelector('h3').textContent.toLowerCase();
      if (titulo.includes(input)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Enter na busca também filtra
  document.getElementById('searchInput').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') filtrarVideos();
  });

  // Tocar vídeo automaticamente pela query string ?play=ID
  document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const playId = params.get('play');
    if (playId) {
      // Tenta achar o card para marcar (opcional)
      const cardToPlay = Array.from(videoCards).find(c => c.getAttribute('data-video-id') === playId);
      if (cardToPlay) cardToPlay.scrollIntoView({ behavior: 'smooth', block: 'center' });

      iframe.src = `https://www.youtube.com/embed/${playId}?autoplay=1&rel=0`;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });
