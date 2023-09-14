if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const bodyParser = require('body-parser');
const GNRequest = require('./apis/gerencianet');

const app = express();

app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', 'src/views');

const reqGNAlready = GNRequest({
    clientID: process.env.GN_CLIENT_ID,
    clientSecret: process.env.GN_CLIENT_SECRET
});

app.get('/', async (req, res) => {
    const reqGN = await reqGNAlready;
    const dataCob = {
        calendario: {
            expiracao: 3600
        }, 
        valor: {
            original: '0.01'
        }, 
        chave: 'fff1ec71-9e3f-4333-b303-aca507e52150',
        solicitacaoPagador: 'Cobrança dos serviços de instalação solar.'
    }

    const cobResponse = await reqGN.post('/v2/cob', dataCob);
    const txidResponse = await cobResponse.data.txid;
    const qrcodeResponse = await reqGN.get(`/v2/loc/${cobResponse.data.loc.id}/qrcode`);

    //SUBSTITUIR por 'txidResponse' depois. txid de concluida = 7fd91b446f3e465a8faabc6a10ba331d
    iniciaVerificacao(txidResponse);
    const dataTxid = await reqGN.get(`/v2/cob/${txidResponse}`);

    res.render('qrcode', 
    { 
        qrcodeImage: qrcodeResponse.data.imagemQrcode, 
        statusVerificado: dataTxid.data.status 
    });

    
});

function iniciaVerificacao (txidResponse) {
    app.get('/verificar-status-pagamento', async (req, res) => {
        const reqGN = await reqGNAlready;

        const dataTxid = await reqGN.get(`/v2/cob/${txidResponse}`);
        const verificaStatus = dataTxid.data.status;

        res.json({ verificaStatus });
    });
}



app.get('/cobrancas', async (req, res) => {
    const reqGN = await reqGNAlready;

    const cobResponse = await reqGN.get('/v2/cob?inicio=2023-08-01T10:00:00Z&fim=2023-09-30T23:59:00Z');

    res.send(cobResponse.data);
});

app.post('/webhook(/pix)?', (req, res) => {
    console.log(req.body);
    res.send('200');
})

app.listen(8000, () => {
    console.log('running')
})