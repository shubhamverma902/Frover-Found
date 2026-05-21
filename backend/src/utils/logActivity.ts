import Activity from '../models/Activity';

const logActivity = (userId: string, icon: string, text: string): void => {
  Activity.create({ userId, icon, text }).catch(() => {}); // fire-and-forget, silent on failure
};

export default logActivity;
