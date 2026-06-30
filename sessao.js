// sessao.js - Controle de sessão para todas as páginas
(function() {
    const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutos
    let timeoutId = null;

    function realizarLogout() {
        sessionStorage.removeItem('usuarioLogado');
        sessionStorage.removeItem('ultimaAtividade');
        
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }

        // Redireciona para o login com mensagem de timeout
        window.location.href = 'login.html?timeout=1';
    }

    function resetarTimer() {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        const usuario = sessionStorage.getItem('usuarioLogado');
        if (!usuario) {
            realizarLogout();
            return;
        }

        timeoutId = setTimeout(() => {
            realizarLogout();
        }, SESSION_TIMEOUT);
    }

    function atualizarAtividade() {
        if (sessionStorage.getItem('usuarioLogado')) {
            sessionStorage.setItem('ultimaAtividade', Date.now().toString());
        }
    }

    function verificarSessao() {
        const usuario = sessionStorage.getItem('usuarioLogado');
        const ultimaAtividade = sessionStorage.getItem('ultimaAtividade');

        if (!usuario || !ultimaAtividade) {
            realizarLogout();
            return;
        }

        const tempoDecorrido = Date.now() - parseInt(ultimaAtividade);
        if (tempoDecorrido >= SESSION_TIMEOUT) {
            realizarLogout();
            return;
        }

        // Atualiza a atividade e inicia o timer
        atualizarAtividade();
        resetarTimer();
    }

    // Configura detectores de atividade
    function configurarDetectores() {
        const eventos = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart', 'focus'];
        
        eventos.forEach(evento => {
            document.addEventListener(evento, () => {
                atualizarAtividade();
                resetarTimer();
            });
        });
    }

    // Inicializa quando a página carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            verificarSessao();
            configurarDetectores();
        });
    } else {
        verificarSessao();
        configurarDetectores();
    }

    // Previne que a página seja fechada sem aviso (opcional)
    window.addEventListener('beforeunload', function() {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    });

})();