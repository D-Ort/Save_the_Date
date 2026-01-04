import crypto from "crypto";

const events = [];

const generateId = () => crypto.randomUUID();

export const create = async ({ name, creator, info, dates }) => {
    
    if (!Array.isArray(dates) || dates.length === 0) {
        throw new Error("Fechas inválidas");
    };

    const newEvent = {
        id: generateId(),
        name,
        creator,
        info,
        dates: [...dates],
        createdAt: new Date(),
    };

    events.push(newEvent);
    return newEvent;
};

export const getAll = async () => {
    return [...events];
};

export const findById = async (id) => {
    return events.find(event => event.id === id) || null;
};

export const findByNameAndCreator = async (name, creator) =>{
    return events.find(event => event.name === name && event.creator === creator) || null;
};

export const update = async (id, updateData) => {
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex === -1) return null;

    const event = events[eventIndex];

    // Cambio de nombre
    if (updateData.name) {
        event.name = updateData.name;
    };

    // Cambio de información
    if (updateData.info) {
        event.info = updateData.info;
    };

    // Cambio de fechas
    if (updateData.dates) {
        if (!Array.isArray(updateData.dates) || updateData.dates.length === 0) {
            throw new Error("Fechas inválidas");
        };
        event.dates = [...updateData.dates];
    };

    event.updatedAt = new Date();
    events[eventIndex] = event;

    return event;
};

export const deleteById = async (id) => {
    const index = events.findIndex(event => event.id === id);
    if (index === -1) return false;

    events.splice(index, 1);
    return true;
};