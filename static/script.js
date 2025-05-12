document.addEventListener('DOMContentLoaded', function () {
    // Seletores com nomes traduzidos
    const telaBoasVindas = document.getElementById('telaBoasVindas');
    const logoBoasVindasContainer = document.querySelector('#telaBoasVindas .logo-boas-vindas');
    const botaoIniciar = document.getElementById('botaoIniciar');
    const conteudoPrincipal = document.getElementById('conteudoPrincipal');
    const formularioTumor = document.getElementById('formularioTumor'); // ID traduzido
    const secaoResultado = document.getElementById('secaoResultado'); // ID traduzido
    const textoEstagioPredito = document.getElementById('textoEstagioPredito'); // ID traduzido
    const tituloResultado = secaoResultado.querySelector('h2');
    const botaoSubmit = formularioTumor.querySelector('button[type="submit"]');
    
    const conteudoOriginalBotaoSubmit = botaoSubmit.innerHTML;

    function carregarImagensBoasVindas() {
        if (telaBoasVindas) {
            telaBoasVindas.style.backgroundImage = `linear-gradient(rgba(26, 32, 44, 0.85), rgba(26, 32, 44, 0.95)), url('static/images/welcome-background.jpg')`;
        }
        if (logoBoasVindasContainer) {
            const imgLogo = document.createElement('img');
            imgLogo.src = 'static/images/brain-health-icon.png';
            imgLogo.alt = 'NeuroPredictor AI Logo';
            logoBoasVindasContainer.innerHTML = ''; 
            logoBoasVindasContainer.appendChild(imgLogo);
        }
    }

    carregarImagensBoasVindas();

    if (botaoIniciar && telaBoasVindas && conteudoPrincipal) {
        botaoIniciar.addEventListener('click', function() {
            telaBoasVindas.classList.add('oculta'); 
            setTimeout(() => {
                telaBoasVindas.style.display = 'none'; 
                conteudoPrincipal.style.display = 'block'; 
                requestAnimationFrame(() => { // Garante que o display:block foi processado
                    requestAnimationFrame(() => { // Força reflow para animação de entrada
                         conteudoPrincipal.classList.add('visivel'); 
                    });
                });
            }, 700); // Corresponde à transição de 0.7s no CSS
        });
    } else {
        if(conteudoPrincipal) {
            conteudoPrincipal.style.display = 'block';
             requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    conteudoPrincipal.classList.add('visivel');
                });
            });
        }
        if (!botaoIniciar && telaBoasVindas) {
            console.warn("Botão 'Iniciar' não encontrado.");
        }
    }

    formularioTumor.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        const formData = new FormData(formularioTumor);
        const dados = {};
        formData.forEach((valor, chave) => {
            const elementoInput = formularioTumor.elements[chave];
            if (elementoInput && elementoInput.type === 'number' && valor !== '') {
                dados[chave] = parseFloat(valor);
            } else if (valor === "N/A" || valor === "") {
                dados[chave] = null;
            } else {
                dados[chave] = valor;
            }
        });

        secaoResultado.classList.add('visivel'); // Torna a seção de resultado visível
        secaoResultado.className = 'visivel processing'; // Adiciona classe de processamento
        textoEstagioPredito.textContent = 'Analisando dados e aplicando modelo preditivo...';
        textoEstagioPredito.className = 'processing'; // Classe para cor do texto
        tituloResultado.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Processando Predição'; 
        
        botaoSubmit.disabled = true;
        botaoSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analisando... ';

        const tempoMinimoLoading = 1800; // Aumentado um pouco para dar mais tempo de "show"
        const tempoInicio = Date.now();

        try {
            const resposta = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dados),
            });

            const tempoDecorrido = Date.now() - tempoInicio;
            const tempoRestante = tempoMinimoLoading - tempoDecorrido;

            if (tempoRestante > 0) {
                await new Promise(resolve => setTimeout(resolve, tempoRestante));
            }

            if (!resposta.ok) {
                let msgErro = `Erro na requisição: ${resposta.status}`;
                try {
                    const dadosErro = await resposta.json();
                    if (dadosErro && dadosErro.error) {
                        msgErro = `Erro do Servidor: ${dadosErro.error}`;
                    }
                } catch (e) { /* Silenciar erro de parse do JSON de erro */ }
                throw new Error(msgErro);
            }

            const resultado = await resposta.json();

            if (resultado.stage_predito) {
                textoEstagioPredito.textContent = `Estágio Clínico Previsto: ${resultado.stage_predito}`;
                textoEstagioPredito.className = 'success';
                secaoResultado.className = 'visivel success';
                tituloResultado.innerHTML = '<i class="fas fa-check-circle"></i>Predição Concluída com Sucesso';
            } else if (resultado.error) {
                textoEstagioPredito.textContent = `Erro na predição: ${resultado.error}`;
                textoEstagioPredito.className = 'error';
                secaoResultado.className = 'visivel error';
                tituloResultado.innerHTML = '<i class="fas fa-exclamation-triangle"></i>Falha na Predição';
            } else {
                 textoEstagioPredito.textContent = 'Resposta inesperada do servidor. Por favor, tente novamente.';
                 textoEstagioPredito.className = 'error';
                 secaoResultado.className = 'visivel error';
                 tituloResultado.innerHTML = '<i class="fas fa-times-circle"></i>Erro Inesperado';
            }

        } catch (erro) {
            const tempoDecorrido = Date.now() - tempoInicio;
            const tempoRestante = tempoMinimoLoading - tempoDecorrido;
             // Garante o tempo mínimo mesmo em caso de erro de fetch, mas não para erros de JS antes do fetch
            if (tempoRestante > 0 && (erro.message.startsWith("Erro na requisição:") || erro.name === 'TypeError')) { // TypeError pode ser falha de fetch
                 await new Promise(resolve => setTimeout(resolve, tempoRestante));
            }
            console.error('Falha ao enviar dados:', erro);
            textoEstagioPredito.textContent = `Falha na comunicação: ${erro.message}`;
            textoEstagioPredito.className = 'error';
            secaoResultado.className = 'visivel error';
            tituloResultado.innerHTML = '<i class="fas fa-network-wired"></i>Erro de Comunicação';
        } finally {
            botaoSubmit.disabled = false;
            botaoSubmit.innerHTML = conteudoOriginalBotaoSubmit;
        }
    });
});