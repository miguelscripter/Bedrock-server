const bedrock = require('bedrock-protocol');

const config = {
    host: 'BLAZE_CRAFT-xf0c.aternos.me',     // Substitua pelo IP ou domínio do seu servidor
    port: '39054,                    // Porta padrão da Bedrock
    username: 'Bot_AntiAFK',        // Nome que o bot vai ter dentro do jogo
    offline: true,                  // 'true' para servidores piratas ou 'false' para usar conta Microsoft original
    version: '1.26.10'              // Configurado para a versão 1.26 do Bedrock
};

function createBot() {
    console.log(`[${new Date().toLocaleTimeString()}] Tentando conectar ao servidor Bedrock 1.26...`);
    
    const client = bedrock.createClient(config);

    client.on('join', () => {
        console.log(`[${new Date().toLocaleTimeString()}] Sucesso! O bot entrou no servidor.`);
        
        // Rotina Anti-AFK: Envia pequenos pacotes de movimento a cada 30 segundos
        // para o servidor saber que o jogador ainda está ativo
        setInterval(() => {
            if (client.status === 2) { // Estado 2 = Dentro do jogo (Play state)
                client.write('player_auth_input', {
                    pitch: 0,
                    yaw: 0,
                    position: { x: 0, y: 0, z: 0 },
                    move_vector: { x: 0, z: 0 },
                    look_vector: { x: 0, z: 0 },
                    flags: { delta: false },
                    ticks: 1n
                });
            }
        }, 30000);
    });

    // Auto-Reconectar caso o bot seja expulso ou o servidor reinicie
    client.on('close', (reason) => {
        console.log(`[${new Date().toLocaleTimeString()}] O bot caiu. Motivo: ${reason}`);
        console.log('Reiniciando a conexão em 15 seconds...');
        setTimeout(createBot, 15000);
    });

    client.on('error', (err) => {
        console.log('Erro detectado no bot:', err.message);
    });
}

createBot();

