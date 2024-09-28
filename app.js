const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} = require("@bot-whatsapp/bot");

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");

const flowPrincipal = addKeyword([""]).addAnswer(async (ctx) => {
  try {
    const userMessage = await ctx.body;
    if (userMessage === "/fgm") {
      return "Hola, has invocado al bot con un comando válido.";
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error capturado:", error);
    return "Ocurrió un error al procesar tu solicitud.";
  }
});

const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([flowPrincipal]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

main();
