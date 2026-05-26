import Activity from '../models/Activity';

const CAP = 500;

// Find the CAPth-newest document for this user; if it exists, everything strictly
// older than it is excess and gets deleted.  Runs after the insert, fire-and-forget.
async function trimUserActivity(userId: string): Promise<void> {
  const marker = await Activity.findOne({ userId })
    .sort({ createdAt: -1 })
    .skip(CAP - 1)
    .select('createdAt')
    .lean();
  if (marker) {
    await Activity.deleteMany({ userId, createdAt: { $lt: marker.createdAt } });
  }
}

const logActivity = (userId: string, icon: string, text: string): void => {
  Activity.create({ userId, icon, text })
    .then(() => trimUserActivity(userId))
    .catch(() => {});
};

export default logActivity;
