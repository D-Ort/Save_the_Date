import express from "express";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

const app = express();
app.use(express.json());

// Middleware de rutas
app.use("/user", userRoutes);
app.use("/event", eventRoutes);

// 404 global
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));