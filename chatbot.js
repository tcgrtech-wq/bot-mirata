const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');

const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

// Mensagem de status e conexão
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Por favor, escaneie o QR Code acima para conectar o WhatsApp Business.');
});

client.on('ready', () => {
    console.log('✅ Conectado com sucesso! O bot da Mirata Capital está online.');
});

// Funil de atendimento principal com menu de texto
client.on('message', async msg => {
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const name = contact.pushname;

    // Mensagem de boas-vindas e menu inicial
    if (msg.body.match(/(menu|Menu|oi|Oi|Olá|olá|ola|Ola)/i)) {
        await chat.sendStateTyping();

        await client.sendMessage(msg.from,
            `Olá ${name.split(" ")[0]}! 👋 Sou o assistente virtual da Mirata Capital.\n` +
            `Como podemos ajudá-lo hoje?\n\n` +
            `*Menu Principal:*\n` +
            `1️⃣ - Nossos serviços de crédito\n` +
            `2️⃣ - Soluções para empresas\n` +
            `3️⃣ - Quero solicitar crédito\n` +
            `4️⃣ - Falar com um especialista\n\n` +
            `Por favor, digite o *número* da opção desejada.`
        );
    }
    
    // Lógica para as respostas do menu
    else if (msg.body === '1') {
        await chat.sendStateTyping();
        await client.sendMessage(msg.from,
            `Conheça nossas opções de crédito para pessoa física:\n\n` +
            `*🏦 Financiamento Imobiliário:* Realize o sonho da casa própria com as melhores taxas.\n` +
            `*🚗 Financiamento de Veículo:* Troque de carro ou compre um novo com facilidade.\n` +
            `*💰 Crédito Direto ao Consumidor (CDC):* Para qualquer finalidade, sem burocracia.\n\n` +
            `Para voltar ao menu, digite *Menu*.`
        );
    }
    else if (msg.body === '2') {
        await chat.sendStateTyping();
        await client.sendMessage(msg.from,
            `Oferecemos consultoria financeira e crédito para o seu negócio:\n\n` +
            `*📈 Consultoria Financeira:* Análise de mercado e planejamento estratégico para empresas.\n` +
            `*💼 Crédito Empresarial:* Capital de giro e expansão de negócios.\n\n` +
            `Para voltar ao menu, digite *Menu*.`
        );
    }
    else if (msg.body === '3') {
        await chat.sendStateTyping();
        await client.sendMessage(msg.from,
            `Ótimo! Para iniciar sua solicitação, acesse nosso link seguro:\n\n` +
            `*🔗 Link para Solicitação:* https://miratacapital.com/solicitar-credito\n\n` +
            `Para voltar ao menu, digite *Menu*.`
        );
    }
    else if (msg.body === '4') {
        await chat.sendStateTyping();
        await client.sendMessage(msg.from,
            `Um de nossos especialistas em crédito entrará em contato com você o mais rápido possível.\n\n` +
            `Para voltar ao menu, digite *Menu*.`
        );
    }
    // Resposta padrão caso a mensagem não seja uma opção válida
    else {
        await chat.sendStateTyping();
        await client.sendMessage(msg.from,
            `Desculpe, não entendi. Por favor, digite *Menu* para ver as opções novamente.`
        );
    }
});

// Inicializa o cliente
client.initialize();