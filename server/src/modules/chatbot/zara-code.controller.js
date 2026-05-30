const { getZaraCodeHelp } = require('./zara-code.service');

exports.getCodeHelp = async (req, res) => {
  try {
    const { message, code } = req.body;
    const studentContext = {
      fullName: req.user?.fullName || 'Student',
    };
    const result = await getZaraCodeHelp(message, code, studentContext);
    res.json(result);
  } catch (err) {
    res.status(500).json({ 
      message: "Sorry, I couldn't process that. Try again!", 
      code: req.body.code 
    });
  }
};