const enrollmentService = require('../services/enrollmentService');

async function getReport(req, res, next) {
  try {
    const { sede, grupo, clubId } = req.query;

    const data = await enrollmentService.getReport({
      sedeSlug: sede,
      grupo,
      clubId,
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getReport,
};

