import bcrypt from "bcrypt";
import User from "../models/User.js";

/**
 * CREATE USER
 */
// ... imports

/**
 * CREATE USER
 */
export async function createUser(req, res) {
  try {
    const { email, password, role, firstName, lastName, collegeId, children } = req.body;

    // Vérifications strictes
    if (!email || !password || !role || !firstName || !lastName || !collegeId) {
      return res.status(400).json({
        message:
          "Tous les champs sont obligatoires : email, password, role, firstName, lastName, collegeId"
      });
    }

    // Mail unique
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé."
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      passwordHash,
      role,
      collegeId,
      firstName,
      lastName,
      children: children || []
    });

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      children: user.children
    });

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}



/**
 * LIST USERS
 */
export async function listUsers(req, res) {
  try {
    const { collegeId } = req.query;

    const filter = collegeId ? { collegeId } : {};

    const users = await User.find(filter)
      .select("-passwordHash")
      .populate("children", "firstName lastName email")
      .lean();

    res.json(users);

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}



/**
 * UPDATE USER
 */
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { email, role, firstName, lastName, children } = req.body;

    if (!email || !role || !firstName || !lastName) {
      return res.status(400).json({ message: "Champs obligatoires manquants." });
    }

    const updates = { email, role, firstName, lastName };
    if (children) updates.children = children;

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    res.json(user);

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}




/**
 * DELETE USER
 */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res.json({ success: true });

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
