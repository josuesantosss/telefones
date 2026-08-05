// sessao.js - Controle de sessão para todas as páginas
(function() {
    const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutos
    let timeoutId = null;
    let loadingElement = null;

    // Criar elemento de loading
    function criarLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-overlay';
        loadingDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            flex-direction: column;
        `;

        const spinner = document.createElement('div');
        spinner.style.cssText = `
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        `;

        const message = document.createElement('p');
        message.textContent = 'Processando...';
        message.style.cssText = `
            color: white;
            margin-top: 20px;
            font-family: Arial, sans-serif;
            font-size: 16px;
        `;

        loadingDiv.appendChild(spinner);
        loadingDiv.appendChild(message);

        // Adicionar estilo de animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        return loadingDiv;
    }

    // Funções de controle do loading
    function showLoading(message = 'Processando...') {
        if (!loadingElement) {
            loadingElement = criarLoading();
            document.body.appendChild(loadingElement);
        }
        
        // Atualizar mensagem se necessário
        const msgElement = loadingElement.querySelector('p');
        if (msgElement) {
            msgElement.textContent = message;
        }
        
        loadingElement.style.display = 'flex';
    }

    function hideLoading() {
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    // Função para executar comandos com loading
    function executarComando(funcao, mensagem = 'Processando...', delay = 300) {
        return new Promise((resolve, reject) => {
            // Mostra loading com um pequeno delay para evitar flashes
            const timerId = setTimeout(() => {
                showLoading(mensagem);
            }, delay);

            try {
                // Executa a função
                const resultado = funcao();
                
                // Esconde loading e resolve
                clearTimeout(timerId);
                hideLoading();
                resolve(resultado);
            } catch (error) {
                clearTimeout(timerId);
                hideLoading();
                reject(error);
            }
        });
    }

    // Função para executar comandos assíncronos com loading
    async function executarComandoAsync(funcao, mensagem = 'Processando...', delay = 300) {
        let timerId = null;
        
        try {
            // Mostra loading com delay
            timerId = setTimeout(() => {
                showLoading(mensagem);
            }, delay);

            // Executa a função assíncrona
            const resultado = await funcao();
            
            // Esconde loading
            if (timerId) clearTimeout(timerId);
            hideLoading();
            
            return resultado;
        } catch (error) {
            if (timerId) clearTimeout(timerId);
            hideLoading();
            throw error;
        }
    }

    function realizarLogout() {
        // Mostra loading durante o logout
        showLoading('Finalizando sessão...');
        
        setTimeout(() => {
            sessionStorage.removeItem('usuarioLogado');
            sessionStorage.removeItem('ultimaAtividade');
            
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }


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

    // Previne que a página seja fechada sem aviso
    window.addEventListener('beforeunload', function() {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        hideLoading();
    });

    // Expõe funções globalmente para uso em outras páginas
    window.loading = {
        show: showLoading,
        hide: hideLoading,
        executar: executarComando,
        executarAsync: executarComandoAsync
    };

    // Intercepta fetch e XMLHttpRequest para mostrar loading automaticamente
    // (opcional - descomente se quiser)
    /*
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        showLoading('Carregando dados...');
        return originalFetch.apply(this, args)
            .then(response => {
                hideLoading();
                return response;
            })
            .catch(error => {
                hideLoading();
                throw error;
            });
    };
    */

})();
