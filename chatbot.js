const express = require('express');
const { WA_DEFAULT_EPHEMERAL } = require('@adiwajshing/baileys');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const pino = require('pino');

// Configuração do Express para manter o bot online
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send('O bot da Mirata Capital está online!');
});

app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});

// -- A partir daqui, o novo código do bot começa --

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Alterado para false
        logger: pino({ level: 'silent' }),
        browser: ['Chatbot Mirata', 'Chrome', '1.0'],
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

            if (reason === DisconnectReason.badSession) { console.log(`Sessão desconectada. Por favor, remova o arquivo 'baileys_auth_info' e escaneie o QR Code novamente.`); sock.logout(); }
            else if (reason === DisconnectReason.connectionClosed) { console.log("Conexão fechada. Reconectando..."); connectToWhatsApp(); }
            else if (reason === DisconnectReason.connectionLost) { console.log("Conexão perdida. Reconectando..."); connectToWhatsApp(); }
            else if (reason === DisconnectReason.loggedOut) { console.log(`Dispositivo desconectado. Por favor, escaneie o QR Code novamente.`); sock.logout(); }
            else if (reason === DisconnectReason.restartRequired) { console.log("Reinicialização necessária. Reiniciando..."); connectToWhatsApp(); }
            else if (reason === DisconnectReason.timedOut) { console.log("Tempo limite da conexão esgotado. Reconectando..."); connectToWhatsApp(); }
            else { sock.end(`Motivo de desconexão desconhecido: ${reason}|${lastDisconnect.error}`); }
        } else if (connection === 'open') {
            console.log('✅ Conectado com sucesso! O bot da Mirata Capital está online.');
        }

        if (qr) {
            // Este é o novo código para gerar o link do QR Code
            console.log('QR Code gerado. Copie o link abaixo e cole no seu navegador para escanear:');
            console.log(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qr)}`);
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.key.fromMe) {
            const userId = msg.key.remoteJid;
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

            // Lógica do bot
            if (text && text.match(/(menu|Menu|oi|Oi|Olá|olá|ola|Ola)/i)) {
                await sock.sendMessage(userId, {
                    text: `Olá! 👋 Sou o assistente virtual da Mirata Capital.\nComo podemos ajudá-lo hoje?\n\n*Menu Principal:*\n1️⃣ - Nossos serviços de crédito\n2️⃣ - Soluções para empresas\n3️⃣ - Quero solicitar crédito\n4️⃣ - Falar com um especialista\n\nPor favor, digite o *número* da opção desejada.`
                });
            } else if (text === '1') {
                await sock.sendMessage(userId, {
                    text: `Conheça nossas opções de crédito para pessoa física:\n\n*🏦 Financiamento Imobiliário:* Realize o sonho da casa própria com as melhores taxas.\n*🚗 Financiamento de Veículo:* Troque de carro ou compre um novo com facilidade.\n*💰 Crédito Direto ao Consumidor (CDC):* Para qualquer finalidade, sem burocracia.\n\nPara voltar ao menu, digite *Menu*.`
                });
            } else if (text === '2') {
                await sock.sendMessage(userId, {
                    text: `Oferecemos consultoria financeira e crédito para o seu negócio:\n\n*📈 Consultoria Financeira:* Análise de mercado e planejamento estratégico para empresas.\n*💼 Crédito Empresarial:* Capital de giro e expansão de negócios.\n\nPara voltar ao menu, digite *Menu*.`
                });
            } else if (text === '3') {
                await sock.sendMessage(userId, {
                    text: `Ótimo!  Para iniciar sua solicitação, acesse nosso link seguro:\n\n*🔗 Link para Solicitação:* https://miratacapital.com/solicitar-credito\n\nPara voltar ao menu, digite *Menu*.`
                });
            } else if (text === '4') {
                await sock.sendMessage(userId, {
                    text: `🔔 Um especialista da *Mirata Capital* foi acionado e entrará em contato com você em breve.\n\nPara voltar ao menu, digite *Menu*.`
                });
            } else {
                await sock.sendMessage(userId, {
                    text: `Desculpe, não entendi. Por favor, digite *Menu* para ver as opções novamente.`
                });
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

connectToWhatsApp();