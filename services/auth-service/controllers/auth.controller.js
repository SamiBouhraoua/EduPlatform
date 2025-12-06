import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const { JWT_SECRET = "dev_secret_change_me" } = process.env;

export async function login(req, res) {
  try {
    const { email, password, collegeId } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Champs manquants." });

    const user = await User.findOne({ email }).populate("collegeId");
    if (!user)
      return res.status(401).json({ success: false, message: "Email incorrect." });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      return res.status(401).json({ success: false, message: "Mot de passe incorrect." });

    if (collegeId && user.collegeId && user.collegeId._id.toString() !== collegeId)
      return res.status(403).json({ success: false, message: "Collège non correspondant." });

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        collegeId: user.collegeId?._id || null,
        firstName: user.firstName,
        lastName: user.lastName
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Connexion réussie.",
      token,

      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      collegeId: user.collegeId?._id || null
    });


  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
}

export async function changePassword(req, res) {
  try {
    const userId = req.userId; // vient du JWT passé via API Gateway
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Les deux mots de passe sont requis." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Ancien mot de passe incorrect." });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Mot de passe mis à jour avec succès !" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
}