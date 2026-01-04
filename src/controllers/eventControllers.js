import * as eventModels from "../models/eventModels.js";

// Crear evento
export const createEvent = async (req, res) => {
  try {
    const { name, creator, info, dates } = req.body;
    if (!name || !creator || !info || !Array.isArray(dates) || dates.length === 0) return res.status(400).json({ message: "Datos incompletos" });
    
    const existingEvent = await eventModels.findByNameAndCreator(name, creator);
    if (existingEvent) return res.status(409).json({ message: "El evento ya existe" });

    const newEvent = await eventModels.create({ name, creator, info, dates });
    res.status(201).json(newEvent);

  } catch (error){
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// Obtener todos los eventos
export const getAllEvents = async (req, res) => {
  try {
    const events = await eventModels.getAll();
    res.json(events);

  } catch (error){
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// Obtener eventos por ID
export const getEventById = async (req, res) => {
  try {
    const event = await eventModels.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Evento no encontrado" });
    res.json(event);
  
  } catch (error){
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// Actualizar evento
export const updateEvent = async (req, res) => {
  try {
    const { name, info, dates } = req.body;

    if (!name && !info && !dates) {
      return res.status(400).json({ message: "Nada que actualizar" });
    }

    const updateData = {};
    if(name) updateData.name = name;
    if(info) updateData.info = info;
    if(dates) updateData.dates = dates;

    const updatedEvent = await eventModels.update(req.params.id, updateData);

    if (!updatedEvent) return res.status(404).json({ message: "Evento no encontrado" });
    res.json(updatedEvent);

  } catch (error){
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// Eliminar evento
export const deleteEvent = async (req, res) => {
  try{
    const deleted = await eventModels.deleteById(req.params.id);
    
    if (!deleted) return res.status(404).json({ message: "Evento no encontrado" });
    res.status(204).send();

  } catch (error){
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// Añadir voto
export const addVote = async (req, res) => {
  try {
    const result = await eventModels.addVote(req.params.id, req.body);
    if (!result) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//Actualizar voto
export const updateVote = async (req, res) => {
  try {
    const { token, availability } = req.body;

    const ok = await eventModels.updateVote(
      req.params.id,
      req.params.voteId,
      token,
      availability
    );

    if (!ok) {
      return res.status(404).json({ error: "Voto no encontrado" });
    }

    res.json({ success: true });

  } catch (err) {
    if (err.message === "No autorizado") {
      return res.status(403).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
};

//Eliminar voto
export const deleteVote = async (req, res) => {
  try {
    const { token, isAdmin } = req.body;

    const ok = await eventModels.deleteVote(
      req.params.id,
      req.params.voteId,
      token,
      isAdmin
    );

    if (!ok) {
      return res.status(404).json({ error: "Voto no encontrado" });
    }

    res.json({ success: true });

  } catch (err) {
    if (err.message === "No autorizado") {
      return res.status(403).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
};