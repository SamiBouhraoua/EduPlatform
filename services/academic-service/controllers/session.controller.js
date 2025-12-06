import Session from "../models/Session.js";

export const createSession = async (req, res) => {
  const item = await Session.create({
    ...req.body,
    collegeId: req.collegeId
  });
  res.json(item);
};

export const listSessions = async (req, res) => {
  const items = await Session.find({ collegeId: req.collegeId });
  res.json(items);
};

export const updateSession = async (req, res) => {
  const item = await Session.findOneAndUpdate(
    { _id: req.params.id, collegeId: req.collegeId },
    req.body,
    { new: true }
  );
  res.json(item);
};

export const deleteSession = async (req, res) => {
  await Session.deleteOne({ _id: req.params.id, collegeId: req.collegeId });
  res.json({ success: true });
};
