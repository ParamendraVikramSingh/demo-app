const User = require('../../models/User');
const { NotFoundError } = require('../../utils/errors');

const SERVICE = 'users';

const getProfile = async (userId, log) => {
  log.info('Fetching user profile', { event: 'get_profile', userId, service: SERVICE });
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) throw new NotFoundError('User not found', SERVICE);
  return user;
};

const updateProfile = async (userId, data, log) => {
  log.info('Updating user profile', { event: 'update_profile_attempt', userId, service: SERVICE });

  const user = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
  }).select('-passwordHash');

  if (!user) throw new NotFoundError('User not found', SERVICE);

  log.info('Profile updated successfully', { event: 'profile_updated', userId, service: SERVICE });
  return user;
};

module.exports = { getProfile, updateProfile };
