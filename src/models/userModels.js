import crypto from "crypto";

const users = [];

const generateId = () => crypto.randomUUID();

export const create = async ({ name, email, password }) => {
    const newUser = {
        id: generateId(),
        name,
        email,
        password,
        createdAt: new Date(),
    };

    users.push(newUser);
    return newUser;
};

export const getAll = async () => {
    return [...users];
};

export const findById = async (id) => {
    return users.find(user => user.id === id) || null;
};

export const findByEmail = async (email) => {
    return users.find(user => user.email === email) || null;
};

export const update = async (id, updateData) => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    const user = users[userIndex];

    // Cambio de nombre
    if (updateData.name) {
        user.name = updateData.name;
    };

    // Cambio de contraseña
    if (updateData.password) {
        if (!updateData.oldPassword) {
        throw new Error("Old password requerida");
        };

        if (user.password !== updateData.oldPassword) {
        throw new Error("Old password incorrecta");
        };

        user.password = updateData.password;
    };

    user.updatedAt = new Date();
    users[userIndex] = user;

    return user;
};

export const deleteById = async (id) => {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return false;

    users.splice(index, 1);
    return true;
};