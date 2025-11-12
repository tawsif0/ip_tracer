const Visit = require("../models/Visit");
const Link = require("../models/Link");

exports.getStatsSummary = async (req, res) => {
  try {
    const links = await Link.find({ createdBy: req.user._id });
    const linkIds = links.map((link) => link._id);

    const [
      totalClicks,
      uniqueVisitors,
      clicksByCountry,
      clicksByLink,
      clicksByDevice,
      clicksByReferrer
    ] = await Promise.all([
      Visit.countDocuments({ link: { $in: linkIds } }),
      Visit.distinct("publicIp", { link: { $in: linkIds } }),
      Visit.aggregate([
        { $match: { link: { $in: linkIds } } },
        { $group: { _id: "$geo.country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Visit.aggregate([
        { $match: { link: { $in: linkIds } } },
        { $group: { _id: "$link", count: { $sum: 1 } } }
      ]),
      Visit.aggregate([
        { $match: { link: { $in: linkIds } } },
        { $group: { _id: "$device.type", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Visit.aggregate([
        { $match: { link: { $in: linkIds } } },
        { $group: { _id: "$referrer.type", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const stats = {
      totalClicks,
      uniqueVisitors: uniqueVisitors.length,
      topCountries: clicksByCountry,
      clicksByLink: clicksByLink.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      devices: clicksByDevice,
      referrers: clicksByReferrer,
      links: links.map((link) => ({
        _id: link._id,
        shortCode: link.shortCode,
        originalUrl: link.originalUrl,
        clicks: link.clicks
      }))
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getLinkStats = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await Link.findOne({ _id: id, createdBy: req.user._id });

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    const visits = await Visit.find({ link: id })
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(visits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// WAS: exports.getLinkStats
exports.getVisitLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const link = await Link.findOne({ _id: id, createdBy: req.user._id });
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { timestamp: -1 }
    };

    const visits = await Visit.paginate({ link: id }, options);
    res.json(visits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
