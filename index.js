const bedrock = require('bedrock-protocol');

// Configuração camuflada para o servidor da Aternos
const config = {
    host: 'BLAZE_CRAFT-xf0c.aternos.me', 
    port: 39054,                    
    username: 'Bot_AntiAFK',        
    offline: true,                  
    version: '1.26.10',
    
    // --- CAMUFLAGEM PARA EVITAR O KICK DA ATERNOS ---
    skipEncryption: false,             // Tenta responder à criptografia padrão primeiro
    profilesFolder: './auth',          // Cria uma sessão realista para o bot
    concurrency: 10,
    skinData: {
        ClientRandomId: Date.now(),
        CurrentInputMode: 1,           // Simula controle Touch (celular)
        DeviceOS: 1,                   // Simula sistema Android
        DeviceModel: 'Generic Phone',  // Fornece um modelo de aparelho para o anti-cheat
        LanguageCode: 'pt_BR'          // Define o idioma em português
    }
};

function createBot() {
    console.log(`[${new Date().toLocaleTimeString()}] Tentando conectar ao BLAZE_CRAFT...`);
    
    let client;
    try {
        client = bedrock.createClient(config);
    } catch (e) {
        console.log(`Erro crítico ao criar o cliente: ${e.message}`);
        setTimeout(createBot, 15000);
        return;
    }

    client.on('join', () => {
        console.log(`[${new Date().toLocaleTimeString()}] Sucesso! O bot entrou no servidor.`);
        
        // Rotina Anti-AFK ativa a cada 20 segundos
        const afkInterval = setInterval(() => {
            if (client.status === 2 || client.status === 'playing') {
                try {
                    client.write('player_auth_input', {
                        pitch: 0,
                        yaw: 0,
                        position: { x: 0, y: 0, z: 0 },
                        move_vector: { x: 0, z: 0 },
                        look_vector: { x: 0, z: 0 },
                        flags: { delta: false },
                        ticks: 1n
                    });
                } catch (err) {
                    console.log('Erro ao enviar pacote Anti-AFK, reiniciando conexão...');
                    clearInterval(afkInterval);
                    client.close();
                }
            }
        }, 20000);
    });

    // Captura o motivo exato enviado pelo servidor no momento do kick
    client.on('disconnect', (packet) => {
        const reason = packet?.reason || 'Desconexão direta da Aternos (rejeitado)';
        console.log(`[${new Date().toLocaleTimeString()}] O bot foi desconectado. Motivo: ${reason}`);
    });

    client.on('close', (reason) => {
        const finalReason = reason || 'Conexão encerrada ou tempo limite esgotado';
        console.log(`[${new Date().toLocaleTimeString()}] Conexão fechada. Motivo: ${finalReason}`);
        console.log('Reiniciando a conexão em 15 segundos...');
        setTimeout(createBot, 15000);
    });

    client.on('error', (err) => {
        console.log('Erro interno detectado no protocolo:', err.message);
    });
}

// Inicia a execução do bot
createBot();

// Mantém o processo do Replit ativo em segundo plano
setInterval(() => {}, 1000);
