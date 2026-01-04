import * as userModels from "../models/userModels.js";

// Crear usuario
export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Datos incompletos" });
    
    const existingUser = await userModels.findByEmail(email);
    if (existingUser) return res.status(409).json({message: "El usuario ya existe"});

    const newUser = await userModels.create({ name, email, password });
    
    const {password: _, ...safeUser} = newUser;
    res.status(201).json(safeUser);

  } catch (error){
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// Obtener todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModels.getAll();
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json(safeUsers);

  } catch (error){
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// Obtener usuario por ID
export const getUserById = async (req, res) => {
  try {
    const user = await userModels.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado"});
    
    const {password: _, ...safeUser} = user;
    res.json(safeUser);

  } catch (error){
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const { name, oldPassword, password } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (password && oldPassword) {
      updateData.password = password;
      updateData.oldPassword = oldPassword;
    }
    
    const updatedUser = await userModels.update(req.params.id, updateData);
    
    if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado"});
    
    const { password: _, ...safeUser } = updatedUser;
    res.json(safeUser);

  } catch (error){
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  try{
    const deleted = await userModels.deleteById(req.params.id);
    
    if (!deleted) return res.status(404).json({ message: "Usuario no encontrado"});
    res.status(204).send();

  } catch (error){
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error" });
  }
};