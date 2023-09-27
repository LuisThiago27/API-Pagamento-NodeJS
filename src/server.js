const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
const GNRequest = require('./apis/gerencianet');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const reqGNAlready = GNRequest({
    clientID: process.env.GN_CLIENT_ID,
    clientSecret: process.env.GN_CLIENT_SECRET
});

app.get('/cobrancas', async (req, res) => {
    const reqGN = await reqGNAlready;

    const cobResponse = await reqGN.get('/v2/cob?inicio=2023-08-01T10:00:00Z&fim=2023-09-30T23:59:00Z');

    res.send(cobResponse.data);
});

app.post('/processar-cobranca', async (req, res) => {
    const reqGN = await reqGNAlready;
    const dadosGerencianet = req.body;

    const cobResponse = await reqGN.post('/v2/cob', dadosGerencianet);
    const txidResponse = await cobResponse.data.txid;
    const qrcodeResponse = await reqGN.get(`/v2/loc/${cobResponse.data.loc.id}/qrcode`);

    res.json({ codQRCodeResult: qrcodeResponse.data.qrcode, qrcodeResult: qrcodeResponse.data.imagemQrcode, txidResult: txidResponse });

});

app.get('/verificar-status', async (req, res) => {
    const reqGN = await reqGNAlready;
    const txid = req.query.txid; // Obtém o txid da query string

    const dataTxid = await reqGN.get(`/v2/cob/${txid}`);
    const verificaStatus = dataTxid.data.status;

    res.json({ verificaStatus });
});

module.exports.handler = serverless(app);