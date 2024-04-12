const User = require('../../models/User');
const { updateUserPluginsService } = require('~/server/services/UserService');
const { updateUserPluginAuth, deleteUserPluginAuth } = require('~/server/services/PluginService');
const { logger } = require('~/config');

const getUserController = async (req, res) => {
  res.status(200).send(req.user);
};

const getUsersController = async (req, res) => {
  const data = (await User.find()) ?? [];
  res.status(200).send(data);
};

const updateUserPluginsController = async (req, res) => {
  const { user } = req;
  const { pluginKey, action, auth, isAssistantTool } = req.body;
  let authService;
  try {
    if (!isAssistantTool) {
      const userPluginsService = await updateUserPluginsService(user, pluginKey, action);

      if (userPluginsService instanceof Error) {
        logger.error('[userPluginsService]', userPluginsService);
        const { status, message } = userPluginsService;
        res.status(status).send({ message });
      }
    }

    if (auth) {
      const keys = Object.keys(auth);
      const values = Object.values(auth);
      if (action === 'install' && keys.length > 0) {
        for (let i = 0; i < keys.length; i++) {
          authService = await updateUserPluginAuth(user.id, keys[i], pluginKey, values[i]);
          if (authService instanceof Error) {
            logger.error('[authService]', authService);
            const { status, message } = authService;
            res.status(status).send({ message });
          }
        }
      }
      if (action === 'uninstall' && keys.length > 0) {
        for (let i = 0; i < keys.length; i++) {
          authService = await deleteUserPluginAuth(user.id, keys[i]);
          if (authService instanceof Error) {
            logger.error('[authService]', authService);
            const { status, message } = authService;
            res.status(status).send({ message });
          }
        }
      }
    }

    res.status(200).send();
  } catch (err) {
    logger.error('[updateUserPluginsController]', err);
    res.status(500).json({ message: err.message });
  }
};

const updateUserAssistantIdsController = async (req, res) => {
  const { user } = req;
  const { userId, assistantIds } = req.body;

  // TODO: move this outside controller
  if (user.role !== 'ADMIN') {
    res.status(401).json({ message: 'Unauthorized' });
  }

  const updatedUser = await User.findOne({ _id: userId }).lean();
  if (updatedUser) {
    await User.updateOne({ _id: userId }, { assistantIds });
  }
  res.status(200).json({ message: 'ok' });
};

module.exports = {
  getUserController,
  getUsersController,
  updateUserPluginsController,
  updateUserAssistantIdsController,
};
