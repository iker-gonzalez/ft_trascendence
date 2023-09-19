import React, { useEffect, useState } from 'react';
import { getBaseUrl } from '../utils/utils';
import UserProfileHero from '../components/UserProfileHero';

// Define a TypeScript interface for the user data
interface UserData {
  id: string;
  createdAt: string;
  updatedAt: string;
  isTwoFactorAuthEnabled: boolean;
  intraId: number;
  username: string;
  avatar: string;
  email: string;
}

// TODO add TS interface for userData
const UserProfile: React.FC<{ userData: any }> = ({ userData }) => {
  // const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `${getBaseUrl()}/users/me`;
        const response = await fetch(
            url,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                // Add authentication headers if needed
              }
            }
          );

        if (response.ok) {
          const data = await response.json();
          // setUserData(data.data);
        } else {
          console.error('Error fetching user data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    // Display a loading message while fetching data
    return <div>Loading...</div>;
  }

  if (!userData) {
    // Display an error message if the data couldn't be fetched
    return <div>Error fetching user data.</div>;
  }

  return (
    <div>
      {userData && <UserProfileHero userData={userData} />}
    </div>
  );
};

export default UserProfile;
