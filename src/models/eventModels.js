/**-------------------------------------------------------------------------------------------------
 * @file eventModel.js
 * @dependences crypto
------------------------------------------------------------------------------------------------- */
import crypto from "crypto";

// Temporary local variable for storing events
const events = [];

/**
 * Local Function Generate ID
 *
 * Function that returns a random UUID.
 *
 * @returns {UUID} - Random UUID.
 * */
const generateId = () => crypto.randomUUID();

/**
 * Local Function Find Raw By ID
 *
 * Function that searches for and returns an event by ID.
 *
 * @param {UUID} id - ID of the event to search for.
 * @returns {event} - Searched event or null.
 * */
const findRawById = (id) => events.find(event => event.id === id) || null;

/**
 * Local Function Sanitize Vote
 *
 * Function that sanitizes a vote by removing the token to prevent confidential information from 
 * being leaked.
 * @param {vote} vote - Vote to be sanitized.
 * @returns {vote} - Vote without token.
 * */
const sanitizeVote = ({ token, ...safeVote }) => safeVote;

/**
 * Local Function Sanitize Event
 *
 * Function that sanitizes a event by removing the tokens of all votes to prevent confidential 
 * information from being leaked.
 * @param {event} event - Event to be sanitized.
 * @returns {event} - Event without vote's tokens.
 * */
const sanitizeEvent = (event) => ({ 
    ...event, 
    dates: event.dates.map(d => ({
        date: d.date,
        slots: [...d.slots],
    })),
    votes: event.votes.map(v => ({
        ...sanitizeVote(v),
        availability: structuredClone(v.availability),
    })),
    results: structuredClone(event.results),
});

/**
 * Local Function Calculate Results
 * 
 * Function that precalculates results each time new votes are written or existing ones are updated.
 * @param {event} event - Event from which to calculate the voting result.
 * @returns {object} - Results by date and slot with voters who have accepted the vote.
 * */
const calculateResults = (event) => {
    const results = {};

    // Initialize structure
    for (const { date, slots } of event.dates) {
        results[date] = {};
        for (const slot of slots) {
            results[date][slot] = {
                yes: 0,
                no: 0,
                voters: [],
            };
        };
    };

    // Browse votes
    for (const vote of event.votes) {
        for (const [date, slots] of Object.entries(vote.availability)) {
            if (!results[date]) continue;

            for (const [slot, value] of Object.entries(slots)) {
                if (!results[date][slot]) continue;

                if (value === true) {
                    results[date][slot].yes++;
                    results[date][slot].voters.push(vote.name);
                } else {
                    results[date][slot].no++;
                };
            };
        };
    };

    return results;
};

/**
 * CRUD Function Event Builder
 *
 * Function that initializes a new Event.
 * @param {Object} { name, creator, info, dates } - Attributes of the new event.
 * @returns {event} - Sanitized event without tokens.
 * */
export const create = async ({ name, creator, info, dates }) => {
    
    // Checking the structure of dates
    if (
        !Array.isArray(dates) ||
        dates.length === 0 ||
        !dates.every(d =>
            typeof d.date === "string" &&
            Array.isArray(d.slots) &&
            d.slots.length > 0
        )
    ) throw new Error("Estructura de fechas inválida");

    // Initialize structure
    const newEvent = {
        id: generateId(),
        name: name.trim().slice(0, 50),
        creator,
        info,
        dates: dates.map(d => ({
            date: d.date,
            slots: [...d.slots]
        })),
        votes: [],
        createdAt: new Date(),
    };
    newEvent.results = calculateResults(newEvent);
        

    events.push(newEvent);
    return sanitizeEvent(newEvent);
};

/**
 * CRUD Function for Querying all Events
 *
 * Function that queries all events.
 * @returns {event} - All sanitized events without tokens.
 * */
export const getAll = async () => {
    return events.map(sanitizeEvent);
};

/**
 * CRUD Function for Querying Events by ID
 *
 * Function that queries events by ID.
 * @param {UUID} id - ID of the target event.
 * @returns {event} - Sanitized event without tokens.
 * */
export const findById = async (id) => {
    const event = findRawById(id);
    if(!event) return null;

    return sanitizeEvent(event);
};

/**
 * CRUD Function for Querying Events by Name & Creator
 *
 * Function that queries events by name and creator.
 * @param {string} name - Name of the target event.
 * @param {string} creator - Creator's name of the target event.
 * @returns {event} - Sanitized event without tokens.
 * */
export const findByNameAndCreator = async (name, creator) =>{
    const event = events.find(
        event => event.name === name.trim().slice(0, 50) && event.creator === creator
    );
    if(!event) return null;

    return sanitizeEvent(event);
};

/**
 * CRUD Function for Updating Events
 *
 * Function that updates events' name, infomation and/or dates.
 * @param {UUID} id - ID of the target event.
 * @param {Object} updateData - Object with the fields to be updated.
 * @returns {event} - Sanitized updated event without tokens.
 * */
export const update = async (id, updateData) => {
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex === -1) return null;

    const event = events[eventIndex];

    // Cambio de nombre
    if (updateData.name) {
        event.name = updateData.name.trim().slice(0, 50);
    };

    // Cambio de información
    if (updateData.info) {
        event.info = updateData.info;
    };

    // Cambio de fechas
    if (updateData.dates) {
        if (
            !Array.isArray(updateData.dates) ||
            updateData.dates.length === 0 ||
            !updateData.dates.every(d =>
                typeof d.date === "string" &&
                Array.isArray(d.slots) &&
                d.slots.length > 0
            )
        ) throw new Error("Estructura de fechas inválida");
        event.dates = updateData.dates.map(d => ({
            date: d.date,
            slots: [...d.slots],
        }));
    };

    event.updatedAt = new Date();
    event.results = calculateResults(event);
    events[eventIndex] = event;

    return sanitizeEvent(event);
};

/**
 * CRUD Function for Deteting Events
 *
 * Function that deletes events.
 * @param {UUID} id - ID of the target event.
 * @returns {Boolean} - Confirmation.
 * */
export const deleteById = async (id) => {
    const index = events.findIndex(event => event.id === id);
    if (index === -1) return false;

    events.splice(index, 1);
    return true;
};

/**
 * CRUD Function Vote Builder
 *
 * Function that initializes a new vote.
 * @param {UUID} eventId - ID of the target event.
 * @param {Object} { name, availability } - Attributes of the new vote.
 * @returns {vote} - Sanitized vote without token.
 * @returns {token} - Vote's token.
 * */
export const addVote = async (eventId, { name, availability }) => {
    const event = await findRawById(eventId);
    if (!event) return null;

    // Checking the Availability structure
    if (typeof availability !== "object" || availability === null || Object.keys(availability).length === 0) {
        throw new Error("Disponibilidad inválida");
    };

    for (const date of Object.keys(availability)) {
        const eventDate = event.dates.find(d => d.date === date);
        if (!eventDate) {
            throw new Error(`Fecha inválida: ${date}`);
        };

        for (const slot of Object.keys(availability[date])) {
            if (!eventDate.slots.includes(slot)) {
                throw new Error(`Slot inválido: ${slot}`);
            };

            if (typeof availability[date][slot] !== "boolean") {
                throw new Error(`Valor inválido para ${date} - ${slot}`);
            };
        };
    };

    // Checking the Name 
    if (typeof name !== "string" || name.trim().slice(0, 50) === "") {
        throw new Error("Nombre inválido");
    };

    // Initialize structure
    const token = crypto.randomUUID();
    const vote = {
        id: crypto.randomUUID(),
        name: name.trim().slice(0, 50),
        availability: structuredClone(availability),
        token,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    event.votes.push(vote);
    event.updatedAt = new Date();
    event.results = calculateResults(event);

    return {
        vote: sanitizeVote(vote),
        token
    };
};

/**
 * CRUD Function for Updating Votes
 *
 * Function that updates a vote.
 * @param {UUID} eventId - ID of the target event.
 * @param {UUID} voteId - ID of the target vote.
 * @param {token} token - Token of the user.
 * @param {Object} availability - New availability to update.
 * @returns {bool} - Confirmation.
 * */
export const updateVote = async (eventId, voteId, token, availability) => {
    // Checking the event and vote
    const event = await findRawById(eventId);
    if (!event) return null;

    const vote = event.votes.find(v => v.id === voteId);
    if (!vote) return false;

    // Authenticating the user
    if (vote.token !== token) {
        throw new Error("No autorizado");
    };

    // Checking the Availability structure
    for (const date of Object.keys(availability)) {
        const eventDate = event.dates.find(d => d.date === date);
        if (!eventDate) {
            throw new Error(`Fecha inválida: ${date}`);
        };

        for (const slot of Object.keys(availability[date])) {
            if (!eventDate.slots.includes(slot)) {
                throw new Error(`Slot inválido: ${slot}`);
            };

            if (typeof availability[date][slot] !== "boolean") {
                throw new Error(`Valor inválido para ${date} - ${slot}`);
            };
        };
    };

    vote.availability = availability;
    vote.updatedAt = new Date();
    event.updatedAt = new Date();
    event.results = calculateResults(event);

    return true;
};

/**
 * CRUD Function for Deleting Votes
 *
 * Function that deletes a vote.
 * @param {UUID} eventId - ID of the target event.
 * @param {UUID} voteId - ID of the target vote.
 * @param {token} token - Token of the user. * 
 * @param {Boolean} isAdmin - Confirmation of the Admin user.
 * @returns {bool} - Confirmation.
 * */
export const deleteVote = async (eventId, voteId, token = null, isAdmin = false) => {
    // Checking the event and vote
    const event = findRawById(eventId);
    if (!event) return null;

    const voteIndex = event.votes.findIndex(v => v.id === voteId);
    if (voteIndex === -1) return false;

    // Authenticating the user
    if (!isAdmin && vote.token !== token) {
        throw new Error("No autorizado");
    };

    const vote = event.votes[voteIndex];

    event.votes.splice(voteIndex, 1);
    event.updatedAt = new Date();
    event.results = calculateResults(event);

    return true;
};