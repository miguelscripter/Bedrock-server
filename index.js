const bedrock = require('bedrock-protocol');
const http = require('http');

// --- CRIA UMA PÁGINA WEB SIMPLES PARA O UPTIMEROBOT ---
// Isso faz o Replit gerar o link (.replit.app) que você vai usar no UptimeRobot
http.createServer((req, res) => {
    res.write("Bot Anti-AFK do Minecraft esta rodando!");
    res.end();
}).listen(8080); 
console.log("[Web Server] Servidor HTTP criado na porta 8080 para o UptimeRobot.");

// Configuração camuflada para o servidor da Aternos
const config = {
    host: 'mc2069687.fmcs.cloud', 
    port: 25755,                    
    username: 'Bot_AntiAFK',        
    
    // --- SE SEU SERVIDOR FOR PIRATA ---
    offline: true,                  // Deixe 'true' para pirata ou mude para 'false' se o servidor for original
    skipEncryption: true,           // Mude para 'false' se o servidor for original
    
    version: '1.26.10',
    profilesFolder: './auth',          
    concurrency: 10,
    skinData: {
        ClientRandomId: Date.now(),
        CurrentInputMode: 1,           
        DeviceOS: 1,                   
        DeviceModel: 'Generic Phone',  
        LanguageCode: 'pt_BR'          
    }
};

// SE SEU SERVIDOR TIVER PLUGIN DE SENHA (/login ou /register)
const CONFIG_SENHA = "SUA_SENHA_AQUI"; 

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
        
        // --- SISTEMA DE LOGIN AUTOMÁTICO ---
        setTimeout(() => {
            if (client.status === 2 || client.status === 'playing') {
                console.log('Enviando comandos de autenticação no chat...');
                client.queue('text', {
                    type: 'chat', needs_translation: false, source_name: config.username, xuid: '', platform_chat_id: '',
                    message: `/register ${CONFIG_SENHA} ${CONFIG_SENHA}`
                });
                
                setTimeout(() => {
                    client.queue('text', {
                        type: 'chat', needs_translation: false, source_name: config.username, xuid: '', platform_chat_id: '',
                        message: `/login ${CONFIG_SENHA}`
                    });
                }, 2000);
            }
        }, 3000);

        // Rotina Anti-AFK ativa a cada 20 segundos
        const afkInterval = setInterval(() => {
            if (client.status === 2 || client.status === 'playing') {
                try {
                    client.write('player_auth_input', {
                        pitch: 0, yaw: 0,
                        position: { x: 0, y: 0, z: 0 },
                        move_vector: { x: 0, z: 0 },
                        look_vector: { x: 0, z: 0 },
                        flags: { delta: false }, ticks: 1n
                    });
                } catch (err) {
                    console.log('Erro ao enviar pacote Anti-AFK, reiniciando conexão...');
                    clearInterval(afkInterval);
                    client.close();
                }
            }
        }, 20000);
    });

    client.on('disconnect', (packet) => {
        const reason = packet?.reason || 'Desconexão direta (rejeitado)';
        console.log(`[${new Date().toLocaleTimeString()}] O bot foi desconectado. Motivo: ${reason}`);
    });

    client.on('close', (reason) => {
        const finalReason = reason || 'Conexão encerrada';
        console.log(`[${new Date().toLocaleTimeString()}] Conexão fechada. Motivo: ${finalReason}`);
        console.log('Reiniciando a conexão em 15 segundos...');
        setTimeout(createBot, 15000);
    });

    client.on('error', (err) => {
        console.log('Erro interno detectado:', err.message);
    });
}

createBot();
setInterval(() => {}, 1000);

