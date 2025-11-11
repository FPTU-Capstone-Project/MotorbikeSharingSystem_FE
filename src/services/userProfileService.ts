import { apiFetch } from '../utils/api';

export interface UserProfile {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  profilePhotoUrl?: string;
  userType: 'USER' | 'ADMIN' | 'MODERATOR';
}

export interface UserProfileMap {
  [userId: number]: UserProfile;
}

export const userProfileService = {
  /**
   * Get user profile by user ID
   */
  getUserProfile: async (userId: number): Promise<UserProfile | null> => {
    try {
      const response = await apiFetch<any>(`/users/${userId}`);
      return {
        userId: response.userId || response.id || userId,
        username: response.username || response.fullName || `User ${userId}`,
        fullName: response.fullName || response.name || `User ${userId}`,
        email: response.email || '',
        profilePhotoUrl: response.profilePhotoUrl || response.profile_photo_url,
        userType: response.userType || response.user_type || 'USER',
      };
    } catch (error) {
      console.error(`Failed to fetch user profile for user ${userId}:`, error);
      return null;
    }
  },

  /**
   * Get multiple user profiles by user IDs
   */
  getUserProfiles: async (userIds: number[]): Promise<UserProfileMap> => {
    const profiles: UserProfileMap = {};
    
    // Fetch profiles in parallel
    const promises = userIds.map(async (userId) => {
      const profile = await userProfileService.getUserProfile(userId);
      if (profile) {
        profiles[userId] = profile;
      }
    });

    await Promise.all(promises);
    return profiles;
  },

  /**
   * Get user profile with fallback
   */
  getUserProfileWithFallback: async (userId: number, username?: string): Promise<UserProfile> => {
    const profile = await userProfileService.getUserProfile(userId);
    
    if (profile) {
      return profile;
    }

    // Return fallback profile
    return {
      userId,
      username: username || `User ${userId}`,
      fullName: username || `User ${userId}`,
      email: '',
      profilePhotoUrl: undefined,
      userType: 'USER',
    };
  },

  /**
   * Generate avatar initials from name
   */
  getAvatarInitials: (name: string): string => {
    if (!name) return 'U';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  },

  /**
   * Get avatar URL with fallback
   */
  getAvatarUrl: (profilePhotoUrl?: string, userId?: number): string | null => {
    if (profilePhotoUrl) {
      return profilePhotoUrl;
    }
    return null; // Will use initials fallback
  },
};




















