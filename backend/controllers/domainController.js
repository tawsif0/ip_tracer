const Domain = require("../models/Domain");
const User = require("../models/User");
// Admin: Create new domain
exports.createDomain = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { name, description, isPublic } = req.body;

    // Check if domain already exists
    const existingDomain = await Domain.findOne({ name });
    if (existingDomain) {
      return res.status(400).json({ error: "Domain already exists" });
    }

    const domain = new Domain({
      name,
      description,
      isPublic,
      createdBy: req.user._id,
    });

    await domain.save();
    res.status(201).json(domain);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Admin: Get all domains
exports.getAllDomains = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const domains = await Domain.find({}).populate("createdBy", "name email");
    res.json(domains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Update domain
exports.updateDomain = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { domainId } = req.params;
    const updates = req.body;

    const domain = await Domain.findByIdAndUpdate(domainId, updates, {
      new: true,
    });

    if (!domain) {
      return res.status(404).json({ error: "Domain not found" });
    }

    res.json(domain);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Admin: Delete domain
exports.deleteDomain = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { domainId } = req.params;

    const domain = await Domain.findByIdAndDelete(domainId);
    if (!domain) {
      return res.status(404).json({ error: "Domain not found" });
    }

    res.json({ message: "Domain deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User: Get available domains (public + assigned)
exports.getUserDomains = async (req, res) => {
  try {
    const publicDomains = await Domain.find({ isPublic: true });
    const userAssignedDomains = await Domain.find({
      allowedUsers: req.user._id,
    });

    const allDomains = [...publicDomains, ...userAssignedDomains];
    const uniqueDomains = Array.from(
      new Map(
        allDomains.map((domain) => [domain._id.toString(), domain])
      ).values()
    );

    // Return just the domain names as an array
    res.json(uniqueDomains.map((domain) => domain.name));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Admin: Assign domain to user
exports.assignDomainToUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { domainId, userId } = req.params;

    const domain = await Domain.findById(domainId);
    if (!domain) {
      return res.status(404).json({ error: "Domain not found" });
    }

    // Get the user

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Initialize user permissions if not exists
    if (!user.permissions) {
      user.permissions = {};
    }
    if (!user.permissions.allowedDomains) {
      user.permissions.allowedDomains = [];
    }

    // Add domain to user's allowedDomains if not already present
    let domainAdded = false;
    if (!user.permissions.allowedDomains.includes(domainId)) {
      user.permissions.allowedDomains.push(domainId);
      domainAdded = true;
    }

    // Add user to domain's allowedUsers if not already present
    let userAdded = false;
    if (!domain.allowedUsers.includes(userId)) {
      domain.allowedUsers.push(userId);
      userAdded = true;
    }

    // Save both documents
    await user.save();
    await domain.save();

    res.json({
      message: "Domain assigned to user successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// Admin: Unassign domain from user
exports.unassignDomainFromUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { domainId, userId } = req.params;

    const domain = await Domain.findById(domainId);
    if (!domain) {
      return res.status(404).json({ error: "Domain not found" });
    }

    // Get the user
    const User = require("../models/User");
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove user from domain's allowedUsers
    domain.allowedUsers = domain.allowedUsers.filter(
      (id) => id.toString() !== userId
    );
    await domain.save();

    // Remove domain from user's allowedDomains
    if (user.permissions && user.permissions.allowedDomains) {
      user.permissions.allowedDomains = user.permissions.allowedDomains.filter(
        (id) => id.toString() !== domainId
      );
      await user.save();
    }

    res.json({
      message: "Domain unassigned from user successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
