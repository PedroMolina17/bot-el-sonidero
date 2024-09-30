const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} = require("@bot-whatsapp/bot");

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");
const axios = require("axios");

const getSound = async (name) => {
  try {
    const response = await axios.get(
      `http://localhost:4000/detail-sound/name/${name}`
    );

    if (response.data && response.data.sound && response.data.sound.name) {
      const soundUrl = response.data.sound.name;
      return soundUrl;
    } else {
      throw new Error("Estructura de datos no válida");
    }
  } catch (error) {
    console.error("Error al obtener el sonido:", error.message || error);
    throw error;
  }
};

const flowPrincipal = addKeyword(["/fgm"]).addAction(
  async (ctx, { flowDynamic }) => {
    console.log("Mensaje recibido:", ctx);

    try {
      const commandPrefix = "/fgm ";
      if (ctx.body.startsWith(commandPrefix)) {
        const soundName = ctx.body.slice(commandPrefix.length).trim();

        if (!soundName) {
          return await flowDynamic("No se ha proporcionado un nombre válido.");
        }

        const soundUrl = await getSound(soundName);

        return await flowDynamic([
          {
            body: `Hola, has invocado al bot con el comando "/fgm ${soundName}".`,
            media: soundUrl,
          },
        ]);
      } else {
        return await flowDynamic("No has utilizado un comando válido.");
      }
    } catch (error) {
      console.error("Error capturado:", error.message || error);
      return await flowDynamic("Ocurrió un error al procesar tu solicitud.");
    }
  }
);

const flowPrincipal2 = addKeyword(["/fgm"]).addAction(
  async (ctx, { flowDynamic }) => {
    const message = ctx.body;
    const fromGroup = ctx.from.endsWith("@g.us"); // Verificar si el mensaje proviene de un grupo

    console.log("Mensaje recibido:", message);
    console.log("¿El mensaje proviene de un grupo?", fromGroup);

    // Lógica específica si el mensaje es en un grupo
    if (fromGroup) {
      try {
        const commandPrefix = "/fgm ";
        if (message.startsWith(commandPrefix)) {
          const soundName = message.slice(commandPrefix.length).trim();

          if (!soundName) {
            return await flowDynamic(
              "No se ha proporcionado un nombre válido."
            );
          }

          const soundUrl = await getSound(soundName);

          return await flowDynamic([
            {
              body: `Hola, has invocado al bot con el comando "/fgm ${soundName}" en un grupo.`,
              media: soundUrl,
            },
          ]);
        } else {
          return await flowDynamic("No has utilizado un comando válido.");
        }
      } catch (error) {
        console.error("Error capturado:", error.message || error);
        return await flowDynamic(
          "Ocurrió un error al procesar tu solicitud en el grupo."
        );
      }
    } else {
      // Si el mensaje no es de un grupo, procesarlo de manera normal
      return await flowDynamic("Mensaje recibido fuera de un grupo.");
    }
  }
);

const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([flowPrincipal2]);
  const adapterProvider = createProvider(BaileysProvider, {
    printQRInTerminal: true,
    handleGroups: true, // Asegurarse de que esta opción está activada para manejar grupos
    listenEvents: ["messages.upsert", "group-participants.update"], // Escucha de eventos clave
    logLevel: "debug", // Registro detallado para detectar errores
  });
  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

main();
