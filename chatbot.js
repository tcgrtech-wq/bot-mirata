const express = require('express');
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');

// Configuração do Express
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send('O bot da Mirata Capital está online!');
});

app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});

const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Por favor, escaneie o QR Code acima para conectar o WhatsApp Business.');
});

client.on('ready', () => {
    console.log('✅ Conectado com sucesso! O bot da Mirata Capital está online.');
});

// Objeto para armazenar o estado de cada usuário no fluxo
let userState = {};

client.on('message', async msg => {
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const name = contact.pushname;
    const userId = msg.from;

    // Verifica se usuário está em fluxo de captura
    if (userState[userId]?.step) {
        if (userState[userId].step === 'nome') {
            userState[userId].nome = msg.body.trim();
            userState[userId].step = 'cpf';
            await client.sendMessage(userId, 'Certo! Agora, por favor, informe seu *CPF* (somente números).');
            return;
        }
        if (userState[userId].step === 'cpf') {
            userState[userId].cpf = msg.body.trim();
            userState[userId].step = 'celular';
            await client.sendMessage(userId, 'Perfeito! Agora me informe seu *número de celular* com DDD.');
            return;
        }
        if (userState[userId].step === 'celular') {
            userState[userId].celular = msg.body.trim();
            userState[userId].step = null;
            await client.sendMessage(userId,
                `✅ Obrigado, ${userState[userId].nome}!\n\n` +
                `📄 Dados recebidos:\n` +
                `Nome: ${userState[userId].nome}\n` +
                `CPF: ${userState[userId].cpf}\n` +
                `Celular: ${userState[userId].celular}\n\n` +
                `🔔 Um especialista da *Mirata Capital* já foi chamado e entrará em contato com você em breve.\n\n` +
                `Para voltar ao menu, digite *Menu*.`
            );
            return;
        }
    }

    // Menu inicial
    if (msg.body.match(/(menu|Menu|oi|Oi|Olá|olá|ola|Ola)/i)) {
        await chat.sendStateTyping();
        await client.sendMessage(userId,
            `Olá ${name.split(" ")[0]}! 👋 Sou o assistente virtual da *Mirata Capital*.\n` +
            `Como podemos ajudá-lo hoje?\n\n` +
            `*Menu Principal:*\n` +
            `1️⃣ - Nossos serviços de crédito\n` +
            `2️⃣ - Soluções para empresas\n` +
            `3️⃣ - Quero solicitar crédito\n` +
            `4️⃣ - Falar com um especialista\n\n` +
            `Por favor, digite o *número* da opção desejada.`
        );
    }
    else if (msg.body === '1') {
        await chat.sendStateTyping();
        await client.sendMessage(userId,
            `Conheça nossas opções de crédito para pessoa física:\n\n` +
            `*🏦 Financiamento Imobiliário:* Realize o sonho da casa própria com as melhores taxas.\n` +
            `*🚗 Financiamento de Veículo:* Troque de carro ou compre um novo com facilidade.\n` +
            `*💰 Crédito Direto ao Consumidor (CDC):* Para qualquer finalidade, sem burocracia.\n\n` +
            `Para voltar ao menu, digite *Menu*.`
        );
    }
    else if (msg.body === '2') {
        await chat.sendStateTyping();
        await client.sendMessage(userId,
            `Oferecemos consultoria financeira e crédito para o seu negócio:\n\n` +
            `*📈 Consultoria Financeira:* Análise de mercado e planejamento estratégico para empresas.\n` +
            `*💼 Crédito Empresarial:* Capital de giro e expansão de negócios.\n\n` +
            `Para voltar ao menu, digite *Menu*.`
        );
    }
    else if (msg.body === '3') {
        userState[userId] = { step: 'nome' };
        await chat.sendStateTyping();
        await client.sendMessage(userId,
            `Ótimo! Vamos iniciar sua solicitação de crédito.\n` +
            `Por favor, me informe seu *nome completo*.`
        );
    }
    else if (msg.body === '4') {
        await chat.sendStateTyping();
        await client.sendMessage(userId,
            `🔔 Um especialista da *Mirata Capital* foi acionado e entrará em contato com você em breve.\n\n` +
            `Para voltar ao menu, digite *Menu*.`
        );
    }
    else {
        await chat.sendStateTyping();
        await client.sendMessage(userId,
            `Desculpe, não entendi. Por favor, digite *Menu* para ver as opções novamente.`
        );
    }
});

client.initialize();
