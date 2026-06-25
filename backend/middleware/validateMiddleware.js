export const requiredFields = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter((f) => {
      const v = req.body[f];
      return v === undefined || v === null || v === "";
    });
    if (missing.length) {
      return res.status(400).json({
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }
    next();
  };
};
