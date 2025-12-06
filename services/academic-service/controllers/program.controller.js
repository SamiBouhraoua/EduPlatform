import Program from "../models/Program.js";

export const createProgram = async (req, res) => {
  const item = await Program.create({
    name: req.body.name,
    level: req.body.level,
    code: req.body.code,
    collegeId: req.collegeId
  });
  res.json(item);
};

export const listPrograms = async (req, res) => {
  const items = await Program.find({ collegeId: req.collegeId });
  res.json(items);
};

export const updateProgram = async (req, res) => {
  const item = await Program.findOneAndUpdate(
    { _id: req.params.id, collegeId: req.collegeId },
    {
      name: req.body.name,
      level: req.body.level,
      code: req.body.code
    },
    { new: true }
  );
  res.json(item);
};

export const deleteProgram = async (req, res) => {
  await Program.deleteOne({ _id: req.params.id, collegeId: req.collegeId });
  res.json({ success: true });
};
